import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersApi, type CreateUserPayload } from '../services/api/usersApi';
import { useToastStore } from '../store/toastStore';

export const useUsers = () => {
  const qc = useQueryClient();
  const push = useToastStore((s) => s.push);

  const users = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.list
  });

  const createUser = useMutation({
    mutationFn: (payload: CreateUserPayload) => usersApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      push({ type: 'success', title: 'User created successfully' });
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to create user';
      push({ type: 'error', title: msg });
    }
  });

  return { users, createUser };
};
