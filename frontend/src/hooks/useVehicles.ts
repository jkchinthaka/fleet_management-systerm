import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { vehicleApi } from '../services/api/vehicleApi';
import { useToastStore } from '../store/toastStore';

export const useVehicles = () => {
  const queryClient = useQueryClient();
  const push = useToastStore((s) => s.push);

  const list = useQuery({
    queryKey: ['vehicles'],
    queryFn: vehicleApi.list
  });

  const create = useMutation({
    mutationFn: vehicleApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      push({ type: 'success', title: 'Vehicle created successfully' });
    },
    onError: () => push({ type: 'error', title: 'Unable to create vehicle' })
  });

  return { list, create };
};
