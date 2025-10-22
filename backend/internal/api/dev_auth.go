package api

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"
)

// DEV AUTH - Development-only email/password authentication
// Enabled when DEV_AUTH_ENABLED=1 in environment.
//
// Endpoints:
// - POST /v1/dev/login    { "email": string, "password": string } -> { token, email, role }
// - GET  /v1/dev/whoami   Authorization: Bearer <token>         -> { email, role }
//
// Middleware:
// - DevAuthMiddleware(next) validates Bearer token against in-memory store.

var (
	devAuthEnabled = strings.TrimSpace(os.Getenv("DEV_AUTH_ENABLED")) == "1"

	// in-memory token store: token -> email
	devTokens   = map[string]string{}
	devTokensMu sync.RWMutex
)

type devLoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type devLoginResponse struct {
	Token string `json:"token"`
	Email string `json:"email"`
	Role  string `json:"role"`
}

type devWhoAmIResponse struct {
	Email string `json:"email"`
	Role  string `json:"role"`
}

func genToken() string {
	var b [16]byte
	if _, err := rand.Read(b[:]); err != nil {
		return time.Now().UTC().Format("20060102T150405.000000000Z07")
	}
	return hex.EncodeToString(b[:])
}

func getBearerToken(r *http.Request) string {
	auth := r.Header.Get("Authorization")
	if auth == "" || !strings.HasPrefix(auth, "Bearer ") {
		return ""
	}
	return strings.TrimSpace(strings.TrimPrefix(auth, "Bearer "))
}

// DevLoginHandler handles POST /v1/dev/login
func DevLoginHandler(w http.ResponseWriter, r *http.Request) {
	if !devAuthEnabled {
		Forbidden(w, r, "dev auth disabled")
		return
	}
	if r.Method != http.MethodPost {
		WriteJSON[struct{}](w, http.StatusMethodNotAllowed, APIResponse[struct{}]{
			Success: false,
			Error:   &APIError{Code: "method_not_allowed", Message: "method not allowed"},
			Meta:    buildMeta(r),
		})
		return
	}

	var req devLoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		BadRequest(w, r, "invalid_request", "invalid request body", nil)
		return
	}
	email := strings.TrimSpace(req.Email)
	password := strings.TrimSpace(req.Password)

	wantEmail := strings.TrimSpace(os.Getenv("DEV_ADMIN_EMAIL"))
	wantPass := strings.TrimSpace(os.Getenv("DEV_ADMIN_PASSWORD"))
	if wantEmail == "" || wantPass == "" {
		Forbidden(w, r, "dev admin credentials not configured")
		return
	}

	if email != wantEmail || password != wantPass {
		Unauthorized(w, r, "invalid email or password")
		return
	}

	token := genToken()
	devTokensMu.Lock()
	devTokens[token] = email
	devTokensMu.Unlock()

	OK(w, r, devLoginResponse{
		Token: token,
		Email: email,
		Role:  "admin",
	})
}

// DevWhoAmIHandler handles GET /v1/dev/whoami
func DevWhoAmIHandler(w http.ResponseWriter, r *http.Request) {
	if !devAuthEnabled {
		Forbidden(w, r, "dev auth disabled")
		return
	}
	if r.Method != http.MethodGet {
		WriteJSON[struct{}](w, http.StatusMethodNotAllowed, APIResponse[struct{}]{
			Success: false,
			Error:   &APIError{Code: "method_not_allowed", Message: "method not allowed"},
			Meta:    buildMeta(r),
		})
		return
	}

	token := getBearerToken(r)
	if token == "" {
		Unauthorized(w, r, "missing Authorization bearer token")
		return
	}
	devTokensMu.RLock()
	email, ok := devTokens[token]
	devTokensMu.RUnlock()
	if !ok {
		Unauthorized(w, r, "invalid token")
		return
	}
	OK(w, r, devWhoAmIResponse{
		Email: email,
		Role:  "admin",
	})
}

// DevAuthMiddleware validates Bearer <token> for admin endpoints when DEV_AUTH_ENABLED=1
func DevAuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !devAuthEnabled {
			Forbidden(w, r, "dev auth disabled")
			return
		}
		token := getBearerToken(r)
		if token == "" {
			Unauthorized(w, r, "missing Authorization bearer token")
			return
		}
		devTokensMu.RLock()
		_, ok := devTokens[token]
		devTokensMu.RUnlock()
		if !ok {
			Unauthorized(w, r, "invalid token")
			return
		}
		next.ServeHTTP(w, r)
	})
}
