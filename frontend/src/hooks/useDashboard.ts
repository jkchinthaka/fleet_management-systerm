import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../services/api/dashboardApi';

export const useDashboard = () => {
  return useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: dashboardApi.getSummary
  });
};
