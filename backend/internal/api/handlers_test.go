package api

import (
	"bytes"
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
	var out models.UserRegisterResponse
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}
	if out.UserID != "test@example.com" {
		t.Errorf("unexpected user_id: %s", out.UserID)
	}
	if out.Message == "" {
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
	var out models.ErrorResponse
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		t.Fatalf("failed to decode error response: %v", err)
	}
	if out.ErrorCode != "unauthorized" {
		t.Errorf("expected error_code 'unauthorized', got '%s'", out.ErrorCode)
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
	var out models.ErrorResponse
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		t.Fatalf("failed to decode error response: %v", err)
	}
	if out.ErrorCode != "unauthorized" {
		t.Errorf("expected error_code 'unauthorized', got '%s'", out.ErrorCode)
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
	var out models.ErrorResponse
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		t.Fatalf("failed to decode error response: %v", err)
	}
	if out.ErrorCode != "unauthorized" {
		t.Errorf("expected error_code 'unauthorized', got '%s'", out.ErrorCode)
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
	var out models.ErrorResponse
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		t.Fatalf("failed to decode error response: %v", err)
	}
	if out.ErrorCode != "invalid_request" {
		t.Errorf("expected error_code 'invalid_request', got '%s'", out.ErrorCode)
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
	var out models.ErrorResponse
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		t.Fatalf("failed to decode error response: %v", err)
	}
	if out.ErrorCode != "missing_fields" {
		t.Errorf("expected error_code 'missing_fields', got '%s'", out.ErrorCode)
	}
}

// --- Test cases ---

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
	var out models.ProcessImageResponse
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}
	if out.ProcessedImageURL != "https://example.com/processed.jpg" {
		t.Errorf("unexpected processed image url: %s", out.ProcessedImageURL)
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
	var out models.ErrorResponse
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		t.Fatalf("failed to decode error response: %v", err)
	}
	if out.ErrorCode != "invalid_request" {
		t.Errorf("expected error_code 'invalid_request', got '%s'", out.ErrorCode)
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
	var out models.ErrorResponse
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		t.Fatalf("failed to decode error response: %v", err)
	}
	if out.ErrorCode != "missing_fields" {
		t.Errorf("expected error_code 'missing_fields', got '%s'", out.ErrorCode)
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
	var out models.ErrorResponse
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		t.Fatalf("failed to decode error response: %v", err)
	}
	if out.ErrorCode != "image_not_found" {
		t.Errorf("expected error_code 'image_not_found', got '%s'", out.ErrorCode)
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
	var out models.ErrorResponse
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		t.Fatalf("failed to decode error response: %v", err)
	}
	if out.ErrorCode != "template_not_found" {
		t.Errorf("expected error_code 'template_not_found', got '%s'", out.ErrorCode)
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
	var out models.ErrorResponse
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		t.Fatalf("failed to decode error response: %v", err)
	}
	if out.ErrorCode != "internal_error" {
		t.Errorf("expected error_code 'internal_error', got '%s'", out.ErrorCode)
	}
}
