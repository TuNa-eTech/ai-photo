"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplatesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const upload_asset_dto_1 = require("./dto/upload-asset.dto");
const client_1 = require("@prisma/client");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const crypto_1 = require("crypto");
let TemplatesService = class TemplatesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    mapToApi(t) {
        return {
            id: t.id,
            name: t.name,
            thumbnail_url: t.thumbnailUrl ?? undefined,
            published_at: t.publishedAt ? t.publishedAt.toISOString() : undefined,
            usage_count: t.usageCount,
        };
    }
    resolveOrder(sort) {
        switch (sort) {
            case 'popular':
                return { usageCount: 'desc' };
            case 'name':
                return { name: 'asc' };
            case 'newest':
            default:
                return { publishedAt: 'desc' };
        }
    }
    async listTemplates(query) {
        const { limit, offset, q, tags, sort } = query;
        const where = {
            status: client_1.TemplateStatus.published,
            visibility: 'public',
        };
        if (q && q.trim()) {
            where.AND = [
                {
                    OR: [
                        { name: { contains: q.trim(), mode: 'insensitive' } },
                        { id: { contains: q.trim(), mode: 'insensitive' } },
                    ],
                },
            ];
        }
        if (tags && tags.trim()) {
            const tagList = tags.split(',').map((t) => t.trim()).filter((t) => t.length > 0);
            if (tagList.length > 0) {
                if (where.AND) {
                    where.AND.push({ tags: { hasSome: tagList } });
                }
                else {
                    where.AND = [{ tags: { hasSome: tagList } }];
                }
            }
        }
        const orderBy = this.resolveOrder(sort);
        const rows = await this.prisma.template.findMany({
            where,
            orderBy,
            take: limit,
            skip: offset,
            select: {
                id: true,
                name: true,
                thumbnailUrl: true,
                publishedAt: true,
                usageCount: true,
            },
        });
        return { templates: rows.map((r) => this.mapToApi(r)) };
    }
    async listTrendingTemplates(query) {
        const { limit = 20, offset = 0 } = query;
        const where = {
            status: client_1.TemplateStatus.published,
            visibility: 'public',
            usageCount: { gte: 500 },
        };
        const rows = await this.prisma.template.findMany({
            where,
            orderBy: { usageCount: 'desc' },
            take: Math.min(limit, 50),
            skip: offset,
            select: {
                id: true,
                name: true,
                thumbnailUrl: true,
                publishedAt: true,
                usageCount: true,
            },
        });
        return { templates: rows.map((r) => this.mapToApi(r)) };
    }
    mapToAdminApi(t) {
        return {
            id: t.id,
            slug: t.slug,
            name: t.name,
            description: t.description ?? undefined,
            prompt: t.prompt ?? undefined,
            negative_prompt: t.negativePrompt ?? undefined,
            model_provider: t.modelProvider,
            model_name: t.modelName,
            thumbnail_url: t.thumbnailUrl ?? undefined,
            status: t.status,
            visibility: t.visibility,
            published_at: t.publishedAt ? t.publishedAt.toISOString() : undefined,
            usage_count: t.usageCount,
            created_at: t.createdAt.toISOString(),
            updated_at: t.updatedAt.toISOString(),
            tags: t.tags,
        };
    }
    async listAdminTemplates() {
        const templates = await this.prisma.template.findMany({
            orderBy: { updatedAt: 'desc' },
        });
        return { templates: templates.map((t) => this.mapToAdminApi(t)) };
    }
    async createTemplate(dto) {
        const existing = await this.prisma.template.findUnique({
            where: { slug: dto.slug },
        });
        if (existing) {
            throw new common_1.ConflictException(`Template with slug '${dto.slug}' already exists`);
        }
        const template = await this.prisma.template.create({
            data: {
                slug: dto.slug,
                name: dto.name,
                description: dto.description,
                prompt: dto.prompt,
                negativePrompt: dto.negativePrompt,
                modelProvider: dto.modelProvider,
                modelName: dto.modelName,
                status: dto.status ?? client_1.TemplateStatus.draft,
                visibility: dto.visibility ?? 'public',
                tags: dto.tags ?? [],
            },
        });
        return this.mapToAdminApi(template);
    }
    async getTemplateBySlug(slug) {
        const template = await this.prisma.template.findUnique({
            where: { slug },
        });
        if (!template) {
            throw new common_1.NotFoundException(`Template with slug '${slug}' not found`);
        }
        return this.mapToAdminApi(template);
    }
    async updateTemplate(slug, dto) {
        const existing = await this.prisma.template.findUnique({
            where: { slug },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Template with slug '${slug}' not found`);
        }
        const template = await this.prisma.template.update({
            where: { slug },
            data: {
                name: dto.name,
                description: dto.description,
                prompt: dto.prompt,
                negativePrompt: dto.negativePrompt,
                modelProvider: dto.modelProvider,
                modelName: dto.modelName,
                status: dto.status,
                visibility: dto.visibility,
                tags: dto.tags,
            },
        });
        return this.mapToAdminApi(template);
    }
    async deleteTemplate(slug) {
        const existing = await this.prisma.template.findUnique({
            where: { slug },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Template with slug '${slug}' not found`);
        }
        if (existing.thumbnailUrl) {
            try {
                const oldUrl = new URL(existing.thumbnailUrl);
                const oldFilename = path.basename(oldUrl.pathname);
                const uploadDir = path.join(process.cwd(), 'public', 'thumbnails');
                const oldFilePath = path.join(uploadDir, oldFilename);
                await fs.unlink(oldFilePath);
                console.log(`Deleted thumbnail file: ${oldFilename}`);
            }
            catch (error) {
                console.warn('Could not delete thumbnail file:', error);
            }
        }
        await this.prisma.template.delete({
            where: { slug },
        });
    }
    async publishTemplate(slug) {
        const existing = await this.prisma.template.findUnique({
            where: { slug },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Template with slug '${slug}' not found`);
        }
        if (!existing.thumbnailUrl) {
            throw new common_1.UnprocessableEntityException('Cannot publish template without a thumbnail. Please upload a thumbnail first.');
        }
        const template = await this.prisma.template.update({
            where: { slug },
            data: {
                status: client_1.TemplateStatus.published,
                publishedAt: new Date(),
            },
        });
        return this.mapToAdminApi(template);
    }
    async unpublishTemplate(slug) {
        const existing = await this.prisma.template.findUnique({
            where: { slug },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Template with slug '${slug}' not found`);
        }
        const template = await this.prisma.template.update({
            where: { slug },
            data: {
                status: client_1.TemplateStatus.draft,
                publishedAt: null,
            },
        });
        return this.mapToAdminApi(template);
    }
    async uploadAsset(slug, kind, file) {
        const template = await this.prisma.template.findUnique({
            where: { slug },
        });
        if (!template) {
            throw new common_1.NotFoundException(`Template with slug '${slug}' not found`);
        }
        const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new common_1.BadRequestException(`Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`);
        }
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new common_1.BadRequestException('File size must be less than 5MB');
        }
        const ext = path.extname(file.originalname);
        const filename = `${slug}-${kind}-${Date.now()}${ext}`;
        const uploadDir = path.join(process.cwd(), 'public', 'thumbnails');
        const filePath = path.join(uploadDir, filename);
        await fs.mkdir(uploadDir, { recursive: true });
        if (kind === upload_asset_dto_1.AssetKind.THUMBNAIL && template.thumbnailUrl) {
            try {
                const oldUrl = new URL(template.thumbnailUrl);
                const oldFilename = path.basename(oldUrl.pathname);
                const oldFilePath = path.join(uploadDir, oldFilename);
                await fs.unlink(oldFilePath);
                console.log(`Deleted old thumbnail: ${oldFilename}`);
            }
            catch (error) {
                console.warn('Could not delete old thumbnail:', error);
            }
        }
        await fs.writeFile(filePath, file.buffer);
        const baseUrl = process.env.API_BASE_URL || 'http://localhost:8080';
        const fileUrl = `${baseUrl}/public/thumbnails/${filename}`;
        if (kind === upload_asset_dto_1.AssetKind.THUMBNAIL) {
            await this.prisma.template.update({
                where: { slug },
                data: { thumbnailUrl: fileUrl },
            });
        }
        const response = {
            id: (0, crypto_1.randomUUID)(),
            template_id: template.id,
            kind: kind,
            url: fileUrl,
            sort_order: 0,
            created_at: new Date().toISOString(),
        };
        return response;
    }
};
exports.TemplatesService = TemplatesService;
exports.TemplatesService = TemplatesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TemplatesService);
//# sourceMappingURL=templates.service.js.map