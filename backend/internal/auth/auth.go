package auth

import (
	"context"
	"fmt"
	"net/http"
	"strings"

	firebase "firebase.google.com/go/v4"
	firebaseauth "firebase.google.com/go/v4/auth"
	"google.golang.org/api/option"
)

type FirebaseAuthClient interface {
	VerifyIDToken(ctx context.Context, idToken string) (*firebaseauth.Token, error)
}

// FirebaseAuth holds the Firebase app and context
type FirebaseAuth struct {
	App    *firebase.App
	Ctx    context.Context
	Client FirebaseAuthClient
}

// NewFirebaseAuth initializes Firebase Admin SDK using the service account JSON file
func NewFirebaseAuth(serviceAccountPath string) (*FirebaseAuth, error) {
	ctx := context.Background()
	opt := option.WithCredentialsFile(serviceAccountPath)
	app, err := firebase.NewApp(ctx, nil, opt)
	if err != nil {
		return nil, fmt.Errorf("error initializing firebase app: %v", err)
	}
	client, err := app.Auth(ctx)
	if err != nil {
		return nil, fmt.Errorf("error getting Auth client: %v", err)
	}
	return &FirebaseAuth{
		App:    app,
		Ctx:    ctx,
		Client: client, // *firebaseauth.Client implements FirebaseAuthClient
	}, nil
}

// AuthMiddleware returns a middleware that verifies Firebase ID tokens
func (fa *FirebaseAuth) AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			http.Error(w, `{"error": "Unauthorized. Invalid, expired, or missing Firebase authentication token."}`, http.StatusUnauthorized)
			return
		}
		idToken := strings.TrimPrefix(authHeader, "Bearer ")
		token, err := fa.Client.VerifyIDToken(fa.Ctx, idToken)
		if err != nil {
			http.Error(w, `{"error": "Unauthorized. Invalid, expired, or missing Firebase authentication token."}`, http.StatusUnauthorized)
			return
		}
		// Attach user info to context for downstream handlers
		ctx := context.WithValue(r.Context(), "firebaseUser", token)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// GetFirebaseUser extracts the Firebase user info from the request context
func GetFirebaseUser(r *http.Request) (*firebaseauth.Token, bool) {
	token, ok := r.Context().Value("firebaseUser").(*firebaseauth.Token)
	return token, ok
}
