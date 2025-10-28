import { ConfigService } from '@nestjs/config';
import { GenerateImageDto, GeminiResponse, ValidationResult } from './dto';
export declare class GeminiService {
    private readonly configService;
    private readonly logger;
    private readonly apiKey;
    private readonly model;
    private readonly timeoutMs;
    private genAI;
    constructor(configService: ConfigService);
    generateImage(dto: GenerateImageDto): Promise<GeminiResponse>;
    private parseResponse;
    validateImageBase64(base64: string): ValidationResult;
}
