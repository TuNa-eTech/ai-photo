import { Module } from '@nestjs/common';
import { ImagesController } from './images.controller';
import { ImagesService } from './images.service';
import { GeminiModule } from '../gemini/gemini.module';
import { TemplatesModule } from '../templates/templates.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [GeminiModule, TemplatesModule, PrismaModule],
  controllers: [ImagesController],
  providers: [ImagesService],
})
export class ImagesModule {}

