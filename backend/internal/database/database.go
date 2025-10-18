package database

import (
	"encoding/json"
	"errors"
	"fmt"
	"imageaiwrapper-backend/internal/models"
	"os"
)

// GetUserByEmail loads users from users.json and returns the user with the given email.
func GetUserByEmail(email string) (*models.User, error) {
	file, err := os.Open("users.json")
	if err != nil {
		if os.IsNotExist(err) {
			return nil, errors.New("user not found")
		}
		return nil, fmt.Errorf("failed to open users.json: %w", err)
	}
	defer file.Close()

	var users []models.User
	if err := json.NewDecoder(file).Decode(&users); err != nil {
		return nil, fmt.Errorf("failed to decode users.json: %w", err)
	}

	for _, u := range users {
		if u.Email == email {
			return &u, nil
		}
	}
	return nil, errors.New("user not found")
}

// UpsertUser saves or updates a user in users.json.
func UpsertUser(user *models.User) error {
	var users []models.User

	// Load existing users if file exists
	file, err := os.Open("users.json")
	if err == nil {
		defer file.Close()
		if err := json.NewDecoder(file).Decode(&users); err != nil {
			return fmt.Errorf("failed to decode users.json: %w", err)
		}
	} else if !os.IsNotExist(err) {
		return fmt.Errorf("failed to open users.json: %w", err)
	}

	updated := false
	for i, u := range users {
		if u.Email == user.Email {
			users[i] = *user
			updated = true
			break
		}
	}
	if !updated {
		users = append(users, *user)
	}

	// Save back to file
	f, err := os.Create("users.json")
	if err != nil {
		return fmt.Errorf("failed to create users.json: %w", err)
	}
	defer f.Close()
	if err := json.NewEncoder(f).Encode(users); err != nil {
		return fmt.Errorf("failed to encode users.json: %w", err)
	}
	return nil
}

// GetTemplateByID loads templates from templates.json and returns the template with the given ID.
func GetTemplateByID(id string) (*models.Template, error) {
	file, err := os.Open("templates.json")
	if err != nil {
		return nil, fmt.Errorf("failed to open templates.json: %w", err)
	}
	defer file.Close()

	var templates []models.Template
	if err := json.NewDecoder(file).Decode(&templates); err != nil {
		return nil, fmt.Errorf("failed to decode templates.json: %w", err)
	}

	for _, t := range templates {
		if t.ID == id {
			return &t, nil
		}
	}
	return nil, errors.New("template not found")
}
