import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { refuelApi } from '../services/api/refuelApi';
import { useToastStore } from '../store/toastStore';

export const useRefuel = () => {
  const queryClient = useQueryClient();
  const push = useToastStore((s) => s.push);

  const list = useQuery({
    queryKey: ['refuel-logs'],
    queryFn: () => refuelApi.list()
  });

  const create = useMutation({
    mutationFn: refuelApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['refuel-logs'] });
      push({ type: 'success', title: 'Refuel log created' });
    },
    onError: () => push({ type: 'error', title: 'Unable to create refuel log' })
  });

  const approve = useMutation({
    mutationFn: ({ id, approved }: { id: number; approved: boolean }) =>
      refuelApi.approve(id, approved),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['refuel-logs'] });
      push({ type: 'success', title: 'Refuel status updated' });
    },
    onError: () => push({ type: 'error', title: 'Unable to update refuel status' })
  });

  const remove = useMutation({
    mutationFn: refuelApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['refuel-logs'] });
      push({ type: 'success', title: 'Refuel log deleted' });
    },
    onError: () => push({ type: 'error', title: 'Unable to delete refuel log' })
  });

  return { list, create, approve, remove };
};
