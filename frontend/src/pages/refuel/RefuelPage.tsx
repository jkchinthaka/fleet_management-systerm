import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle, XCircle, Fuel } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Modal } from '../../components/ui/modal';
import { Card } from '../../components/ui/card';
import { DataTable } from '../../components/common/DataTable';
import { useRefuel } from '../../hooks/useRefuel';
import { useAppStore } from '../../store/appStore';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

const todayISO = () => new Date().toISOString().slice(0, 10);

const FUEL_TYPES = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG', 'Other'] as const;

const schema = z.object({
  vehicle_id: z.coerce.number().int().positive('Vehicle ID is required'),
  log_date: z.string().min(1, 'Date is required'),
  odometer: z.coerce.number().nonnegative('Odometer must be >= 0'),
  fuel_volume: z.coerce.number().positive('Fuel volume must be > 0'),
  price_per_litre: z.coerce.number().nonnegative().optional(),
  total_cost: z.coerce.number().nonnegative().optional(),
  fuel_type: z.enum(FUEL_TYPES).optional(),
  full_tank: z.boolean().optional(),
  notes: z.string().max(500).optional()
});

type FormData = z.infer<typeof schema>;

export const RefuelPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const roleId = useAppStore((s) => s.roleId);
  const canApprove = roleId === 1 || roleId === 7;
  const { list, create, approve, remove } = useRefuel();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      log_date: todayISO(),
      fuel_type: 'Diesel',
      full_tank: false
    }
  });

  const trendData = useMemo(() => {
    const map: Record<string, { date: string; totalCost: number; totalVolume: number }> = {};
    (list.data || []).forEach((r) => {
      const date = new Date(r.log_date).toISOString().slice(0, 10);
      if (!map[date]) map[date] = { date, totalCost: 0, totalVolume: 0 };
      map[date].totalCost += r.total_cost || 0;
      map[date].totalVolume += r.fuel_volume || 0;
    });
    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
  }, [list.data]);

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = { ...values };

    if (!payload.total_cost && payload.fuel_volume && payload.price_per_litre) {
      payload.total_cost = Number((payload.fuel_volume * payload.price_per_litre).toFixed(2));
    }

    await create.mutateAsync(payload);
    form.reset({ log_date: todayISO(), fuel_type: 'Diesel', full_tank: false });
    setIsOpen(false);
  });

  const FieldError = ({ name }: { name: keyof FormData }) => {
    const err = form.formState.errors[name];
    return err ? <p className="mt-1 text-sm text-red-500">{err.message}</p> : null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Fuel size={22} />
          <h1 className="text-2xl font-bold">Refuel Management</h1>
        </div>
        <Button onClick={() => setIsOpen(true)}>Add Refuel Log</Button>
      </div>

      <Card>
        <h2 className="mb-3 text-lg font-semibold">Refuel Cost Trend</h2>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="totalCost" name="Total Cost" stroke="#365ff8" fill="#365ff833" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <DataTable
        isLoading={list.isLoading}
        isError={list.isError}
        columns={[
          { key: 'id', header: 'ID' },
          { key: 'vehicle', header: 'Vehicle' },
          { key: 'log_date', header: 'Date' },
          { key: 'fuel_volume', header: 'Volume (L)' },
          { key: 'price_per_litre', header: 'Price/L' },
          { key: 'total_cost', header: 'Total Cost' },
          { key: 'status', header: 'Status' },
          ...(canApprove ? [{ key: 'actions' as const, header: 'Actions' }] : []),
          { key: 'deleteAction' as const, header: '' }
        ]}
        data={(list.data || []).map((row) => ({
          id: row.id,
          vehicle: row.vehicle?.registration_number || row.vehicle_id,
          log_date: new Date(row.log_date).toLocaleDateString(),
          fuel_volume: row.fuel_volume,
          price_per_litre: row.price_per_litre ?? '-',
          total_cost: row.total_cost,
          status: row.status,
          actions: canApprove ? (
            <div className="flex gap-1">
              <button onClick={() => approve.mutate({ id: row.id, approved: true })} title="Approve" className="rounded p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30">
                <CheckCircle size={16} />
              </button>
              <button onClick={() => approve.mutate({ id: row.id, approved: false })} title="Reject" className="rounded p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30">
                <XCircle size={16} />
              </button>
            </div>
          ) : null,
          deleteAction: (
            <button onClick={() => remove.mutate(row.id)} className="text-xs text-red-500 hover:underline">Delete</button>
          )
        }))}
      />

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Add Refuel Log">
        <form className="space-y-3" onSubmit={onSubmit}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Input type="number" placeholder="Vehicle ID *" {...form.register('vehicle_id')} />
              <FieldError name="vehicle_id" />
            </div>
            <div>
              <Input type="date" {...form.register('log_date')} />
              <FieldError name="log_date" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Input type="number" placeholder="Odometer *" {...form.register('odometer')} />
              <FieldError name="odometer" />
            </div>
            <div>
              <Input type="number" step="0.01" placeholder="Fuel Volume (L) *" {...form.register('fuel_volume')} />
              <FieldError name="fuel_volume" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Input type="number" step="0.01" placeholder="Price per litre" {...form.register('price_per_litre')} />
              <FieldError name="price_per_litre" />
            </div>
            <div>
              <Input type="number" step="0.01" placeholder="Total cost (optional)" {...form.register('total_cost')} />
              <FieldError name="total_cost" />
            </div>
          </div>

          <div>
            <select
              className="w-full rounded-xl border border-slate-200 bg-transparent px-4 py-2 text-sm dark:border-slate-700"
              {...form.register('fuel_type')}
            >
              {FUEL_TYPES.map((ft) => <option key={ft} value={ft}>{ft}</option>)}
            </select>
          </div>

          <div>
            <textarea
              className="w-full rounded-xl border border-slate-200 bg-transparent px-4 py-2 text-sm dark:border-slate-700"
              placeholder="Notes (optional)"
              rows={2}
              {...form.register('notes')}
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
            <input type="checkbox" {...form.register('full_tank')} />
            Full tank
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={create.isPending}>{create.isPending ? 'Saving...' : 'Save'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
