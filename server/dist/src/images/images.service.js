"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ImagesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImagesService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const fs_1 = require("fs");
const path_1 = require("path");
const gemini_service_1 = require("../gemini/gemini.service");
const templates_service_1 = require("../templates/templates.service");
const prisma_service_1 = require("../prisma/prisma.service");
const credits_service_1 = require("../credits/credits.service");
let ImagesService = ImagesService_1 = class ImagesService {
    geminiService;
    templatesService;
    prisma;
    configService;
    creditsService;
    logger = new common_1.Logger(ImagesService_1.name);
    constructor(geminiService, templatesService, prisma, configService, creditsService) {
        this.geminiService = geminiService;
        this.templatesService = templatesService;
        this.prisma = prisma;
        this.configService = configService;
        this.creditsService = creditsService;
    }
    getMockImageBase64() {
        const mockImagePath = (0, path_1.join)(process.cwd(), 'mock_dev', 'test_img.png');
        if (!(0, fs_1.existsSync)(mockImagePath)) {
            throw new Error(`Mock image not found at ${mockImagePath}`);
        }
        try {
            const imageBuffer = (0, fs_1.readFileSync)(mockImagePath);
            return imageBuffer.toString('base64');
        }
        catch (error) {
            this.logger.error(`Failed to read mock image: ${error instanceof Error ? error.message : error}`);
            throw new Error('Failed to read mock image file');
        }
    }
    async processImage(dto, firebaseUid) {
        const startTime = Date.now();
        try {
            const hasEnoughCredits = await this.creditsService.checkCreditsAvailability(firebaseUid, 1);
            if (!hasEnoughCredits) {
                throw new common_1.ForbiddenException({
                    code: 'insufficient_credits',
                    message: 'Insufficient credits. Please purchase more credits to continue.',
                });
            }
            const useMockImage = this.configService.get('gemini.useMockImage', false);
            if (useMockImage) {
                this.logger.log('🔄 Mock image mode enabled - using mock_dev/test_img.png');
                const validation = this.geminiService.validateImageBase64(dto.image_base64);
                if (!validation.valid) {
                    throw new Error(validation.error || 'Invalid image');
                }
                const template = await this.prisma.template.findUnique({
                    where: { id: dto.template_id },
                });
                if (!template) {
                    throw new common_1.NotFoundException('Template not found');
                }
                const mockImageBase64 = this.getMockImageBase64();
                const simulatedProcessingTime = Math.floor(Math.random() * 400) + 100;
                await new Promise(resolve => setTimeout(resolve, simulatedProcessingTime));
                const processingTime = Date.now() - startTime;
                this.logger.log(`Mock image processing completed in ${processingTime}ms`);
                await this.creditsService.deductCredits(firebaseUid, 1, dto.template_id);
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
            const validation = this.geminiService.validateImageBase64(dto.image_base64);
            if (!validation.valid) {
                throw new Error(validation.error || 'Invalid image');
            }
            this.logger.log(`Processing image: ${(validation.sizeBytes || 0) / 1024}KB for template: ${dto.template_id}`);
            const template = await this.prisma.template.findUnique({
                where: { id: dto.template_id },
            });
            if (!template) {
                throw new common_1.NotFoundException('Template not found');
            }
            if (!template.prompt) {
                throw new Error('Template does not have prompt configured');
            }
            const result = await this.geminiService.generateImage({
                prompt: template.prompt,
                negativePrompt: template.negativePrompt || undefined,
                imageBase64: dto.image_base64,
                width: dto.options?.width,
                height: dto.options?.height,
                quality: dto.options?.quality,
            });
            const processingTime = Date.now() - startTime;
            this.logger.log(`Image processing completed in ${processingTime}ms`);
            await this.creditsService.deductCredits(firebaseUid, 1, dto.template_id);
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
        }
        catch (error) {
            const processingTime = Date.now() - startTime;
            this.logger.error(`Image processing failed after ${processingTime}ms:`, error.message);
            throw error;
        }
    }
};
exports.ImagesService = ImagesService;
exports.ImagesService = ImagesService = ImagesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(4, (0, common_1.Inject)((0, common_1.forwardRef)(() => credits_service_1.CreditsService))),
    __metadata("design:paramtypes", [gemini_service_1.GeminiService,
        templates_service_1.TemplatesService,
        prisma_service_1.PrismaService,
        config_1.ConfigService,
        credits_service_1.CreditsService])
], ImagesService);
//# sourceMappingURL=images.service.js.map