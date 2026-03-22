import { apiClient } from './client';
import type { ApiResponse, AttendanceRecord, AttendanceMonthlySummary } from '../../types';

export const attendanceApi = {
  async list() {
    const response = await apiClient.get<ApiResponse<AttendanceRecord[]>>('/attendance');
    return response.data.data;
  },
  async mark(payload: Omit<AttendanceRecord, 'id' | 'user_id' | 'user_email'>) {
    const response = await apiClient.post<ApiResponse<AttendanceRecord>>('/attendance', payload);
    return response.data.data;
  },
  async update(id: number, payload: Partial<Omit<AttendanceRecord, 'id'>>) {
    const response = await apiClient.put<ApiResponse<AttendanceRecord>>(`/attendance/${id}`, payload);
    return response.data.data;
  },
  async monthlySummary(yearMonth: string) {
    const response = await apiClient.get<ApiResponse<AttendanceMonthlySummary[]>>('/attendance/monthly-summary', {
      params: { yearMonth }
    });
    return response.data.data;
  }
};
