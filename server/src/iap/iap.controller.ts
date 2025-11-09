import { Controller, Get } from '@nestjs/common';
import { IAPService } from './iap.service';
import { IAPProductsListResponseDto } from './dto';

@Controller('v1/iap')
export class IAPController {
  constructor(private readonly iapService: IAPService) {}

  /**
   * GET /v1/iap/products
   * Get list of active IAP products (public endpoint)
   */
  @Get('products')
  async getProducts(): Promise<IAPProductsListResponseDto> {
    return this.iapService.getProducts();
  }
}

