// main.go
package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

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

	// Protected handler example
	protectedHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		token, ok := auth.GetFirebaseUser(r)
		if !ok {
			http.Error(w, `{"error": "Unauthorized. Invalid, expired, or missing Firebase authentication token."}`, http.StatusUnauthorized)
			return
		}
		// Example: return the user's UID and email (if available)
		email := ""
		if e, ok := token.Claims["email"].(string); ok {
			email = e
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		fmt.Fprintf(w, `{"uid": "%s", "email": "%s"}`, token.UID, email)
	})

	// Set up HTTP server and routes
	mux := http.NewServeMux()
	mux.Handle("/v1/images/process", firebaseAuth.AuthMiddleware(protectedHandler))

	fmt.Printf("Server listening on port %s\n", cfg.Port)
	log.Fatal(http.ListenAndServe(":"+cfg.Port, mux))
}
