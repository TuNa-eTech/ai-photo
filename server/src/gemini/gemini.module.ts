import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GeminiService } from './gemini.service';
import geminiConfig from '../config/gemini.config';

@Module({
  imports: [
    ConfigModule.forFeature(geminiConfig),
  ],
  providers: [GeminiService],
  exports: [GeminiService],
})
export class GeminiModule {}

