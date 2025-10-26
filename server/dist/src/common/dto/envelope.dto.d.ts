export interface Meta {
    requestId?: string;
    timestamp?: string;
}
export interface APIError {
    code: string;
    message: string;
    details?: Record<string, any>;
}
export interface EnvelopeSuccess<T> {
    success: true;
    data: T;
    meta?: Meta;
}
export interface EnvelopeError {
    success: false;
    error: APIError;
    meta?: Meta;
}
export type Envelope<T> = EnvelopeSuccess<T> | EnvelopeError;
export declare function makeMeta(): Meta;
export declare function ok<T>(data: T): EnvelopeSuccess<T>;
export declare function err(code: string, message: string, details?: Record<string, any>): EnvelopeError;
