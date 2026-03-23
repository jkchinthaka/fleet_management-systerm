import { useMutation } from '@tanstack/react-query';
import { authApi } from '../services/api/authApi';
import { useAppStore } from '../store/appStore';
import { useToastStore } from '../store/toastStore';

export const useAuth = () => {
  const setSession = useAppStore((s) => s.setSession);
  const push = useToastStore((s) => s.push);

  const getErrorMessage = (error: unknown) => {
    const axiosLike = error as {
      code?: string;
      message?: string;
      response?: { data?: { message?: string } };
    };

    if (axiosLike?.response?.data?.message) {
      return axiosLike.response.data.message;
    }

    if (axiosLike?.code === 'ECONNABORTED') {
      return 'Request timed out. Please try again.';
    }

    if (axiosLike?.message === 'Network Error') {
      return 'Unable to reach server. Check backend URL, CORS, and internet connection.';
    }

    return 'Login failed. Please try again.';
  };

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setSession(data.token, data.user?.role_id ?? null);
      push({ type: 'success', title: 'Login successful' });
    },
    onError: (error: unknown) => {
      const msg = getErrorMessage(error);
      push({ type: 'error', title: msg });
    }
  });
};
