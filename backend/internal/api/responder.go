package api

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"net/http"
	"time"
)

// Context key for request ID
type ctxKey string

const ctxKeyRequestID ctxKey = "requestId"

// Envelope response types

type APIResponse[T any] struct {
	Success bool      `json:"success"`
	Data    *T        `json:"data,omitempty"`
	Error   *APIError `json:"error,omitempty"`
	Meta    *Meta     `json:"meta,omitempty"`
}

type APIError struct {
	Code    string      `json:"code"`
	Message string      `json:"message"`
	Details interface{} `json:"details,omitempty"`
}

type Meta struct {
	RequestID  string      `json:"requestId,omitempty"`
	Timestamp  time.Time   `json:"timestamp,omitempty"`
	Pagination *Pagination `json:"pagination,omitempty"`
}

type Pagination struct {
	Page       int    `json:"page,omitempty"`
	PerPage    int    `json:"perPage,omitempty"`
	Total      int    `json:"total,omitempty"`
	TotalPages int    `json:"totalPages,omitempty"`
	NextCursor string `json:"nextCursor,omitempty"`
}

// Helper writers

func WriteJSON[T any](w http.ResponseWriter, status int, resp APIResponse[T]) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(resp)
}

func OK[T any](w http.ResponseWriter, r *http.Request, data T) {
	WriteJSON(w, http.StatusOK, APIResponse[T]{Success: true, Data: &data, Meta: buildMeta(r)})
}

func Created[T any](w http.ResponseWriter, r *http.Request, data T) {
	WriteJSON(w, http.StatusCreated, APIResponse[T]{Success: true, Data: &data, Meta: buildMeta(r)})
}

func NoContent(w http.ResponseWriter, r *http.Request) {
	// Keep envelope consistency; many teams prefer 200 with empty data instead of 204.
	WriteJSON(w, http.StatusOK, APIResponse[struct{}]{Success: true, Data: nil, Meta: buildMeta(r)})
}

func BadRequest(w http.ResponseWriter, r *http.Request, code, msg string, details interface{}) {
	WriteJSON[struct{}](w, http.StatusBadRequest, APIResponse[struct{}]{
		Success: false,
		Error:   &APIError{Code: code, Message: msg, Details: details},
		Meta:    buildMeta(r),
	})
}

func Unauthorized(w http.ResponseWriter, r *http.Request, msg string) {
	WriteJSON[struct{}](w, http.StatusUnauthorized, APIResponse[struct{}]{
		Success: false,
		Error:   &APIError{Code: "unauthorized", Message: msg},
		Meta:    buildMeta(r),
	})
}

func Forbidden(w http.ResponseWriter, r *http.Request, msg string) {
	WriteJSON[struct{}](w, http.StatusForbidden, APIResponse[struct{}]{
		Success: false,
		Error:   &APIError{Code: "forbidden", Message: msg},
		Meta:    buildMeta(r),
	})
}

func NotFound(w http.ResponseWriter, r *http.Request, msg string) {
	WriteJSON[struct{}](w, http.StatusNotFound, APIResponse[struct{}]{
		Success: false,
		Error:   &APIError{Code: "not_found", Message: msg},
		Meta:    buildMeta(r),
	})
}

func Conflict(w http.ResponseWriter, r *http.Request, msg string) {
	WriteJSON[struct{}](w, http.StatusConflict, APIResponse[struct{}]{
		Success: false,
		Error:   &APIError{Code: "conflict", Message: msg},
		Meta:    buildMeta(r),
	})
}

func Unprocessable(w http.ResponseWriter, r *http.Request, msg string, details interface{}) {
	WriteJSON[struct{}](w, http.StatusUnprocessableEntity, APIResponse[struct{}]{
		Success: false,
		Error:   &APIError{Code: "unprocessable_entity", Message: msg, Details: details},
		Meta:    buildMeta(r),
	})
}

func TooMany(w http.ResponseWriter, r *http.Request, msg string) {
	WriteJSON[struct{}](w, http.StatusTooManyRequests, APIResponse[struct{}]{
		Success: false,
		Error:   &APIError{Code: "too_many_requests", Message: msg},
		Meta:    buildMeta(r),
	})
}

func ServerError(w http.ResponseWriter, r *http.Request, msg string) {
	WriteJSON[struct{}](w, http.StatusInternalServerError, APIResponse[struct{}]{
		Success: false,
		Error:   &APIError{Code: "internal_error", Message: msg},
		Meta:    buildMeta(r),
	})
}

// Meta utilities

func buildMeta(r *http.Request) *Meta {
	reqID := r.Header.Get("X-Request-ID")
	if reqID == "" {
		// Try context value set by RequestID middleware
		if v := r.Context().Value(ctxKeyRequestID); v != nil {
			if s, ok := v.(string); ok && s != "" {
				reqID = s
			}
		}
	}
	if reqID == "" {
		reqID = genID()
	}
	return &Meta{
		RequestID: reqID,
		Timestamp: time.Now().UTC(),
	}
}

func genID() string {
	var b [16]byte
	if _, err := rand.Read(b[:]); err != nil {
		return time.Now().UTC().Format("20060102T150405.000000000Z07")
	}
	return hex.EncodeToString(b[:])
}

// Context helpers

func WithRequestID(ctx context.Context, id string) context.Context {
	return context.WithValue(ctx, ctxKeyRequestID, id)
}
