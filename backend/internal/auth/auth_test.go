// auth_test.go
package auth

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	firebaseauth "firebase.google.com/go/v4/auth"
)

// Mock FirebaseAuth struct with a fake VerifyIDToken method
type mockFirebaseAuth struct {
	shouldSucceed bool
}

func (m *mockFirebaseAuth) VerifyIDToken(ctx context.Context, idToken string) (*firebaseauth.Token, error) {
	if m.shouldSucceed && idToken == "valid-token" {
		return &firebaseauth.Token{UID: "testuid"}, nil
	}
	return nil, context.DeadlineExceeded
}

func TestAuthMiddleware_ValidToken(t *testing.T) {
	mock := &mockFirebaseAuth{shouldSucceed: true}
	fa := &FirebaseAuth{Client: mock}
	handlerCalled := false
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		handlerCalled = true
	})
	req := httptest.NewRequest("GET", "/", nil)
	req.Header.Set("Authorization", "Bearer valid-token")
	rr := httptest.NewRecorder()
	fa.AuthMiddleware(handler).ServeHTTP(rr, req)
	if !handlerCalled {
		t.Error("Handler should be called for valid token")
	}
	if rr.Code != http.StatusOK {
		t.Errorf("Expected 200 OK, got %d", rr.Code)
	}
}

func TestAuthMiddleware_InvalidToken(t *testing.T) {
	mock := &mockFirebaseAuth{shouldSucceed: false}
	fa := &FirebaseAuth{Client: mock}
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		t.Error("Handler should not be called for invalid token")
	})
	req := httptest.NewRequest("GET", "/", nil)
	req.Header.Set("Authorization", "Bearer invalid-token")
	rr := httptest.NewRecorder()
	fa.AuthMiddleware(handler).ServeHTTP(rr, req)
	if rr.Code != http.StatusUnauthorized {
		t.Errorf("Expected 401 Unauthorized, got %d", rr.Code)
	}
}

func TestAuthMiddleware_MissingToken(t *testing.T) {
	mock := &mockFirebaseAuth{shouldSucceed: false}
	fa := &FirebaseAuth{Client: mock}
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		t.Error("Handler should not be called when token is missing")
	})
	req := httptest.NewRequest("GET", "/", nil)
	rr := httptest.NewRecorder()
	fa.AuthMiddleware(handler).ServeHTTP(rr, req)
	if rr.Code != http.StatusUnauthorized {
		t.Errorf("Expected 401 Unauthorized, got %d", rr.Code)
	}
}
