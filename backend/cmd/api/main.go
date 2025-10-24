package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"imageaiwrapper-backend/internal/api"
	"imageaiwrapper-backend/internal/auth"

	"github.com/joho/godotenv"
)

func main() {
	mux := http.NewServeMux()

	// Public endpoint (kept as-is; can be protected if required)
	mux.HandleFunc("/v1/images/process", api.ProcessImageHandler)

	// Load .env files (prefer .env.local) for local/dev configuration
	_ = godotenv.Load(".env.local", ".env")

	// Production auth: require Firebase Admin SDK and do not allow dev/insecure fallbacks
	sa := strings.TrimSpace(os.Getenv("FIREBASE_SERVICE_ACCOUNT"))
	if sa == "" {
		log.Fatal("FIREBASE_SERVICE_ACCOUNT is required in production")
	}
	fa, err := auth.NewFirebaseAuth(sa)
	if err != nil {
		log.Fatalf("Failed to initialize Firebase Admin SDK: %v", err)
	}

	// Protected endpoints (no dev or insecure fallbacks)
	mux.Handle("/v1/users/register", fa.AuthMiddleware(http.HandlerFunc(api.RegisterUserHandler)))
	mux.Handle("/v1/templates", fa.AuthMiddleware(http.HandlerFunc(api.ListTemplatesHandler)))

	// Admin endpoints (require auth + admin)
	mux.Handle("/v1/admin/templates", fa.AuthMiddleware(fa.AdminOnly(http.HandlerFunc(api.AdminTemplatesCollectionHandler))))
	mux.Handle("/v1/admin/templates/", fa.AuthMiddleware(fa.AdminOnly(http.HandlerFunc(api.AdminTemplateItemHandler))))

	// Root/404
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/" {
			fmt.Fprintf(w, "Hello, World!")
		} else {
			http.NotFound(w, r)
		}
	})

	// Note: DEV endpoints (/v1/dev/*), debug route (/debug/processed), and static mounts (/processed/*, /assets/*) are intentionally removed.

	// Resolve port from env, default 8080
	port := strings.TrimSpace(os.Getenv("PORT"))
	if port == "" {
		port = "8080"
	}
	log.Println("Starting server on :" + port)
	// RequestID -> Logging -> CORS -> mux
	if err := http.ListenAndServe(":"+port, api.CORSMiddleware(api.LoggingMiddleware(api.RequestIDMiddleware(mux)))); err != nil {
		log.Fatal(err)
	}
}
