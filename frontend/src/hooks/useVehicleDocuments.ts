import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { vehicleDocumentApi } from '../services/api/vehicleDocumentApi';
import { useToastStore } from '../store/toastStore';

export const useVehicleDocuments = (vehicleId: number | null) => {
  const queryClient = useQueryClient();
  const push = useToastStore((s) => s.push);

  const list = useQuery({
    queryKey: ['vehicle-documents', vehicleId],
    queryFn: () => vehicleDocumentApi.list(vehicleId!),
    enabled: vehicleId != null
  });

  const create = useMutation({
    mutationFn: (payload: { document_type: string; document_number?: string; expiry_date?: string }) =>
      vehicleDocumentApi.create(vehicleId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-documents', vehicleId] });
      push({ type: 'success', title: 'Document added' });
    },
    onError: () => push({ type: 'error', title: 'Unable to add document' })
  });

  const remove = useMutation({
    mutationFn: (id: number) => vehicleDocumentApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-documents', vehicleId] });
      push({ type: 'success', title: 'Document removed' });
    },
    onError: () => push({ type: 'error', title: 'Unable to remove document' })
  });

  return { list, create, remove };
};
