package api

import (
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"path"
	"path/filepath"
	"strings"
	"time"

	"imageaiwrapper-backend/internal/database"
	"imageaiwrapper-backend/internal/storage"
)

var allowedAssetKinds = map[string]struct{}{
	"thumbnail": {},
	"cover":     {},
	"preview":   {},
}

func parseSlugFromAssetsPath(r *http.Request) (slug string, rest string, ok bool) {
	// /v1/admin/templates/{slug}/assets or /v1/admin/templates/{slug}/assets/{id}
	const prefix = "/v1/admin/templates/"
	if !strings.HasPrefix(r.URL.Path, prefix) {
		return "", "", false
	}
	restPath := strings.TrimPrefix(r.URL.Path, prefix) // {slug}/assets or {slug}/assets/{id}
	parts := strings.Split(restPath, "/")
	if len(parts) < 2 {
		return "", "", false
	}
	return parts[0], strings.Join(parts[1:], "/"), true
}

// AdminTemplateAssetsCollection handles:
// GET  /v1/admin/templates/{slug}/assets
// POST /v1/admin/templates/{slug}/assets  (multipart/form-data)
func AdminTemplateAssetsCollection(w http.ResponseWriter, r *http.Request) {
	slug, rest, ok := parseSlugFromAssetsPath(r)
	if !ok || !strings.HasPrefix(rest, "assets") || rest == "" || strings.Contains(rest, "/") && strings.Count(rest, "/") > 0 && strings.Split(rest, "/")[0] != "assets" {
		NotFound(w, r, "not found")
		return
	}

	switch r.Method {
	case http.MethodGet:
		items, err := database.ListTemplateAssets(r.Context(), slug)
		if err != nil {
			if strings.Contains(strings.ToLower(err.Error()), "not_found") {
				NotFound(w, r, "template not found")
				return
			}
			ServerError(w, r, "failed to list assets")
			return
		}
		OK(w, r, items)
		return

	case http.MethodPost:
		if ct := r.Header.Get("Content-Type"); !strings.Contains(ct, "multipart/form-data") {
			BadRequest(w, r, "invalid_request", "Content-Type must be multipart/form-data", nil)
			return
		}
		if err := r.ParseMultipartForm(32 << 20); err != nil { // 32MB
			BadRequest(w, r, "invalid_request", "failed to parse multipart form", nil)
			return
		}
		kind := strings.TrimSpace(r.FormValue("kind"))
		if _, ok := allowedAssetKinds[kind]; !ok {
			Unprocessable(w, r, "validation_error", map[string]any{"fields": []string{"kind"}, "message": "invalid kind"})
			return
		}
		file, hdr, err := r.FormFile("file")
		if err != nil {
			BadRequest(w, r, "invalid_request", "file is required", nil)
			return
		}
		defer file.Close()

		url, err := saveUploadedImage(slug, hdr, file)
		if err != nil {
			msg := strings.ToLower(err.Error())
			if strings.Contains(msg, "payload_too_large") {
				WriteJSON[struct{}](w, http.StatusRequestEntityTooLarge, APIResponse[struct{}]{Success: false, Error: &APIError{Code: "payload_too_large", Message: "file too large"}, Meta: buildMeta(r)})
				return
			}
			if strings.Contains(msg, "unsupported_media_type") {
				WriteJSON[struct{}](w, http.StatusUnsupportedMediaType, APIResponse[struct{}]{Success: false, Error: &APIError{Code: "unsupported_media_type", Message: "unsupported media type"}, Meta: buildMeta(r)})
				return
			}
			ServerError(w, r, "failed to save file")
			return
		}

		item, err := database.InsertTemplateAsset(r.Context(), slug, kind, url, nil)
		if err != nil {
			if strings.Contains(strings.ToLower(err.Error()), "not_found") {
				NotFound(w, r, "template not found")
				return
			}
			ServerError(w, r, "failed to save asset")
			return
		}
		Created(w, r, item)
		return

	default:
		WriteJSON[struct{}](w, http.StatusMethodNotAllowed, APIResponse[struct{}]{
			Success: false,
			Error:   &APIError{Code: "method_not_allowed", Message: "method not allowed"},
			Meta:    buildMeta(r),
		})
		return
	}
}

// AdminTemplateAssetItem handles:
// PUT    /v1/admin/templates/{slug}/assets/{id}
// DELETE /v1/admin/templates/{slug}/assets/{id}
func AdminTemplateAssetItem(w http.ResponseWriter, r *http.Request) {
	slug, rest, ok := parseSlugFromAssetsPath(r)
	if !ok {
		NotFound(w, r, "not found")
		return
	}
	parts := strings.Split(strings.TrimPrefix(rest, ""), "/")
	// Expect "assets/{id}"
	if len(parts) != 2 || parts[0] != "assets" {
		NotFound(w, r, "not found")
		return
	}
	id := path.Base(parts[1])

	switch r.Method {
	case http.MethodPut:
		var in struct {
			Kind      *string `json:"kind"`
			SortOrder *int    `json:"sort_order"`
		}
		if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
			BadRequest(w, r, "invalid_request", "invalid request body", nil)
			return
		}
		if in.Kind != nil {
			k := strings.TrimSpace(*in.Kind)
			if _, ok := allowedAssetKinds[k]; !ok {
				Unprocessable(w, r, "validation_error", map[string]any{"fields": []string{"kind"}, "message": "invalid kind"})
				return
			}
			in.Kind = &k
		}
		item, err := database.UpdateTemplateAsset(r.Context(), slug, id, in.Kind, in.SortOrder)
		if err != nil {
			msg := strings.ToLower(err.Error())
			if strings.Contains(msg, "not_found") {
				NotFound(w, r, "not found")
				return
			}
			ServerError(w, r, "failed to update asset")
			return
		}
		OK(w, r, item)
		return

	case http.MethodDelete:
		if err := database.DeleteTemplateAsset(r.Context(), slug, id); err != nil {
			if strings.Contains(strings.ToLower(err.Error()), "not_found") {
				NotFound(w, r, "not found")
				return
			}
			ServerError(w, r, "failed to delete asset")
			return
		}
		NoContent(w, r)
		return

	default:
		WriteJSON[struct{}](w, http.StatusMethodNotAllowed, APIResponse[struct{}]{
			Success: false,
			Error:   &APIError{Code: "method_not_allowed", Message: "method not allowed"},
			Meta:    buildMeta(r),
		})
		return
	}
}

func saveUploadedImage(slug string, hdr *multipart.FileHeader, file multipart.File) (string, error) {
	// Basic size guard (e.g., 12MB)
	if hdr.Size > 12*1024*1024 {
		return "", fmt.Errorf("payload_too_large")
	}
	// Read into memory (DEV-scale). For large files, stream/chunk approach.
	data, err := io.ReadAll(file)
	if err != nil {
		return "", fmt.Errorf("read file: %w", err)
	}
	// Detect content type
	ct := http.DetectContentType(data)
	var ext string
	switch ct {
	case "image/jpeg":
		ext = ".jpg"
	case "image/png":
		ext = ".png"
	default:
		return "", fmt.Errorf("unsupported_media_type: %s", ct)
	}
	// Generate filename
	ts := time.Now().UTC().Format("20060102T150405.000000000")
	base := strings.TrimSuffix(filepathBaseSafe(hdr.Filename), filepath.Ext(hdr.Filename))
	if base == "" {
		base = "upload"
	}
	filename := fmt.Sprintf("%s-%s%s", base, ts, ext)

	// Save to assets and return public URL
	return storage.SaveTemplateAssetFile(slug, filename, data)
}

// filepathBaseSafe returns a sanitized base name without directory traversal.
func filepathBaseSafe(p string) string {
	b := path.Base(strings.ReplaceAll(p, "\\", "/"))
	b = strings.TrimSpace(b)
	if b == "." || b == "/" || b == "" {
		return "file"
	}
	return b
}
