package api

import (
	"crypto/rand"
	"encoding/hex"
	"log"
	"net/http"
	"os"
	"strings"
	"time"
)

func LoggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		reqID := r.Header.Get("X-Request-ID")
		if reqID == "" {
			if v := r.Context().Value(ctxKeyRequestID); v != nil {
				if s, ok := v.(string); ok && s != "" {
					reqID = s
				}
			}
		}
		if reqID != "" {
			log.Printf("[API] %s %s (requestId=%s)", r.Method, r.URL.Path, reqID)
		} else {
			log.Printf("[API] %s %s", r.Method, r.URL.Path)
		}
		next.ServeHTTP(w, r)
	})
}

// RequestIDMiddleware ensures each request has a request ID in header/context.
func RequestIDMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		reqID := r.Header.Get("X-Request-ID")
		if reqID == "" {
			reqID = generateRequestID()
		}
		// Write back header for downstream and client visibility
		w.Header().Set("X-Request-ID", reqID)
		ctx := WithRequestID(r.Context(), reqID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func generateRequestID() string {
	var b [16]byte
	if _, err := rand.Read(b[:]); err != nil {
		return time.Now().UTC().Format("20060102T150405.000000000Z07")
	}
	return hex.EncodeToString(b[:])
}

// CORSMiddleware applies CORS headers based on environment configuration and handles preflight requests.
// Env:
// - CORS_ALLOWED_ORIGINS: comma-separated list of origins (e.g., http://localhost:5173,https://admin.example.com). Default: *
// - CORS_ALLOWED_HEADERS: comma-separated list of allowed headers. Default: Authorization, Content-Type
// - CORS_ALLOWED_METHODS: comma-separated list of methods. Default: GET, POST, PUT, DELETE, OPTIONS
func CORSMiddleware(next http.Handler) http.Handler {
	originsEnv := strings.TrimSpace(os.Getenv("CORS_ALLOWED_ORIGINS"))
	allowedOrigins := map[string]struct{}{}
	if originsEnv == "" || originsEnv == "*" {
		// empty map means wildcard
	} else {
		for _, o := range strings.Split(originsEnv, ",") {
			if s := strings.TrimSpace(o); s != "" {
				allowedOrigins[s] = struct{}{}
			}
		}
	}

	allowedHeaders := os.Getenv("CORS_ALLOWED_HEADERS")
	if strings.TrimSpace(allowedHeaders) == "" {
		allowedHeaders = "Authorization, Content-Type"
	}
	allowedMethods := os.Getenv("CORS_ALLOWED_METHODS")
	if strings.TrimSpace(allowedMethods) == "" {
		allowedMethods = "GET, POST, PUT, DELETE, OPTIONS"
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")

		// Set Access-Control-Allow-Origin
		if len(allowedOrigins) == 0 {
			// wildcard
			w.Header().Set("Access-Control-Allow-Origin", "*")
		} else if origin != "" {
			if _, ok := allowedOrigins[origin]; ok {
				w.Header().Set("Access-Control-Allow-Origin", origin)
				w.Header().Set("Vary", "Origin")
			}
		}

		// Always set these for CORS-capable responses
		w.Header().Set("Access-Control-Allow-Headers", allowedHeaders)
		w.Header().Set("Access-Control-Allow-Methods", allowedMethods)

		// Handle preflight
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}
