import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../hooks/useAuth';
import { useAppStore } from '../../store/appStore';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

type FormData = z.infer<typeof schema>;

export const LoginPage = () => {
  const token = useAppStore((s) => s.token);
  const auth = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema)
  });

  if (token) return <Navigate to="/" replace />;

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await auth.mutateAsync(values);
    } catch {
      // Error toast is already handled in the mutation hook.
    }
  });

  const serverError = auth.error
    ? ((auth.error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
       'Login failed. Please try again.')
    : null;

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <h1 className="mb-1 text-2xl font-bold">FleetMatrix Login</h1>
        <p className="mb-6 text-sm text-[var(--muted)]">Secure access for operations teams</p>

        <form className="space-y-3" onSubmit={onSubmit}>
          {serverError && (
            <div className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
              {serverError}
            </div>
          )}
          <Input placeholder="Email" {...form.register('email')} />
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              className="pr-10"
              {...form.register('password')}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <Button type="submit" className="w-full" disabled={auth.isPending}>
            {auth.isPending ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>


      </Card>
    </div>
  );
}
