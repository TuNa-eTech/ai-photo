package image

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"imageaiwrapper-backend/internal/database"
	"imageaiwrapper-backend/internal/models"
	"imageaiwrapper-backend/internal/storage"
	"io"
	"net/http"
	"os"
)

/*
ProcessImage performs image processing using the specified template and image path.
This implementation now integrates Gemini API for real AI processing.
Implements as described in .documents/gemini-api-integration-backend.md
*/

// ProcessImage performs image processing using the specified template and image path.
func ProcessImage(req *models.ProcessImageRequest) (string, error) {
	// 1. Read the original image file
	imageData, err := os.ReadFile(req.ImagePath)
	if err != nil {
		return "", fmt.Errorf("failed to read image: %w", err)
	}

	// 2. Encode image to base64
	imageBase64 := encodeToBase64(imageData)

	// 3. Get prompt from template DB using req.TemplateID
	prompt, err := getPromptFromTemplate(req.TemplateID)
	if err != nil {
		return "", fmt.Errorf("failed to get prompt from template: %w", err)
	}

	// 4. Call Gemini API
	resultBase64, err := callGeminiAPI(imageBase64, prompt)
	if err != nil {
		return "", fmt.Errorf("Gemini API error: %w", err)
	}

	// 5. Decode result base64 to bytes
	processedData, err := decodeFromBase64(resultBase64)
	if err != nil {
		return "", fmt.Errorf("failed to decode processed image: %w", err)
	}

	// 6. Save the processed image and get its URL
	resultPath := fmt.Sprintf("processed_%s", req.ImagePath)
	url, err := storage.SaveProcessedImage(resultPath, processedData)
	if err != nil {
		return "", fmt.Errorf("failed to save processed image: %w", err)
	}

	return url, nil
}

// getPromptFromTemplate fetches the prompt string from the template DB by TemplateID
func getPromptFromTemplate(templateID string) (string, error) {
	// Use the database package to get the template
	template, err := database.GetTemplateByID(templateID)
	if err != nil {
		return "", err
	}
	return template.Prompt, nil
}

// encodeToBase64 encodes bytes to base64 string
func encodeToBase64(data []byte) string {
	return base64.StdEncoding.EncodeToString(data)
}

// decodeFromBase64 decodes base64 string to bytes
func decodeFromBase64(s string) ([]byte, error) {
	return base64.StdEncoding.DecodeString(s)
}

// callGeminiAPI calls Gemini API with image base64 and prompt, returns result image base64
func callGeminiAPI(imageBase64, prompt string) (string, error) {
	apiKey := os.Getenv("GEMINI_API_KEY")
	url := "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=" + apiKey

	reqBody := map[string]interface{}{
		"contents": []interface{}{
			map[string]interface{}{
				"parts": []interface{}{
					map[string]interface{}{"text": prompt},
					map[string]interface{}{
						"inline_data": map[string]interface{}{
							"mime_type": "image/png",
							"data":      imageBase64,
						},
					},
				},
			},
		},
	}
	body, _ := json.Marshal(reqBody)
	resp, err := http.Post(url, "application/json", bytes.NewBuffer(body))
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	respBody, _ := io.ReadAll(resp.Body)

	// Parse response to extract base64 image (assume response format as in docs)
	var parsed map[string]interface{}
	if err := json.Unmarshal(respBody, &parsed); err != nil {
		return "", err
	}
	// Traverse response to get base64 image (update as needed for actual API)
	candidates, ok := parsed["candidates"].([]interface{})
	if !ok || len(candidates) == 0 {
		return "", fmt.Errorf("no candidates in response")
	}
	content, ok := candidates[0].(map[string]interface{})["content"].(map[string]interface{})
	if !ok {
		return "", fmt.Errorf("no content in response")
	}
	parts, ok := content["parts"].([]interface{})
	if !ok || len(parts) == 0 {
		return "", fmt.Errorf("no parts in response")
	}
	// Find inline_data part
	for _, part := range parts {
		partMap, ok := part.(map[string]interface{})
		if !ok {
			continue
		}
		if inline, ok := partMap["inline_data"].(map[string]interface{}); ok {
			if data, ok := inline["data"].(string); ok {
				return data, nil
			}
		}
	}
	return "", fmt.Errorf("no image data found in response")
}
