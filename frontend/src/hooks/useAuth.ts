import { useMutation } from '@tanstack/react-query';
import { authApi } from '../services/api/authApi';
import { useAppStore } from '../store/appStore';
import { useToastStore } from '../store/toastStore';

export const useAuth = () => {
  const setSession = useAppStore((s) => s.setSession);
  const push = useToastStore((s) => s.push);

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setSession(data.token, data.user?.role_id ?? null);
      push({ type: 'success', title: 'Login successful' });
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Login failed. Please try again.';
      push({ type: 'error', title: msg });
    }
  });
};
