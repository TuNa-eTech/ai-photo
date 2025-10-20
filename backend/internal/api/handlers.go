package api

import (
	"encoding/json"
	"net/http"
	"strings"

	"imageaiwrapper-backend/internal/auth"
	"imageaiwrapper-backend/internal/database"
	"imageaiwrapper-backend/internal/image"
	"imageaiwrapper-backend/internal/models"
	"imageaiwrapper-backend/internal/storage"
)

// --- Dependency injection for testability ---
var (
	imageExists     = storage.ImageExists
	getTemplateByID = database.GetTemplateByID
	processImage    = image.ProcessImage
)

// ProcessImageHandler handles the /v1/images/process endpoint.
func ProcessImageHandler(w http.ResponseWriter, r *http.Request) {
	var req models.ProcessImageRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		BadRequest(w, r, "invalid_request", "invalid request body", nil)
		return
	}

	if req.TemplateID == "" || req.ImagePath == "" {
		BadRequest(w, r, "missing_fields", "template_id and image_path are required", map[string]any{"fields": []string{"template_id", "image_path"}})
		return
	}

	if !imageExists(req.ImagePath) {
		NotFound(w, r, "image not found")
		return
	}

	_, err := getTemplateByID(req.TemplateID)
	if err != nil {
		NotFound(w, r, "template not found")
		return
	}

	// Call image processing logic (stub)
	processedURL, err := processImage(&req)
	if err != nil {
		ServerError(w, r, "failed to process image")
		return
	}
	OK(w, r, models.ProcessImageResponse{ProcessedImageURL: processedURL})
}

// RegisterUserHandler handles the /v1/users/register endpoint.
func RegisterUserHandler(w http.ResponseWriter, r *http.Request) {
	authHeader := r.Header.Get("Authorization")
	if !strings.HasPrefix(authHeader, "Bearer ") {
		Unauthorized(w, r, "missing or invalid Authorization header")
		return
	}
	idToken := strings.TrimPrefix(authHeader, "Bearer ")
	idToken = strings.TrimSpace(idToken)
	if idToken == "" {
		Unauthorized(w, r, "missing Firebase ID token")
		return
	}

	var req models.UserRegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		BadRequest(w, r, "invalid_request", "invalid request body", nil)
		return
	}

	// Try to extract verified email from Firebase token (if AuthMiddleware ran)
	verifiedEmail := ""
	if tok, ok := auth.GetFirebaseUser(r); ok && tok != nil && tok.Claims != nil {
		if em, ok := tok.Claims["email"].(string); ok && em != "" {
			verifiedEmail = em
		}
	}

	// Validate required fields: name is required; email can come from body or verified token
	if strings.TrimSpace(req.Name) == "" || (strings.TrimSpace(req.Email) == "" && verifiedEmail == "") {
		BadRequest(w, r, "missing_fields", "name and email are required", map[string]any{"fields": []string{"name", "email"}})
		return
	}

	// Prefer verified email when present; otherwise use body email
	emailToUse := strings.TrimSpace(req.Email)
	if emailToUse == "" && verifiedEmail != "" {
		emailToUse = verifiedEmail
	}

	// If available, use verified identity as user_id (email). Fallback to email from request.
	userID := emailToUse

	// Persist user profile to Postgres (user_profiles) using email as unique key.
	if err := database.UpsertUserProfile(r.Context(), emailToUse, req.Name, req.AvatarURL); err != nil {
		ServerError(w, r, "failed to persist user profile")
		return
	}
	OK(w, r, models.UserRegisterResponse{
		UserID:  userID,
		Message: "User registered/updated successfully.",
	})
}
