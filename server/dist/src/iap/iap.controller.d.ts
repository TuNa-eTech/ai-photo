import { IAPService } from './iap.service';
import { IAPProductsListResponseDto } from './dto';
export declare class IAPController {
    private readonly iapService;
    constructor(iapService: IAPService);
    getProducts(): Promise<IAPProductsListResponseDto>;
}
