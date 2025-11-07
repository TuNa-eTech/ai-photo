import { ConfigService } from '@nestjs/config';
import { GeminiService } from '../gemini/gemini.service';
import { TemplatesService } from '../templates/templates.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProcessImageDto, ProcessImageResponse } from './dto';
export declare class ImagesService {
    private readonly geminiService;
    private readonly templatesService;
    private readonly prisma;
    private readonly configService;
    private readonly logger;
    constructor(geminiService: GeminiService, templatesService: TemplatesService, prisma: PrismaService, configService: ConfigService);
    private getMockImageBase64;
    processImage(dto: ProcessImageDto): Promise<ProcessImageResponse>;
}
