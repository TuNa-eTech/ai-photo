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
exports.CreditsController = void 0;
const common_1 = require("@nestjs/common");
const bearer_auth_guard_1 = require("../auth/bearer-auth.guard");
const credits_service_1 = require("./credits.service");
const dto_1 = require("./dto");
const iap_service_1 = require("../iap/iap.service");
let CreditsController = class CreditsController {
    creditsService;
    iapService;
    constructor(creditsService, iapService) {
        this.creditsService = creditsService;
        this.iapService = iapService;
    }
    async getBalance(req) {
        const firebaseUid = req.firebaseUid;
        return this.creditsService.getCreditsBalance(firebaseUid);
    }
    async getTransactions(req, limit, offset) {
        const firebaseUid = req.firebaseUid;
        return this.creditsService.getTransactionHistory(firebaseUid, limit, offset);
    }
    async purchase(req, dto) {
        const firebaseUid = req.firebaseUid;
        const result = await this.iapService.processPurchase(firebaseUid, dto.transaction_data, dto.product_id);
        return {
            transaction_id: result.transactionId,
            credits_added: result.creditsAdded,
            new_balance: result.newBalance,
        };
    }
    async reward(req, dto) {
        const firebaseUid = req.firebaseUid;
        const result = await this.creditsService.addRewardCredit(firebaseUid, dto.source || 'rewarded_ad');
        return {
            credits_added: result.credits_added,
            new_balance: result.new_balance,
        };
    }
};
exports.CreditsController = CreditsController;
__decorate([
    (0, common_1.Get)('balance'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CreditsController.prototype, "getBalance", null);
__decorate([
    (0, common_1.Get)('transactions'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(20), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('offset', new common_1.DefaultValuePipe(0), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], CreditsController.prototype, "getTransactions", null);
__decorate([
    (0, common_1.Post)('purchase'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.PurchaseRequestDto]),
    __metadata("design:returntype", Promise)
], CreditsController.prototype, "purchase", null);
__decorate([
    (0, common_1.Post)('reward'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.RewardRequestDto]),
    __metadata("design:returntype", Promise)
], CreditsController.prototype, "reward", null);
exports.CreditsController = CreditsController = __decorate([
    (0, common_1.Controller)('v1/credits'),
    (0, common_1.UseGuards)(bearer_auth_guard_1.BearerAuthGuard),
    __metadata("design:paramtypes", [credits_service_1.CreditsService,
        iap_service_1.IAPService])
], CreditsController);
//# sourceMappingURL=credits.controller.js.map