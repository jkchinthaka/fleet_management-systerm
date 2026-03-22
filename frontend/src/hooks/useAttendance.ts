import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { attendanceApi } from '../services/api/attendanceApi';
import { useToastStore } from '../store/toastStore';

export const useAttendance = () => {
  const queryClient = useQueryClient();
  const push = useToastStore((s) => s.push);

  const records = useQuery({ queryKey: ['attendance-records'], queryFn: attendanceApi.list });
  const monthlySummary = useQuery({
    queryKey: ['attendance-monthly-summary'],
    queryFn: () => attendanceApi.monthlySummary(new Date().toISOString().slice(0, 7))
  });

  const markAttendance = useMutation({
    mutationFn: attendanceApi.mark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-records'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-monthly-summary'] });
      push({ type: 'success', title: 'Attendance marked' });
    }
  });

  const updateAttendance = useMutation({
    mutationFn: ({ id, ...payload }: { id: number } & Parameters<typeof attendanceApi.update>[1]) =>
      attendanceApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-records'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-monthly-summary'] });
      push({ type: 'success', title: 'Attendance updated' });
    }
  });

  return { records, monthlySummary, markAttendance, updateAttendance };
};
