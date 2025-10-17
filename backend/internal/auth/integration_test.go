// integration_test.go
package auth

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"context"
	firebaseauth "firebase.google.com/go/v4/auth"
)

// Mock FirebaseAuth for integration test
type mockFirebaseAuthIntegration struct {
	shouldSucceed bool
}

func (m *mockFirebaseAuthIntegration) VerifyIDToken(ctx context.Context, idToken string) (*firebaseauth.Token, error) {
	if m.shouldSucceed && idToken == "valid-token" {
		return &firebaseauth.Token{UID: "testuid"}, nil
	}
	return nil, context.DeadlineExceeded
}

func TestProcessEndpoint_WithValidToken(t *testing.T) {
	mock := &mockFirebaseAuthIntegration{shouldSucceed: true}
	fa := &FirebaseAuth{Client: mock}
	// Simulate /v1/images/process endpoint
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		token, ok := GetFirebaseUser(r)
		if !ok || token.UID != "testuid" {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"result": "success"}`))
	})
	mux := http.NewServeMux()
	mux.Handle("/v1/images/process", fa.AuthMiddleware(handler))

	req := httptest.NewRequest("POST", "/v1/images/process", nil)
	req.Header.Set("Authorization", "Bearer valid-token")
	rr := httptest.NewRecorder()
	mux.ServeHTTP(rr, req)
	if rr.Code != http.StatusOK {
		t.Errorf("Expected 200 OK, got %d", rr.Code)
	}
}

func TestProcessEndpoint_WithInvalidToken(t *testing.T) {
	mock := &mockFirebaseAuthIntegration{shouldSucceed: false}
	fa := &FirebaseAuth{Client: mock}
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		t.Error("Handler should not be called for invalid token")
	})
	mux := http.NewServeMux()
	mux.Handle("/v1/images/process", fa.AuthMiddleware(handler))

	req := httptest.NewRequest("POST", "/v1/images/process", nil)
	req.Header.Set("Authorization", "Bearer invalid-token")
	rr := httptest.NewRecorder()
	mux.ServeHTTP(rr, req)
	if rr.Code != http.StatusUnauthorized {
		t.Errorf("Expected 401 Unauthorized, got %d", rr.Code)
	}
}

func TestProcessEndpoint_MissingToken(t *testing.T) {
	mock := &mockFirebaseAuthIntegration{shouldSucceed: false}
	fa := &FirebaseAuth{Client: mock}
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		t.Error("Handler should not be called when token is missing")
	})
	mux := http.NewServeMux()
	mux.Handle("/v1/images/process", fa.AuthMiddleware(handler))

	req := httptest.NewRequest("POST", "/v1/images/process", nil)
	rr := httptest.NewRecorder()
	mux.ServeHTTP(rr, req)
	if rr.Code != http.StatusUnauthorized {
		t.Errorf("Expected 401 Unauthorized, got %d", rr.Code)
	}
}
