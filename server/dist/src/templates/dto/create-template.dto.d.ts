import { TemplateStatus, TemplateVisibility } from '@prisma/client';
export declare class CreateTemplateDto {
    slug: string;
    name: string;
    description?: string;
    prompt?: string;
    negativePrompt?: string;
    modelProvider?: string;
    modelName?: string;
    status?: TemplateStatus;
    visibility?: TemplateVisibility;
    tags?: string[];
}
