export declare enum AssetKind {
    THUMBNAIL = "thumbnail",
    PREVIEW = "preview",
    COVER = "cover"
}
export declare class UploadAssetDto {
    kind: AssetKind;
}
export interface AssetUploadResponse {
    id: string;
    template_id: string;
    kind: string;
    url: string;
    sort_order: number;
    created_at: string;
}
