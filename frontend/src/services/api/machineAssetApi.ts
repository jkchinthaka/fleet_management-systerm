import { apiClient } from './client';
import type { ApiResponse, Asset, Machine, MachineMaintenanceSchedule, MachineServiceHistory } from '../../types';

export const machineAssetApi = {
  async listMachines() {
    const response = await apiClient.get<ApiResponse<Machine[]>>('/machine-asset/machines');
    return response.data.data;
  },
  async createMachine(payload: Omit<Machine, 'id'>) {
    const response = await apiClient.post<ApiResponse<Machine>>('/machine-asset/machines', payload);
    return response.data.data;
  },
  async updateMachine(id: number, payload: Partial<Omit<Machine, 'id'>>) {
    const response = await apiClient.put<ApiResponse<Machine>>(`/machine-asset/machines/${id}`, payload);
    return response.data.data;
  },

  async listServiceHistory() {
    const response = await apiClient.get<ApiResponse<MachineServiceHistory[]>>('/machine-asset/machine-service-history');
    return response.data.data;
  },
  async createServiceHistory(payload: Omit<MachineServiceHistory, 'id'>) {
    const response = await apiClient.post<ApiResponse<MachineServiceHistory>>('/machine-asset/machine-service-history', payload);
    return response.data.data;
  },
  async updateServiceHistory(id: number, payload: Partial<Omit<MachineServiceHistory, 'id'>>) {
    const response = await apiClient.put<ApiResponse<MachineServiceHistory>>(`/machine-asset/machine-service-history/${id}`, payload);
    return response.data.data;
  },

  async listMaintenanceSchedules() {
    const response = await apiClient.get<ApiResponse<MachineMaintenanceSchedule[]>>('/machine-asset/maintenance-schedules');
    return response.data.data;
  },
  async createMaintenanceSchedule(payload: Omit<MachineMaintenanceSchedule, 'id'>) {
    const response = await apiClient.post<ApiResponse<MachineMaintenanceSchedule>>('/machine-asset/maintenance-schedules', payload);
    return response.data.data;
  },
  async updateMaintenanceSchedule(id: number, payload: Partial<Omit<MachineMaintenanceSchedule, 'id'>>) {
    const response = await apiClient.put<ApiResponse<MachineMaintenanceSchedule>>(`/machine-asset/maintenance-schedules/${id}`, payload);
    return response.data.data;
  },

  async listAssets() {
    const response = await apiClient.get<ApiResponse<Asset[]>>('/machine-asset/assets');
    return response.data.data;
  },
  async createAsset(payload: Omit<Asset, 'id'>) {
    const response = await apiClient.post<ApiResponse<Asset>>('/machine-asset/assets', payload);
    return response.data.data;
  },
  async updateAsset(id: number, payload: Partial<Omit<Asset, 'id'>>) {
    const response = await apiClient.put<ApiResponse<Asset>>(`/machine-asset/assets/${id}`, payload);
    return response.data.data;
  }
};
