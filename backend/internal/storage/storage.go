package storage

// ImageExists checks if the original image exists at the given path.
import (
	"fmt"
	"os"
	"path/filepath"
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
