import { Controller, Post, Body, UseGuards, Req, Headers } from '@nestjs/common';
import { BearerAuthGuard } from '../auth/bearer-auth.guard';
import { ImagesService } from './images.service';
import { ProcessImageDto } from './dto/process-image.dto';

@Controller('v1/images')
@UseGuards(BearerAuthGuard)
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) { }

  @Post('process')
  async processImage(
    @Req() req: Request & { firebaseUid?: string; isAnonymous?: boolean },
    @Body() dto: ProcessImageDto,
    @Headers('x-device-id') deviceId?: string,
  ) {
    const firebaseUid = req.firebaseUid!;
    const isAnonymous = req.isAnonymous || false;

    return await this.imagesService.processImage(
      dto,
      firebaseUid,
      isAnonymous,
      deviceId,
    );
  }
}
