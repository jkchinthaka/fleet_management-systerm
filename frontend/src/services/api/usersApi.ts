import { apiClient } from './client';
import type { ApiResponse, AppUser } from '../../types';

export type CreateUserPayload = {
  name: string;
  email: string;
  password: string;
  roleId: number;
};

export const usersApi = {
  async list() {
    const response = await apiClient.get<ApiResponse<AppUser[]>>('/users');
    return response.data.data;
  },

  async create(payload: CreateUserPayload) {
    const response = await apiClient.post<ApiResponse<AppUser>>('/users', payload);
    return response.data.data;
  }
};
