// main.go (production-safe entrypoint)
package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"imageaiwrapper-backend/internal/api"
	"imageaiwrapper-backend/internal/auth"
	"imageaiwrapper-backend/internal/config"

	"github.com/joho/godotenv"
)

func main() {
	fmt.Println("ImageAIWraper backend is starting...")

	// Load .env file if present (for local development convenience)
	_ = godotenv.Load()

	// Load configuration from environment variables (requires FIREBASE_SERVICE_ACCOUNT)
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// Ensure Firebase service account file exists
	if _, err := os.Stat(cfg.FirebaseServiceAccount); os.IsNotExist(err) {
		log.Fatalf("Firebase service account file not found: %s", cfg.FirebaseServiceAccount)
	}

	// Initialize Firebase Auth (required; no dev/insecure fallbacks)
	firebaseAuth, err := auth.NewFirebaseAuth(cfg.FirebaseServiceAccount)
	if err != nil {
		log.Fatalf("Failed to initialize Firebase Auth: %v", err)
	}

	// Import the real ProcessImageHandler
	importedHandler := http.HandlerFunc(api.ProcessImageHandler)

	// Set up HTTP server and routes
	mux := http.NewServeMux()

	// Production policy:
	// - Keep /v1/images/process public (unchanged)
	// - Protect /v1/users/register with Firebase Auth
	mux.Handle("/v1/images/process", importedHandler)
	mux.Handle("/v1/users/register", firebaseAuth.AuthMiddleware(http.HandlerFunc(api.RegisterUserHandler)))

	// Start server
	fmt.Printf("Server listening on port %s\n", cfg.Port)
	log.Fatal(http.ListenAndServe(":"+cfg.Port, mux))
}
