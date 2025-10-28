export declare enum ImageQuality {
    STANDARD = "standard",
    HIGH = "high"
}
declare class ProcessImageOptions {
    width?: number;
    height?: number;
    quality?: ImageQuality;
}
export declare class ProcessImageDto {
    template_id: string;
    image_base64: string;
    options?: ProcessImageOptions;
}
export {};
