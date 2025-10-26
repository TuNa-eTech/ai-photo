import { PrismaService } from '../prisma/prisma.service';
import { QueryTemplatesDto } from './dto/query-templates.dto';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { AssetKind, AssetUploadResponse } from './dto/upload-asset.dto';
export type ApiTemplate = {
    id: string;
    name: string;
    thumbnail_url?: string;
    published_at?: string;
    usage_count?: number;
};
export type ApiTemplateAdmin = {
    id: string;
    slug: string;
    name: string;
    description?: string;
    prompt?: string;
    negative_prompt?: string;
    model_provider?: string;
    model_name?: string;
    thumbnail_url?: string;
    status: string;
    visibility: string;
    published_at?: string;
    usage_count?: number;
    created_at: string;
    updated_at: string;
    tags?: string[];
};
export declare class TemplatesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private mapToApi;
    private resolveOrder;
    listTemplates(query: QueryTemplatesDto): Promise<{
        templates: ApiTemplate[];
    }>;
    private mapToAdminApi;
    listAdminTemplates(): Promise<{
        templates: ApiTemplateAdmin[];
    }>;
    createTemplate(dto: CreateTemplateDto): Promise<ApiTemplateAdmin>;
    getTemplateBySlug(slug: string): Promise<ApiTemplateAdmin>;
    updateTemplate(slug: string, dto: UpdateTemplateDto): Promise<ApiTemplateAdmin>;
    deleteTemplate(slug: string): Promise<void>;
    publishTemplate(slug: string): Promise<ApiTemplateAdmin>;
    unpublishTemplate(slug: string): Promise<ApiTemplateAdmin>;
    uploadAsset(slug: string, kind: AssetKind, file: Express.Multer.File): Promise<AssetUploadResponse>;
}
