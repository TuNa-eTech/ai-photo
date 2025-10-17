package storage

import (
	"os"
	"testing"
)

func TestSaveProcessedImageAndImageExists(t *testing.T) {
	filename := "test_image.jpg"
	data := []byte("test image data")

	// Clean up before test
	_ = os.RemoveAll("processed")

	// Save image
	url, err := SaveProcessedImage(filename, data)
	if err != nil {
		t.Fatalf("SaveProcessedImage failed: %v", err)
	}
	if url != "/processed/"+filename {
		t.Errorf("unexpected url: got %s, want /processed/%s", url, filename)
	}

	// Check file exists
	exists := ImageExists("processed/" + filename)
	if !exists {
		t.Errorf("ImageExists should return true for saved file")
	}

	// Check non-existent file
	if ImageExists("processed/does_not_exist.jpg") {
		t.Errorf("ImageExists should return false for non-existent file")
	}

	// Clean up after test
	_ = os.RemoveAll("processed")
}
