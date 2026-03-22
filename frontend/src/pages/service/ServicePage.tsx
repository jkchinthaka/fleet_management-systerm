import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Modal } from '../../components/ui/modal';
import { DataTable } from '../../components/common/DataTable';
import { Card } from '../../components/ui/card';
import { useService } from '../../hooks/useService';
import type { ServiceRequest } from '../../types';

const STATUS_COLORS: Record<ServiceRequest['status'], string> = {
  Pending: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20',
  'In Progress': 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
  Completed: 'text-green-600 bg-green-50 dark:bg-green-900/20',
  Cancelled: 'text-slate-500 bg-slate-100 dark:bg-slate-800'
};

const todayISO = () => new Date().toISOString().slice(0, 10);

const schema = z.object({
  title: z.string().min(3, 'Title is required (min 3 chars)'),
  description: z.string().optional(),
  sla_deadline: z.string().optional()
});

type FormData = z.infer<typeof schema>;

export const ServicePage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { list, create, updateStatus, remove } = useService();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { sla_deadline: '' }
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await create.mutateAsync({
      title: values.title,
      description: values.description || undefined,
      sla_deadline: values.sla_deadline || undefined
    });
    form.reset();
    setIsOpen(false);
  });

  const statusCounts = (list.data || []).reduce(
    (acc, r) => {
      acc[r.status] = (acc[r.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Service Requests</h1>
        <Button onClick={() => setIsOpen(true)}>+ New Request</Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {(['Pending', 'In Progress', 'Completed', 'Cancelled'] as ServiceRequest['status'][]).map((s) => (
          <Card key={s} className="text-center">
            <p className="text-2xl font-bold">{statusCounts[s] ?? 0}</p>
            <p className="text-sm text-[var(--muted)]">{s}</p>
          </Card>
        ))}
      </div>

      <DataTable
        isLoading={list.isLoading}
        isError={list.isError}
        columns={[
          { key: 'id', header: 'ID' },
          { key: 'title', header: 'Title' },
          { key: 'status_badge', header: 'Status' },
          { key: 'sla_deadline', header: 'SLA Deadline' },
          { key: 'total_cost', header: 'Cost (₹)' },
          { key: '_actions', header: 'Actions' }
        ]}
        data={(list.data || []).map((r) => ({
          id: r.id,
          title: r.title,
          status_badge: (
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[r.status]}`}>
              {r.status}
            </span>
          ),
          sla_deadline: r.sla_deadline ? new Date(r.sla_deadline).toLocaleDateString() : '-',
          total_cost: r.total_cost != null ? `₹${Number(r.total_cost).toLocaleString()}` : '-',
          _actions: (
            <div className="flex gap-2">
              {r.status === 'Pending' && (
                <button
                  className="text-xs text-blue-600 hover:underline"
                  onClick={() => updateStatus.mutate({ id: r.id, status: 'In Progress' })}
                >
                  Start
                </button>
              )}
              {r.status === 'In Progress' && (
                <button
                  className="text-xs text-green-600 hover:underline"
                  onClick={() => updateStatus.mutate({ id: r.id, status: 'Completed' })}
                >
                  Complete
                </button>
              )}
              <button
                className="text-xs text-red-500 hover:underline"
                onClick={() => remove.mutate(r.id)}
              >
                Delete
              </button>
            </div>
          )
        }))}
      />

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="New Service Request">
        <form className="space-y-3" onSubmit={onSubmit}>
          <div>
            <Input placeholder="Title *" {...form.register('title')} />
            {form.formState.errors.title && (
              <p className="mt-1 text-sm text-red-500">{form.formState.errors.title.message}</p>
            )}
          </div>
          <textarea
            className="w-full rounded-lg border border-slate-300 p-2 text-sm dark:border-slate-600 dark:bg-slate-800"
            rows={3}
            placeholder="Description (optional)"
            {...form.register('description')}
          />
          <div>
            <label className="mb-1 block text-xs text-[var(--muted)]">SLA Deadline</label>
            <Input type="date" defaultValue={todayISO()} {...form.register('sla_deadline')} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? 'Saving...' : 'Submit'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
