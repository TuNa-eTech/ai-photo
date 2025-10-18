// main.go
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

	// Load .env file if present (for local development)
	_ = godotenv.Load()

	// Load configuration from environment variables
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// Check if service account file exists
	if _, err := os.Stat(cfg.FirebaseServiceAccount); os.IsNotExist(err) {
		log.Fatalf("Firebase service account file not found: %s", cfg.FirebaseServiceAccount)
	}

	// Initialize Firebase Auth
	firebaseAuth, err := auth.NewFirebaseAuth(cfg.FirebaseServiceAccount)
	if err != nil {
		log.Fatalf("Failed to initialize Firebase Auth: %v", err)
	}

	// Import the real ProcessImageHandler
	importedHandler := http.HandlerFunc(api.ProcessImageHandler)

	// Set up HTTP server and routes
	mux := http.NewServeMux()

	disableAuth := os.Getenv("DISABLE_AUTH")
	if disableAuth == "true" {
		fmt.Println("WARNING: Firebase Auth is DISABLED for local development.")
		mux.Handle("/v1/images/process", importedHandler)
		mux.Handle("/v1/users/register", http.HandlerFunc(api.RegisterUserHandler))
	} else {
		mux.Handle("/v1/images/process", firebaseAuth.AuthMiddleware(importedHandler))
		mux.Handle("/v1/users/register", http.HandlerFunc(api.RegisterUserHandler))
	}

	fmt.Printf("Server listening on port %s\n", cfg.Port)
	log.Fatal(http.ListenAndServe(":"+cfg.Port, mux))
}
