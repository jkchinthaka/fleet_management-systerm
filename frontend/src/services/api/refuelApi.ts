import { apiClient } from './client';
import type { ApiResponse, RefuelLog } from '../../types';

export const refuelApi = {
  async list(params?: { vehicleId?: string; status?: string; from?: string; to?: string }) {
    const response = await apiClient.get<ApiResponse<RefuelLog[]>>('/refuel', { params });
    return response.data.data;
  },

  async getById(id: number) {
    const response = await apiClient.get<ApiResponse<RefuelLog>>(`/refuel/${id}`);
    return response.data.data;
  },

  async create(payload: {
    vehicle_id: number;
    log_date: string;
    odometer: number;
    fuel_volume: number;
    price_per_litre?: number;
    total_cost?: number;
    full_tank?: boolean;
    fuel_type?: string;
    notes?: string;
    photo?: string;
  }) {
    const response = await apiClient.post<ApiResponse<RefuelLog>>('/refuel', payload);
    return response.data.data;
  },

  async update(id: number, payload: Partial<Record<string, unknown>>) {
    const response = await apiClient.put<ApiResponse<RefuelLog>>(`/refuel/${id}`, payload);
    return response.data.data;
  },

  async approve(id: number, approved: boolean) {
    const response = await apiClient.patch<ApiResponse<RefuelLog>>(`/refuel/${id}/approve`, { approved });
    return response.data.data;
  },

  async remove(id: number) {
    const response = await apiClient.delete<ApiResponse<void>>(`/refuel/${id}`);
    return response.data;
  }
};
