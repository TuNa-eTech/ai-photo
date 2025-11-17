import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { UploadAssetDto, AssetKind } from './dto/upload-asset.dto';
import { BearerAuthGuard } from '../auth/bearer-auth.guard';

/**
 * Admin Templates Controller
 * All endpoints require authentication (Bearer token)
 */
@Controller('v1/admin/templates')
@UseGuards(BearerAuthGuard)
export class TemplatesAdminController {
  constructor(private readonly templatesService: TemplatesService) {}

  /**
   * List all templates (admin view with full details and filters)
   * GET /v1/admin/templates
   */
  @Get()
  async list(@Query() query: any) {
    return this.templatesService.listAdminTemplates(query);
  }

  /**
   * Create a new template
   * POST /v1/admin/templates
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateTemplateDto) {
    return this.templatesService.createTemplate(createDto);
  }

  /**
   * Get template by slug
   * GET /v1/admin/templates/{slug}
   */
  @Get(':slug')
  async getBySlug(@Param('slug') slug: string) {
    return this.templatesService.getTemplateBySlug(slug);
  }

  /**
   * Update template by slug
   * PUT /v1/admin/templates/{slug}
   */
  @Put(':slug')
  async update(
    @Param('slug') slug: string,
    @Body() updateDto: UpdateTemplateDto,
  ) {
    return this.templatesService.updateTemplate(slug, updateDto);
  }

  /**
   * Delete template by slug
   * DELETE /v1/admin/templates/{slug}
   */
  @Delete(':slug')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('slug') slug: string) {
    await this.templatesService.deleteTemplate(slug);
  }

  /**
   * Publish template
   * POST /v1/admin/templates/{slug}/publish
   *
   * Guard: Requires thumbnail_url to be present, otherwise returns 422
   */
  @Post(':slug/publish')
  async publish(@Param('slug') slug: string) {
    return this.templatesService.publishTemplate(slug);
  }

  /**
   * Unpublish template
   * POST /v1/admin/templates/{slug}/unpublish
   */
  @Post(':slug/unpublish')
  async unpublish(@Param('slug') slug: string) {
    return this.templatesService.unpublishTemplate(slug);
  }

  /**
   * Mark template as trending
   * POST /v1/admin/templates/{slug}/trending
   */
  @Post(':slug/trending')
  async setTrending(@Param('slug') slug: string) {
    return this.templatesService.setTrending(slug, true);
  }

  /**
   * Remove template from trending
   * DELETE /v1/admin/templates/{slug}/trending
   */
  @Delete(':slug/trending')
  async unsetTrending(@Param('slug') slug: string) {
    return this.templatesService.setTrending(slug, false);
  }

  /**
   * Upload template asset (thumbnail, preview, cover)
   * POST /v1/admin/templates/{slug}/assets
   * Content-Type: multipart/form-data
   *
   * Form fields:
   * - kind: 'thumbnail' | 'preview' | 'cover'
   * - file: image file (jpeg, png, webp, gif)
   */
  @Post(':slug/assets')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAsset(
    @Param('slug') slug: string,
    @Body('kind') kind: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    if (!kind) {
      throw new BadRequestException('kind field is required');
    }

    // Validate kind
    const validKinds = Object.values(AssetKind);
    if (!validKinds.includes(kind as AssetKind)) {
      throw new BadRequestException(
        `Invalid kind. Must be one of: ${validKinds.join(', ')}`,
      );
    }

    return this.templatesService.uploadAsset(slug, kind as AssetKind, file);
  }
}
