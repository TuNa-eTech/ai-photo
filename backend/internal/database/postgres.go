package database

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"os"
	"sync"

	"imageaiwrapper-backend/internal/models"

	_ "github.com/jackc/pgx/v5/stdlib"
)

// Lazy-initialized global DB handle for simplicity in this demo.
// For production, prefer explicit dependency injection.
var (
	dbOnce sync.Once
	dbConn *sql.DB
	dbErr  error
)

// getEnv returns env var value or fallback.
func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

// dsnFromEnv composes a Postgres DSN from environment variables.
// Priority:
//  1. DATABASE_URL if provided
//  2. Compose from DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME (+ sslmode)
func dsnFromEnv() string {
	if url := os.Getenv("DATABASE_URL"); url != "" {
		return url
	}
	host := getEnv("DB_HOST", "localhost")
	port := getEnv("DB_PORT", "5432")
	user := getEnv("DB_USER", "imageai")
	pass := getEnv("DB_PASSWORD", "imageai_pass")
	name := getEnv("DB_NAME", "imageai_db")
	ssl := getEnv("DB_SSLMODE", "disable")
	return fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=%s", user, pass, host, port, name, ssl)
}

// getDB initializes a shared *sql.DB using pgx driver.
func getDB() (*sql.DB, error) {
	dbOnce.Do(func() {
		dsn := dsnFromEnv()
		dbConn, dbErr = sql.Open("pgx", dsn)
		if dbErr != nil {
			return
		}
		// Validate connection
		if err := dbConn.Ping(); err != nil {
			dbErr = fmt.Errorf("db ping failed: %w", err)
			return
		}
	})
	return dbConn, dbErr
}

// UpsertUserProfile inserts or updates a user profile by email into user_profiles table.
func UpsertUserProfile(ctx context.Context, email, name, avatarURL string) error {
	db, err := getDB()
	if err != nil {
		return fmt.Errorf("connect db: %w", err)
	}
	const q = `
INSERT INTO user_profiles (email, name, avatar_url)
VALUES ($1, $2, NULLIF($3, ''))
ON CONFLICT (email) DO UPDATE
SET name = EXCLUDED.name,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = NOW()
`
	if _, err := db.ExecContext(ctx, q, email, name, avatarURL); err != nil {
		return fmt.Errorf("upsert user_profile: %w", err)
	}
	return nil
}

// GetTemplateByIDFromDB fetches a template (by slug) and its current version prompt from Postgres.
func GetTemplateByIDFromDB(ctx context.Context, slug string) (*models.Template, error) {
	db, err := getDB()
	if err != nil {
		return nil, fmt.Errorf("connect db: %w", err)
	}
	const q = `
SELECT t.id, t.name, tv.prompt_template
FROM templates t
JOIN template_versions tv ON tv.id = t.current_version_id
WHERE t.slug = $1
LIMIT 1
`
	var (
		tplID  string
		name   string
		prompt string
	)
	if err := db.QueryRowContext(ctx, q, slug).Scan(&tplID, &name, &prompt); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("template not found")
		}
		return nil, fmt.Errorf("query template: %w", err)
	}
	// Keep ID consistent with existing JSON-based flow where ID is used as slug.
	return &models.Template{
		ID:     slug,
		Name:   name,
		Prompt: prompt,
	}, nil
}

// ListPublishedTemplates returns public/published templates for browsing (prompt omitted).
func ListPublishedTemplates(ctx context.Context, limit, offset int) ([]models.Template, error) {
	db, err := getDB()
	if err != nil {
		return nil, fmt.Errorf("connect db: %w", err)
	}
	if limit <= 0 {
		limit = 20
	}
	if offset < 0 {
		offset = 0
	}
	const q = `
SELECT t.slug, t.name
FROM templates t
WHERE t.status = 'published' AND t.visibility = 'public'
ORDER BY t.published_at DESC NULLS LAST, t.created_at DESC
LIMIT $1 OFFSET $2
`
	rows, err := db.QueryContext(ctx, q, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("query templates: %w", err)
	}
	defer rows.Close()

	var out []models.Template
	for rows.Next() {
		var slug string
		var name string
		if err := rows.Scan(&slug, &name); err != nil {
			return nil, fmt.Errorf("scan template: %w", err)
		}
		out = append(out, models.Template{
			ID:   slug,
			Name: name,
			// Prompt intentionally omitted for listing (server-side only)
		})
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate templates: %w", err)
	}
	return out, nil
}

// TemplateQuery defines filters for advanced templates listing.
type TemplateQuery struct {
	Limit   int
	Offset  int
	Q       string
	TagsCSV string // comma-separated tag slugs
	Sort    string // newest | popular | name
}

// ListPublishedTemplatesAdvanced returns public templates with additional fields and filtering/sorting.
func ListPublishedTemplatesAdvanced(ctx context.Context, p TemplateQuery) ([]models.TemplateListItem, error) {
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

	// Allow-list sort to prevent SQL injection
	sortClause := "t.published_at DESC NULLS LAST, t.created_at DESC"
	switch p.Sort {
	case "popular":
		sortClause = "t.usage_count DESC NULLS LAST, t.published_at DESC NULLS LAST"
	case "name":
		sortClause = "t.name ASC"
	case "newest", "":
		sortClause = "t.published_at DESC NULLS LAST, t.created_at DESC"
	default:
		sortClause = "t.published_at DESC NULLS LAST, t.created_at DESC"
	}

	q := `
SELECT
  t.slug,
  t.name,
  t.published_at,
  COALESCE(t.usage_count, 0) AS usage_count,
  (
    SELECT ta.url
    FROM template_assets ta
    WHERE ta.template_id = t.id AND ta.kind = 'thumbnail'
    ORDER BY ta.sort_order ASC
    LIMIT 1
  ) AS thumbnail_url
FROM templates t
WHERE t.status = 'published' AND t.visibility = 'public'
  AND ($1 = '' OR t.name ILIKE '%' || $1 || '%' OR t.slug ILIKE '%' || $1 || '%')
  AND ($2 = '' OR EXISTS (
        SELECT 1
        FROM template_tags tt
        JOIN tags tg ON tg.id = tt.tag_id
        WHERE tt.template_id = t.id
          AND tg.slug = ANY (string_to_array($2, ','))
      ))
ORDER BY ` + sortClause + `
LIMIT $3 OFFSET $4
`
	rows, err := db.QueryContext(ctx, q, p.Q, p.TagsCSV, p.Limit, p.Offset)
	if err != nil {
		return nil, fmt.Errorf("query templates advanced: %w", err)
	}
	defer rows.Close()

	var out []models.TemplateListItem
	for rows.Next() {
		var (
			slug, name       string
			publishedAt      sql.NullTime
			usageCount       int
			thumbnailURLNull sql.NullString
		)
		if err := rows.Scan(&slug, &name, &publishedAt, &usageCount, &thumbnailURLNull); err != nil {
			return nil, fmt.Errorf("scan template: %w", err)
		}
		item := models.TemplateListItem{
			ID:         slug,
			Name:       name,
			UsageCount: usageCount,
		}
		if publishedAt.Valid {
			t := publishedAt.Time
			item.PublishedAt = &t
		}
		if thumbnailURLNull.Valid {
			item.ThumbnailURL = thumbnailURLNull.String
		}
		out = append(out, item)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate templates: %w", err)
	}
	return out, nil
}
