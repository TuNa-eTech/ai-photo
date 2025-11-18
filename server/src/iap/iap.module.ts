import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { IAPController } from './iap.controller';
import { IAPService } from './iap.service';
import { IAPProductsAdminController } from './iap-products-admin.controller';

@Module({
  imports: [PrismaModule],
  controllers: [IAPController, IAPProductsAdminController],
  providers: [IAPService],
  exports: [IAPService],
})
export class IAPModule {}
