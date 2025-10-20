package api

import (
	"crypto/rand"
	"encoding/hex"
	"log"
	"net/http"
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
