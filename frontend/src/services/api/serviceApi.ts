import { apiClient } from './client';
import type { ApiResponse, ServiceRequest } from '../../types';

export const serviceApi = {
  async list() {
    const response = await apiClient.get<ApiResponse<ServiceRequest[]>>('/service/requests');
    return response.data.data;
  },
  async create(payload: {
    title: string;
    description?: string;
    sla_deadline?: string;
    assigned_technician_id?: number;
  }) {
    const response = await apiClient.post<ApiResponse<ServiceRequest>>('/service/requests', {
      ...payload,
      status: 'Pending'
    });
    return response.data.data;
  },
  async update(id: number, payload: Partial<Omit<ServiceRequest, 'id'>>) {
    const response = await apiClient.put<ApiResponse<ServiceRequest>>(
      `/service/requests/${id}`,
      payload
    );
    return response.data.data;
  },
  async updateStatus(id: number, status: ServiceRequest['status']) {
    const response = await apiClient.patch<ApiResponse<ServiceRequest>>(
      `/service/requests/${id}/status`,
      { status }
    );
    return response.data.data;
  },
  async remove(id: number) {
    const response = await apiClient.delete<ApiResponse<null>>(`/service/requests/${id}`);
    return response.data;
  }
};
