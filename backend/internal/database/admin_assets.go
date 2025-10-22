package database

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"imageaiwrapper-backend/internal/models"
)

// ListTemplateAssets returns assets for a template identified by slug.
func ListTemplateAssets(ctx context.Context, slug string) ([]models.TemplateAssetAdmin, error) {
	db, err := getDB()
	if err != nil {
		return nil, fmt.Errorf("connect db: %w", err)
	}
	const q = `
SELECT ta.id, ta.url, ta.kind, ta.sort_order, NOW() AS created_at
FROM template_assets ta
JOIN templates t ON t.id = ta.template_id
WHERE t.slug = $1
ORDER BY ta.kind ASC, ta.sort_order ASC, ta.id ASC
`
	rows, err := db.QueryContext(ctx, q, slug)
	if err != nil {
		return nil, fmt.Errorf("query assets: %w", err)
	}
	defer rows.Close()

	var out []models.TemplateAssetAdmin
	for rows.Next() {
		var it models.TemplateAssetAdmin
		var createdAt sql.NullTime
		if err := rows.Scan(&it.ID, &it.URL, &it.Kind, &it.SortOrder, &createdAt); err != nil {
			return nil, fmt.Errorf("scan asset: %w", err)
		}
		if createdAt.Valid {
			t := createdAt.Time
			it.CreatedAt = &t
		}
		out = append(out, it)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate assets: %w", err)
	}
	return out, nil
}

// InsertTemplateAsset inserts a new asset for the template. If sortOrder is nil, append to the end within its kind.
func InsertTemplateAsset(ctx context.Context, slug string, kind string, url string, sortOrder *int) (*models.TemplateAssetAdmin, error) {
	db, err := getDB()
	if err != nil {
		return nil, fmt.Errorf("connect db: %w", err)
	}
	tx, err := db.BeginTx(ctx, &sql.TxOptions{})
	if err != nil {
		return nil, fmt.Errorf("begin tx: %w", err)
	}
	defer func() { _ = tx.Rollback() }()

	// Resolve template id
	var tplID string
	if err := tx.QueryRowContext(ctx, `SELECT id FROM templates WHERE slug = $1`, slug).Scan(&tplID); err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("not_found")
		}
		return nil, fmt.Errorf("get template: %w", err)
	}

	// Determine sort order if not provided
	so := 0
	if sortOrder != nil {
		so = *sortOrder
	} else {
		if err := tx.QueryRowContext(ctx,
			`SELECT COALESCE(MAX(sort_order) + 1, 0) FROM template_assets WHERE template_id = $1 AND kind = $2`,
			tplID, kind,
		).Scan(&so); err != nil {
			return nil, fmt.Errorf("compute sort_order: %w", err)
		}
	}

	var (
		id string
		co time.Time
	)
	if err := tx.QueryRowContext(ctx,
		`INSERT INTO template_assets (template_id, kind, url, sort_order) VALUES ($1, $2, $3, $4) RETURNING id, NOW()`,
		tplID, kind, url, so,
	).Scan(&id, &co); err != nil {
		return nil, fmt.Errorf("insert asset: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return nil, fmt.Errorf("commit: %w", err)
	}
	return &models.TemplateAssetAdmin{
		ID:        id,
		URL:       url,
		Kind:      kind,
		SortOrder: so,
		CreatedAt: &co,
	}, nil
}

// UpdateTemplateAsset updates an asset's kind and/or sort order. If setting kind to 'thumbnail', enforce uniqueness.
func UpdateTemplateAsset(ctx context.Context, slug string, assetID string, newKind *string, sortOrder *int) (*models.TemplateAssetAdmin, error) {
	db, err := getDB()
	if err != nil {
		return nil, fmt.Errorf("connect db: %w", err)
	}
	tx, err := db.BeginTx(ctx, &sql.TxOptions{})
	if err != nil {
		return nil, fmt.Errorf("begin tx: %w", err)
	}
	defer func() { _ = tx.Rollback() }()

	// Resolve template id
	var tplID string
	if err := tx.QueryRowContext(ctx, `SELECT id FROM templates WHERE slug = $1`, slug).Scan(&tplID); err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("not_found")
		}
		return nil, fmt.Errorf("get template: %w", err)
	}

	// Ensure asset belongs to template
	var exists bool
	if err := tx.QueryRowContext(ctx,
		`SELECT EXISTS(SELECT 1 FROM template_assets WHERE id = $1 AND template_id = $2)`,
		assetID, tplID,
	).Scan(&exists); err != nil {
		return nil, fmt.Errorf("check asset: %w", err)
	}
	if !exists {
		return nil, fmt.Errorf("not_found")
	}

	// If changing to thumbnail, demote other thumbnails
	if newKind != nil && *newKind == "thumbnail" {
		if _, err := tx.ExecContext(ctx,
			`UPDATE template_assets SET kind = 'preview' WHERE template_id = $1 AND kind = 'thumbnail' AND id <> $2`,
			tplID, assetID,
		); err != nil {
			return nil, fmt.Errorf("demote other thumbnails: %w", err)
		}
	}

	// Build dynamic update
	q := `UPDATE template_assets SET `
	args := []any{}
	idx := 1
	setAny := false
	if newKind != nil {
		q += fmt.Sprintf("kind = $%d", idx)
		args = append(args, *newKind)
		idx++
		setAny = true
	}
	if sortOrder != nil {
		if setAny {
			q += ", "
		}
		q += fmt.Sprintf("sort_order = $%d", idx)
		args = append(args, *sortOrder)
		idx++
		setAny = true
	}
	if !setAny {
		// Nothing to update; return current
		var out models.TemplateAssetAdmin
		if err := tx.QueryRowContext(ctx,
			`SELECT id, url, kind, sort_order, NOW() AS created_at FROM template_assets WHERE id = $1 AND template_id = $2`,
			assetID, tplID,
		).Scan(&out.ID, &out.URL, &out.Kind, &out.SortOrder, &out.CreatedAt); err != nil {
			return nil, fmt.Errorf("select asset: %w", err)
		}
		_ = tx.Commit()
		return &out, nil
	}
	q += fmt.Sprintf(" WHERE id = $%d AND template_id = $%d RETURNING id, url, kind, sort_order, NOW() AS created_at", idx, idx+1)
	args = append(args, assetID, tplID)

	var out models.TemplateAssetAdmin
	if err := tx.QueryRowContext(ctx, q, args...).Scan(&out.ID, &out.URL, &out.Kind, &out.SortOrder, &out.CreatedAt); err != nil {
		return nil, fmt.Errorf("update asset: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return nil, fmt.Errorf("commit: %w", err)
	}
	return &out, nil
}

// DeleteTemplateAsset deletes an asset (DB row). Note: it does not remove the physical file.
func DeleteTemplateAsset(ctx context.Context, slug string, assetID string) error {
	db, err := getDB()
	if err != nil {
		return fmt.Errorf("connect db: %w", err)
	}
	res, err := db.ExecContext(ctx,
		`DELETE FROM template_assets WHERE id = $1 AND template_id = (SELECT id FROM templates WHERE slug = $2)`,
		assetID, slug,
	)
	if err != nil {
		return fmt.Errorf("delete asset: %w", err)
	}
	aff, _ := res.RowsAffected()
	if aff == 0 {
		return fmt.Errorf("not_found")
	}
	return nil
}
