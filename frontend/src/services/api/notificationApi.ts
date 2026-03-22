import { apiClient } from './client';
import type { AlertThreshold, ApiResponse, NotificationItem } from '../../types';

export const notificationApi = {
  async list() {
    const response = await apiClient.get<ApiResponse<NotificationItem[]>>('/notifications');
    return response.data.data;
  },
  async create(payload: Omit<NotificationItem, 'id' | 'is_read' | 'created_at'>) {
    const response = await apiClient.post<ApiResponse<NotificationItem>>('/notifications', payload);
    return response.data.data;
  },
  async update(id: number, payload: Partial<Omit<NotificationItem, 'id'>>) {
    const response = await apiClient.put<ApiResponse<NotificationItem>>(`/notifications/${id}`, payload);
    return response.data.data;
  },
  async markRead(id: number) {
    await apiClient.patch(`/notifications/${id}/read`);
  },
  async listThresholds() {
    const response = await apiClient.get<ApiResponse<AlertThreshold[]>>('/notifications/thresholds');
    return response.data.data;
  },
  async runEngine() {
    const response = await apiClient.post<ApiResponse<NotificationItem[]>>('/notifications/run-engine');
    return response.data.data;
  }
};
