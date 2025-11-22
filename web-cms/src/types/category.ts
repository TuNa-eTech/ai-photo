export interface Category {
    id: string;
    slug: string;
    name: string;
    description?: string;
    imageUrl?: string;
    displayOrder: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCategoryDto {
    name: string;
    slug: string;
    description?: string;
    imageUrl?: string;
    displayOrder?: number;
}

export interface UpdateCategoryDto {
    name?: string;
    slug?: string;
    description?: string;
    imageUrl?: string;
    displayOrder?: number;
}
