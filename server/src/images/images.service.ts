import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { GeminiService } from '../gemini/gemini.service';
import { TemplatesService } from '../templates/templates.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreditsService } from '../credits/credits.service';
import { ProcessImageDto, ProcessImageResponse } from './dto';

@Injectable()
export class ImagesService {
  private readonly logger = new Logger(ImagesService.name);

  constructor(
    private readonly geminiService: GeminiService,
    private readonly templatesService: TemplatesService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => CreditsService))
    private readonly creditsService: CreditsService,
  ) {}

  /**
   * Read mock image from mock_dev/test_img.png and convert to base64
   * @returns Base64 string without data URI prefix
   */
  private getMockImageBase64(): string {
    const mockImagePath = join(process.cwd(), 'mock_dev', 'test_img.png');

    if (!existsSync(mockImagePath)) {
      throw new Error(`Mock image not found at ${mockImagePath}`);
    }

    try {
      const imageBuffer = readFileSync(mockImagePath);
      return imageBuffer.toString('base64');
    } catch (error) {
      this.logger.error(
        `Failed to read mock image: ${error instanceof Error ? error.message : error}`,
      );
      throw new Error('Failed to read mock image file');
    }
  }

  async processImage(
    dto: ProcessImageDto,
    firebaseUid: string,
  ): Promise<ProcessImageResponse> {
    const startTime = Date.now();

    try {
      // Check credits before processing
      const hasEnoughCredits =
        await this.creditsService.checkCreditsAvailability(firebaseUid, 1);
      if (!hasEnoughCredits) {
        throw new ForbiddenException({
          code: 'insufficient_credits',
          message:
            'Insufficient credits. Please purchase more credits to continue.',
        });
      }

      // Check if mock mode is enabled
      const useMockImage = this.configService.get<boolean>(
        'gemini.useMockImage',
        false,
      );

      if (useMockImage) {
        this.logger.log(
          '🔄 Mock image mode enabled - using mock_dev/test_img.png',
        );

        // 1. Validate image (still validate input even in mock mode)
        const validation = this.geminiService.validateImageBase64(
          dto.image_base64,
        );
        if (!validation.valid) {
          throw new Error(validation.error || 'Invalid image');
        }

        // 2. Get template by ID
        const template = await this.prisma.template.findUnique({
          where: { id: dto.template_id },
        });

        if (!template) {
          throw new NotFoundException('Template not found');
        }

        // 3. Get mock image
        const mockImageBase64 = this.getMockImageBase64();

        // Simulate processing time (100-500ms)
        const simulatedProcessingTime = Math.floor(Math.random() * 400) + 100;
        await new Promise((resolve) =>
          setTimeout(resolve, simulatedProcessingTime),
        );

        const processingTime = Date.now() - startTime;
        this.logger.log(
          `Mock image processing completed in ${processingTime}ms`,
        );

        // 4. Deduct 1 credit after successful processing
        await this.creditsService.deductCredits(
          firebaseUid,
          1,
          dto.template_id,
        );

        // 5. Tăng usageCount cho template
        await this.prisma.template.update({
          where: { id: dto.template_id },
          data: { usageCount: { increment: 1 } },
        });

        // 6. Return mock result
        return {
          processed_image_base64: `data:image/jpeg;base64,${mockImageBase64}`,
          metadata: {
            template_id: dto.template_id,
            template_name: template.name,
            model_used: 'mock',
            generation_time_ms: processingTime,
            processed_dimensions: {
              width: dto.options?.width || 1024,
              height: dto.options?.height || 1024,
            },
          },
        };
      }

      // Original flow when mock mode is disabled
      // 1. Validate image
      const validation = this.geminiService.validateImageBase64(
        dto.image_base64,
      );
      if (!validation.valid) {
        throw new Error(validation.error || 'Invalid image');
      }

      this.logger.log(
        `Processing image: ${(validation.sizeBytes || 0) / 1024}KB for template: ${dto.template_id}`,
      );

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

      // 4. Deduct 1 credit after successful processing
      await this.creditsService.deductCredits(firebaseUid, 1, dto.template_id);

      // 5. Tăng usageCount cho template
      await this.prisma.template.update({
        where: { id: dto.template_id },
        data: { usageCount: { increment: 1 } },
      });

      // 6. Return result
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
      this.logger.error(
        `Image processing failed after ${processingTime}ms:`,
        error.message,
      );
      throw error;
    }
  }
}
