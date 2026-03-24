import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { costLogApi } from '../services/api/costLogApi';
import { useToastStore } from '../store/toastStore';

export const useCostLog = () => {
  const queryClient = useQueryClient();
  const push = useToastStore((s) => s.push);

  const list = useQuery({
    queryKey: ['cost-logs'],
    queryFn: () => costLogApi.list()
  });

  const create = useMutation({
    mutationFn: costLogApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-logs'] });
      push({ type: 'success', title: 'Cost log created' });
    },
    onError: () => push({ type: 'error', title: 'Unable to create cost log' })
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Record<string, unknown> }) =>
      costLogApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-logs'] });
      push({ type: 'success', title: 'Cost log updated' });
    },
    onError: () => push({ type: 'error', title: 'Unable to update cost log' })
  });

  const approve = useMutation({
    mutationFn: ({ id, approved }: { id: number; approved: boolean }) =>
      costLogApi.approve(id, approved),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-logs'] });
      push({ type: 'success', title: 'Cost log status updated' });
    },
    onError: () => push({ type: 'error', title: 'Unable to update approval' })
  });

  const remove = useMutation({
    mutationFn: costLogApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-logs'] });
      push({ type: 'success', title: 'Cost log deleted' });
    },
    onError: () => push({ type: 'error', title: 'Unable to delete cost log' })
  });

  return { list, create, update, approve, remove };
};
