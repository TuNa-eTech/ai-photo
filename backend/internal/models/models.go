package models

// ProcessImageRequest represents the request payload for processing an image with a template.
type ProcessImageRequest struct {
	TemplateID string `json:"template_id"`
	ImagePath  string `json:"image_path"`
}

// ProcessImageResponse represents the response payload containing the processed image URL.
type ProcessImageResponse struct {
	ProcessedImageURL string `json:"processed_image_url"`
}

// Template represents an AI style template.
type Template struct {
	ID     string `json:"id"`
	Name   string `json:"name"`
	Prompt string `json:"prompt"`
}

// ErrorResponse represents a standard error response.
type ErrorResponse struct {
	Error     string `json:"error"`
	ErrorCode string `json:"error_code"`
}

// UserRegisterRequest represents the request payload for registering/updating a user profile.
type UserRegisterRequest struct {
	Name      string `json:"name"`
	Email     string `json:"email"`
	AvatarURL string `json:"avatar_url"`
}

// UserRegisterResponse represents the response payload for a successful user registration/update.
type UserRegisterResponse struct {
	UserID  string `json:"user_id"`
	Message string `json:"message"`
}

// User represents a user profile stored in the database.
type User struct {
	ID        string `json:"id"` // Unique user ID (could be Firebase UID or email)
	Name      string `json:"name"`
	Email     string `json:"email"`
	AvatarURL string `json:"avatar_url"`
}
