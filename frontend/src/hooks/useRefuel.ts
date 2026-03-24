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

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Record<string, unknown> }) =>
      refuelApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['refuel-logs'] });
      push({ type: 'success', title: 'Refuel log updated' });
    },
    onError: () => push({ type: 'error', title: 'Unable to update refuel log' })
  });

  const approve = useMutation({
    mutationFn: ({ id, approved }: { id: number; approved: boolean }) =>
      refuelApi.approve(id, approved),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['refuel-logs'] });
      push({ type: 'success', title: 'Refuel log status updated' });
    },
    onError: () => push({ type: 'error', title: 'Unable to update approval' })
  });

  const remove = useMutation({
    mutationFn: refuelApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['refuel-logs'] });
      push({ type: 'success', title: 'Refuel log deleted' });
    },
    onError: () => push({ type: 'error', title: 'Unable to delete refuel log' })
  });

  return { list, create, update, approve, remove };
};
