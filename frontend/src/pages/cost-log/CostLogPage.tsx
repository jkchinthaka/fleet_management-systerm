import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Modal } from '../../components/ui/modal';
import { Card } from '../../components/ui/card';
import { DataTable } from '../../components/common/DataTable';
import { useCostLog } from '../../hooks/useCostLog';
import { useAppStore } from '../../store/appStore';
import { readFileAsBase64 } from '../../utils/fileHelpers';
import { CheckCircle, XCircle, Paperclip } from 'lucide-react';
import {
  BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';
import { useMemo } from 'react';

const todayISO = () => new Date().toISOString().slice(0, 10);

const COST_TYPES = ['Service', 'Repair', 'Insurance', 'Registration', 'Toll', 'Parking', 'Tyre', 'Other'] as const;

const schema = z.object({
  vehicle_id: z.coerce.number().int().positive('Vehicle ID is required'),
  cost_type: z.enum(COST_TYPES),
  amount: z.coerce.number().positive('Amount must be > 0'),
  log_date: z.string().min(1, 'Date is required'),
  notes: z.string().max(500).optional()
});

type FormData = z.infer<typeof schema>;

export const CostLogPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [attachment, setAttachment] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const roleId = useAppStore((s) => s.roleId);
  const { list, create, approve } = useCostLog();
  const canApprove = roleId === 1 || roleId === 7;

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { log_date: todayISO(), cost_type: 'Service' }
  });

  const chartData = useMemo(() => {
    const byType: Record<string, number> = {};
    (list.data || []).forEach((l) => {
      byType[l.cost_type] = (byType[l.cost_type] || 0) + l.amount;
    });
    return Object.entries(byType).map(([type, total]) => ({ type, total }));
  }, [list.data]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAttachment(await readFileAsBase64(file));
  };

  const onSubmit = form.handleSubmit(async (values) => {
    await create.mutateAsync({ ...values, attachment: attachment || undefined });
    form.reset({ log_date: todayISO(), cost_type: 'Service' });
    setAttachment(null);
    setIsOpen(false);
  });

  const handleApprove = (id: number, approved: boolean) => {
    approve.mutate({ id, approved });
  };

  const FieldError = ({ name }: { name: keyof FormData }) => {
    const err = form.formState.errors[name];
    return err ? <p className="mt-1 text-sm text-red-500">{err.message}</p> : null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Cost Logs</h1>
        <Button onClick={() => setIsOpen(true)}>Add Cost Log</Button>
      </div>

      <Card>
        <h2 className="mb-3 text-lg font-semibold">Cost by Type</h2>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" name="Total Cost" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <DataTable
        isLoading={list.isLoading}
        isError={list.isError}
        columns={[
          { key: 'id', header: 'ID' },
          { key: 'vehicle', header: 'Vehicle' },
          { key: 'cost_type', header: 'Type' },
          { key: 'amount', header: 'Amount' },
          { key: 'log_date', header: 'Date' },
          { key: 'status', header: 'Status' },
          ...(canApprove ? [{ key: 'actions' as const, header: 'Actions' }] : [])
        ]}
        data={(list.data || []).map((row) => ({
          id: row.id,
          vehicle: row.vehicle?.registration_number || row.vehicle_id,
          cost_type: row.cost_type,
          amount: row.amount,
          log_date: new Date(row.log_date).toLocaleDateString(),
          status: row.status,
          actions: canApprove ? (
            <div className="flex gap-1">
              <button onClick={() => handleApprove(row.id, true)} title="Approve" className="rounded p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30">
                <CheckCircle size={16} />
              </button>
              <button onClick={() => handleApprove(row.id, false)} title="Reject" className="rounded p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30">
                <XCircle size={16} />
              </button>
            </div>
          ) : null
        }))}
      />

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Add Cost Log">
        <form className="space-y-3" onSubmit={onSubmit}>
          <div>
            <Input type="number" placeholder="Vehicle ID *" {...form.register('vehicle_id')} />
            <FieldError name="vehicle_id" />
          </div>
          <div>
            <select className="w-full rounded-xl border border-slate-200 bg-transparent px-4 py-2 text-sm dark:border-slate-700" {...form.register('cost_type')}>
              {COST_TYPES.map((ct) => <option key={ct} value={ct}>{ct}</option>)}
            </select>
            <FieldError name="cost_type" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Input type="number" step="0.01" placeholder="Amount *" {...form.register('amount')} />
              <FieldError name="amount" />
            </div>
            <div>
              <Input type="date" {...form.register('log_date')} />
              <FieldError name="log_date" />
            </div>
          </div>
          <div>
            <textarea className="w-full rounded-xl border border-slate-200 bg-transparent px-4 py-2 text-sm dark:border-slate-700" placeholder="Notes (optional)" rows={2} {...form.register('notes')} />
          </div>

          <div>
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm hover:border-brand-500 dark:border-slate-600">
              <Paperclip size={18} className="text-slate-400" />
              <span>{attachment ? 'File attached' : 'Attach document / receipt'}</span>
              <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileChange} />
            </label>
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
