import { Module } from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { TemplatesController } from './templates.controller';
import { TemplatesAdminController } from './templates-admin.controller';
import { BearerAuthGuard } from '../auth/bearer-auth.guard';

@Module({
  imports: [],
  providers: [TemplatesService, BearerAuthGuard],
  controllers: [TemplatesController, TemplatesAdminController],
  exports: [TemplatesService],
})
export class TemplatesModule {}
