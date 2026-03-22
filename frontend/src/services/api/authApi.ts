import { apiClient } from './client';
import type { ApiResponse } from '../../types';

type LoginResponse = {
  user: {
    id: number;
    full_name: string;
    email: string;
    role_id: number;
  };
  token: string;
};

export const authApi = {
  async login(payload: { email: string; password: string }) {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth-mongo/login', payload);
    return response.data.data;
  }
};
