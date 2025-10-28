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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessImageDto = exports.ImageQuality = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var ImageQuality;
(function (ImageQuality) {
    ImageQuality["STANDARD"] = "standard";
    ImageQuality["HIGH"] = "high";
})(ImageQuality || (exports.ImageQuality = ImageQuality = {}));
class ProcessImageOptions {
    width = 1024;
    height = 1024;
    quality = ImageQuality.STANDARD;
}
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(512),
    (0, class_validator_1.Max)(2048),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], ProcessImageOptions.prototype, "width", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(512),
    (0, class_validator_1.Max)(2048),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], ProcessImageOptions.prototype, "height", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(ImageQuality),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ProcessImageOptions.prototype, "quality", void 0);
class ProcessImageDto {
    template_id;
    image_base64;
    options;
}
exports.ProcessImageDto = ProcessImageDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProcessImageDto.prototype, "template_id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProcessImageDto.prototype, "image_base64", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ProcessImageOptions),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", ProcessImageOptions)
], ProcessImageDto.prototype, "options", void 0);
//# sourceMappingURL=process-image.dto.js.map