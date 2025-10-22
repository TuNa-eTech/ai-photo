package api

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"imageaiwrapper-backend/internal/models"
)

var (
	mockImageExists     func(string) bool
	mockGetTemplateByID func(string) (*models.Template, error)
	mockProcessImage    func(*models.ProcessImageRequest) (string, error)
)

// --- Test helpers ---

func setMocks(
	imageExistsFunc func(string) bool,
	getTemplateByIDFunc func(string) (*models.Template, error),
	processImageFunc func(*models.ProcessImageRequest) (string, error),
) {
	mockImageExists = imageExistsFunc
	mockGetTemplateByID = getTemplateByIDFunc
	mockProcessImage = processImageFunc

	// Inject mocks into handler dependencies
	imageExists = imageExistsFunc
	getTemplateByID = getTemplateByIDFunc
	processImage = processImageFunc
}

/* --- RegisterUserHandler Tests --- */

func TestRegisterUserHandler_Success(t *testing.T) {
	// Stub DB upsert to avoid Postgres dependency in unit test
	upsertUserProfile = func(ctx context.Context, email, name, avatarURL string) error {
		return nil
	}

	reqBody := models.UserRegisterRequest{
		Name:  "Test User",
		Email: "test@example.com",
	}
	body, _ := json.Marshal(reqBody)
	req := httptest.NewRequest("POST", "/v1/users/register", bytes.NewReader(body))
	req.Header.Set("Authorization", "Bearer valid-token")
	w := httptest.NewRecorder()

	RegisterUserHandler(w, req)

	resp := w.Result()
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected 200 OK, got %d", resp.StatusCode)
	}
	var out APIResponse[models.UserRegisterResponse]
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}
	if out.Data == nil {
		t.Fatalf("expected data payload, got nil")
	}
	if out.Data.UserID != "test@example.com" {
		t.Errorf("unexpected user_id: %s", out.Data.UserID)
	}
	if out.Data.Message == "" {
		t.Errorf("expected non-empty message")
	}
}

func TestRegisterUserHandler_MissingAuthHeader(t *testing.T) {
	reqBody := models.UserRegisterRequest{Name: "Test", Email: "test@example.com"}
	body, _ := json.Marshal(reqBody)
	req := httptest.NewRequest("POST", "/v1/users/register", bytes.NewReader(body))
	// No Authorization header
	w := httptest.NewRecorder()

	RegisterUserHandler(w, req)

	resp := w.Result()
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusUnauthorized {
		t.Fatalf("expected 401 Unauthorized, got %d", resp.StatusCode)
	}
	var out APIResponse[struct{}]
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		t.Fatalf("failed to decode error response: %v", err)
	}
	if out.Error == nil || out.Error.Code != "unauthorized" {
		t.Errorf("expected error.code 'unauthorized', got '%v'", out.Error)
	}
}

func TestRegisterUserHandler_InvalidAuthHeader(t *testing.T) {
	reqBody := models.UserRegisterRequest{Name: "Test", Email: "test@example.com"}
	body, _ := json.Marshal(reqBody)
	req := httptest.NewRequest("POST", "/v1/users/register", bytes.NewReader(body))
	req.Header.Set("Authorization", "InvalidTokenFormat")
	w := httptest.NewRecorder()

	RegisterUserHandler(w, req)

	resp := w.Result()
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusUnauthorized {
		t.Fatalf("expected 401 Unauthorized, got %d", resp.StatusCode)
	}
	var out APIResponse[struct{}]
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		t.Fatalf("failed to decode error response: %v", err)
	}
	if out.Error == nil || out.Error.Code != "unauthorized" {
		t.Errorf("expected error.code 'unauthorized', got '%v'", out.Error)
	}
}

func TestRegisterUserHandler_MissingIDToken(t *testing.T) {
	reqBody := models.UserRegisterRequest{Name: "Test", Email: "test@example.com"}
	body, _ := json.Marshal(reqBody)
	req := httptest.NewRequest("POST", "/v1/users/register", bytes.NewReader(body))
	req.Header.Set("Authorization", "Bearer ")
	w := httptest.NewRecorder()

	RegisterUserHandler(w, req)

	resp := w.Result()
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusUnauthorized {
		t.Fatalf("expected 401 Unauthorized, got %d", resp.StatusCode)
	}
	var out APIResponse[struct{}]
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		t.Fatalf("failed to decode error response: %v", err)
	}
	if out.Error == nil || out.Error.Code != "unauthorized" {
		t.Errorf("expected error.code 'unauthorized', got '%v'", out.Error)
	}
}

func TestRegisterUserHandler_InvalidRequestBody(t *testing.T) {
	req := httptest.NewRequest("POST", "/v1/users/register", bytes.NewReader([]byte("not-json")))
	req.Header.Set("Authorization", "Bearer valid-token")
	w := httptest.NewRecorder()

	RegisterUserHandler(w, req)

	resp := w.Result()
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusBadRequest {
		t.Fatalf("expected 400 Bad Request, got %d", resp.StatusCode)
	}
	var out APIResponse[struct{}]
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		t.Fatalf("failed to decode error response: %v", err)
	}
	if out.Error == nil || out.Error.Code != "invalid_request" {
		t.Errorf("expected error.code 'invalid_request', got '%v'", out.Error)
	}
}

func TestRegisterUserHandler_MissingFields(t *testing.T) {
	reqBody := models.UserRegisterRequest{Name: "", Email: ""}
	body, _ := json.Marshal(reqBody)
	req := httptest.NewRequest("POST", "/v1/users/register", bytes.NewReader(body))
	req.Header.Set("Authorization", "Bearer valid-token")
	w := httptest.NewRecorder()

	RegisterUserHandler(w, req)

	resp := w.Result()
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusBadRequest {
		t.Fatalf("expected 400 Bad Request, got %d", resp.StatusCode)
	}
	var out APIResponse[struct{}]
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		t.Fatalf("failed to decode error response: %v", err)
	}
	if out.Error == nil || out.Error.Code != "missing_fields" {
		t.Errorf("expected error.code 'missing_fields', got '%v'", out.Error)
	}
}

// --- ProcessImageHandler Tests ---

func TestProcessImageHandler_Success(t *testing.T) {
	setMocks(
		func(path string) bool { return true },
		func(id string) (*models.Template, error) {
			return &models.Template{ID: id, Name: "Test", Prompt: "Prompt"}, nil
		},
		func(req *models.ProcessImageRequest) (string, error) {
			return "https://example.com/processed.jpg", nil
		},
	)

	reqBody := models.ProcessImageRequest{
		TemplateID: "test-template",
		ImagePath:  "test.jpg",
	}
	body, _ := json.Marshal(reqBody)
	req := httptest.NewRequest("POST", "/v1/images/process", bytes.NewReader(body))
	w := httptest.NewRecorder()

	ProcessImageHandler(w, req)

	resp := w.Result()
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected 200 OK, got %d", resp.StatusCode)
	}
	var out APIResponse[models.ProcessImageResponse]
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}
	if out.Data == nil {
		t.Fatalf("expected data payload, got nil")
	}
	if out.Data.ProcessedImageURL != "https://example.com/processed.jpg" {
		t.Errorf("unexpected processed image url: %s", out.Data.ProcessedImageURL)
	}
}

func TestProcessImageHandler_InvalidRequest(t *testing.T) {
	req := httptest.NewRequest("POST", "/v1/images/process", bytes.NewReader([]byte("not-json")))
	w := httptest.NewRecorder()
	ProcessImageHandler(w, req)
	ProcessImageHandler(w, req)
	resp := w.Result()
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusBadRequest {
		t.Fatalf("expected 400 Bad Request, got %d", resp.StatusCode)
	}
	var out APIResponse[struct{}]
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		t.Fatalf("failed to decode error response: %v", err)
	}
	if out.Error == nil || out.Error.Code != "invalid_request" {
		t.Errorf("expected error.code 'invalid_request', got '%v'", out.Error)
	}
}

func TestProcessImageHandler_MissingFields(t *testing.T) {
	reqBody := models.ProcessImageRequest{}
	body, _ := json.Marshal(reqBody)
	req := httptest.NewRequest("POST", "/v1/images/process", bytes.NewReader(body))
	w := httptest.NewRecorder()
	ProcessImageHandler(w, req)
	resp := w.Result()
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusBadRequest {
		t.Fatalf("expected 400 Bad Request, got %d", resp.StatusCode)
	}
	var out APIResponse[struct{}]
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		t.Fatalf("failed to decode error response: %v", err)
	}
	if out.Error == nil || out.Error.Code != "invalid_request" && out.Error.Code != "missing_fields" {
		t.Errorf("expected error.code 'missing_fields' or 'invalid_request', got '%v'", out.Error)
	}
}

func TestProcessImageHandler_ImageNotFound(t *testing.T) {
	setMocks(
		func(path string) bool { return false },
		func(id string) (*models.Template, error) {
			return &models.Template{ID: id, Name: "Test", Prompt: "Prompt"}, nil
		},
		func(req *models.ProcessImageRequest) (string, error) {
			return "https://example.com/processed.jpg", nil
		},
	)
	reqBody := models.ProcessImageRequest{
		TemplateID: "test-template",
		ImagePath:  "notfound.jpg",
	}
	body, _ := json.Marshal(reqBody)
	req := httptest.NewRequest("POST", "/v1/images/process", bytes.NewReader(body))
	w := httptest.NewRecorder()
	ProcessImageHandler(w, req)
	resp := w.Result()
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusNotFound {
		t.Fatalf("expected 404 Not Found, got %d", resp.StatusCode)
	}
	var out APIResponse[struct{}]
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		t.Fatalf("failed to decode error response: %v", err)
	}
	// Handler uses generic not_found code
	if out.Error == nil || out.Error.Code != "not_found" {
		t.Errorf("expected error.code 'not_found', got '%v'", out.Error)
	}
}

func TestProcessImageHandler_TemplateNotFound(t *testing.T) {
	setMocks(
		func(path string) bool { return true },
		func(id string) (*models.Template, error) {
			return nil, errors.New("not found")
		},
		func(req *models.ProcessImageRequest) (string, error) {
			return "https://example.com/processed.jpg", nil
		},
	)
	reqBody := models.ProcessImageRequest{
		TemplateID: "notfound",
		ImagePath:  "test.jpg",
	}
	body, _ := json.Marshal(reqBody)
	req := httptest.NewRequest("POST", "/v1/images/process", bytes.NewReader(body))
	w := httptest.NewRecorder()
	ProcessImageHandler(w, req)
	resp := w.Result()
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusNotFound {
		t.Fatalf("expected 404 Not Found, got %d", resp.StatusCode)
	}
	var out APIResponse[struct{}]
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		t.Fatalf("failed to decode error response: %v", err)
	}
	// Handler uses generic not_found code
	if out.Error == nil || out.Error.Code != "not_found" {
		t.Errorf("expected error.code 'not_found', got '%v'", out.Error)
	}
}

func TestProcessImageHandler_InternalError(t *testing.T) {
	setMocks(
		func(path string) bool { return true },
		func(id string) (*models.Template, error) {
			return &models.Template{ID: id, Name: "Test", Prompt: "Prompt"}, nil
		},
		func(req *models.ProcessImageRequest) (string, error) {
			return "", errors.New("processing failed")
		},
	)
	reqBody := models.ProcessImageRequest{
		TemplateID: "test-template",
		ImagePath:  "test.jpg",
	}
	body, _ := json.Marshal(reqBody)
	req := httptest.NewRequest("POST", "/v1/images/process", bytes.NewReader(body))
	w := httptest.NewRecorder()
	ProcessImageHandler(w, req)
	resp := w.Result()
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusInternalServerError {
		t.Fatalf("expected 500 Internal Server Error, got %d", resp.StatusCode)
	}
	var out APIResponse[struct{}]
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		t.Fatalf("failed to decode error response: %v", err)
	}
	if out.Error == nil || out.Error.Code != "internal_error" {
		t.Errorf("expected error.code 'internal_error', got '%v'", out.Error)
	}
}
