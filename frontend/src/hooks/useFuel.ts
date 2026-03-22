import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fuelApi } from '../services/api/fuelApi';
import { useToastStore } from '../store/toastStore';

export const useFuel = () => {
  const queryClient = useQueryClient();
  const push = useToastStore((s) => s.push);

  const list = useQuery({
    queryKey: ['fuel-logs'],
    queryFn: () => fuelApi.list()
  });

  const create = useMutation({
    mutationFn: fuelApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuel-logs'] });
      push({ type: 'success', title: 'Fuel log created' });
    },
    onError: () => push({ type: 'error', title: 'Unable to create fuel log' })
  });

  return { list, create };
};
