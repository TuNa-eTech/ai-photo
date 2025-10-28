import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { GenerateImageDto, GeminiResponse, ValidationResult } from './dto';
import { GeminiAPIException, ContentPolicyException } from './exceptions';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly apiKey: string | undefined;
  private readonly model: string;
  private readonly timeoutMs: number;
  private genAI: GoogleGenAI | null = null;

  constructor(
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('gemini.apiKey');
    this.model = this.configService.get<string>('gemini.model') || 'gemini-2.5-flash-image';
    this.timeoutMs = this.configService.get<number>('gemini.timeoutMs') || 45000;

    if (this.apiKey) {
      this.genAI = new GoogleGenAI({ apiKey: this.apiKey });
      this.logger.log('Gemini SDK initialized successfully');
    } else {
      this.logger.warn('GEMINI_API_KEY is not configured. Image processing will be disabled.');
    }
  }

  /**
   * Generate image using Gemini API
   */
  async generateImage(dto: GenerateImageDto): Promise<GeminiResponse> {
    if (!this.apiKey || !this.genAI) {
      throw new GeminiAPIException('Gemini API key is not configured');
    }

    const startTime = Date.now();
    
    try {
      this.logger.log(`Starting image generation with model: ${this.model}`);
      
      // Build prompt with negative prompt if provided
      const fullPrompt = dto.negativePrompt
        ? `${dto.prompt}\n\nNegative prompt: ${dto.negativePrompt}`
        : dto.prompt;
      
      // Strip data URI prefix if present
      const base64Data = dto.imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
      
      // Convert base64 to image part for editing
      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: 'image/jpeg',
        },
      };
      
      // For image editing: send both prompt and image
      // Reference: https://ai.google.dev/gemini-api/docs/image-generation
      const response = await Promise.race([
        this.genAI!.models.generateContent({
          model: this.model,
          contents: [fullPrompt, imagePart],
          config: {
            // Optional: specify response modality to ensure image generation
            responseModalities: ['IMAGE'],
          },
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), this.timeoutMs)
        ),
      ]) as any;
      
      // Parse response
      const parsed = this.parseResponse(response);
      
      const generationTime = Date.now() - startTime;
      this.logger.log(`Image generated successfully in ${generationTime}ms`);
      
      return {
        processedImageBase64: parsed.imageBase64,
        metadata: {
          modelUsed: this.model,
          generationTimeMs: generationTime,
          dimensions: {
            width: dto.width || 1024,
            height: dto.height || 1024,
          },
        },
      };
      
    } catch (error: any) {
      const generationTime = Date.now() - startTime;
      this.logger.error(`Image generation failed after ${generationTime}ms:`, error.message);
      
      // Handle timeout
      if (error.message === 'Timeout') {
        throw new GeminiAPIException('Request timeout', 504);
      }
      
      // Handle quota exceeded (429)
      if (error.error?.code === 429 || error.error?.status === 'RESOURCE_EXHAUSTED') {
        const retryAfter = error.error?.details?.find((d: any) => d['@type'] === 'type.googleapis.com/google.rpc.RetryInfo')?.retryDelay;
        const message = error.error?.message || 'API quota exceeded';
        throw new GeminiAPIException(`Quota exceeded. Please check your billing and retry later. ${retryAfter ? `Retry after: ${retryAfter}` : ''}`, 429);
      }
      
      // Handle safety/content policy errors
      if (error.error?.message?.includes('safety') || error.error?.message?.includes('content')) {
        throw new ContentPolicyException('Image violates content policy');
      }
      
      // Check if already our custom exception
      if (error instanceof ContentPolicyException || error instanceof GeminiAPIException) {
        throw error;
      }
      
      throw new GeminiAPIException(`Unexpected error: ${error.message}`);
    }
  }

  /**
   * Parse Gemini API response from SDK
   */
  private parseResponse(response: any): { imageBase64: string } {
    this.logger.debug('Parsing Gemini response:', JSON.stringify(response, null, 2));
    
    const candidates = response.candidates;
    
    if (!candidates || candidates.length === 0) {
      throw new GeminiAPIException('No candidates in response');
    }
    
    const candidate = candidates[0];
    
    // Check for content policy blocks
    if (candidate.finishReason === 'SAFETY' || candidate.finishReason === 'RECITATION') {
      throw new ContentPolicyException('Content blocked by safety filter');
    }
    
    const parts = candidate.content?.parts;
    if (!parts || parts.length === 0) {
      this.logger.error('No parts in response. Response:', JSON.stringify(response, null, 2));
      throw new GeminiAPIException('No parts in response');
    }
    
    // Find image in parts
    const imagePart = parts.find((part: any) => part.inlineData);
    if (!imagePart || !imagePart.inlineData?.data) {
      this.logger.error('No image data in response. Parts:', JSON.stringify(parts, null, 2));
      throw new GeminiAPIException('No image data in response');
    }
    
    return {
      imageBase64: imagePart.inlineData.data,
    };
  }

  /**
   * Validate base64 image
   */
  validateImageBase64(base64: string): ValidationResult {
    try {
      // Extract data URI info
      const matches = base64.match(/^data:(image\/[a-z]+);base64,(.+)$/);
      if (!matches) {
        // Try without data URI prefix
        try {
          const buffer = Buffer.from(base64, 'base64');
          
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
          };
        } catch (bufferError) {
          return {
            valid: false,
            error: 'Invalid base64 encoding',
          };
        }
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

