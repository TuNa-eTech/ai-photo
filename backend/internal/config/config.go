package config

import (
	"fmt"
	"os"
)

type Config struct {
	FirebaseServiceAccount string
	Port                   string
	DatabaseURL            string
	GeminiAPIKey           string
}

func LoadConfig() (*Config, error) {
	cfg := &Config{}

	// Required: Firebase service account JSON path
	cfg.FirebaseServiceAccount = os.Getenv("FIREBASE_SERVICE_ACCOUNT")
	if cfg.FirebaseServiceAccount == "" {
		return nil, fmt.Errorf("FIREBASE_SERVICE_ACCOUNT environment variable is required")
	}

	// Optional: Port (default 8080)
	cfg.Port = os.Getenv("PORT")
	if cfg.Port == "" {
		cfg.Port = "8080"
	}

	// Optional: Database URL
	cfg.DatabaseURL = os.Getenv("DATABASE_URL")

	// Optional: Gemini API Key
	cfg.GeminiAPIKey = os.Getenv("GEMINI_API_KEY")

	return cfg, nil
}
