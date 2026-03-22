import { apiClient } from './client';
import type { ApiResponse, Vehicle } from '../../types';

export const vehicleApi = {
  async list() {
    const response = await apiClient.get<ApiResponse<Vehicle[]>>('/vehicles');
    return response.data.data;
  },
  async create(payload: Partial<Vehicle>) {
    const response = await apiClient.post<ApiResponse<Vehicle>>('/vehicles', payload);
    return response.data.data;
  }
};
