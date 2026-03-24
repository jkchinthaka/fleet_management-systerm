import { apiClient } from './client';
import type { ApiResponse, CostLogEntry } from '../../types';

export const costLogApi = {
  async list(params?: { vehicleId?: string; costType?: string; from?: string; to?: string }) {
    const response = await apiClient.get<ApiResponse<CostLogEntry[]>>('/cost-logs', { params });
    return response.data.data;
  },

  async getById(id: number) {
    const response = await apiClient.get<ApiResponse<CostLogEntry>>(`/cost-logs/${id}`);
    return response.data.data;
  },

  async create(payload: {
    vehicle_id: number;
    cost_type: string;
    amount: number;
    log_date: string;
    notes?: string;
    attachment?: string;
  }) {
    const response = await apiClient.post<ApiResponse<CostLogEntry>>('/cost-logs', payload);
    return response.data.data;
  },

  async update(id: number, payload: Partial<Record<string, unknown>>) {
    const response = await apiClient.put<ApiResponse<CostLogEntry>>(`/cost-logs/${id}`, payload);
    return response.data.data;
  },

  async approve(id: number, approved: boolean) {
    const response = await apiClient.patch<ApiResponse<CostLogEntry>>(`/cost-logs/${id}/approve`, { approved });
    return response.data.data;
  },

  async remove(id: number) {
    const response = await apiClient.delete<ApiResponse<void>>(`/cost-logs/${id}`);
    return response.data;
  }
};
