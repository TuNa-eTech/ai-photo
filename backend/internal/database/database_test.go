package database

import (
	"encoding/json"
	"os"
	"testing"

	"imageaiwrapper-backend/internal/models"
)

func setupTemplatesFile(t *testing.T, templates []models.Template) {
	file, err := os.Create("templates.json")
	if err != nil {
		t.Fatalf("failed to create templates.json: %v", err)
	}
	defer file.Close()
	if err := json.NewEncoder(file).Encode(templates); err != nil {
		t.Fatalf("failed to write templates.json: %v", err)
	}
}

func cleanupTemplatesFile() {
	_ = os.Remove("templates.json")
}

func TestGetTemplateByID_Success(t *testing.T) {
	templates := []models.Template{
		{ID: "t1", Name: "Test1", Prompt: "Prompt1"},
		{ID: "t2", Name: "Test2", Prompt: "Prompt2"},
	}
	setupTemplatesFile(t, templates)
	defer cleanupTemplatesFile()

	tmpl, err := GetTemplateByID("t2")
	if err != nil {
		t.Fatalf("expected success, got error: %v", err)
	}
	if tmpl.ID != "t2" || tmpl.Name != "Test2" {
		t.Errorf("unexpected template: %+v", tmpl)
	}
}

func TestGetTemplateByID_NotFound(t *testing.T) {
	templates := []models.Template{
		{ID: "t1", Name: "Test1", Prompt: "Prompt1"},
	}
	setupTemplatesFile(t, templates)
	defer cleanupTemplatesFile()

	_, err := GetTemplateByID("not_exist")
	if err == nil {
		t.Fatalf("expected error for not found, got nil")
	}
}

func TestGetTemplateByID_FileMissing(t *testing.T) {
	cleanupTemplatesFile()
	_, err := GetTemplateByID("any")
	if err == nil {
		t.Fatalf("expected error for missing file, got nil")
	}
}

func TestGetTemplateByID_InvalidJSON(t *testing.T) {
	file, err := os.Create("templates.json")
	if err != nil {
		t.Fatalf("failed to create templates.json: %v", err)
	}
	file.WriteString("not json")
	file.Close()
	defer cleanupTemplatesFile()

	_, err = GetTemplateByID("any")
	if err == nil {
		t.Fatalf("expected error for invalid JSON, got nil")
	}
}
