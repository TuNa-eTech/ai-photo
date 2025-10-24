package api

import (
	"bytes"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strings"
	"time"
)

func LoggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		iw := &instrumentedWriter{ResponseWriter: w, status: http.StatusOK}
		next.ServeHTTP(iw, r)
		dur := time.Since(start)

		reqID := r.Header.Get("X-Request-ID")
		if reqID == "" {
			if v := r.Context().Value(ctxKeyRequestID); v != nil {
				if s, ok := v.(string); ok && s != "" {
					reqID = s
				}
			}
		}

		if reqID != "" {
			log.Printf("[API] %d %s %s (requestId=%s, dur=%s, size=%d)", iw.status, r.Method, r.URL.Path, reqID, dur.String(), iw.size)
		} else {
			log.Printf("[API] %d %s %s (dur=%s, size=%d)", iw.status, r.Method, r.URL.Path, dur.String(), iw.size)
		}

		// If error response, attempt to parse envelope and log error details
		if iw.status >= 400 && iw.buf.Len() > 0 && strings.HasPrefix(iw.Header().Get("Content-Type"), "application/json") {
			var env APIResponse[any]
			if err := json.Unmarshal(iw.buf.Bytes(), &env); err == nil && env.Error != nil {
				if env.Error.Details != nil {
					detailBytes, _ := json.Marshal(env.Error.Details)
					if len(detailBytes) > 1024 {
						detailBytes = append(detailBytes[:1024], []byte("...")...)
					}
					log.Printf("[API][error] code=%s message=%s details=%s", env.Error.Code, env.Error.Message, string(detailBytes))
				} else {
					log.Printf("[API][error] code=%s message=%s", env.Error.Code, env.Error.Message)
				}
			}
		}
	})
}

// instrumentedWriter captures status, size, and a small copy of the response body for logging.
type instrumentedWriter struct {
	http.ResponseWriter
	status int
	size   int
	buf    bytes.Buffer
}

func (w *instrumentedWriter) WriteHeader(code int) {
	w.status = code
	w.ResponseWriter.WriteHeader(code)
}

func (w *instrumentedWriter) Write(b []byte) (int, error) {
	// keep up to 4KB of body for logging
	if w.buf.Len() < 4096 {
		n := 4096 - w.buf.Len()
		if len(b) < n {
			n = len(b)
		}
		_, _ = w.buf.Write(b[:n])
	}
	n, err := w.ResponseWriter.Write(b)
	w.size += n
	return n, err
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
