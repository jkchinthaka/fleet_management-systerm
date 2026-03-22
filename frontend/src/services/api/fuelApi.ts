import { apiClient } from './client';
import type { ApiResponse, FuelLog } from '../../types';

export const fuelApi = {
  async list(vehicleId?: string) {
    const response = await apiClient.get<ApiResponse<FuelLog[]>>('/fuel', {
      params: vehicleId ? { vehicleId } : undefined
    });
    return response.data.data;
  },
  async create(payload: {
    vehicle_id: number;
    log_date: string;
    fuel_quantity: number;
    cost: number;
    mileage: number;
  }) {
    const response = await apiClient.post<ApiResponse<FuelLog>>('/fuel', payload);
    return response.data.data;
  },
  async update(id: number, payload: Partial<Omit<FuelLog, 'id'>>) {
    const response = await apiClient.put<ApiResponse<FuelLog>>(`/fuel/${id}`, payload);
    return response.data.data;
  }
};
