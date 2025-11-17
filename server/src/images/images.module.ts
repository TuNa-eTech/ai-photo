import { Module, forwardRef } from '@nestjs/common';
import { ImagesController } from './images.controller';
import { ImagesService } from './images.service';
import { GeminiModule } from '../gemini/gemini.module';
import { TemplatesModule } from '../templates/templates.module';
import { PrismaModule } from '../prisma/prisma.module';
import { CreditsModule } from '../credits/credits.module';

@Module({
  imports: [
    GeminiModule,
    TemplatesModule,
    PrismaModule,
    forwardRef(() => CreditsModule),
  ],
  controllers: [ImagesController],
  providers: [ImagesService],
})
export class ImagesModule {}
