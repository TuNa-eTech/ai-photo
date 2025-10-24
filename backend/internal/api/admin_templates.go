package api

import (
	"encoding/json"
	"log"
	"net/http"
	"path"
	"strconv"
	"strings"

	"imageaiwrapper-backend/internal/database"
	"imageaiwrapper-backend/internal/models"
)

var (
	slugRegexValid = func(s string) bool {
		if s == "" {
			return false
		}
		for _, r := range s {
			if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') || r == '-' {
				continue
			}
			return false
		}
		return true
	}
	allowedStatus = map[string]struct{}{
		"draft":     {},
		"published": {},
		"archived":  {},
	}
	allowedVisibility = map[string]struct{}{
		"public":  {},
		"private": {},
	}
)

func validateCreateInput(in *models.CreateTemplateInput) (ok bool, details map[string]any) {
	details = map[string]any{}
	fields := []string{}
	if !slugRegexValid(strings.TrimSpace(in.Slug)) {
		fields = append(fields, "slug")
	}
	if strings.TrimSpace(in.Name) == "" {
		fields = append(fields, "name")
	}
	if _, ok := allowedStatus[in.Status]; !ok {
		fields = append(fields, "status")
	}
	if _, ok := allowedVisibility[in.Visibility]; !ok {
		fields = append(fields, "visibility")
	}
	for _, t := range in.Tags {
		if !slugRegexValid(strings.TrimSpace(t)) {
			fields = append(fields, "tags[]")
			break
		}
	}
	if len(fields) > 0 {
		details["fields"] = fields
		return false, details
	}
	return true, nil
}

func validateUpdateInput(in *models.UpdateTemplateInput) (ok bool, details map[string]any) {
	details = map[string]any{}
	fields := []string{}
	if strings.TrimSpace(in.Name) == "" {
		fields = append(fields, "name")
	}
	if _, ok := allowedStatus[in.Status]; !ok {
		fields = append(fields, "status")
	}
	if _, ok := allowedVisibility[in.Visibility]; !ok {
		fields = append(fields, "visibility")
	}
	for _, t := range in.Tags {
		if !slugRegexValid(strings.TrimSpace(t)) {
			fields = append(fields, "tags[]")
			break
		}
	}
	if len(fields) > 0 {
		details["fields"] = fields
		return false, details
	}
	return true, nil
}

// AdminTemplatesCollectionHandler handles:
// GET /v1/admin/templates -> list
// POST /v1/admin/templates -> create
func AdminTemplatesCollectionHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		qp := r.URL.Query()
		limit, _ := strconv.Atoi(qp.Get("limit"))
		offset, _ := strconv.Atoi(qp.Get("offset"))
		p := database.AdminTemplateQuery{
			Limit:      limit,
			Offset:     offset,
			Q:          qp.Get("q"),
			TagsCSV:    qp.Get("tags"),
			Status:     qp.Get("status"),
			Visibility: qp.Get("visibility"),
			Sort:       qp.Get("sort"), // updated | newest | popular | name
		}
		items, err := database.ListAdminTemplates(r.Context(), p)
		if err != nil {
			ServerError(w, r, "failed to list admin templates")
			return
		}
		OK(w, r, models.AdminTemplatesList{Templates: items})
		return

	case http.MethodPost:
		var in models.CreateTemplateInput
		if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
			BadRequest(w, r, "invalid_request", "invalid request body", nil)
			return
		}
		if ok, det := validateCreateInput(&in); !ok {
			Unprocessable(w, r, "validation_error", det)
			return
		}
		out, err := database.CreateAdminTemplate(r.Context(), in)
		if err != nil {
			msg := strings.ToLower(err.Error())
			if strings.Contains(msg, "duplicate") || strings.Contains(msg, "unique") || strings.Contains(msg, "conflict") {
				Conflict(w, r, "slug already exists")
				return
			}
			// Log underlying error for diagnosis (middleware logs envelope only)
			log.Printf("[AdminTemplates] create error: %v", err)
			WriteJSON[struct{}](w, http.StatusInternalServerError, APIResponse[struct{}]{
				Success: false,
				Error:   &APIError{Code: "internal_error", Message: "failed to create template", Details: map[string]any{"cause": err.Error()}},
				Meta:    buildMeta(r),
			})
			return
		}
		Created(w, r, out)
		return

	default:
		// 405
		WriteJSON[struct{}](w, http.StatusMethodNotAllowed, APIResponse[struct{}]{
			Success: false,
			Error:   &APIError{Code: "method_not_allowed", Message: "method not allowed"},
			Meta:    buildMeta(r),
		})
		return
	}
}

// AdminTemplateItemHandler handles:
// GET    /v1/admin/templates/{slug}
// PUT    /v1/admin/templates/{slug}
// DELETE /v1/admin/templates/{slug}
// POST   /v1/admin/templates/{slug}/publish
// POST   /v1/admin/templates/{slug}/unpublish
func AdminTemplateItemHandler(w http.ResponseWriter, r *http.Request) {
	const prefix = "/v1/admin/templates/"
	if !strings.HasPrefix(r.URL.Path, prefix) {
		NotFound(w, r, "not found")
		return
	}
	rest := strings.TrimPrefix(r.URL.Path, prefix)
	rest = strings.TrimSuffix(rest, "/")
	// Support cases where trailing slash might exist.
	if rest == "" {
		NotFound(w, r, "not found")
		return
	}
	// Split parts to detect action
	parts := strings.Split(rest, "/")
	slug := parts[0]
	action := ""
	if len(parts) > 1 {
		action = parts[1]
	}
	// Normalize slug from path.Base to be safe (though only a-z0-9- expected)
	slug = path.Base(slug)

	// Delegate to assets sub-routes if present: /v1/admin/templates/{slug}/assets[/...]
	if action == "assets" {
		// If exactly ".../assets" -> collection; if ".../assets/{id}" -> item
		if len(parts) == 2 {
			AdminTemplateAssetsCollection(w, r)
			return
		}
		if len(parts) >= 3 {
			AdminTemplateAssetItem(w, r)
			return
		}
		NotFound(w, r, "not found")
		return
	}

	// Actions: publish/unpublish
	if action == "publish" && r.Method == http.MethodPost {
		out, err := database.PublishAdminTemplate(r.Context(), slug)
		if err != nil {
			errMsg := strings.ToLower(err.Error())
			if strings.Contains(errMsg, "not_found") {
				NotFound(w, r, "template not found")
				return
			}
			if strings.Contains(errMsg, "validation_thumbnail_required") {
				Unprocessable(w, r, "validation_error", map[string]any{
					"fields":  []string{"thumbnail_url"},
					"message": "thumbnail required for publish",
				})
				return
			}
			ServerError(w, r, "failed to publish template")
			return
		}
		OK(w, r, out)
		return
	}
	if action == "unpublish" && r.Method == http.MethodPost {
		out, err := database.UnpublishAdminTemplate(r.Context(), slug)
		if err != nil {
			if strings.Contains(strings.ToLower(err.Error()), "not_found") {
				NotFound(w, r, "template not found")
				return
			}
			ServerError(w, r, "failed to unpublish template")
			return
		}
		OK(w, r, out)
		return
	}
	// If action segment is present but not recognized
	if action != "" {
		NotFound(w, r, "not found")
		return
	}

	switch r.Method {
	case http.MethodGet:
		out, err := database.GetAdminTemplate(r.Context(), slug)
		if err != nil {
			if strings.Contains(strings.ToLower(err.Error()), "not_found") {
				NotFound(w, r, "template not found")
				return
			}
			ServerError(w, r, "failed to get template")
			return
		}
		OK(w, r, out)
		return

	case http.MethodPut:
		var in models.UpdateTemplateInput
		if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
			BadRequest(w, r, "invalid_request", "invalid request body", nil)
			return
		}
		if ok, det := validateUpdateInput(&in); !ok {
			Unprocessable(w, r, "validation_error", det)
			return
		}
		out, err := database.UpdateAdminTemplate(r.Context(), slug, in)
		if err != nil {
			if strings.Contains(strings.ToLower(err.Error()), "not_found") {
				NotFound(w, r, "template not found")
				return
			}
			ServerError(w, r, "failed to update template")
			return
		}
		OK(w, r, out)
		return

	case http.MethodDelete:
		if err := database.DeleteAdminTemplate(r.Context(), slug); err != nil {
			if strings.Contains(strings.ToLower(err.Error()), "not_found") {
				NotFound(w, r, "template not found")
				return
			}
			ServerError(w, r, "failed to delete template")
			return
		}
		NoContent(w, r)
		return

	default:
		// 405
		WriteJSON[struct{}](w, http.StatusMethodNotAllowed, APIResponse[struct{}]{
			Success: false,
			Error:   &APIError{Code: "method_not_allowed", Message: "method not allowed"},
			Meta:    buildMeta(r),
		})
		return
	}
}
