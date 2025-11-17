import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { BearerAuthGuard } from '../auth/bearer-auth.guard';
import { ImagesService } from './images.service';
import { ProcessImageDto } from './dto/process-image.dto';

@Controller('v1/images')
@UseGuards(BearerAuthGuard)
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post('process')
  async processImage(
    @Req() req: Request & { firebaseUid?: string },
    @Body() dto: ProcessImageDto,
  ) {
    const firebaseUid = req.firebaseUid!;
    return await this.imagesService.processImage(dto, firebaseUid);
  }
}
