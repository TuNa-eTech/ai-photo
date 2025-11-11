import { CreditsService } from './credits.service';
import { CreditsBalanceResponseDto, TransactionHistoryResponseDto, PurchaseRequestDto, PurchaseResponseDto, RewardRequestDto, RewardResponseDto } from './dto';
import { IAPService } from '../iap/iap.service';
export declare class CreditsController {
    private readonly creditsService;
    private readonly iapService;
    constructor(creditsService: CreditsService, iapService: IAPService);
    getBalance(req: Request & {
        firebaseUid?: string;
    }): Promise<CreditsBalanceResponseDto>;
    getTransactions(req: Request & {
        firebaseUid?: string;
    }, limit: number, offset: number): Promise<TransactionHistoryResponseDto>;
    purchase(req: Request & {
        firebaseUid?: string;
    }, dto: PurchaseRequestDto): Promise<PurchaseResponseDto>;
    reward(req: Request & {
        firebaseUid?: string;
    }, dto: RewardRequestDto): Promise<RewardResponseDto>;
}
