import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Modal } from '../../components/ui/modal';
import { DataTable } from '../../components/common/DataTable';
import { useUsers } from '../../hooks/useUsers';

const ROLE_OPTIONS = [
  { id: 1, name: 'Admin' },
  { id: 2, name: 'Fleet Manager' },
  { id: 3, name: 'Maintenance Technician' },
  { id: 4, name: 'Inventory Purchasing Officer' },
  { id: 5, name: 'Finance Accountant' },
  { id: 6, name: 'Driver Employee' },
  { id: 7, name: 'Supervisor Manager' }
] as const;

const schema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(120),
  email: z.string().trim().email('Valid email is required').max(255),
  password: z
    .string()
    .min(8)
    .max(72)
    .regex(/[A-Z]/, 'Must include uppercase')
    .regex(/[a-z]/, 'Must include lowercase')
    .regex(/[0-9]/, 'Must include number')
    .regex(/[^A-Za-z0-9]/, 'Must include special character'),
  roleId: z.coerce.number().int().min(1).max(7)
});

type FormValues = z.infer<typeof schema>;

export const UsersPage = () => {
  const [open, setOpen] = useState(false);
  const { users, createUser } = useUsers();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { roleId: 2 }
  });

  const submit = form.handleSubmit(async (values) => {
    await createUser.mutateAsync(values);
    form.reset({ roleId: 2, name: '', email: '', password: '' });
    setOpen(false);
  });

  const tableRows = useMemo(
    () =>
      (users.data || []).map((u) => ({
        ...u,
        createdAt: u.createdAt ? String(u.createdAt).split('T')[0] : '-'
      })),
    [users.data]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Button onClick={() => setOpen(true)}>Add User</Button>
      </div>

      <Card>
        <DataTable
          columns={[
            { key: 'id', header: 'ID' },
            { key: 'name', header: 'Name' },
            { key: 'email', header: 'Email' },
            { key: 'roleName', header: 'Role' },
            { key: 'createdAt', header: 'Created' }
          ]}
          data={tableRows}
          isLoading={users.isLoading}
          isError={users.isError}
        />
      </Card>

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Create User">
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-slate-500">Full Name</label>
            <Input placeholder="Full name" autoComplete="name" {...form.register('name')} />
            {form.formState.errors.name && <p className="mt-1 text-xs text-red-500">{form.formState.errors.name.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-xs text-slate-500">Email</label>
            <Input type="email" placeholder="user@company.com" autoComplete="email" {...form.register('email')} />
            {form.formState.errors.email && <p className="mt-1 text-xs text-red-500">{form.formState.errors.email.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-xs text-slate-500">Password</label>
            <Input type="password" placeholder="Strong password" autoComplete="new-password" {...form.register('password')} />
            {form.formState.errors.password && <p className="mt-1 text-xs text-red-500">{form.formState.errors.password.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-xs text-slate-500">Role</label>
            <select
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-400 dark:border-slate-700 dark:bg-slate-900"
              {...form.register('roleId')}
            >
              {ROLE_OPTIONS.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createUser.isPending}>
              {createUser.isPending ? 'Saving...' : 'Create User'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
