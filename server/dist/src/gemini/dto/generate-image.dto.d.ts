export declare enum ImageQuality {
    STANDARD = "standard",
    HIGH = "high"
}
export declare class GenerateImageDto {
    prompt: string;
    negativePrompt?: string;
    imageBase64: string;
    width?: number;
    height?: number;
    quality?: ImageQuality;
}
