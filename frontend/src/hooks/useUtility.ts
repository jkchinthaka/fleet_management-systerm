import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { utilityApi } from '../services/api/utilityApi';
import { useToastStore } from '../store/toastStore';

export const useUtility = () => {
  const queryClient = useQueryClient();
  const push = useToastStore((s) => s.push);
  const getErrorMessage = (error: unknown, fallback: string) =>
    (error as { response?: { data?: { message?: string } } })?.response?.data?.message || fallback;

  const water = useQuery({ queryKey: ['utility-water'], queryFn: utilityApi.listWater });
  const electricity = useQuery({ queryKey: ['utility-electricity'], queryFn: utilityApi.listElectricity });
  const comparison = useQuery({ queryKey: ['utility-comparison'], queryFn: utilityApi.comparison });

  const createWater = useMutation({
    mutationFn: utilityApi.createWater,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utility-water'] });
      queryClient.invalidateQueries({ queryKey: ['utility-comparison'] });
      push({ type: 'success', title: 'Water reading added' });
    },
    onError: (error: unknown) => {
      push({ type: 'error', title: getErrorMessage(error, 'Unable to save water reading') });
    }
  });

  const createElectricity = useMutation({
    mutationFn: utilityApi.createElectricity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utility-electricity'] });
      queryClient.invalidateQueries({ queryKey: ['utility-comparison'] });
      push({ type: 'success', title: 'Electricity reading added' });
    },
    onError: (error: unknown) => {
      push({ type: 'error', title: getErrorMessage(error, 'Unable to save electricity reading') });
    }
  });

  const updateWater = useMutation({
    mutationFn: ({ id, ...payload }: { id: number } & Parameters<typeof utilityApi.updateWater>[1]) =>
      utilityApi.updateWater(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utility-water'] });
      queryClient.invalidateQueries({ queryKey: ['utility-comparison'] });
      push({ type: 'success', title: 'Water reading updated' });
    },
    onError: (error: unknown) => {
      push({ type: 'error', title: getErrorMessage(error, 'Unable to update water reading') });
    }
  });

  const updateElectricity = useMutation({
    mutationFn: ({ id, ...payload }: { id: number } & Parameters<typeof utilityApi.updateElectricity>[1]) =>
      utilityApi.updateElectricity(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utility-electricity'] });
      queryClient.invalidateQueries({ queryKey: ['utility-comparison'] });
      push({ type: 'success', title: 'Electricity reading updated' });
    },
    onError: (error: unknown) => {
      push({ type: 'error', title: getErrorMessage(error, 'Unable to update electricity reading') });
    }
  });

  return { water, electricity, comparison, createWater, createElectricity, updateWater, updateElectricity };
};
