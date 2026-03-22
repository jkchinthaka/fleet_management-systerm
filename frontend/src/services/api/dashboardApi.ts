import { apiClient } from './client';
import type { ApiResponse, DashboardSummary } from '../../types';

export const dashboardApi = {
  async getSummary() {
    const response = await apiClient.get<ApiResponse<DashboardSummary>>('/dashboard/summary');
    return response.data.data;
  }
};
