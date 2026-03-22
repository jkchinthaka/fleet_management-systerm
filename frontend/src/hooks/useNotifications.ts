import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '../services/api/notificationApi';
import { useToastStore } from '../store/toastStore';

export const useNotifications = () => {
  const queryClient = useQueryClient();
  const push = useToastStore((s) => s.push);

  const notifications = useQuery({ queryKey: ['notifications'], queryFn: notificationApi.list });
  const thresholds = useQuery({ queryKey: ['alert-thresholds'], queryFn: notificationApi.listThresholds });

  const runEngine = useMutation({
    mutationFn: notificationApi.runEngine,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      push({ type: 'success', title: 'Alert engine executed' });
    }
  });

  const markRead = useMutation({
    mutationFn: notificationApi.markRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  return { notifications, thresholds, runEngine, markRead };
};
