import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FileService } from '../files/file.service';
import { QueryTemplatesDto, SortKey } from './dto/query-templates.dto';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { AssetKind, AssetUploadResponse } from './dto/upload-asset.dto';
import { ApiCategory } from './dto/category.dto';
import {
  Template,
  TemplateStatus,
} from '@prisma/client';
import { generateSlug, generateUniqueSlug } from '../utils/slug';
import * as fs from 'fs/promises';
import * as path from 'path';

type DbTemplate = {
  id: string;
  name: string;
  thumbnailUrl: string | null;
  publishedAt: Date | null;
  usageCount: number;
};

export type ApiTemplate = {
  id: string;
  name: string;
  thumbnailUrl?: string;
  publishedAt?: string;
  usageCount?: number;
};

export type ApiTemplateAdmin = {
  id: string;
  slug: string;
  name: string;
  description?: string;
  prompt?: string;
  negativePrompt?: string;
  modelProvider?: string;
  modelName?: string;
  thumbnailUrl?: string;
  status: string;
  visibility: string;
  publishedAt?: string;
  usageCount?: number;
  isTrendingManual?: boolean;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
};

@Injectable()
export class TemplatesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileService: FileService,
  ) {}

  // Category definitions with metadata
  private readonly CATEGORIES: Array<{ id: string; name: string }> = [
    { id: 'portrait', name: 'Chân dung' },
    { id: 'landscape', name: 'Phong cảnh' },
    { id: 'artistic', name: 'Nghệ thuật' },
    { id: 'vintage', name: 'Cổ điển' },
    { id: 'abstract', name: 'Trừu tượng' },
  ];

  // Category-to-tags mapping for filtering
  private readonly CATEGORY_TO_TAGS: Record<string, string[]> = {
    portrait: ['portrait', 'chân dung', 'person', 'people'],
    landscape: ['landscape', 'phong cảnh', 'scenery', 'nature'],
    artistic: ['artistic', 'nghệ thuật', 'art', 'creative'],
    vintage: ['vintage', 'cổ điển', 'classic', 'retro'],
    abstract: ['abstract', 'trừu tượng', 'geometric', 'pattern'],
  };

  private mapToApi(t: DbTemplate): ApiTemplate {
    return {
      id: t.id,
      name: t.name,
      thumbnailUrl: t.thumbnailUrl ?? undefined,
      publishedAt: t.publishedAt ? t.publishedAt.toISOString() : undefined,
      usageCount: t.usageCount,
    };
  }

  private resolveOrder(sort: SortKey) {
    switch (sort) {
      case 'popular':
        return { usageCount: 'desc' as const };
      case 'name':
        return { name: 'asc' as const };
      case 'newest':
      default:
        return { publishedAt: 'desc' as const };
    }
  }

  async listTemplates(
    query: QueryTemplatesDto,
  ): Promise<{ templates: ApiTemplate[] }> {
    const { limit, offset, q, tags, category, sort } = query;

    // Security: Only return published + public templates to end users
    const where: any = {
      status: TemplateStatus.published,
      visibility: 'public',
    };

    // Search filter (if provided)
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

    // Build tags list from category and/or tags parameter
    let tagList: string[] = [];

    // If category is provided, map it to tags
    if (category && category.trim()) {
      const categoryTags = this.CATEGORY_TO_TAGS[category.toLowerCase()];
      if (categoryTags) {
        tagList.push(...categoryTags);
      }
    }

    // If tags parameter is also provided, combine with category tags
    if (tags && tags.trim()) {
      const tagsFromParam = tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
      tagList.push(...tagsFromParam);
    }

    // Remove duplicates from tagList
    tagList = [...new Set(tagList)];

    // Apply tags filter if we have any tags
    if (tagList.length > 0) {
      if (where.AND) {
        where.AND.push({ tags: { hasSome: tagList } });
      } else {
        where.AND = [{ tags: { hasSome: tagList } }];
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

    return { templates: rows.map((r) => this.mapToApi(r as DbTemplate)) };
  }

  async listCategories(): Promise<{ categories: ApiCategory[] }> {
    return {
      categories: this.CATEGORIES.map((cat) => ({
        id: cat.id,
        name: cat.name,
      })),
    };
  }

  async listTrendingTemplates(
    query: QueryTemplatesDto,
  ): Promise<{ templates: ApiTemplate[] }> {
    const { limit = 20 } = query;

    // 1. Lấy các template trending thủ công
    const manualTrending = await this.prisma.template.findMany({
      where: {
        isTrendingManual: true,
        status: TemplateStatus.published,
        visibility: 'public',
      },
      orderBy: { usageCount: 'desc' },
      take: limit,
      select: {
        id: true,
        name: true,
        thumbnailUrl: true,
        publishedAt: true,
        usageCount: true,
      },
    });

    const manualIds = manualTrending.map((t) => t.id);

    // 2. Lấy các template usageCount lớn nhất, loại trừ các template đã lấy ở trên
    const autoTrending = await this.prisma.template.findMany({
      where: {
        id: { notIn: manualIds },
        status: TemplateStatus.published,
        visibility: 'public',
      },
      orderBy: { usageCount: 'desc' },
      take: limit - manualTrending.length,
      select: {
        id: true,
        name: true,
        thumbnailUrl: true,
        publishedAt: true,
        usageCount: true,
      },
    });

    // 3. Gộp hai danh sách
    const trendingTemplates = [...manualTrending, ...autoTrending];

    return {
      templates: trendingTemplates.map((r) => this.mapToApi(r as DbTemplate)),
    };
  }

  // ========== ADMIN METHODS ==========

  private mapToAdminApi(t: Template): ApiTemplateAdmin {
    return {
      id: t.id,
      slug: t.slug,
      name: t.name,
      description: t.description ?? undefined,
      prompt: t.prompt ?? undefined,
      negativePrompt: t.negativePrompt ?? undefined,
      modelProvider: t.modelProvider,
      modelName: t.modelName,
      thumbnailUrl: t.thumbnailUrl ?? undefined,
      status: t.status,
      visibility: t.visibility,
      publishedAt: t.publishedAt ? t.publishedAt.toISOString() : undefined,
      usageCount: t.usageCount,
      isTrendingManual: t.isTrendingManual,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
      tags: t.tags,
    };
  }

  async listAdminTemplates(params?: {
    q?: string;
    status?: string;
    visibility?: string;
    tags?: string;
    sort?: string;
    trending?: 'all' | 'manual' | 'none';
  }): Promise<{ templates: ApiTemplateAdmin[] }> {
    const { q, status, visibility, tags, sort, trending } = params || {};

    // Build where clause
    const where: any = {};

    // Search filter
    if (q && q.trim()) {
      where.OR = [
        { name: { contains: q.trim(), mode: 'insensitive' } },
        { slug: { contains: q.trim(), mode: 'insensitive' } },
        { description: { contains: q.trim(), mode: 'insensitive' } },
      ];
    }

    // Status filter
    if (status) {
      where.status = status;
    }

    // Visibility filter
    if (visibility) {
      where.visibility = visibility;
    }

    // Tags filter
    if (tags && tags.trim()) {
      const tagList = tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
      if (tagList.length > 0) {
        where.tags = { hasSome: tagList };
      }
    }

    // Trending filter
    if (trending) {
      if (trending === 'manual') {
        where.isTrendingManual = true;
      } else if (trending === 'none') {
        where.isTrendingManual = false;
      }
      // 'all' means no filter on trending
    }

    // Order by
    let orderBy: any = { updatedAt: 'desc' };
    switch (sort) {
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'popular':
        orderBy = { usageCount: 'desc' };
        break;
      case 'name':
        orderBy = { name: 'asc' };
        break;
      case 'updated':
      default:
        orderBy = { updatedAt: 'desc' };
        break;
    }

    const templates = await this.prisma.template.findMany({
      where,
      orderBy,
    });

    return { templates: templates.map((t) => this.mapToAdminApi(t)) };
  }

  async createTemplate(dto: CreateTemplateDto): Promise<ApiTemplateAdmin> {
    // Auto-generate slug if not provided
    let slug = dto.slug;
    if (!slug) {
      slug = generateSlug(dto.name);

      // Get all existing slugs to ensure uniqueness
      const existingTemplates = await this.prisma.template.findMany({
        select: { slug: true },
      });
      const existingSlugs = existingTemplates.map((t) => t.slug);

      slug = generateUniqueSlug(slug, existingSlugs);
    } else {
      // If slug is provided, check if it already exists
      const existing = await this.prisma.template.findUnique({
        where: { slug },
      });

      if (existing) {
        throw new ConflictException(
          `Template with slug '${slug}' already exists`,
        );
      }
    }

    const template = await this.prisma.template.create({
      data: {
        slug,
        name: dto.name,
        description: dto.description,
        prompt: dto.prompt,
        negativePrompt: dto.negativePrompt,
        modelProvider: dto.modelProvider,
        modelName: dto.modelName,
        status: dto.status ?? TemplateStatus.draft,
        visibility: dto.visibility ?? 'public',
        tags: dto.tags ?? [],
        isTrendingManual: dto.isTrendingManual ?? false,
      },
    });

    return this.mapToAdminApi(template);
  }

  async getTemplateBySlug(slug: string): Promise<ApiTemplateAdmin> {
    const template = await this.prisma.template.findUnique({
      where: { slug },
    });

    if (!template) {
      throw new NotFoundException(`Template with slug '${slug}' not found`);
    }

    return this.mapToAdminApi(template);
  }

  async updateTemplate(
    slug: string,
    dto: UpdateTemplateDto,
  ): Promise<ApiTemplateAdmin> {
    const existing = await this.prisma.template.findUnique({
      where: { slug },
    });

    if (!existing) {
      throw new NotFoundException(`Template with slug '${slug}' not found`);
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
        isTrendingManual: dto.isTrendingManual,
      },
    });

    return this.mapToAdminApi(template);
  }

  async deleteTemplate(slug: string): Promise<void> {
    const existing = await this.prisma.template.findUnique({
      where: { slug },
    });

    if (!existing) {
      throw new NotFoundException(`Template with slug '${slug}' not found`);
    }

    // Delete thumbnail file if exists
    if (existing.thumbnailUrl) {
      try {
        const oldUrl = new URL(existing.thumbnailUrl);
        const oldFilename = path.basename(oldUrl.pathname);
        const uploadDir = path.join(process.cwd(), 'public', 'thumbnails');
        const oldFilePath = path.join(uploadDir, oldFilename);

        await fs.unlink(oldFilePath);
        console.log(`Deleted thumbnail file: ${oldFilename}`);
      } catch (error) {
        console.warn('Could not delete thumbnail file:', error);
      }
    }

    await this.prisma.template.delete({
      where: { slug },
    });
  }

  async publishTemplate(slug: string): Promise<ApiTemplateAdmin> {
    const existing = await this.prisma.template.findUnique({
      where: { slug },
    });

    if (!existing) {
      throw new NotFoundException(`Template with slug '${slug}' not found`);
    }

    // Guard: require thumbnail_url before publishing
    if (!existing.thumbnailUrl) {
      throw new UnprocessableEntityException(
        'Cannot publish template without a thumbnail. Please upload a thumbnail first.',
      );
    }

    const template = await this.prisma.template.update({
      where: { slug },
      data: {
        status: TemplateStatus.published,
        publishedAt: new Date(),
      },
    });

    return this.mapToAdminApi(template);
  }

  async unpublishTemplate(slug: string): Promise<ApiTemplateAdmin> {
    const existing = await this.prisma.template.findUnique({
      where: { slug },
    });

    if (!existing) {
      throw new NotFoundException(`Template with slug '${slug}' not found`);
    }

    const template = await this.prisma.template.update({
      where: { slug },
      data: {
        status: TemplateStatus.draft,
        publishedAt: null,
      },
    });

    return this.mapToAdminApi(template);
  }

  async setTrending(
    slug: string,
    isTrending: boolean,
  ): Promise<ApiTemplateAdmin> {
    const existing = await this.prisma.template.findUnique({
      where: { slug },
    });

    if (!existing) {
      throw new NotFoundException(`Template with slug '${slug}' not found`);
    }

    const template = await this.prisma.template.update({
      where: { slug },
      data: {
        isTrendingManual: isTrending,
      },
    });

    return this.mapToAdminApi(template);
  }

  // ========== ASSET UPLOAD ==========

  async uploadAsset(
    slug: string,
    kind: AssetKind,
    file: Express.Multer.File,
  ): Promise<AssetUploadResponse> {
    // Check if template exists
    const template = await this.prisma.template.findUnique({
      where: { slug },
      include: { templateAssets: true },
    });

    if (!template) {
      throw new NotFoundException(`Template with slug '${slug}' not found`);
    }

    // Save file using FileService
    const savedFile = await this.fileService.saveFile({
      originalName: file.originalname,
      buffer: file.buffer,
      mimeType: file.mimetype,
    });

    // Convert AssetKind to database enum
    const assetKind = this.mapToPrismaAssetKind(kind);

    // Check if asset of this kind already exists for this template
    const existingAsset = template.templateAssets.find(
      (asset) => asset.kind === kind,
    );

    if (existingAsset) {
      // Update existing asset
      await this.prisma.templateAsset.update({
        where: { id: existingAsset.id },
        data: { fileId: savedFile.id },
      });

      // Delete old file
      await this.fileService.deleteFile(existingAsset.fileId);
    } else {
      // Create new asset
      await this.prisma.templateAsset.create({
        data: {
          templateId: template.id,
          fileId: savedFile.id,
          kind: assetKind,
        },
      });
    }

    // Update template thumbnailUrl if kind is thumbnail (for backward compatibility)
    if (kind === AssetKind.THUMBNAIL) {
      await this.prisma.template.update({
        where: { slug },
        data: { thumbnailUrl: savedFile.fileUrl },
      });
    }

    // Return asset response
    const response: AssetUploadResponse = {
      id: savedFile.id,
      template_id: template.id,
      kind: kind,
      url: savedFile.fileUrl,
      sort_order: 0,
      created_at: savedFile.createdAt.toISOString(),
    };

    return response;
  }

  /**
   * Convert DTO AssetKind to Prisma AssetKind enum
   */
  private mapToPrismaAssetKind(kind: AssetKind): AssetKind {
    return kind;
  }
}
