import { ImagesService } from './images.service';
import { ProcessImageDto } from './dto/process-image.dto';
export declare class ImagesController {
    private readonly imagesService;
    constructor(imagesService: ImagesService);
    processImage(dto: ProcessImageDto): Promise<import("./dto").ProcessImageResponse>;
}
