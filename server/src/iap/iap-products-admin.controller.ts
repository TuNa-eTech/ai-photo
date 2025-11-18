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
} from '@nestjs/common';
import { IAPService } from './iap.service';
import { CreateIAPProductDto } from './dto/create-iap-product.dto';
import { UpdateIAPProductDto } from './dto/update-iap-product.dto';
import { BearerAuthGuard } from '../auth/bearer-auth.guard';

/**
 * Admin IAP Products Controller
 * All endpoints require authentication (Bearer token)
 */
@Controller('v1/admin/iap-products')
@UseGuards(BearerAuthGuard)
export class IAPProductsAdminController {
  constructor(private readonly iapService: IAPService) {}

  /**
   * List all IAP products (admin view with full details and filters)
   * GET /v1/admin/iap-products
   */
  @Get()
  async list(@Query() query: any) {
    return this.iapService.listAdminProducts(query);
  }

  /**
   * Create a new IAP product
   * POST /v1/admin/iap-products
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateIAPProductDto) {
    return this.iapService.createProduct(createDto);
  }

  /**
   * Get IAP product by ID
   * GET /v1/admin/iap-products/:productId
   */
  @Get(':productId')
  async getById(@Param('productId') productId: string) {
    return this.iapService.getProductById(productId);
  }

  /**
   * Update IAP product by ID
   * PUT /v1/admin/iap-products/:productId
   */
  @Put(':productId')
  async update(
    @Param('productId') productId: string,
    @Body() updateDto: UpdateIAPProductDto,
  ) {
    return this.iapService.updateProduct(productId, updateDto);
  }

  /**
   * Delete IAP product by ID
   * DELETE /v1/admin/iap-products/:productId
   */
  @Delete(':productId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('productId') productId: string) {
    await this.iapService.deleteProduct(productId);
  }

  /**
   * Activate IAP product
   * POST /v1/admin/iap-products/:productId/activate
   */
  @Post(':productId/activate')
  @HttpCode(HttpStatus.OK)
  async activate(@Param('productId') productId: string) {
    return this.iapService.activateProduct(productId);
  }

  /**
   * Deactivate IAP product
   * DELETE /v1/admin/iap-products/:productId/activate
   */
  @Delete(':productId/activate')
  @HttpCode(HttpStatus.OK)
  async deactivate(@Param('productId') productId: string) {
    return this.iapService.deactivateProduct(productId);
  }
}