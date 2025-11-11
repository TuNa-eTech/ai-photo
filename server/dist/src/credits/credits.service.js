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
var CreditsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreditsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let CreditsService = CreditsService_1 = class CreditsService {
    prisma;
    logger = new common_1.Logger(CreditsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getCreditsBalance(firebaseUid) {
        const user = await this.prisma.user.findUnique({
            where: { firebaseUid },
            select: { credits: true },
        });
        if (!user) {
            throw new common_1.NotFoundException({
                code: 'user_not_found',
                message: 'User not found',
            });
        }
        return {
            credits: user.credits,
        };
    }
    async checkCreditsAvailability(firebaseUid, amount) {
        const user = await this.prisma.user.findUnique({
            where: { firebaseUid },
            select: { credits: true },
        });
        if (!user) {
            throw new common_1.NotFoundException({
                code: 'user_not_found',
                message: 'User not found',
            });
        }
        return user.credits >= amount;
    }
    async deductCredits(firebaseUid, amount, productId) {
        const user = await this.prisma.user.findUnique({
            where: { firebaseUid },
        });
        if (!user) {
            throw new common_1.NotFoundException({
                code: 'user_not_found',
                message: 'User not found',
            });
        }
        if (user.credits < amount) {
            throw new common_1.ForbiddenException({
                code: 'insufficient_credits',
                message: 'Insufficient credits',
            });
        }
        await this.prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { firebaseUid },
                data: {
                    credits: {
                        decrement: amount,
                    },
                },
            });
            await tx.transaction.create({
                data: {
                    userId: user.id,
                    type: client_1.TransactionType.usage,
                    amount: -amount,
                    productId: productId || null,
                    status: client_1.TransactionStatus.completed,
                },
            });
        });
        this.logger.log(`Deducted ${amount} credits from user ${firebaseUid}. New balance: ${user.credits - amount}`);
    }
    async addCredits(firebaseUid, amount, productId, transactionId, appleTransactionId, appleOriginalTransactionId, transactionData) {
        const user = await this.prisma.user.findUnique({
            where: { firebaseUid },
        });
        if (!user) {
            throw new common_1.NotFoundException({
                code: 'user_not_found',
                message: 'User not found',
            });
        }
        await this.prisma.$transaction(async (tx) => {
            const updatedUser = await tx.user.update({
                where: { firebaseUid },
                data: {
                    credits: {
                        increment: amount,
                    },
                },
            });
            await tx.transaction.create({
                data: {
                    userId: user.id,
                    type: client_1.TransactionType.purchase,
                    amount: amount,
                    productId: productId || null,
                    appleTransactionId: appleTransactionId || null,
                    appleOriginalTransactionId: appleOriginalTransactionId || null,
                    transactionData: transactionData || null,
                    status: client_1.TransactionStatus.completed,
                },
            });
            this.logger.log(`Added ${amount} credits to user ${firebaseUid}. New balance: ${updatedUser.credits}`);
        });
    }
    async addRewardCredit(firebaseUid, source) {
        const user = await this.prisma.user.findUnique({
            where: { firebaseUid },
        });
        if (!user) {
            throw new common_1.NotFoundException({
                code: 'user_not_found',
                message: 'User not found',
            });
        }
        const amount = 1;
        const result = await this.prisma.$transaction(async (tx) => {
            const updatedUser = await tx.user.update({
                where: { firebaseUid },
                data: {
                    credits: {
                        increment: amount,
                    },
                },
            });
            await tx.transaction.create({
                data: {
                    userId: user.id,
                    type: client_1.TransactionType.bonus,
                    amount: amount,
                    productId: source || 'rewarded_ad',
                    status: client_1.TransactionStatus.completed,
                },
            });
            this.logger.log(`Added ${amount} reward credit to user ${firebaseUid}. New balance: ${updatedUser.credits}`);
            return {
                credits_added: amount,
                new_balance: updatedUser.credits,
            };
        });
        return result;
    }
    async getTransactionHistory(firebaseUid, limit = 20, offset = 0) {
        const user = await this.prisma.user.findUnique({
            where: { firebaseUid },
            select: { id: true },
        });
        if (!user) {
            throw new common_1.NotFoundException({
                code: 'user_not_found',
                message: 'User not found',
            });
        }
        const [transactions, total] = await Promise.all([
            this.prisma.transaction.findMany({
                where: { userId: user.id },
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset,
                select: {
                    id: true,
                    type: true,
                    amount: true,
                    productId: true,
                    status: true,
                    createdAt: true,
                },
            }),
            this.prisma.transaction.count({
                where: { userId: user.id },
            }),
        ]);
        const transactionDtos = transactions.map((t) => ({
            id: t.id,
            type: t.type,
            amount: t.amount,
            product_id: t.productId || undefined,
            status: t.status,
            created_at: t.createdAt,
        }));
        return {
            transactions: transactionDtos,
            meta: {
                total,
                limit,
                offset,
            },
        };
    }
};
exports.CreditsService = CreditsService;
exports.CreditsService = CreditsService = CreditsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CreditsService);
//# sourceMappingURL=credits.service.js.map