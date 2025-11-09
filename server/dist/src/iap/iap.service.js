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
var IAPService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IAPService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const jwt = __importStar(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
let IAPService = IAPService_1 = class IAPService {
    prisma;
    logger = new common_1.Logger(IAPService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    verifyTransaction(transactionData) {
        try {
            let payload;
            if (transactionData.trim().startsWith('{')) {
                try {
                    payload = JSON.parse(transactionData);
                    if (typeof payload === 'object' && payload !== null && (payload.transaction_id || payload.transactionId)) {
                        this.logger.log('Parsed transaction data as JSON');
                        const transactionId = payload.transaction_id || payload.transactionId;
                        const originalTransactionId = payload.original_transaction_id || payload.originalTransactionId;
                        const productId = payload.product_id || payload.productId;
                        if (!transactionId || !originalTransactionId || !productId) {
                            throw new common_1.BadRequestException('Invalid transaction data: Missing required fields in JSON (transaction_id, original_transaction_id, product_id)');
                        }
                        const normalizedPayload = {
                            transactionId: String(transactionId),
                            originalTransactionId: String(originalTransactionId),
                            productId: String(productId),
                            purchaseDate: payload.purchase_date || payload.purchaseDate || Date.now(),
                            expiresDate: payload.expires_date || payload.expiresDate,
                            quantity: payload.quantity || 1,
                            type: payload.type || 'Consumable',
                            environment: payload.environment || 'Production',
                            ...payload,
                        };
                        this.logger.log(`Verified transaction (JSON): ${transactionId}, product: ${productId}`);
                        return normalizedPayload;
                    }
                }
                catch (jsonError) {
                    this.logger.log('Transaction data is not valid JSON, trying as JWT');
                }
            }
            else {
                this.logger.log('Transaction data doesn\'t look like JSON, trying as JWT');
            }
            const decoded = jwt.decode(transactionData, { complete: true });
            if (!decoded) {
                throw new common_1.BadRequestException('Invalid transaction data: Unable to decode as JWT or JSON');
            }
            payload = decoded.payload || decoded;
            const transactionId = payload.transactionId || payload.jti || payload.transaction_id;
            const originalTransactionId = payload.originalTransactionId || payload.original_transaction_id;
            const productId = payload.productId || payload.product_id;
            if (!transactionId || !originalTransactionId || !productId) {
                this.logger.error(`Missing required fields. Payload keys: ${Object.keys(payload).join(', ')}`);
                throw new common_1.BadRequestException('Invalid transaction data: Missing required fields (transactionId, originalTransactionId, productId)');
            }
            const normalizedPayload = {
                transactionId,
                originalTransactionId,
                productId,
                purchaseDate: payload.purchaseDate || payload.purchase_date || Date.now(),
                expiresDate: payload.expiresDate || payload.expires_date,
                quantity: payload.quantity || 1,
                type: payload.type || 'Consumable',
                environment: payload.environment || 'Production',
                ...payload,
            };
            this.logger.log(`Verified transaction (JWT): ${transactionId}, product: ${productId}`);
            return normalizedPayload;
        }
        catch (error) {
            this.logger.error(`Failed to verify transaction: ${error instanceof Error ? error.message : error}`);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Invalid transaction data: Unable to parse as JWT or JSON');
        }
    }
    async processPurchase(firebaseUid, transactionData, productId) {
        const transactionPayload = this.verifyTransaction(transactionData);
        if (transactionPayload.productId !== productId) {
            throw new common_1.BadRequestException('Product ID mismatch');
        }
        const user = await this.prisma.user.findUnique({
            where: { firebaseUid },
        });
        if (!user) {
            throw new common_1.NotFoundException({
                code: 'user_not_found',
                message: 'User not found',
            });
        }
        const existingTransaction = await this.prisma.transaction.findFirst({
            where: {
                appleOriginalTransactionId: transactionPayload.originalTransactionId,
                type: 'purchase',
                status: 'completed',
            },
        });
        if (existingTransaction) {
            this.logger.warn(`Transaction already processed: ${transactionPayload.originalTransactionId}. Returning existing transaction.`);
            const product = await this.prisma.iAPProduct.findUnique({
                where: { productId },
            });
            return {
                transactionId: existingTransaction.id,
                creditsAdded: product?.credits || 0,
                newBalance: user.credits,
            };
        }
        const product = await this.prisma.iAPProduct.findUnique({
            where: { productId },
        });
        if (!product) {
            throw new common_1.NotFoundException({
                code: 'product_not_found',
                message: 'IAP product not found',
            });
        }
        if (!product.isActive) {
            throw new common_1.BadRequestException('Product is not active');
        }
        const [updatedUser, transaction] = await this.prisma.$transaction(async (tx) => {
            const updated = await tx.user.update({
                where: { firebaseUid },
                data: {
                    credits: {
                        increment: product.credits,
                    },
                },
            });
            const createdTransaction = await tx.transaction.create({
                data: {
                    userId: user.id,
                    type: client_1.TransactionType.purchase,
                    amount: product.credits,
                    productId: productId,
                    appleTransactionId: transactionPayload.transactionId,
                    appleOriginalTransactionId: transactionPayload.originalTransactionId,
                    transactionData: transactionData,
                    status: client_1.TransactionStatus.completed,
                },
            });
            return [updated, createdTransaction];
        });
        this.logger.log(`Purchase processed: ${transactionPayload.transactionId}, added ${product.credits} credits to user ${firebaseUid}`);
        return {
            transactionId: transaction?.id || transactionPayload.transactionId,
            creditsAdded: product.credits,
            newBalance: updatedUser.credits,
        };
    }
    async getProducts() {
        const products = await this.prisma.iAPProduct.findMany({
            where: { isActive: true },
            orderBy: { displayOrder: 'asc' },
        });
        const productDtos = products.map((p) => ({
            id: p.id,
            product_id: p.productId,
            name: p.name,
            description: p.description || undefined,
            credits: p.credits,
            price: p.price ? Number(p.price) : undefined,
            currency: p.currency || undefined,
            display_order: p.displayOrder,
        }));
        return {
            products: productDtos,
        };
    }
    async getProductByProductId(productId) {
        const product = await this.prisma.iAPProduct.findUnique({
            where: { productId },
        });
        if (!product) {
            return null;
        }
        return {
            id: product.id,
            product_id: product.productId,
            name: product.name,
            description: product.description || undefined,
            credits: product.credits,
            price: product.price ? Number(product.price) : undefined,
            currency: product.currency || undefined,
            display_order: product.displayOrder,
        };
    }
};
exports.IAPService = IAPService;
exports.IAPService = IAPService = IAPService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], IAPService);
//# sourceMappingURL=iap.service.js.map