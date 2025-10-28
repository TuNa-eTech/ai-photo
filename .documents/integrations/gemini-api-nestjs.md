# Gemini API Integration Guide (NestJS)

**Last updated:** 2025-10-27  
**Status:** Planning  
**Tech Stack:** NestJS + TypeScript + Axios

---

## Overview

This guide covers integration of Google Gemini API (Imagen 3) into NestJS backend for AI-powered image processing. The backend acts as a stateless proxy, forwarding requests to Gemini and returning results to clients.

---

## Prerequisites

### 1. API Key Setup

**Get API Key:**
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create new project or select existing
3. Generate API key
4. Copy key (starts with `AIza...`)

**Store in Environment:**

```bash
# server/.env
GEMINI_API_KEY=AIzaSyD...your_key_here
GEMINI_API_BASE_URL=https://generativelanguage.googleapis.com
GEMINI_MODEL=imagen-3-fast
GEMINI_TIMEOUT_MS=45000
```

**Load in NestJS:**

```typescript
// server/src/config/gemini.config.ts
import { registerAs } from '@nestjs/config';

export default registerAs('gemini', () => ({
  apiKey: process.env.GEMINI_API_KEY,
  baseUrl: process.env.GEMINI_API_BASE_URL || 'https://generativelanguage.googleapis.com',
  model: process.env.GEMINI_MODEL || 'imagen-3-fast',
  timeoutMs: parseInt(process.env.GEMINI_TIMEOUT_MS || '45000', 10),
}));
```

---

## API Endpoints Reference

### Base URL
```
https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent
```

### Available Models

| Model | Use Case | Speed | Quality | Input | Output |
|-------|----------|-------|---------|-------|--------|
| `imagen-3-fast` | Real-time editing | ⚡⚡⚡ Fast (5-10s) | ⭐⭐⭐ Good | Image + Text | Image |
| `imagen-3` | High-quality edits | 🐢 Slow (20-30s) | ⭐⭐⭐⭐⭐ Excellent | Image + Text | Image |
| `gemini-2.5-flash-image` | Text-to-image | ⚡⚡ Fast (8-15s) | ⭐⭐⭐⭐ Very Good | Text only | Image |

**Recommendation:** Use `imagen-3-fast` for MVP.

---

## Request Format

### Image-to-Image Generation

```http
POST /v1beta/models/imagen-3-fast:generateContent?key=YOUR_API_KEY HTTP/1.1
Host: generativelanguage.googleapis.com
Content-Type: application/json

{
  "contents": [
    {
      "parts": [
        {
          "text": "Transform this photo into anime style with vibrant colors, big expressive eyes, and detailed hair. Negative prompt: blurry, low quality, realistic photo"
        },
        {
          "inline_data": {
            "mime_type": "image/jpeg",
            "data": "/9j/4AAQSkZJRgABAQEAYABgAAD..."
          }
        }
      ]
    }
  ],
  "generationConfig": {
    "responseModalities": ["image"],
    "numberOfImages": 1,
    "imageConfig": {
      "width": 1024,
      "height": 1024,
      "outputFormat": "image/jpeg",
      "compressionQuality": 90
    }
  },
  "safetySettings": [
    {
      "category": "HARM_CATEGORY_HATE_SPEECH",
      "threshold": "BLOCK_MEDIUM_AND_ABOVE"
    },
    {
      "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
      "threshold": "BLOCK_MEDIUM_AND_ABOVE"
    },
    {
      "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
      "threshold": "BLOCK_MEDIUM_AND_ABOVE"
    }
  ]
}
```

### Response Format

```json
{
  "candidates": [
    {
      "content": {
        "parts": [
          {
            "inline_data": {
              "mime_type": "image/jpeg",
              "data": "/9j/4AAQSkZJRgABAQEAYABgAAD..."
            }
          }
        ]
      },
      "finishReason": "STOP",
      "safetyRatings": [
        {
          "category": "HARM_CATEGORY_HATE_SPEECH",
          "probability": "NEGLIGIBLE"
        }
      ]
    }
  ],
  "usageMetadata": {
    "promptTokenCount": 150,
    "candidatesTokenCount": 0,
    "totalTokenCount": 150
  }
}
```

---

## NestJS Implementation

### 1. Module Structure

```
server/src/gemini/
  ├── gemini.module.ts
  ├── gemini.service.ts
  ├── gemini.service.spec.ts
  ├── dto/
  │   ├── generate-image.dto.ts
  │   └── gemini-response.dto.ts
  └── exceptions/
      ├── gemini-api.exception.ts
      └── content-policy.exception.ts
```

### 2. Module Configuration

```typescript
// server/src/gemini/gemini.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { GeminiService } from './gemini.service';
import geminiConfig from '../config/gemini.config';

@Module({
  imports: [
    ConfigModule.forFeature(geminiConfig),
    HttpModule.register({
      timeout: 60000, // 60s
      maxRedirects: 0,
    }),
  ],
  providers: [GeminiService],
  exports: [GeminiService],
})
export class GeminiModule {}
```

### 3. DTOs

```typescript
// server/src/gemini/dto/generate-image.dto.ts
import { IsString, IsOptional, IsInt, Min, Max, IsEnum } from 'class-validator';

export enum ImageQuality {
  STANDARD = 'standard',
  HIGH = 'high',
}

export class GenerateImageDto {
  @IsString()
  prompt: string;

  @IsString()
  @IsOptional()
  negativePrompt?: string;

  @IsString()
  imageBase64: string;

  @IsInt()
  @Min(512)
  @Max(2048)
  @IsOptional()
  width?: number = 1024;

  @IsInt()
  @Min(512)
  @Max(2048)
  @IsOptional()
  height?: number = 1024;

  @IsEnum(ImageQuality)
  @IsOptional()
  quality?: ImageQuality = ImageQuality.STANDARD;
}
```

```typescript
// server/src/gemini/dto/gemini-response.dto.ts
export interface GeminiResponse {
  processedImageBase64: string;
  metadata: {
    modelUsed: string;
    generationTimeMs: number;
    dimensions: {
      width: number;
      height: number;
    };
  };
}
```

### 4. Service Implementation

```typescript
// server/src/gemini/gemini.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, timeout } from 'rxjs';
import { GenerateImageDto, GeminiResponse } from './dto';
import { GeminiAPIException, ContentPolicyException } from './exceptions';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly model: string;
  private readonly timeoutMs: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.apiKey = this.configService.get<string>('gemini.apiKey');
    this.baseUrl = this.configService.get<string>('gemini.baseUrl');
    this.model = this.configService.get<string>('gemini.model');
    this.timeoutMs = this.configService.get<number>('gemini.timeoutMs');

    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
  }

  /**
   * Generate image using Gemini API
   */
  async generateImage(dto: GenerateImageDto): Promise<GeminiResponse> {
    const startTime = Date.now();
    
    try {
      this.logger.log(`Starting image generation with model: ${this.model}`);
      
      // Build request payload
      const payload = this.buildRequestPayload(dto);
      
      // Call Gemini API with timeout
      const url = `${this.baseUrl}/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
      
      const response = await firstValueFrom(
        this.httpService.post(url, payload).pipe(
          timeout(this.timeoutMs)
        )
      );
      
      // Parse response
      const result = this.parseResponse(response.data);
      
      const generationTime = Date.now() - startTime;
      this.logger.log(`Image generated successfully in ${generationTime}ms`);
      
      return {
        processedImageBase64: result.imageBase64,
        metadata: {
          modelUsed: this.model,
          generationTimeMs: generationTime,
          dimensions: {
            width: dto.width || 1024,
            height: dto.height || 1024,
          },
        },
      };
      
    } catch (error) {
      const generationTime = Date.now() - startTime;
      this.logger.error(`Image generation failed after ${generationTime}ms:`, error.message);
      
      // Handle specific error types
      if (error.response?.status === 400) {
        const errorMessage = error.response.data?.error?.message || 'Invalid request';
        
        if (errorMessage.includes('content policy')) {
          throw new ContentPolicyException('Image violates content policy');
        }
        
        throw new GeminiAPIException(`Bad request: ${errorMessage}`);
      }
      
      if (error.response?.status === 429) {
        throw new GeminiAPIException('Rate limit exceeded', 429);
      }
      
      if (error.response?.status >= 500) {
        throw new GeminiAPIException('Gemini API service error', 502);
      }
      
      if (error.name === 'TimeoutError') {
        throw new GeminiAPIException('Request timeout', 504);
      }
      
      throw new GeminiAPIException(`Unexpected error: ${error.message}`);
    }
  }

  /**
   * Build Gemini API request payload
   */
  private buildRequestPayload(dto: GenerateImageDto) {
    // Combine prompt with negative prompt
    const fullPrompt = dto.negativePrompt
      ? `${dto.prompt}\n\nNegative prompt: ${dto.negativePrompt}`
      : dto.prompt;
    
    // Strip data URI prefix if present
    const base64Data = dto.imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
    
    // Determine compression quality
    const compressionQuality = dto.quality === 'high' ? 95 : 90;
    
    return {
      contents: [
        {
          parts: [
            {
              text: fullPrompt,
            },
            {
              inline_data: {
                mime_type: 'image/jpeg',
                data: base64Data,
              },
            },
          ],
        },
      ],
      generationConfig: {
        responseModalities: ['image'],
        numberOfImages: 1,
        imageConfig: {
          width: dto.width || 1024,
          height: dto.height || 1024,
          outputFormat: 'image/jpeg',
          compressionQuality,
        },
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
      ],
    };
  }

  /**
   * Parse Gemini API response
   */
  private parseResponse(data: any): { imageBase64: string } {
    if (!data.candidates || data.candidates.length === 0) {
      throw new GeminiAPIException('No candidates in response');
    }
    
    const candidate = data.candidates[0];
    
    // Check for content policy blocks
    if (candidate.finishReason === 'SAFETY') {
      throw new ContentPolicyException('Content blocked by safety filter');
    }
    
    const parts = candidate.content?.parts;
    if (!parts || parts.length === 0) {
      throw new GeminiAPIException('No parts in response');
    }
    
    // Find image in parts
    const imagePart = parts.find(part => part.inline_data);
    if (!imagePart || !imagePart.inline_data?.data) {
      throw new GeminiAPIException('No image data in response');
    }
    
    return {
      imageBase64: imagePart.inline_data.data,
    };
  }

  /**
   * Validate base64 image
   */
  validateImageBase64(base64: string): {
    valid: boolean;
    sizeBytes?: number;
    mimeType?: string;
    error?: string;
  } {
    try {
      // Extract data URI info
      const matches = base64.match(/^data:(image\/[a-z]+);base64,(.+)$/);
      if (!matches) {
        // Try without data URI prefix
        const buffer = Buffer.from(base64, 'base64');
        return {
          valid: true,
          sizeBytes: buffer.length,
        };
      }
      
      const mimeType = matches[1];
      const data = matches[2];
      const buffer = Buffer.from(data, 'base64');
      
      // Check size (max 10MB)
      const maxSize = 10 * 1024 * 1024;
      if (buffer.length > maxSize) {
        return {
          valid: false,
          error: `Image too large: ${(buffer.length / 1024 / 1024).toFixed(2)}MB (max 10MB)`,
        };
      }
      
      return {
        valid: true,
        sizeBytes: buffer.length,
        mimeType,
      };
      
    } catch (error) {
      return {
        valid: false,
        error: 'Invalid base64 encoding',
      };
    }
  }
}
```

### 5. Custom Exceptions

```typescript
// server/src/gemini/exceptions/gemini-api.exception.ts
import { HttpException, HttpStatus } from '@nestjs/common';

export class GeminiAPIException extends HttpException {
  constructor(message: string, status: number = HttpStatus.BAD_GATEWAY) {
    super(
      {
        success: false,
        error: {
          code: 'gemini_api_error',
          message,
        },
      },
      status,
    );
  }
}
```

```typescript
// server/src/gemini/exceptions/content-policy.exception.ts
import { HttpException, HttpStatus } from '@nestjs/common';

export class ContentPolicyException extends HttpException {
  constructor(message: string) {
    super(
      {
        success: false,
        error: {
          code: 'inappropriate_content',
          message,
        },
      },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
}
```

---

## Usage in Images Module

```typescript
// server/src/images/images.controller.ts
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { BearerAuthGuard } from '../auth/bearer-auth.guard';
import { GeminiService } from '../gemini/gemini.service';
import { TemplatesService } from '../templates/templates.service';
import { ProcessImageDto } from './dto/process-image.dto';

@Controller('v1/images')
@UseGuards(BearerAuthGuard)
export class ImagesController {
  constructor(
    private readonly geminiService: GeminiService,
    private readonly templatesService: TemplatesService,
  ) {}

  @Post('process')
  async processImage(@Body() dto: ProcessImageDto) {
    // 1. Validate image
    const validation = this.geminiService.validateImageBase64(dto.image_base64);
    if (!validation.valid) {
      throw new BadRequestException(validation.error);
    }

    // 2. Get template
    const template = await this.templatesService.findOne(dto.template_id);
    if (!template) {
      throw new NotFoundException('Template not found');
    }

    // 3. Generate image
    const result = await this.geminiService.generateImage({
      prompt: template.prompt,
      negativePrompt: template.negativePrompt,
      imageBase64: dto.image_base64,
      width: dto.options?.width,
      height: dto.options?.height,
      quality: dto.options?.quality,
    });

    // 4. Return result
    return {
      success: true,
      data: {
        processed_image_base64: `data:image/jpeg;base64,${result.processedImageBase64}`,
        metadata: {
          template_id: dto.template_id,
          template_name: template.name,
          ...result.metadata,
        },
      },
    };
  }
}
```

---

## Testing

### Unit Tests

```typescript
// server/src/gemini/gemini.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { GeminiService } from './gemini.service';
import { of, throwError } from 'rxjs';

describe('GeminiService', () => {
  let service: GeminiService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeminiService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config = {
                'gemini.apiKey': 'test-api-key',
                'gemini.baseUrl': 'https://test.api.com',
                'gemini.model': 'test-model',
                'gemini.timeoutMs': 30000,
              };
              return config[key];
            }),
          },
        },
        {
          provide: HttpService,
          useValue: {
            post: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<GeminiService>(GeminiService);
    httpService = module.get<HttpService>(HttpService);
  });

  describe('generateImage', () => {
    it('should generate image successfully', async () => {
      const mockResponse = {
        data: {
          candidates: [
            {
              content: {
                parts: [
                  {
                    inline_data: {
                      data: 'base64encodedimage',
                    },
                  },
                ],
              },
              finishReason: 'STOP',
            },
          ],
        },
      };

      jest.spyOn(httpService, 'post').mockReturnValue(of(mockResponse) as any);

      const result = await service.generateImage({
        prompt: 'Test prompt',
        imageBase64: 'data:image/jpeg;base64,testdata',
        width: 1024,
        height: 1024,
      });

      expect(result.processedImageBase64).toBe('base64encodedimage');
      expect(result.metadata.modelUsed).toBe('test-model');
    });

    it('should throw ContentPolicyException when content blocked', async () => {
      const mockResponse = {
        data: {
          candidates: [
            {
              finishReason: 'SAFETY',
            },
          ],
        },
      };

      jest.spyOn(httpService, 'post').mockReturnValue(of(mockResponse) as any);

      await expect(
        service.generateImage({
          prompt: 'Test',
          imageBase64: 'test',
        }),
      ).rejects.toThrow(ContentPolicyException);
    });
  });

  describe('validateImageBase64', () => {
    it('should validate correct base64', () => {
      const base64 = 'data:image/jpeg;base64,' + Buffer.from('test').toString('base64');
      const result = service.validateImageBase64(base64);
      
      expect(result.valid).toBe(true);
      expect(result.mimeType).toBe('image/jpeg');
    });

    it('should reject oversized image', () => {
      const largeData = Buffer.alloc(11 * 1024 * 1024).toString('base64'); // 11MB
      const result = service.validateImageBase64(largeData);
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('too large');
    });
  });
});
```

---

## Error Handling Best Practices

### 1. Timeout Handling

```typescript
// Set appropriate timeouts
const GEMINI_TIMEOUT = 45000; // 45s for Gemini processing
const HTTP_TIMEOUT = 60000;   // 60s total for HTTP request

// Use RxJS timeout operator
this.httpService.post(url, payload).pipe(
  timeout(GEMINI_TIMEOUT),
  catchError(error => {
    if (error.name === 'TimeoutError') {
      throw new GatewayTimeoutException('AI processing timeout');
    }
    throw error;
  })
);
```

### 2. Retry Logic (Optional)

```typescript
import { retry, delay } from 'rxjs/operators';

this.httpService.post(url, payload).pipe(
  retry({
    count: 2,
    delay: (error, retryCount) => {
      // Only retry on 5xx errors
      if (error.response?.status >= 500) {
        return of(null).pipe(delay(1000 * retryCount));
      }
      throw error;
    },
  }),
);
```

### 3. Logging

```typescript
this.logger.log(`Gemini API request: ${dto.prompt.substring(0, 50)}...`);
this.logger.log(`Image size: ${validation.sizeBytes / 1024}KB`);
this.logger.error(`Gemini API error: ${error.message}`, error.stack);
```

---

## Rate Limiting

```typescript
// server/src/gemini/gemini.module.ts
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,   // 60 seconds
      limit: 10, // 10 requests per minute
    }),
  ],
})
export class GeminiModule {}
```

---

## Environment Variables Checklist

```bash
# Required
GEMINI_API_KEY=AIzaSy...

# Optional (with defaults)
GEMINI_API_BASE_URL=https://generativelanguage.googleapis.com
GEMINI_MODEL=imagen-3-fast
GEMINI_TIMEOUT_MS=45000
```

---

## References

- [Gemini API Documentation](https://ai.google.dev/gemini-api/docs)
- [Imagen 3 Guide](https://ai.google.dev/gemini-api/docs/imagen)
- [NestJS HTTP Module](https://docs.nestjs.com/techniques/http-module)
- [RxJS Timeout Operator](https://rxjs.dev/api/operators/timeout)

---

## Troubleshooting

### API Key Not Working
- Verify key is correct (starts with `AIza`)
- Check if API is enabled in Google Cloud Console
- Ensure billing is set up (Gemini API may require it)

### Timeout Errors
- Check network connectivity
- Verify image size (< 10MB)
- Try with smaller image dimensions

### Content Policy Violations
- Review Gemini content policies
- Ensure prompt doesn't request inappropriate content
- Check input image content

### 429 Rate Limit
- Implement exponential backoff
- Add rate limiting on your API
- Consider upgrading API quota

