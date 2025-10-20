package database

import (
	"context"
	"database/sql"
	"fmt"
	"os"
	"sync"

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
