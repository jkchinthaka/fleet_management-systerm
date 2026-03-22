import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { machineAssetApi } from '../services/api/machineAssetApi';
import { useToastStore } from '../store/toastStore';

export const useMachineAsset = () => {
  const queryClient = useQueryClient();
  const push = useToastStore((s) => s.push);

  const machines = useQuery({ queryKey: ['machines'], queryFn: machineAssetApi.listMachines });
  const serviceHistory = useQuery({ queryKey: ['machine-service-history'], queryFn: machineAssetApi.listServiceHistory });
  const schedules = useQuery({ queryKey: ['machine-schedules'], queryFn: machineAssetApi.listMaintenanceSchedules });
  const assets = useQuery({ queryKey: ['assets'], queryFn: machineAssetApi.listAssets });

  const createMachine = useMutation({
    mutationFn: machineAssetApi.createMachine,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['machines'] });
      push({ type: 'success', title: 'Machine added' });
    }
  });

  const createAsset = useMutation({
    mutationFn: machineAssetApi.createAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      push({ type: 'success', title: 'Asset added' });
    }
  });

  const createServiceHistory = useMutation({
    mutationFn: machineAssetApi.createServiceHistory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['machine-service-history'] });
      push({ type: 'success', title: 'Service history added' });
    }
  });

  const createSchedule = useMutation({
    mutationFn: machineAssetApi.createMaintenanceSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['machine-schedules'] });
      push({ type: 'success', title: 'Maintenance schedule added' });
    }
  });

  return {
    machines,
    serviceHistory,
    schedules,
    assets,
    createMachine,
    createAsset,
    createServiceHistory,
    createSchedule
  };
};
