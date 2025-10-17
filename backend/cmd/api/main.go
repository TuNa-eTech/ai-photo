package main

import (
	"fmt"
	"log"
	"net/http"

	"imageaiwrapper-backend/internal/api"
)

func main() {
	http.HandleFunc("/v1/images/process", api.ProcessImageHandler)
	http.HandleFunc("/v1/users/register", api.RegisterUserHandler)
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/" {
			fmt.Fprintf(w, "Hello, World!")
		} else {
			http.NotFound(w, r)
		}
	})

	log.Println("Starting server on :8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal(err)
	}
}
