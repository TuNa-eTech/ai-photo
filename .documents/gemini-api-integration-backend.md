# Gemini API Integration Guide (Backend)

## Overview

This document provides instructions for integrating the Gemini AI API into the Go backend for image processing tasks.

## 1. API Key Management

- Obtain your Gemini API key from the [Google AI Console](https://ai.google.dev/gemini-api/docs/quickstart).
- Store the API key in your `.env` file as:
  ```
  GEMINI_API_KEY=your_api_key_here
  ```
- Load the API key in Go using `os.Getenv("GEMINI_API_KEY")`.

## 2. API Endpoint

- **Base URL:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent`
- Refer to [Gemini API Reference](https://ai.google.dev/gemini-api/docs/api/generate-content) for the latest endpoints and model names.

## 3. Request Format

- **HTTP Method:** POST
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <GEMINI_API_KEY>`
- **Body Example:**
  ```json
  {
    "contents": [
      {
        "parts": [
          {
            "text": "Describe the image"
          },
          {
            "inline_data": {
              "mime_type": "image/png",
              "data": "<base64-encoded-image>"
            }
          }
        ]
      }
    ]
  }
  ```

## 4. Response Format

- The response will contain generated content, e.g.:
  ```json
  {
    "candidates": [
      {
        "content": {
          "parts": [
            {
              "text": "This is a cat."
            }
          ]
        }
      }
    ]
  }
  ```

## 5. Go Integration Example (Manual HTTP)

```go
import (
  "bytes"
  "encoding/base64"
  "encoding/json"
  "fmt"
  "io"
  "net/http"
  "os"
)

// Encode image to base64: base64.StdEncoding.EncodeToString([]byte)
// Decode base64 to []byte: base64.StdEncoding.DecodeString(string)

func CallGeminiAPI(imageBase64 string, prompt string) (string, error) {
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
```

## 6. Notes

- Ensure the image is base64-encoded before sending.
- Prompt nên lấy động từ template (truy vấn DB), không hardcode.
- Đọc file ảnh bằng os.ReadFile, không dùng io/ioutil (Go >=1.16).
- Xử lý response: extract base64 image từ trường inline_data, decode và lưu file processed.
- Handle errors and rate limits as per [Gemini API documentation](https://ai.google.dev/gemini-api/docs/rate-limits).
- For image generation or other tasks, refer to the [cookbook](https://github.com/google-gemini/cookbook) for more examples.

## 7. Imagen (Image Generation) Integration

### Overview

Imagen is Google's high-fidelity image generation model, capable of generating images from text prompts.

### API Endpoint

- **Base URL:** `https://generativelanguage.googleapis.com/v1beta/models/imagen-1:generateContent`
- Refer to [Imagen API Reference](https://ai.google.dev/gemini-api/docs/imagen) for the latest endpoints and model names.

### Request Format

- **HTTP Method:** POST
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <GEMINI_API_KEY>`
- **Body Example:**
  ```json
  {
    "contents": [
      {
        "parts": [
          {
            "text": "A photo of a futuristic city at sunset, ultra-realistic, 4K"
          }
        ]
      }
    ],
    "generationConfig": {
      "width": 1024,
      "height": 1024,
      "samples": 1
    }
  }
  ```

### Response Format

- The response will contain base64-encoded image(s), e.g.:
  ```json
  {
    "candidates": [
      {
        "content": {
          "parts": [
            {
              "inline_data": {
                "mime_type": "image/png",
                "data": "<base64-encoded-image>"
              }
            }
          ]
        }
      }
    ]
  }
  ```

### Go Integration Example (Manual HTTP)

```go
import (
  "bytes"
  "encoding/json"
  "fmt"
  "io/ioutil"
  "net/http"
  "os"
)

func CallImagenAPI(prompt string, width, height, samples int) (string, error) {
  apiKey := os.Getenv("GEMINI_API_KEY")
  url := "https://generativelanguage.googleapis.com/v1beta/models/imagen-1:generateContent?key=" + apiKey

  reqBody := map[string]interface{}{
    "contents": []interface{}{
      map[string]interface{}{
        "parts": []interface{}{
          map[string]interface{}{"text": prompt},
        },
      },
    },
    "generationConfig": map[string]interface{}{
      "width":    width,
      "height":   height,
      "samples":  samples,
    },
  }
  body, _ := json.Marshal(reqBody)
  resp, err := http.Post(url, "application/json", bytes.NewBuffer(body))
  if err != nil {
    return "", err
  }
  defer resp.Body.Close()
  respBody, _ := ioutil.ReadAll(resp.Body)
  // Parse response as needed
  return string(respBody), nil
}
```

### Go Integration Example (Official SDK)

#### Install SDK

```sh
go get google.golang.org/genai
```

#### Example Usage

```go
package main

import (
  "context"
  "fmt"
  "log"
  "os"

  "google.golang.org/genai"
)

func main() {
  ctx := context.Background()
  client, err := genai.NewClient(ctx, nil)
  if err != nil {
    log.Fatal(err)
  }

  // For image generation, use the appropriate model (e.g., "gemini-2.5-flash-image")
  result, err := client.Models.GenerateContent(
    ctx,
    "gemini-2.5-flash-image",
    genai.Text("Create a picture of a nano banana dish in a futuristic kitchen, 4K, ultra-realistic"),
  )
  if err != nil {
    log.Fatal(err)
  }

  // Handle result (see SDK docs for details)
  fmt.Println(result)
}
```

#### Notes

- The SDK simplifies authentication and request building.
- Use `genai.Text` for prompt, and check SDK docs for advanced options (parameterization, image input/output).
- See [Go SDK documentation](https://ai.google.dev/gemini-api/docs/libraries/go) for more details.

### References

- [Imagen API Docs](https://ai.google.dev/gemini-api/docs/imagen)
- [Prompt Guide](https://ai.google.dev/gemini-api/docs/imagen/prompt-guide)
- [Gemini Cookbook](https://github.com/google-gemini/cookbook)
- [Go SDK Docs](https://ai.google.dev/gemini-api/docs/libraries/go)
