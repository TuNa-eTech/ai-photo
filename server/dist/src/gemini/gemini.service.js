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
var GeminiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const genai_1 = require("@google/genai");
const exceptions_1 = require("./exceptions");
let GeminiService = GeminiService_1 = class GeminiService {
    configService;
    logger = new common_1.Logger(GeminiService_1.name);
    apiKey;
    model;
    timeoutMs;
    genAI = null;
    constructor(configService) {
        this.configService = configService;
        this.apiKey = this.configService.get('gemini.apiKey');
        this.model = this.configService.get('gemini.model') || 'gemini-2.5-flash-image';
        this.timeoutMs = this.configService.get('gemini.timeoutMs') || 45000;
        if (this.apiKey) {
            this.genAI = new genai_1.GoogleGenAI({ apiKey: this.apiKey });
            this.logger.log('Gemini SDK initialized successfully');
        }
        else {
            this.logger.warn('GEMINI_API_KEY is not configured. Image processing will be disabled.');
        }
    }
    async generateImage(dto) {
        if (!this.apiKey || !this.genAI) {
            throw new exceptions_1.GeminiAPIException('Gemini API key is not configured');
        }
        const startTime = Date.now();
        try {
            this.logger.log(`Starting image generation with model: ${this.model}`);
            const fullPrompt = dto.negativePrompt
                ? `${dto.prompt}\n\nNegative prompt: ${dto.negativePrompt}`
                : dto.prompt;
            const base64Data = dto.imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
            const imagePart = {
                inlineData: {
                    data: base64Data,
                    mimeType: 'image/jpeg',
                },
            };
            const response = await Promise.race([
                this.genAI.models.generateContent({
                    model: this.model,
                    contents: [fullPrompt, imagePart],
                    config: {
                        responseModalities: ['IMAGE'],
                    },
                }),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), this.timeoutMs)),
            ]);
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
        }
        catch (error) {
            const generationTime = Date.now() - startTime;
            this.logger.error(`Image generation failed after ${generationTime}ms:`, error.message);
            if (error.message === 'Timeout') {
                throw new exceptions_1.GeminiAPIException('Request timeout', 504);
            }
            if (error.error?.code === 429 || error.error?.status === 'RESOURCE_EXHAUSTED') {
                const retryAfter = error.error?.details?.find((d) => d['@type'] === 'type.googleapis.com/google.rpc.RetryInfo')?.retryDelay;
                const message = error.error?.message || 'API quota exceeded';
                throw new exceptions_1.GeminiAPIException(`Quota exceeded. Please check your billing and retry later. ${retryAfter ? `Retry after: ${retryAfter}` : ''}`, 429);
            }
            if (error.error?.message?.includes('safety') || error.error?.message?.includes('content')) {
                throw new exceptions_1.ContentPolicyException('Image violates content policy');
            }
            if (error instanceof exceptions_1.ContentPolicyException || error instanceof exceptions_1.GeminiAPIException) {
                throw error;
            }
            throw new exceptions_1.GeminiAPIException(`Unexpected error: ${error.message}`);
        }
    }
    parseResponse(response) {
        this.logger.debug('Parsing Gemini response:', JSON.stringify(response, null, 2));
        const candidates = response.candidates;
        if (!candidates || candidates.length === 0) {
            throw new exceptions_1.GeminiAPIException('No candidates in response');
        }
        const candidate = candidates[0];
        if (candidate.finishReason === 'SAFETY' || candidate.finishReason === 'RECITATION') {
            throw new exceptions_1.ContentPolicyException('Content blocked by safety filter');
        }
        const parts = candidate.content?.parts;
        if (!parts || parts.length === 0) {
            this.logger.error('No parts in response. Response:', JSON.stringify(response, null, 2));
            throw new exceptions_1.GeminiAPIException('No parts in response');
        }
        const imagePart = parts.find((part) => part.inlineData);
        if (!imagePart || !imagePart.inlineData?.data) {
            this.logger.error('No image data in response. Parts:', JSON.stringify(parts, null, 2));
            throw new exceptions_1.GeminiAPIException('No image data in response');
        }
        return {
            imageBase64: imagePart.inlineData.data,
        };
    }
    validateImageBase64(base64) {
        try {
            const matches = base64.match(/^data:(image\/[a-z]+);base64,(.+)$/);
            if (!matches) {
                try {
                    const buffer = Buffer.from(base64, 'base64');
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
                }
                catch (bufferError) {
                    return {
                        valid: false,
                        error: 'Invalid base64 encoding',
                    };
                }
            }
            const mimeType = matches[1];
            const data = matches[2];
            const buffer = Buffer.from(data, 'base64');
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
        }
        catch (error) {
            return {
                valid: false,
                error: 'Invalid base64 encoding',
            };
        }
    }
};
exports.GeminiService = GeminiService;
exports.GeminiService = GeminiService = GeminiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], GeminiService);
//# sourceMappingURL=gemini.service.js.map