package api

import (
	"encoding/json"
	"net/http"
	"strings"

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
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(models.ErrorResponse{
			Error:     "invalid request body",
			ErrorCode: "invalid_request",
		})
		return
	}

	if req.TemplateID == "" || req.ImagePath == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(models.ErrorResponse{
			Error:     "template_id and image_path are required",
			ErrorCode: "missing_fields",
		})
		return
	}

	if !imageExists(req.ImagePath) {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(models.ErrorResponse{
			Error:     "image not found",
			ErrorCode: "image_not_found",
		})
		return
	}

	_, err := getTemplateByID(req.TemplateID)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(models.ErrorResponse{
			Error:     "template not found",
			ErrorCode: "template_not_found",
		})
		return
	}

	// Call image processing logic (stub)
	processedURL, err := processImage(&req)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(models.ErrorResponse{
			Error:     "failed to process image",
			ErrorCode: "internal_error",
		})
		return
	}

	resp := models.ProcessImageResponse{ProcessedImageURL: processedURL}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

// RegisterUserHandler handles the /v1/users/register endpoint.
func RegisterUserHandler(w http.ResponseWriter, r *http.Request) {
	authHeader := r.Header.Get("Authorization")
	if !strings.HasPrefix(authHeader, "Bearer ") {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(models.ErrorResponse{
			Error:     "missing or invalid Authorization header",
			ErrorCode: "unauthorized",
		})
		return
	}
	idToken := strings.TrimPrefix(authHeader, "Bearer ")
	idToken = strings.TrimSpace(idToken)
	if idToken == "" {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(models.ErrorResponse{
			Error:     "missing Firebase ID token",
			ErrorCode: "unauthorized",
		})
		return
	}

	var req models.UserRegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(models.ErrorResponse{
			Error:     "invalid request body",
			ErrorCode: "invalid_request",
		})
		return
	}
	if req.Name == "" || req.Email == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(models.ErrorResponse{
			Error:     "name and email are required",
			ErrorCode: "missing_fields",
		})
		return
	}

	// TODO: Verify idToken with Firebase Admin SDK and extract user info.
	// For now, stub user_id as email.
	userID := req.Email

	// TODO: Save/update user profile in DB.
	// For now, just return success.

	resp := models.UserRegisterResponse{
		UserID:  userID,
		Message: "User registered/updated successfully.",
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
