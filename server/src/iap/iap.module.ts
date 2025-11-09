import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { IAPController } from './iap.controller';
import { IAPService } from './iap.service';

@Module({
  imports: [PrismaModule],
  controllers: [IAPController],
  providers: [IAPService],
  exports: [IAPService],
})
export class IAPModule {}

