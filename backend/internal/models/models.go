package models

import "time"

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

// TemplateListItem represents public template info for listing (no prompt exposure).
type TemplateListItem struct {
	ID           string     `json:"id"`
	Name         string     `json:"name"`
	ThumbnailURL string     `json:"thumbnail_url,omitempty"`
	PublishedAt  *time.Time `json:"published_at,omitempty"`
	UsageCount   int        `json:"usage_count,omitempty"`
}

// TemplatesList is the list response payload for templates browsing.
type TemplatesList struct {
	Templates []TemplateListItem `json:"templates"`
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

// --- Admin Templates (CRUD) ---

// TemplateAdmin represents admin-facing template fields.
type TemplateAdmin struct {
	ID           string     `json:"id"` // mirror slug for consistency with public APIs
	Slug         string     `json:"slug"`
	Name         string     `json:"name"`
	Description  *string    `json:"description,omitempty"`
	ThumbnailURL *string    `json:"thumbnail_url,omitempty"`
	Status       string     `json:"status"`     // draft | published | archived
	Visibility   string     `json:"visibility"` // public | private
	PublishedAt  *time.Time `json:"published_at,omitempty"`
	UsageCount   int        `json:"usage_count,omitempty"`
	UpdatedAt    *time.Time `json:"updated_at,omitempty"`
	Tags         []string   `json:"tags,omitempty"` // tag slugs
}

// AdminTemplatesList is the list payload for admin browsing.
type AdminTemplatesList struct {
	Templates []TemplateAdmin `json:"templates"`
}

// --- Admin Template Assets (upload/list/update/delete) ---

// TemplateAssetAdmin represents a stored asset for a template.
type TemplateAssetAdmin struct {
	ID        string     `json:"id"`
	URL       string     `json:"url"`
	Kind      string     `json:"kind"`       // thumbnail | cover | preview
	SortOrder int        `json:"sort_order"` // ordering within kind
	CreatedAt *time.Time `json:"created_at,omitempty"`
}

// CreateTemplateInput defines fields to create a template.
type CreateTemplateInput struct {
	Slug         string   `json:"slug"`
	Name         string   `json:"name"`
	Description  *string  `json:"description,omitempty"`
	Status       string   `json:"status"`                  // draft | published | archived
	Visibility   string   `json:"visibility"`              // public | private
	Tags         []string `json:"tags,omitempty"`          // tag slugs
	ThumbnailURL *string  `json:"thumbnail_url,omitempty"` // Phase 1: URL input
}

// UpdateTemplateInput defines fields to update a template (full update).
type UpdateTemplateInput struct {
	Name         string   `json:"name"`
	Description  *string  `json:"description,omitempty"`
	Status       string   `json:"status"`                  // draft | published | archived
	Visibility   string   `json:"visibility"`              // public | private
	Tags         []string `json:"tags,omitempty"`          // replace mapping with provided set
	ThumbnailURL *string  `json:"thumbnail_url,omitempty"` // optional update (upsert)
}
