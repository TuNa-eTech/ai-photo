import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { GeminiService } from '../gemini/gemini.service';
import { TemplatesService } from '../templates/templates.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProcessImageDto, ProcessImageResponse } from './dto';

@Injectable()
export class ImagesService {
  private readonly logger = new Logger(ImagesService.name);

  constructor(
    private readonly geminiService: GeminiService,
    private readonly templatesService: TemplatesService,
    private readonly prisma: PrismaService,
  ) {}

  async processImage(dto: ProcessImageDto): Promise<ProcessImageResponse> {
    const startTime = Date.now();
    
    try {
      // 1. Validate image
      const validation = this.geminiService.validateImageBase64(dto.image_base64);
      if (!validation.valid) {
        throw new Error(validation.error || 'Invalid image');
      }

      this.logger.log(`Processing image: ${(validation.sizeBytes || 0) / 1024}KB for template: ${dto.template_id}`);

      // 2. Get template by ID
      // Note: We need to access Prisma directly since TemplatesService doesn't have getById
      const template = await this.prisma.template.findUnique({
        where: { id: dto.template_id },
      });
      
      if (!template) {
        throw new NotFoundException('Template not found');
      }

      if (!template.prompt) {
        throw new Error('Template does not have prompt configured');
      }

      // 3. Generate image
      const result = await this.geminiService.generateImage({
        prompt: template.prompt,
        negativePrompt: template.negativePrompt || undefined,
        imageBase64: dto.image_base64,
        width: dto.options?.width,
        height: dto.options?.height,
        quality: dto.options?.quality as any,
      });

      const processingTime = Date.now() - startTime;
      this.logger.log(`Image processing completed in ${processingTime}ms`);

      // 4. Return result
      return {
        processed_image_base64: `data:image/jpeg;base64,${result.processedImageBase64}`,
        metadata: {
          template_id: dto.template_id,
          template_name: template.name,
          model_used: result.metadata.modelUsed,
          generation_time_ms: result.metadata.generationTimeMs,
          processed_dimensions: result.metadata.dimensions,
        },
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.logger.error(`Image processing failed after ${processingTime}ms:`, error.message);
      throw error;
    }
  }
}

