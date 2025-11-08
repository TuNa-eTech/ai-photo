export type SortKey = 'newest' | 'popular' | 'name';
export declare class QueryTemplatesDto {
    limit: number;
    offset: number;
    q?: string;
    tags?: string;
    category?: string;
    sort: SortKey;
}
