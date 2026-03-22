import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { serviceApi } from '../services/api/serviceApi';
import { useToastStore } from '../store/toastStore';
import type { ServiceRequest } from '../types';

export const useService = () => {
  const queryClient = useQueryClient();
  const push = useToastStore((s) => s.push);

  const list = useQuery({
    queryKey: ['service-requests'],
    queryFn: () => serviceApi.list()
  });

  const create = useMutation({
    mutationFn: serviceApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-requests'] });
      push({ type: 'success', title: 'Service request created' });
    },
    onError: () => push({ type: 'error', title: 'Unable to create service request' })
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: ServiceRequest['status'] }) =>
      serviceApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-requests'] });
      push({ type: 'success', title: 'Status updated' });
    },
    onError: () => push({ type: 'error', title: 'Unable to update status' })
  });

  const remove = useMutation({
    mutationFn: (id: number) => serviceApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-requests'] });
      push({ type: 'success', title: 'Service request deleted' });
    },
    onError: () => push({ type: 'error', title: 'Unable to delete service request' })
  });

  return { list, create, updateStatus, remove };
};
