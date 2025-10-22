package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"time"

	_ "github.com/jackc/pgx/v5/stdlib"
)

// input template structure (matches backend/templates.json and internal/models.Template)
type inputTemplate struct {
	ID     string `json:"id"`
	Name   string `json:"name"`
	Prompt string `json:"prompt"`
}

func main() {
	var (
		filePath   string
		publish    bool
		visibility string
		provider   string
		modelName  string
	)
	flag.StringVar(&filePath, "file", "templates.json", "Path to templates JSON file (relative to backend dir)")
	flag.BoolVar(&publish, "publish", true, "Mark templates as published")
	flag.StringVar(&visibility, "visibility", "public", "Template visibility (public|private)")
	flag.StringVar(&provider, "provider", "gemini", "Model provider (e.g. gemini)")
	flag.StringVar(&modelName, "model", "gemini-1.5-pro", "Model name (e.g. gemini-1.5-pro)")
	flag.Parse()

	absFile := filePath
	if !filepath.IsAbs(filePath) {
		cwd, _ := os.Getwd()
		absFile = filepath.Join(cwd, filePath)
	}
	log.Printf("[seed-templates] Using file: %s\n", absFile)

	// Open and decode JSON
	f, err := os.Open(absFile)
	if err != nil {
		log.Fatalf("open templates json: %v", err)
	}
	defer f.Close()

	var items []inputTemplate
	if err := json.NewDecoder(f).Decode(&items); err != nil {
		log.Fatalf("decode templates json: %v", err)
	}
	if len(items) == 0 {
		log.Println("[seed-templates] No templates to import. Done.")
		return
	}

	// Connect DB
	db, err := openDB()
	if err != nil {
		log.Fatalf("connect db: %v", err)
	}
	defer db.Close()

	ctx := context.Background()
	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		log.Fatalf("begin tx: %v", err)
	}
	defer func() {
		_ = tx.Rollback()
	}()

	now := time.Now().UTC()
	count := 0

	for _, it := range items {
		if it.ID == "" || it.Name == "" || it.Prompt == "" {
			log.Printf("[seed-templates] skip invalid record: id=%q name=%q promptLen=%d", it.ID, it.Name, len(it.Prompt))
			continue
		}

		// 1) Upsert into templates by slug
		var templateUUID string
		var publishedAt *time.Time
		if publish {
			publishedAt = &now
		}
		// Upsert template slug -> id (uuid), set name/provider/model/visibility/status
		const upsertTemplate = `
INSERT INTO templates (slug, name, description, status, visibility, model_provider, model_name, created_at, updated_at, published_at)
VALUES ($1, $2, NULL, $3, $4, $5, $6, NOW(), NOW(), $7)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  visibility = EXCLUDED.visibility,
  model_provider = EXCLUDED.model_provider,
  model_name = EXCLUDED.model_name,
  status = EXCLUDED.status,
  updated_at = NOW(),
  published_at = CASE WHEN EXCLUDED.published_at IS NOT NULL THEN EXCLUDED.published_at ELSE templates.published_at END
RETURNING id
`
		status := "draft"
		if publish {
			status = "published"
		}
		if err := tx.QueryRowContext(ctx, upsertTemplate, it.ID, it.Name, status, visibility, provider, modelName, publishedAt).Scan(&templateUUID); err != nil {
			log.Fatalf("upsert template slug=%s: %v", it.ID, err)
		}

		// 2) Upsert template_versions version=1 for this template
		// If exists, update prompt_template; else insert.
		var versionUUID string
		const upsertVersion = `
INSERT INTO template_versions (template_id, version, prompt_template, negative_prompt, prompt_variables, model_parameters, input_requirements, output_mime, created_at)
VALUES ($1, 1, $2, NULL, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 'image/png', NOW())
ON CONFLICT (template_id, version) DO UPDATE SET
  prompt_template = EXCLUDED.prompt_template
RETURNING id
`
		if err := tx.QueryRowContext(ctx, upsertVersion, templateUUID, it.Prompt).Scan(&versionUUID); err != nil {
			log.Fatalf("upsert version for slug=%s: %v", it.ID, err)
		}

		// 3) Set current_version_id to version=1
		const setCurrent = `
UPDATE templates SET current_version_id = $1, updated_at = NOW() WHERE id = $2
`
		if _, err := tx.ExecContext(ctx, setCurrent, versionUUID, templateUUID); err != nil {
			log.Fatalf("set current_version_id slug=%s: %v", it.ID, err)
		}

		count++
	}

	if err := tx.Commit(); err != nil {
		log.Fatalf("commit: %v", err)
	}
	log.Printf("[seed-templates] Imported %d templates (publish=%v visibility=%s provider=%s model=%s)\n", count, publish, visibility, provider, modelName)
}

func openDB() (*sql.DB, error) {
	// Priority: DATABASE_URL or compose from DB_* vars
	if url := os.Getenv("DATABASE_URL"); url != "" {
		return sql.Open("pgx", url)
	}
	host := getenv("DB_HOST", "localhost")
	port := getenv("DB_PORT", "5432")
	user := getenv("DB_USER", "imageai")
	pass := getenv("DB_PASSWORD", "imageai_pass")
	name := getenv("DB_NAME", "imageai_db")
	ssl := getenv("DB_SSLMODE", "disable")
	dsn := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=%s", user, pass, host, port, name, ssl)
	return sql.Open("pgx", dsn)
}

func getenv(k, def string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return def
}
