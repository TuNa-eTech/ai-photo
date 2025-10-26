import { TemplatesService } from './templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
export declare class TemplatesAdminController {
    private readonly templatesService;
    constructor(templatesService: TemplatesService);
    list(): Promise<{
        templates: import("./templates.service").ApiTemplateAdmin[];
    }>;
    create(createDto: CreateTemplateDto): Promise<import("./templates.service").ApiTemplateAdmin>;
    getBySlug(slug: string): Promise<import("./templates.service").ApiTemplateAdmin>;
    update(slug: string, updateDto: UpdateTemplateDto): Promise<import("./templates.service").ApiTemplateAdmin>;
    delete(slug: string): Promise<void>;
    publish(slug: string): Promise<import("./templates.service").ApiTemplateAdmin>;
    unpublish(slug: string): Promise<import("./templates.service").ApiTemplateAdmin>;
    uploadAsset(slug: string, kind: string, file: Express.Multer.File): Promise<import("./dto/upload-asset.dto").AssetUploadResponse>;
}
