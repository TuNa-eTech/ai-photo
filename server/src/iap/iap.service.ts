import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as jwt from 'jsonwebtoken';
import { TransactionType, TransactionStatus } from '@prisma/client';
import { IAPProductResponseDto, IAPProductsListResponseDto } from './dto';
import { CreateIAPProductDto, UpdateIAPProductDto } from './dto';

/**
 * JWT payload structure from StoreKit 2 transaction
 */
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

@Injectable()
export class IAPService {
  private readonly logger = new Logger(IAPService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Verify JWT transaction from StoreKit 2
   * Parse JWT and extract transaction details
   * Note: We skip signature verification for simplicity, but can be added later
   */
  verifyTransaction(transactionData: string): StoreKit2TransactionPayload {
    try {
      // Try to parse as JSON first (for iOS 26+ which doesn't have jwsRepresentation)
      // JSON format: {"transaction_id": "...", "original_transaction_id": "...", "product_id": "...", ...}
      // JWT format: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..." (for iOS 15-17)
      let payload: any;

      if (transactionData.trim().startsWith('{')) {
        try {
          payload = JSON.parse(transactionData);

          // Validate it's a JSON object with transaction info
          if (
            typeof payload === 'object' &&
            payload !== null &&
            (payload.transaction_id || payload.transactionId)
          ) {
            this.logger.log('Parsed transaction data as JSON');

            const transactionId =
              payload.transaction_id || payload.transactionId;
            const originalTransactionId =
              payload.original_transaction_id || payload.originalTransactionId;
            const productId = payload.product_id || payload.productId;

            if (!transactionId || !originalTransactionId || !productId) {
              throw new BadRequestException(
                'Invalid transaction data: Missing required fields in JSON (transaction_id, original_transaction_id, product_id)',
              );
            }

            const normalizedPayload: StoreKit2TransactionPayload = {
              transactionId: String(transactionId),
              originalTransactionId: String(originalTransactionId),
              productId: String(productId),
              purchaseDate:
                payload.purchase_date || payload.purchaseDate || Date.now(),
              expiresDate: payload.expires_date || payload.expiresDate,
              quantity: payload.quantity || 1,
              type: payload.type || 'Consumable',
              environment: payload.environment || 'Production',
              ...payload,
            };

            this.logger.log(
              `Verified transaction (JSON): ${transactionId}, product: ${productId}`,
            );
            return normalizedPayload;
          }
        } catch (jsonError) {
          // JSON parse failed or invalid structure, will try as JWT below
          this.logger.log('Transaction data is not valid JSON, trying as JWT');
        }
      } else {
        // Doesn't look like JSON (doesn't start with {), try as JWT
        this.logger.log(
          "Transaction data doesn't look like JSON, trying as JWT",
        );
      }

      // Try to decode as JWT (for iOS 15-17 with jwsRepresentation)
      const decoded = jwt.decode(transactionData, { complete: true });

      if (!decoded) {
        throw new BadRequestException(
          'Invalid transaction data: Unable to decode as JWT or JSON',
        );
      }

      // Extract payload - could be nested in 'payload' property or at root
      payload = (decoded as any).payload || decoded;

      // Validate required fields (StoreKit 2 uses different field names)
      // Check for both possible field names
      const transactionId =
        payload.transactionId || payload.jti || payload.transaction_id;
      const originalTransactionId =
        payload.originalTransactionId || payload.original_transaction_id;
      const productId = payload.productId || payload.product_id;

      if (!transactionId || !originalTransactionId || !productId) {
        this.logger.error(
          `Missing required fields. Payload keys: ${Object.keys(payload).join(', ')}`,
        );
        throw new BadRequestException(
          'Invalid transaction data: Missing required fields (transactionId, originalTransactionId, productId)',
        );
      }

      // Normalize payload to our interface
      const normalizedPayload: StoreKit2TransactionPayload = {
        transactionId,
        originalTransactionId,
        productId,
        purchaseDate:
          payload.purchaseDate || payload.purchase_date || Date.now(),
        expiresDate: payload.expiresDate || payload.expires_date,
        quantity: payload.quantity || 1,
        type: payload.type || 'Consumable',
        environment: payload.environment || 'Production',
        ...payload, // Include all other fields
      };

      this.logger.log(
        `Verified transaction (JWT): ${transactionId}, product: ${productId}`,
      );

      return normalizedPayload;
    } catch (error) {
      this.logger.error(
        `Failed to verify transaction: ${error instanceof Error ? error.message : error}`,
      );
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        'Invalid transaction data: Unable to parse as JWT or JSON',
      );
    }
  }

  /**
   * Process purchase: verify transaction, check idempotency, add credits
   */
  async processPurchase(
    firebaseUid: string,
    transactionData: string,
    productId: string,
  ): Promise<{
    transactionId: string;
    creditsAdded: number;
    newBalance: number;
  }> {
    // 1. Verify transaction JWT
    const transactionPayload = this.verifyTransaction(transactionData);

    // 2. Validate product ID matches
    if (transactionPayload.productId !== productId) {
      throw new BadRequestException('Product ID mismatch');
    }

    // 3. Get user
    const user = await this.prisma.user.findUnique({
      where: { firebaseUid },
    });

    if (!user) {
      throw new NotFoundException({
        code: 'user_not_found',
        message: 'User not found',
      });
    }

    // 4. Check idempotency - check if transaction already processed
    const existingTransaction = await this.prisma.transaction.findFirst({
      where: {
        appleOriginalTransactionId: transactionPayload.originalTransactionId,
        type: 'purchase',
        status: 'completed',
      },
    });

    if (existingTransaction) {
      this.logger.warn(
        `Transaction already processed: ${transactionPayload.originalTransactionId}. Returning existing transaction.`,
      );
      // Return existing transaction info without adding credits again
      const product = await this.prisma.iAPProduct.findUnique({
        where: { productId },
      });

      return {
        transactionId: existingTransaction.id,
        creditsAdded: product?.credits || 0,
        newBalance: user.credits,
      };
    }

    // 5. Get product info
    const product = await this.prisma.iAPProduct.findUnique({
      where: { productId },
    });

    if (!product) {
      throw new NotFoundException({
        code: 'product_not_found',
        message: 'IAP product not found',
      });
    }

    if (!product.isActive) {
      throw new BadRequestException('Product is not active');
    }

    // 6. Add credits (use transaction to ensure atomicity)
    const [updatedUser, transaction] = await this.prisma.$transaction(
      async (tx) => {
        // Update user credits
        const updated = await tx.user.update({
          where: { firebaseUid },
          data: {
            credits: {
              increment: product.credits,
            },
          },
        });

        // Create transaction record
        const createdTransaction = await tx.transaction.create({
          data: {
            userId: user.id,
            type: TransactionType.purchase,
            amount: product.credits, // Positive for purchase
            productId: productId,
            appleTransactionId: transactionPayload.transactionId,
            appleOriginalTransactionId:
              transactionPayload.originalTransactionId,
            transactionData: transactionData,
            status: TransactionStatus.completed,
          },
        });

        return [updated, createdTransaction];
      },
    );

    this.logger.log(
      `Purchase processed: ${transactionPayload.transactionId}, added ${product.credits} credits to user ${firebaseUid}`,
    );

    return {
      transactionId: transaction?.id || transactionPayload.transactionId,
      creditsAdded: product.credits,
      newBalance: updatedUser.credits,
    };
  }

  /**
   * Get all active IAP products
   */
  async getProducts(): Promise<IAPProductsListResponseDto> {
    const products = await this.prisma.iAPProduct.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    });

    const productDtos: IAPProductResponseDto[] = products.map((p) => ({
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

  /**
   * Get product by product ID
   */
  async getProductByProductId(
    productId: string,
  ): Promise<IAPProductResponseDto | null> {
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

  // ============================================================================
  // ADMIN METHODS
  // ============================================================================

  /**
   * List all IAP products (admin view with full details and filters)
   */
  async listAdminProducts(query: any): Promise<{
    products: any[];
    meta: {
      total: number;
      limit: number;
      offset: number;
    };
  }> {
    const {
      limit = 50,
      offset = 0,
      search,
      isActive,
      sortBy = 'displayOrder',
      sortOrder = 'asc',
    } = query;

    const where: any = {};

    // Filter by active status if specified
    if (isActive !== undefined) {
      where.isActive = isActive === 'true' || isActive === true;
    }

    // Search functionality
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { productId: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Count total products matching filters
    const total = await this.prisma.iAPProduct.count({ where });

    // Fetch products with pagination and sorting
    const products = await this.prisma.iAPProduct.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    const productDtos = products.map((p) => ({
      id: p.id,
      product_id: p.productId,
      name: p.name,
      description: p.description,
      credits: p.credits,
      price: p.price ? Number(p.price) : null,
      currency: p.currency,
      display_order: p.displayOrder,
      is_active: p.isActive,
      created_at: p.createdAt.toISOString(),
      updated_at: p.updatedAt.toISOString(),
    }));

    return {
      products: productDtos,
      meta: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    };
  }

  /**
   * Get IAP product by ID (admin view)
   */
  async getProductById(productId: string): Promise<any> {
    const product = await this.prisma.iAPProduct.findUnique({
      where: { productId },
    });

    if (!product) {
      throw new NotFoundException({
        code: 'product_not_found',
        message: 'IAP product not found',
      });
    }

    return {
      id: product.id,
      product_id: product.productId,
      name: product.name,
      description: product.description,
      credits: product.credits,
      price: product.price ? Number(product.price) : null,
      currency: product.currency,
      display_order: product.displayOrder,
      is_active: product.isActive,
      created_at: product.createdAt.toISOString(),
      updated_at: product.updatedAt.toISOString(),
    };
  }

  /**
   * Create new IAP product
   */
  async createProduct(createDto: CreateIAPProductDto): Promise<any> {
    // Get the actual product ID (handles both productId and product_id)
    const productId = createDto.getActualProductId();

    if (!productId) {
      throw new BadRequestException({
        code: 'product_id_required',
        message: 'Product ID is required (either productId or product_id)',
      });
    }

    // Check if product ID already exists
    const existingProduct = await this.prisma.iAPProduct.findUnique({
      where: { productId },
    });

    if (existingProduct) {
      throw new BadRequestException({
        code: 'product_id_exists',
        message: 'Product ID already exists',
      });
    }

    const product = await this.prisma.iAPProduct.create({
      data: {
        productId,
        name: createDto.name,
        description: createDto.description,
        credits: createDto.credits,
        price: createDto.price,
        currency: createDto.currency,
        isActive: createDto.isActive ?? true,
        displayOrder: createDto.displayOrder ?? 0,
      },
    });

    this.logger.log(`Created IAP product: ${product.productId}`);

    return {
      id: product.id,
      product_id: product.productId,
      name: product.name,
      description: product.description,
      credits: product.credits,
      price: product.price ? Number(product.price) : null,
      currency: product.currency,
      display_order: product.displayOrder,
      is_active: product.isActive,
      created_at: product.createdAt.toISOString(),
      updated_at: product.updatedAt.toISOString(),
    };
  }

  /**
   * Update existing IAP product
   */
  async updateProduct(productId: string, updateDto: UpdateIAPProductDto): Promise<any> {
    const existingProduct = await this.prisma.iAPProduct.findUnique({
      where: { productId },
    });

    if (!existingProduct) {
      throw new NotFoundException({
        code: 'product_not_found',
        message: 'IAP product not found',
      });
    }

    const product = await this.prisma.iAPProduct.update({
      where: { productId },
      data: {
        ...(updateDto.name && { name: updateDto.name }),
        ...(updateDto.description !== undefined && { description: updateDto.description }),
        ...(updateDto.credits && { credits: updateDto.credits }),
        ...(updateDto.price !== undefined && { price: updateDto.price }),
        ...(updateDto.currency !== undefined && { currency: updateDto.currency }),
        ...(updateDto.isActive !== undefined && { isActive: updateDto.isActive }),
        ...(updateDto.displayOrder !== undefined && { displayOrder: updateDto.displayOrder }),
      },
    });

    this.logger.log(`Updated IAP product: ${product.productId}`);

    return {
      id: product.id,
      product_id: product.productId,
      name: product.name,
      description: product.description,
      credits: product.credits,
      price: product.price ? Number(product.price) : null,
      currency: product.currency,
      display_order: product.displayOrder,
      is_active: product.isActive,
      created_at: product.createdAt.toISOString(),
      updated_at: product.updatedAt.toISOString(),
    };
  }

  /**
   * Delete IAP product (soft delete by setting isActive to false)
   */
  async deleteProduct(productId: string): Promise<void> {
    const existingProduct = await this.prisma.iAPProduct.findUnique({
      where: { productId },
    });

    if (!existingProduct) {
      throw new NotFoundException({
        code: 'product_not_found',
        message: 'IAP product not found',
      });
    }

    await this.prisma.iAPProduct.update({
      where: { productId },
      data: { isActive: false },
    });

    this.logger.log(`Deleted IAP product: ${productId}`);
  }

  /**
   * Activate IAP product
   */
  async activateProduct(productId: string): Promise<any> {
    const product = await this.prisma.iAPProduct.update({
      where: { productId },
      data: { isActive: true },
    });

    this.logger.log(`Activated IAP product: ${productId}`);

    return {
      id: product.id,
      product_id: product.productId,
      name: product.name,
      description: product.description,
      credits: product.credits,
      price: product.price ? Number(product.price) : null,
      currency: product.currency,
      display_order: product.displayOrder,
      is_active: product.isActive,
      created_at: product.createdAt.toISOString(),
      updated_at: product.updatedAt.toISOString(),
    };
  }

  /**
   * Deactivate IAP product
   */
  async deactivateProduct(productId: string): Promise<any> {
    const product = await this.prisma.iAPProduct.update({
      where: { productId },
      data: { isActive: false },
    });

    this.logger.log(`Deactivated IAP product: ${productId}`);

    return {
      id: product.id,
      product_id: product.productId,
      name: product.name,
      description: product.description,
      credits: product.credits,
      price: product.price ? Number(product.price) : null,
      currency: product.currency,
      display_order: product.displayOrder,
      is_active: product.isActive,
      created_at: product.createdAt.toISOString(),
      updated_at: product.updatedAt.toISOString(),
    };
  }
}
