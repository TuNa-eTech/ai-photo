package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"imageaiwrapper-backend/internal/api"
	"imageaiwrapper-backend/internal/auth"
)

func main() {
	mux := http.NewServeMux()

	// Public endpoints
	mux.HandleFunc("/v1/images/process", api.ProcessImageHandler)

	// Conditionally protect /v1/users/register with Firebase Admin verification if FIREBASE_SERVICE_ACCOUNT is provided
	if sa := os.Getenv("FIREBASE_SERVICE_ACCOUNT"); sa != "" {
		if fa, err := auth.NewFirebaseAuth(sa); err == nil {
			mux.Handle("/v1/users/register", fa.AuthMiddleware(http.HandlerFunc(api.RegisterUserHandler)))
			log.Println("AuthMiddleware enabled for /v1/users/register (Firebase Admin SDK)")
		} else {
			log.Printf("Warning: failed to initialize Firebase Admin SDK (%v). Falling back to unprotected register endpoint.\n", err)
			mux.HandleFunc("/v1/users/register", api.RegisterUserHandler)
		}
	} else {
		mux.HandleFunc("/v1/users/register", api.RegisterUserHandler)
	}

	// Root/404
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/" {
			fmt.Fprintf(w, "Hello, World!")
		} else {
			http.NotFound(w, r)
		}
	})

	log.Println("Starting server on :8080")
	if err := http.ListenAndServe(":8080", api.LoggingMiddleware(api.RequestIDMiddleware(mux))); err != nil {
		log.Fatal(err)
	}
}
