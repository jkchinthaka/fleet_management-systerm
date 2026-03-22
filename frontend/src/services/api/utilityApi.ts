import { apiClient } from './client';
import type { ApiResponse, UtilityComparison, UtilityReading } from '../../types';

export const utilityApi = {
  async listWater() {
    const response = await apiClient.get<ApiResponse<UtilityReading[]>>('/utility/water');
    return response.data.data;
  },
  async createWater(payload: Omit<UtilityReading, 'id'>) {
    const response = await apiClient.post<ApiResponse<UtilityReading>>('/utility/water', payload);
    return response.data.data;
  },
  async updateWater(id: number, payload: Partial<Omit<UtilityReading, 'id'>>) {
    const response = await apiClient.put<ApiResponse<UtilityReading>>(`/utility/water/${id}`, payload);
    return response.data.data;
  },

  async listElectricity() {
    const response = await apiClient.get<ApiResponse<UtilityReading[]>>('/utility/electricity');
    return response.data.data;
  },
  async createElectricity(payload: Omit<UtilityReading, 'id'>) {
    const response = await apiClient.post<ApiResponse<UtilityReading>>('/utility/electricity', payload);
    return response.data.data;
  },
  async updateElectricity(id: number, payload: Partial<Omit<UtilityReading, 'id'>>) {
    const response = await apiClient.put<ApiResponse<UtilityReading>>(`/utility/electricity/${id}`, payload);
    return response.data.data;
  },

  async comparison() {
    const response = await apiClient.get<ApiResponse<UtilityComparison[]>>('/utility/comparison');
    return response.data.data;
  }
};
