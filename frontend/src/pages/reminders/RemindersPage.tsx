import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Modal } from '../../components/ui/modal';
import { Card } from '../../components/ui/card';
import { DataTable } from '../../components/common/DataTable';
import { useReminder } from '../../hooks/useReminder';
import { Bell, CheckCircle2 } from 'lucide-react';
import { useMemo } from 'react';

const REMINDER_TYPES = ['Insurance', 'Maintenance', 'Registration', 'Inspection', 'TyreChange', 'OilChange', 'Custom'] as const;
const RECURRENCE = ['None', 'Weekly', 'Monthly', 'Quarterly', 'Yearly'] as const;

const tomorrowISO = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
};

const schema = z.object({
  vehicle_id: z.coerce.number().int().positive('Vehicle ID is required'),
  title: z.string().min(2, 'Title required').max(100),
  reminder_type: z.enum(REMINDER_TYPES),
  due_date: z.string().min(1, 'Due date required'),
  recurrence: z.enum(RECURRENCE),
  recurrence_end: z.string().optional(),
  notify_before_days: z.coerce.number().int().min(0).max(90).optional(),
  assigned_to: z.string().optional(),
  notes: z.string().max(500).optional()
});

type FormData = z.infer<typeof schema>;

export const RemindersPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { list, upcoming, create, complete } = useReminder();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { due_date: tomorrowISO(), recurrence: 'None', reminder_type: 'Maintenance', notify_before_days: 7 }
  });

  const upcomingList = useMemo(() => upcoming.data || [], [upcoming.data]);
  const allList = useMemo(() => list.data || [], [list.data]);

  const onSubmit = form.handleSubmit(async (values) => {
    const { recurrence_end, assigned_to, ...rest } = values;
    const payload = {
      ...rest,
      ...(recurrence_end ? { recurrence_end } : {}),
      ...(assigned_to ? { assigned_to } : {})
    };
    await create.mutateAsync(payload);
    form.reset({ due_date: tomorrowISO(), recurrence: 'None', reminder_type: 'Maintenance', notify_before_days: 7 });
    setIsOpen(false);
  });

  const FieldError = ({ name }: { name: keyof FormData }) => {
    const err = form.formState.errors[name];
    return err ? <p className="mt-1 text-sm text-red-500">{err.message}</p> : null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reminders</h1>
        <Button onClick={() => setIsOpen(true)}>Add Reminder</Button>
      </div>

      {upcomingList.length > 0 && (
        <Card>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-amber-600 dark:text-amber-400">
            <Bell size={18} /> Upcoming ({upcomingList.length})
          </h2>
          <div className="space-y-2">
            {upcomingList.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-lg border border-amber-200 px-4 py-3 dark:border-amber-800">
                <div>
                  <p className="font-medium">{r.title}</p>
                  <p className="text-sm text-slate-500">{r.reminder_type} &middot; Due {new Date(r.due_date).toLocaleDateString()} &middot; Vehicle #{r.vehicle_id}</p>
                </div>
                <button onClick={() => complete.mutate(r.id)} className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700" disabled={complete.isPending}>
                  <CheckCircle2 size={14} /> Done
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      <DataTable
        isLoading={list.isLoading}
        isError={list.isError}
        columns={[
          { key: 'id', header: 'ID' },
          { key: 'title', header: 'Title' },
          { key: 'reminder_type', header: 'Type' },
          { key: 'vehicle', header: 'Vehicle' },
          { key: 'due_date', header: 'Due Date' },
          { key: 'recurrence', header: 'Recurrence' },
          { key: 'status', header: 'Status' },
          { key: 'actions', header: '' }
        ]}
        data={allList.map((row) => ({
          id: row.id,
          title: row.title,
          reminder_type: row.reminder_type,
          vehicle: row.vehicle?.registration_number || row.vehicle_id,
          due_date: new Date(row.due_date).toLocaleDateString(),
          recurrence: row.recurrence,
          status: row.is_completed ? (
            <span className="inline-flex items-center rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/40 dark:text-green-300">Done</span>
          ) : (
            <span className="inline-flex items-center rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">Pending</span>
          ),
          actions: !row.is_completed ? (
            <button onClick={() => complete.mutate(row.id)} className="rounded p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30" title="Mark complete">
              <CheckCircle2 size={16} />
            </button>
          ) : null
        }))}
      />

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Add Reminder">
        <form className="space-y-3" onSubmit={onSubmit}>
          <div>
            <Input placeholder="Title *" {...form.register('title')} />
            <FieldError name="title" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Input type="number" placeholder="Vehicle ID *" {...form.register('vehicle_id')} />
              <FieldError name="vehicle_id" />
            </div>
            <div>
              <select className="w-full rounded-xl border border-slate-200 bg-transparent px-4 py-2 text-sm dark:border-slate-700" {...form.register('reminder_type')}>
                {REMINDER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-slate-500">Due Date *</label>
              <Input type="date" {...form.register('due_date')} />
              <FieldError name="due_date" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-500">Recurrence</label>
              <select className="w-full rounded-xl border border-slate-200 bg-transparent px-4 py-2 text-sm dark:border-slate-700" {...form.register('recurrence')}>
                {RECURRENCE.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-slate-500">Recurrence End</label>
              <Input type="date" {...form.register('recurrence_end')} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-500">Notify Before (days)</label>
              <Input type="number" {...form.register('notify_before_days')} />
            </div>
          </div>
          <div>
            <Input placeholder="Assigned to (user ID)" {...form.register('assigned_to')} />
          </div>
          <div>
            <textarea className="w-full rounded-xl border border-slate-200 bg-transparent px-4 py-2 text-sm dark:border-slate-700" placeholder="Notes" rows={2} {...form.register('notes')} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={create.isPending}>{create.isPending ? 'Saving...' : 'Save'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
