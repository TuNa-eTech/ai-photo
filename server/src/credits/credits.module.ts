import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CreditsController } from './credits.controller';
import { CreditsAdminController } from './credits-admin.controller';
import { CreditsService } from './credits.service';
import { IAPModule } from '../iap/iap.module';

@Module({
  imports: [PrismaModule, IAPModule],
  controllers: [CreditsController, CreditsAdminController],
  providers: [CreditsService],
  exports: [CreditsService],
})
export class CreditsModule {}
