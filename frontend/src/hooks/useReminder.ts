import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reminderApi } from '../services/api/reminderApi';
import { useToastStore } from '../store/toastStore';

export const useReminder = () => {
  const queryClient = useQueryClient();
  const push = useToastStore((s) => s.push);

  const list = useQuery({
    queryKey: ['reminders'],
    queryFn: () => reminderApi.list()
  });

  const upcoming = useQuery({
    queryKey: ['reminders-upcoming'],
    queryFn: () => reminderApi.upcoming(14)
  });

  const create = useMutation({
    mutationFn: reminderApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      queryClient.invalidateQueries({ queryKey: ['reminders-upcoming'] });
      push({ type: 'success', title: 'Reminder created' });
    },
    onError: () => push({ type: 'error', title: 'Unable to create reminder' })
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Record<string, unknown> }) =>
      reminderApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      queryClient.invalidateQueries({ queryKey: ['reminders-upcoming'] });
      push({ type: 'success', title: 'Reminder updated' });
    },
    onError: () => push({ type: 'error', title: 'Unable to update reminder' })
  });

  const complete = useMutation({
    mutationFn: reminderApi.complete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      queryClient.invalidateQueries({ queryKey: ['reminders-upcoming'] });
      push({ type: 'success', title: 'Reminder completed' });
    },
    onError: () => push({ type: 'error', title: 'Unable to complete reminder' })
  });

  const remove = useMutation({
    mutationFn: reminderApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      queryClient.invalidateQueries({ queryKey: ['reminders-upcoming'] });
      push({ type: 'success', title: 'Reminder deleted' });
    },
    onError: () => push({ type: 'error', title: 'Unable to delete reminder' })
  });

  return { list, upcoming, create, update, complete, remove };
};
