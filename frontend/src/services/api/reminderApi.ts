import { apiClient } from './client';
import type { ApiResponse, ReminderEntry } from '../../types';

export const reminderApi = {
  async list(params?: { vehicleId?: string; isCompleted?: string; reminderType?: string }) {
    const response = await apiClient.get<ApiResponse<ReminderEntry[]>>('/reminders', { params });
    return response.data.data;
  },

  async upcoming(days = 7) {
    const response = await apiClient.get<ApiResponse<ReminderEntry[]>>('/reminders/upcoming', { params: { days } });
    return response.data.data;
  },

  async create(payload: {
    vehicle_id: number;
    reminder_type: string;
    title: string;
    description?: string;
    due_date: string;
    recurrence?: string;
    recurrence_end?: string;
    notify_before_days?: number;
    assigned_to?: string;
  }) {
    const response = await apiClient.post<ApiResponse<ReminderEntry>>('/reminders', payload);
    return response.data.data;
  },

  async update(id: number, payload: Partial<Record<string, unknown>>) {
    const response = await apiClient.put<ApiResponse<ReminderEntry>>(`/reminders/${id}`, payload);
    return response.data.data;
  },

  async complete(id: number) {
    const response = await apiClient.patch<ApiResponse<ReminderEntry>>(`/reminders/${id}/complete`);
    return response.data.data;
  },

  async remove(id: number) {
    const response = await apiClient.delete<ApiResponse<void>>(`/reminders/${id}`);
    return response.data;
  }
};
