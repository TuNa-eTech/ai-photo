package database

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"

	"imageaiwrapper-backend/internal/models"
)

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
