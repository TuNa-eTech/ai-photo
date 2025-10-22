package database

import (
	"context"
	"database/sql"
	"fmt"
	"strings"

	"imageaiwrapper-backend/internal/models"
)

// AdminTemplateQuery defines filters for admin templates listing.
type AdminTemplateQuery struct {
	Limit      int
	Offset     int
	Q          string
	TagsCSV    string // comma-separated tag slugs filter (any match)
	Status     string // draft | published | archived (optional)
	Visibility string // public | private (optional)
	Sort       string // updated | newest | popular | name
}

func adminSortClause(sort string) string {
	switch sort {
	case "newest":
		return "t.published_at DESC NULLS LAST, t.created_at DESC"
	case "popular":
		return "t.usage_count DESC NULLS LAST, t.updated_at DESC"
	case "name":
		return "t.name ASC"
	case "updated", "":
		fallthrough
	default:
		return "t.updated_at DESC"
	}
}

// ListAdminTemplates returns templates for admin with filters and metadata.
func ListAdminTemplates(ctx context.Context, p AdminTemplateQuery) ([]models.TemplateAdmin, error) {
	db, err := getDB()
	if err != nil {
		return nil, fmt.Errorf("connect db: %w", err)
	}
	if p.Limit <= 0 {
		p.Limit = 20
	}
	if p.Offset < 0 {
		p.Offset = 0
	}
	sortClause := adminSortClause(p.Sort)

	q := `
SELECT
  t.slug,
  t.name,
  t.description,
  t.status,
  t.visibility,
  t.published_at,
  COALESCE(t.usage_count, 0) AS usage_count,
  t.updated_at,
  (
    SELECT ta.url
    FROM template_assets ta
    WHERE ta.template_id = t.id AND ta.kind = 'thumbnail'
    ORDER BY ta.sort_order ASC
    LIMIT 1
  ) AS thumbnail_url,
  (
    SELECT STRING_AGG(tg.slug, ',')
    FROM template_tags tt
    JOIN tags tg ON tg.id = tt.tag_id
    WHERE tt.template_id = t.id
  ) AS tags_csv
FROM templates t
WHERE ($1 = '' OR t.name ILIKE '%' || $1 || '%' OR t.slug ILIKE '%' || $1 || '%')
  AND ($2 = '' OR t.status = $2)
  AND ($3 = '' OR t.visibility = $3)
  AND ($4 = '' OR EXISTS (
        SELECT 1
        FROM template_tags tt
        JOIN tags tg ON tg.id = tt.tag_id
        WHERE tt.template_id = t.id
          AND tg.slug = ANY (string_to_array($4, ','))
      ))
ORDER BY ` + sortClause + `
LIMIT $5 OFFSET $6
`
	rows, err := db.QueryContext(ctx, q, p.Q, p.Status, p.Visibility, p.TagsCSV, p.Limit, p.Offset)
	if err != nil {
		return nil, fmt.Errorf("query admin templates: %w", err)
	}
	defer rows.Close()

	var out []models.TemplateAdmin
	for rows.Next() {
		var (
			slug, name, status, visibility string
			descNull                       sql.NullString
			publishedAt                    sql.NullTime
			usageCount                     int
			updatedAt                      sql.NullTime
			thumbNull                      sql.NullString
			tagsNull                       sql.NullString
		)
		if err := rows.Scan(&slug, &name, &descNull, &status, &visibility, &publishedAt, &usageCount, &updatedAt, &thumbNull, &tagsNull); err != nil {
			return nil, fmt.Errorf("scan admin template: %w", err)
		}
		var descPtr *string
		if descNull.Valid {
			s := descNull.String
			descPtr = &s
		}
		var thumbPtr *string
		if thumbNull.Valid {
			s := thumbNull.String
			thumbPtr = &s
		}
		var pubPtr *sql.NullTime
		if publishedAt.Valid {
			pubPtr = &publishedAt
		}
		var updPtr *sql.NullTime
		if updatedAt.Valid {
			updPtr = &updatedAt
		}
		var tags []string
		if tagsNull.Valid && tagsNull.String != "" {
			for _, t := range strings.Split(tagsNull.String, ",") {
				t = strings.TrimSpace(t)
				if t != "" {
					tags = append(tags, t)
				}
			}
		}

		item := models.TemplateAdmin{
			ID:           slug,
			Slug:         slug,
			Name:         name,
			Description:  descPtr,
			ThumbnailURL: thumbPtr,
			Status:       status,
			Visibility:   visibility,
			UsageCount:   usageCount,
			Tags:         tags,
		}
		if pubPtr != nil {
			t := pubPtr.Time
			item.PublishedAt = &t
		}
		if updPtr != nil {
			t := updPtr.Time
			item.UpdatedAt = &t
		}
		out = append(out, item)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate admin templates: %w", err)
	}
	return out, nil
}

// GetAdminTemplate fetches a single template by slug with admin fields.
func GetAdminTemplate(ctx context.Context, slug string) (*models.TemplateAdmin, error) {
	db, err := getDB()
	if err != nil {
		return nil, fmt.Errorf("connect db: %w", err)
	}
	const q = `
SELECT
  t.id,
  t.slug,
  t.name,
  t.description,
  t.status,
  t.visibility,
  t.published_at,
  COALESCE(t.usage_count, 0) AS usage_count,
  t.updated_at,
  (
    SELECT ta.url
    FROM template_assets ta
    WHERE ta.template_id = t.id AND ta.kind = 'thumbnail'
    ORDER BY ta.sort_order ASC
    LIMIT 1
  ) AS thumbnail_url,
  (
    SELECT STRING_AGG(tg.slug, ',')
    FROM template_tags tt
    JOIN tags tg ON tg.id = tt.tag_id
    WHERE tt.template_id = t.id
  ) AS tags_csv
FROM templates t
WHERE t.slug = $1
LIMIT 1
`
	var (
		tplID, name, status, visibility string
		descNull                        sql.NullString
		publishedAt                     sql.NullTime
		usageCount                      int
		updatedAt                       sql.NullTime
		thumbNull                       sql.NullString
		tagsNull                        sql.NullString
	)
	if err := db.QueryRowContext(ctx, q, slug).Scan(&tplID, &slug, &name, &descNull, &status, &visibility, &publishedAt, &usageCount, &updatedAt, &thumbNull, &tagsNull); err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("not_found")
		}
		return nil, fmt.Errorf("query admin template: %w", err)
	}
	var descPtr *string
	if descNull.Valid {
		s := descNull.String
		descPtr = &s
	}
	var thumbPtr *string
	if thumbNull.Valid {
		s := thumbNull.String
		thumbPtr = &s
	}
	var pubPtr *sql.NullTime
	if publishedAt.Valid {
		pubPtr = &publishedAt
	}
	var updPtr *sql.NullTime
	if updatedAt.Valid {
		updPtr = &updatedAt
	}
	var tags []string
	if tagsNull.Valid && tagsNull.String != "" {
		for _, t := range strings.Split(tagsNull.String, ",") {
			t = strings.TrimSpace(t)
			if t != "" {
				tags = append(tags, t)
			}
		}
	}
	out := &models.TemplateAdmin{
		ID:           slug,
		Slug:         slug,
		Name:         name,
		Description:  descPtr,
		ThumbnailURL: thumbPtr,
		Status:       status,
		Visibility:   visibility,
		UsageCount:   usageCount,
		Tags:         tags,
	}
	if pubPtr != nil {
		t := pubPtr.Time
		out.PublishedAt = &t
	}
	if updPtr != nil {
		t := updPtr.Time
		out.UpdatedAt = &t
	}
	_ = tplID
	return out, nil
}

// CreateAdminTemplate inserts a new template and assigns tags.
func CreateAdminTemplate(ctx context.Context, in models.CreateTemplateInput) (*models.TemplateAdmin, error) {
	db, err := getDB()
	if err != nil {
		return nil, fmt.Errorf("connect db: %w", err)
	}
	tx, err := db.BeginTx(ctx, &sql.TxOptions{})
	if err != nil {
		return nil, fmt.Errorf("begin tx: %w", err)
	}
	defer func() { _ = tx.Rollback() }()

	const ins = `
INSERT INTO templates (slug, name, description, status, visibility, created_at, updated_at, published_at)
VALUES ($1, $2, NULLIF($3, ''), $4, $5, NOW(), NOW(),
        CASE WHEN $4 = 'published' THEN NOW() ELSE NULL END)
RETURNING id
`
	var tplID string
	if err := tx.QueryRowContext(ctx, ins, in.Slug, in.Name, nullableStr(in.Description), in.Status, in.Visibility).Scan(&tplID); err != nil {
		return nil, fmt.Errorf("insert template: %w", err)
	}

	if err := upsertTemplateTagsTx(ctx, tx, tplID, in.Tags); err != nil {
		return nil, fmt.Errorf("upsert tags: %w", err)
	}
	// Upsert thumbnail asset when provided
	if in.ThumbnailURL != nil {
		if err := upsertThumbnailAssetTx(ctx, tx, tplID, *in.ThumbnailURL); err != nil {
			return nil, fmt.Errorf("upsert thumbnail: %w", err)
		}
	}

	if err := tx.Commit(); err != nil {
		return nil, fmt.Errorf("commit: %w", err)
	}
	return GetAdminTemplate(ctx, in.Slug)
}

// UpdateAdminTemplate updates template fields and replaces tags mapping.
func UpdateAdminTemplate(ctx context.Context, slug string, in models.UpdateTemplateInput) (*models.TemplateAdmin, error) {
	db, err := getDB()
	if err != nil {
		return nil, fmt.Errorf("connect db: %w", err)
	}
	tx, err := db.BeginTx(ctx, &sql.TxOptions{})
	if err != nil {
		return nil, fmt.Errorf("begin tx: %w", err)
	}
	defer func() { _ = tx.Rollback() }()

	const upd = `
UPDATE templates t
SET name = $1,
    description = NULLIF($2, ''),
    status = $3,
    visibility = $4,
    updated_at = NOW(),
    published_at = CASE WHEN $3 = 'published' THEN COALESCE(t.published_at, NOW()) ELSE NULL END
WHERE t.slug = $5
RETURNING t.id
`
	var tplID string
	if err := tx.QueryRowContext(ctx, upd, in.Name, nullableStr(in.Description), in.Status, in.Visibility, slug).Scan(&tplID); err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("not_found")
		}
		return nil, fmt.Errorf("update template: %w", err)
	}

	// Replace tags mapping
	if err := replaceTemplateTagsTx(ctx, tx, tplID, in.Tags); err != nil {
		return nil, fmt.Errorf("replace tags: %w", err)
	}
	// Upsert thumbnail asset when provided
	if in.ThumbnailURL != nil {
		if err := upsertThumbnailAssetTx(ctx, tx, tplID, *in.ThumbnailURL); err != nil {
			return nil, fmt.Errorf("upsert thumbnail: %w", err)
		}
	}

	if err := tx.Commit(); err != nil {
		return nil, fmt.Errorf("commit: %w", err)
	}
	return GetAdminTemplate(ctx, slug)
}

// DeleteAdminTemplate deletes a template by slug.
func DeleteAdminTemplate(ctx context.Context, slug string) error {
	db, err := getDB()
	if err != nil {
		return fmt.Errorf("connect db: %w", err)
	}
	const del = `DELETE FROM templates WHERE slug = $1`
	res, err := db.ExecContext(ctx, del, slug)
	if err != nil {
		return fmt.Errorf("delete template: %w", err)
	}
	aff, _ := res.RowsAffected()
	if aff == 0 {
		return fmt.Errorf("not_found")
	}
	return nil
}

// PublishAdminTemplate sets status=published and published_at=NOW().
func PublishAdminTemplate(ctx context.Context, slug string) (*models.TemplateAdmin, error) {
	db, err := getDB()
	if err != nil {
		return nil, fmt.Errorf("connect db: %w", err)
	}

	// Require thumbnail asset for publish
	const chk = `
SELECT EXISTS(
  SELECT 1
  FROM template_assets ta
  JOIN templates t ON t.id = ta.template_id
  WHERE t.slug = $1 AND ta.kind = 'thumbnail' AND NULLIF(ta.url, '') IS NOT NULL
)
`
	var hasThumb bool
	if err := db.QueryRowContext(ctx, chk, slug).Scan(&hasThumb); err != nil {
		return nil, fmt.Errorf("check thumbnail: %w", err)
	}
	if !hasThumb {
		return nil, fmt.Errorf("validation_thumbnail_required")
	}

	const upd = `
UPDATE templates
SET status = 'published',
    published_at = NOW(),
    updated_at = NOW()
WHERE slug = $1
RETURNING id
`
	var tplID string
	if err := db.QueryRowContext(ctx, upd, slug).Scan(&tplID); err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("not_found")
		}
		return nil, fmt.Errorf("publish template: %w", err)
	}
	return GetAdminTemplate(ctx, slug)
}

// UnpublishAdminTemplate sets status=draft and published_at=NULL.
func UnpublishAdminTemplate(ctx context.Context, slug string) (*models.TemplateAdmin, error) {
	db, err := getDB()
	if err != nil {
		return nil, fmt.Errorf("connect db: %w", err)
	}
	const upd = `
UPDATE templates
SET status = 'draft',
    published_at = NULL,
    updated_at = NOW()
WHERE slug = $1
RETURNING id
`
	var tplID string
	if err := db.QueryRowContext(ctx, upd, slug).Scan(&tplID); err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("not_found")
		}
		return nil, fmt.Errorf("unpublish template: %w", err)
	}
	return GetAdminTemplate(ctx, slug)
}

// Helpers

func nullableStr(p *string) string {
	if p == nil {
		return ""
	}
	return *p
}

func upsertTemplateTagsTx(ctx context.Context, tx *sql.Tx, templateID string, tags []string) error {
	for _, s := range uniqStrings(tags) {
		if s == "" {
			continue
		}
		var tagID int64
		if err := tx.QueryRowContext(ctx,
			`INSERT INTO tags (slug, name) VALUES ($1, $1)
			 ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
			 RETURNING id`, s).Scan(&tagID); err != nil {
			return fmt.Errorf("upsert tag %s: %w", s, err)
		}
		if _, err := tx.ExecContext(ctx,
			`INSERT INTO template_tags (template_id, tag_id) VALUES ($1, $2)
			 ON CONFLICT DO NOTHING`, templateID, tagID); err != nil {
			return fmt.Errorf("map tag %s: %w", s, err)
		}
	}
	return nil
}

func replaceTemplateTagsTx(ctx context.Context, tx *sql.Tx, templateID string, tags []string) error {
	if _, err := tx.ExecContext(ctx, `DELETE FROM template_tags WHERE template_id = $1`, templateID); err != nil {
		return fmt.Errorf("clear template_tags: %w", err)
	}
	return upsertTemplateTagsTx(ctx, tx, templateID, tags)
}

// Upsert thumbnail asset (kind='thumbnail') for a template.
// If url is empty after trim, do nothing.
func upsertThumbnailAssetTx(ctx context.Context, tx *sql.Tx, templateID string, url string) error {
	url = strings.TrimSpace(url)
	if url == "" {
		return nil
	}
	// Try to find existing thumbnail asset
	var assetID string
	err := tx.QueryRowContext(ctx,
		`SELECT id FROM template_assets WHERE template_id = $1 AND kind = 'thumbnail' ORDER BY sort_order ASC LIMIT 1`,
		templateID,
	).Scan(&assetID)

	switch {
	case err == nil:
		// Update existing
		if _, err := tx.ExecContext(ctx, `UPDATE template_assets SET url = $1 WHERE id = $2`, url, assetID); err != nil {
			return fmt.Errorf("update thumbnail asset: %w", err)
		}
		return nil
	case err == sql.ErrNoRows:
		// Insert new
		if _, err := tx.ExecContext(ctx,
			`INSERT INTO template_assets (template_id, kind, url, sort_order) VALUES ($1, 'thumbnail', $2, 0)`,
			templateID, url,
		); err != nil {
			return fmt.Errorf("insert thumbnail asset: %w", err)
		}
		return nil
	default:
		return fmt.Errorf("query thumbnail asset: %w", err)
	}
}

func uniqStrings(in []string) []string {
	seen := make(map[string]struct{}, len(in))
	var out []string
	for _, s := range in {
		s = strings.TrimSpace(s)
		if s == "" {
			continue
		}
		if _, ok := seen[s]; ok {
			continue
		}
		seen[s] = struct{}{}
		out = append(out, s)
	}
	return out
}
