import { PrismaService } from '../prisma/prisma.service';
import { IAPProductResponseDto, IAPProductsListResponseDto } from './dto';
interface StoreKit2TransactionPayload {
    transactionId: string;
    originalTransactionId: string;
    productId: string;
    purchaseDate: number;
    expiresDate?: number;
    quantity: number;
    type: string;
    environment: string;
    [key: string]: any;
}
export declare class IAPService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    verifyTransaction(transactionData: string): StoreKit2TransactionPayload;
    processPurchase(firebaseUid: string, transactionData: string, productId: string): Promise<{
        transactionId: string;
        creditsAdded: number;
        newBalance: number;
    }>;
    getProducts(): Promise<IAPProductsListResponseDto>;
    getProductByProductId(productId: string): Promise<IAPProductResponseDto | null>;
}
export {};
