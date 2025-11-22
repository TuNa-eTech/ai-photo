import { apiClient } from './client';
import type { Category, CreateCategoryDto, UpdateCategoryDto } from '../types/category';

export const categoriesApi = {
    getAll: async (): Promise<Category[]> => {
        return apiClient.get<Category[]>('/categories');
    },

    getOne: async (id: string): Promise<Category> => {
        return apiClient.get<Category>(`/categories/${id}`);
    },

    create: async (data: CreateCategoryDto): Promise<Category> => {
        return apiClient.post<Category>('/categories', data);
    },

    update: async (id: string, data: UpdateCategoryDto): Promise<Category> => {
        return apiClient.patch<Category>(`/categories/${id}`, data);
    },

    delete: async (id: string): Promise<void> => {
        return apiClient.delete<void>(`/categories/${id}`);
    },
};
