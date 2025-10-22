package database

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"imageaiwrapper-backend/internal/models"
	"os"
	"strings"
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

// GetTemplateByID returns template metadata; if TEMPLATE_SOURCE=db it reads from Postgres, otherwise from templates.json.
func GetTemplateByID(id string) (*models.Template, error) {
	if strings.EqualFold(os.Getenv("TEMPLATE_SOURCE"), "db") {
		return GetTemplateByIDFromDB(context.Background(), id)
	}
	return GetTemplateByIDFromFile(id)
}

// GetTemplateByIDFromFile loads templates from templates.json and returns the template with the given ID.
func GetTemplateByIDFromFile(id string) (*models.Template, error) {
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

// ListPublishedTemplatesFromFile returns a paginated list of templates from templates.json (fallback when TEMPLATE_SOURCE != "db").
// Note: Since file source has no status/visibility fields, we return all entries and apply simple pagination.
func ListPublishedTemplatesFromFile(limit, offset int) ([]models.Template, error) {
	if limit <= 0 {
		limit = 20
	}
	if offset < 0 {
		offset = 0
	}

	file, err := os.Open("templates.json")
	if err != nil {
		return nil, fmt.Errorf("failed to open templates.json: %w", err)
	}
	defer file.Close()

	var templates []models.Template
	if err := json.NewDecoder(file).Decode(&templates); err != nil {
		return nil, fmt.Errorf("failed to decode templates.json: %w", err)
	}

	// Apply pagination
	start := offset
	if start > len(templates) {
		start = len(templates)
	}
	end := start + limit
	if end > len(templates) {
		end = len(templates)
	}
	page := templates[start:end]

	// For listing we can omit Prompt (server-only); keep struct as-is for simplicity
	out := make([]models.Template, 0, len(page))
	for _, t := range page {
		out = append(out, models.Template{
			ID:   t.ID,
			Name: t.Name,
			// Prompt intentionally omitted for listing usage
		})
	}
	return out, nil
}

// ListPublishedTemplatesFromFileAdvanced returns a basic filtered/sorted list for file-source fallback.
// Only supports q (case-insensitive contains on name/slug). tags/sort are ignored for simplicity.
func ListPublishedTemplatesFromFileAdvanced(limit, offset int, q, tagsCSV, sort string) ([]models.TemplateListItem, error) {
	templates, err := ListPublishedTemplatesFromFile(limit, offset)
	if err != nil {
		return nil, err
	}
	qtrim := strings.ToLower(strings.TrimSpace(q))
	items := make([]models.TemplateListItem, 0, len(templates))
	for _, t := range templates {
		if qtrim != "" {
			if !strings.Contains(strings.ToLower(t.Name), qtrim) &&
				!strings.Contains(strings.ToLower(t.ID), qtrim) {
				continue
			}
		}
		items = append(items, models.TemplateListItem{
			ID:   t.ID,
			Name: t.Name,
			// ThumbnailURL/PublishedAt/UsageCount not available from file fallback
		})
	}
	return items, nil
}
