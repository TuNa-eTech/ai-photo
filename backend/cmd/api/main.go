package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"imageaiwrapper-backend/internal/api"
	"imageaiwrapper-backend/internal/auth"
)

func main() {
	mux := http.NewServeMux()

	// Public endpoints
	mux.HandleFunc("/v1/images/process", api.ProcessImageHandler)

	// Serve processed images statically (dev/local)
	// Maps URL /processed/* to files under the "processed" directory (cwd or /processed in container)
	mux.Handle("/processed/", http.StripPrefix("/processed/", http.FileServer(http.Dir("/processed"))))

	// Serve uploaded assets statically (dev/local)
	// Maps URL /assets/* to files under the "/assets" directory (mounted via Docker)
	mux.Handle("/assets/", http.StripPrefix("/assets/", http.FileServer(http.Dir("/assets"))))

	// Debug endpoint to inspect /processed inside container
	mux.HandleFunc("/debug/processed", api.DebugProcessedHandler)

	// Conditionally protect /v1/users/register and /v1/templates with Firebase Admin verification if FIREBASE_SERVICE_ACCOUNT is provided
	if sa := os.Getenv("FIREBASE_SERVICE_ACCOUNT"); sa != "" {
		if fa, err := auth.NewFirebaseAuth(sa); err == nil {
			// Protected public endpoints
			mux.Handle("/v1/users/register", fa.AuthMiddleware(http.HandlerFunc(api.RegisterUserHandler)))
			mux.Handle("/v1/templates", fa.AuthMiddleware(http.HandlerFunc(api.ListTemplatesHandler)))

			// Admin endpoints (require auth + admin)
			mux.Handle("/v1/admin/templates", fa.AuthMiddleware(fa.AdminOnly(http.HandlerFunc(api.AdminTemplatesCollectionHandler))))
			mux.Handle("/v1/admin/templates/", fa.AuthMiddleware(fa.AdminOnly(http.HandlerFunc(api.AdminTemplateItemHandler))))

			log.Println("AuthMiddleware enabled for /v1/users/register, /v1/templates, and admin endpoints (Firebase Admin SDK)")
		} else {
			log.Printf("Warning: failed to initialize Firebase Admin SDK (%v). Falling back to unprotected endpoints.\n", err)
			mux.HandleFunc("/v1/users/register", api.RegisterUserHandler)
			mux.HandleFunc("/v1/templates", api.ListTemplatesHandler)

			// DevAuth fallback (DEV-only)
			if os.Getenv("DEV_AUTH_ENABLED") == "1" {
				mux.HandleFunc("/v1/dev/login", api.DevLoginHandler)
				mux.HandleFunc("/v1/dev/whoami", api.DevWhoAmIHandler)
				mux.Handle("/v1/admin/templates", api.DevAuthMiddleware(http.HandlerFunc(api.AdminTemplatesCollectionHandler)))
				mux.Handle("/v1/admin/templates/", api.DevAuthMiddleware(http.HandlerFunc(api.AdminTemplateItemHandler)))
				log.Println("DEV AUTH: Admin endpoints protected by DevAuth (email/password via env).")
			} else if os.Getenv("ALLOW_INSECURE_ADMIN") == "1" {
				mux.HandleFunc("/v1/admin/templates", api.AdminTemplatesCollectionHandler)
				mux.HandleFunc("/v1/admin/templates/", api.AdminTemplateItemHandler)
				log.Println("INSECURE MODE: Admin endpoints enabled without auth (ALLOW_INSECURE_ADMIN=1). DO NOT USE IN PROD.")
			} else {
				log.Println("Admin endpoints not registered (no Firebase Admin; DEV_AUTH_ENABLED and ALLOW_INSECURE_ADMIN are off).")
			}
		}
	} else {
		mux.HandleFunc("/v1/users/register", api.RegisterUserHandler)
		mux.HandleFunc("/v1/templates", api.ListTemplatesHandler)

		// DevAuth (DEV-only): protect admin endpoints with email/password if enabled
		if os.Getenv("DEV_AUTH_ENABLED") == "1" {
			mux.HandleFunc("/v1/dev/login", api.DevLoginHandler)
			mux.HandleFunc("/v1/dev/whoami", api.DevWhoAmIHandler)
			mux.Handle("/v1/admin/templates", api.DevAuthMiddleware(http.HandlerFunc(api.AdminTemplatesCollectionHandler)))
			mux.Handle("/v1/admin/templates/", api.DevAuthMiddleware(http.HandlerFunc(api.AdminTemplateItemHandler)))
			log.Println("DEV AUTH: Admin endpoints protected by DevAuth (email/password via env).")
		} else if os.Getenv("ALLOW_INSECURE_ADMIN") == "1" {
			// Dev-only fallback to expose admin endpoints without Firebase Admin.
			mux.HandleFunc("/v1/admin/templates", api.AdminTemplatesCollectionHandler)
			mux.HandleFunc("/v1/admin/templates/", api.AdminTemplateItemHandler)
			log.Println("INSECURE MODE: Admin endpoints enabled without auth (ALLOW_INSECURE_ADMIN=1). DO NOT USE IN PROD.")
		} else {
			log.Println("FIREBASE_SERVICE_ACCOUNT not set; public endpoints unprotected; admin endpoints not registered.")
		}
	}

	// Root/404
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/" {
			fmt.Fprintf(w, "Hello, World!")
		} else {
			http.NotFound(w, r)
		}
	})

	log.Println("Starting server on :8080")
	// RequestID -> Logging -> CORS -> mux
	if err := http.ListenAndServe(":8080", api.CORSMiddleware(api.LoggingMiddleware(api.RequestIDMiddleware(mux)))); err != nil {
		log.Fatal(err)
	}
}
