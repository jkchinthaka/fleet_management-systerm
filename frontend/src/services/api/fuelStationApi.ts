import { apiClient } from './client';
import type { ApiResponse, FuelStationEntry } from '../../types';

export const fuelStationApi = {
  async list(params?: { isFavorite?: string }) {
    const response = await apiClient.get<ApiResponse<FuelStationEntry[]>>('/fuel-stations', { params });
    return response.data.data;
  },

  async create(payload: {
    name: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    is_favorite?: boolean;
  }) {
    const response = await apiClient.post<ApiResponse<FuelStationEntry>>('/fuel-stations', payload);
    return response.data.data;
  },

  async update(id: number, payload: Partial<Record<string, unknown>>) {
    const response = await apiClient.put<ApiResponse<FuelStationEntry>>(`/fuel-stations/${id}`, payload);
    return response.data.data;
  },

  async remove(id: number) {
    const response = await apiClient.delete<ApiResponse<void>>(`/fuel-stations/${id}`);
    return response.data;
  }
};
