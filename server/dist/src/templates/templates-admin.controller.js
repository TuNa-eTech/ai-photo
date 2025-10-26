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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplatesAdminController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const templates_service_1 = require("./templates.service");
const create_template_dto_1 = require("./dto/create-template.dto");
const update_template_dto_1 = require("./dto/update-template.dto");
const upload_asset_dto_1 = require("./dto/upload-asset.dto");
const bearer_auth_guard_1 = require("../auth/bearer-auth.guard");
let TemplatesAdminController = class TemplatesAdminController {
    templatesService;
    constructor(templatesService) {
        this.templatesService = templatesService;
    }
    async list() {
        return this.templatesService.listAdminTemplates();
    }
    async create(createDto) {
        return this.templatesService.createTemplate(createDto);
    }
    async getBySlug(slug) {
        return this.templatesService.getTemplateBySlug(slug);
    }
    async update(slug, updateDto) {
        return this.templatesService.updateTemplate(slug, updateDto);
    }
    async delete(slug) {
        await this.templatesService.deleteTemplate(slug);
    }
    async publish(slug) {
        return this.templatesService.publishTemplate(slug);
    }
    async unpublish(slug) {
        return this.templatesService.unpublishTemplate(slug);
    }
    async uploadAsset(slug, kind, file) {
        if (!file) {
            throw new common_1.BadRequestException('File is required');
        }
        if (!kind) {
            throw new common_1.BadRequestException('kind field is required');
        }
        const validKinds = Object.values(upload_asset_dto_1.AssetKind);
        if (!validKinds.includes(kind)) {
            throw new common_1.BadRequestException(`Invalid kind. Must be one of: ${validKinds.join(', ')}`);
        }
        return this.templatesService.uploadAsset(slug, kind, file);
    }
};
exports.TemplatesAdminController = TemplatesAdminController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TemplatesAdminController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_template_dto_1.CreateTemplateDto]),
    __metadata("design:returntype", Promise)
], TemplatesAdminController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':slug'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TemplatesAdminController.prototype, "getBySlug", null);
__decorate([
    (0, common_1.Put)(':slug'),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_template_dto_1.UpdateTemplateDto]),
    __metadata("design:returntype", Promise)
], TemplatesAdminController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':slug'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TemplatesAdminController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)(':slug/publish'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TemplatesAdminController.prototype, "publish", null);
__decorate([
    (0, common_1.Post)(':slug/unpublish'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TemplatesAdminController.prototype, "unpublish", null);
__decorate([
    (0, common_1.Post)(':slug/assets'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, common_1.Body)('kind')),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], TemplatesAdminController.prototype, "uploadAsset", null);
exports.TemplatesAdminController = TemplatesAdminController = __decorate([
    (0, common_1.Controller)('v1/admin/templates'),
    (0, common_1.UseGuards)(bearer_auth_guard_1.BearerAuthGuard),
    __metadata("design:paramtypes", [templates_service_1.TemplatesService])
], TemplatesAdminController);
//# sourceMappingURL=templates-admin.controller.js.map