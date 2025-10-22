package storage

// ImageExists checks if the original image exists at the given path.
import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

// ImageExists checks if the original image exists at the given path.
func ImageExists(path string) bool {
	_, err := os.Stat(path)
	return err == nil
}

// SaveProcessedImage saves the processed image data to the "processed/" directory and returns its file path.
func SaveProcessedImage(filename string, data []byte) (string, error) {
	dir := "processed"
	if err := os.MkdirAll(dir, 0755); err != nil {
		return "", fmt.Errorf("failed to create processed dir: %w", err)
	}
	fullPath := filepath.Join(dir, filename)
	if err := os.WriteFile(fullPath, data, 0644); err != nil {
		return "", fmt.Errorf("failed to write processed image: %w", err)
	}
	// Return the relative file path as the "URL"
	return "/" + fullPath, nil
}

// AssetsDir returns the absolute assets directory inside the container/host (from ASSETS_DIR env or default "/assets").
func AssetsDir() string {
	dir := strings.TrimSpace(os.Getenv("ASSETS_DIR"))
	if dir == "" {
		dir = "/assets"
	}
	return dir
}

// AssetsBaseURL returns the public base URL prefix for serving assets (from ASSETS_BASE_URL or default "/assets").
func AssetsBaseURL() string {
	base := strings.TrimSpace(os.Getenv("ASSETS_BASE_URL"))
	if base == "" {
		base = "/assets"
	}
	return strings.TrimRight(base, "/")
}

// SaveTemplateAssetFile stores a binary asset under {ASSETS_DIR}/templates/{slug}/{filename} and returns a public URL.
func SaveTemplateAssetFile(slug string, filename string, data []byte) (string, error) {
	baseDir := AssetsDir()
	targetDir := filepath.Join(baseDir, "templates", slug)
	if err := os.MkdirAll(targetDir, 0755); err != nil {
		return "", fmt.Errorf("failed to create asset dir: %w", err)
	}
	fullPath := filepath.Join(targetDir, filename)
	if err := os.WriteFile(fullPath, data, 0644); err != nil {
		return "", fmt.Errorf("failed to write asset file: %w", err)
	}
	publicURL := AssetsBaseURL() + "/templates/" + slug + "/" + filename
	return publicURL, nil
}
