import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { BearerAuthGuard } from '../auth/bearer-auth.guard';
import { ImagesService } from './images.service';
import { ProcessImageDto } from './dto/process-image.dto';

@Controller('v1/images')
@UseGuards(BearerAuthGuard)
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post('process')
  async processImage(@Body() dto: ProcessImageDto) {
    return await this.imagesService.processImage(dto);
  }
}

