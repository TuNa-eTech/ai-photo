import { apiClient as client } from './client';

export interface User {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
    credits: number;
    is_anonymous: boolean;
    last_active_at: string;
    created_at: string;
    updated_at: string;
}

export interface UsersResponse {
    data: User[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface GetUsersParams {
    page?: number;
    limit?: number;
    search?: string;
    type?: 'all' | 'anonymous' | 'real';
}

export const getUsers = async (params: GetUsersParams): Promise<UsersResponse> => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.search) query.append('search', params.search);
    if (params.type) query.append('type', params.type);

    const response = await client.get<UsersResponse>(`v1/users?${query.toString()}`);
    return response;
};
