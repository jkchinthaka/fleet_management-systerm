import { useMemo, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Modal } from '../../components/ui/modal';
import { Card } from '../../components/ui/card';
import { DataTable } from '../../components/common/DataTable';
import { useRefuel } from '../../hooks/useRefuel';
import { useAppStore } from '../../store/appStore';
import { readFileAsBase64 } from '../../utils/fileHelpers';
import { CheckCircle, XCircle, Image as ImageIcon } from 'lucide-react';

const todayISO = () => new Date().toISOString().slice(0, 16);

const schema = z.object({
  vehicle_id: z.coerce.number().int().positive('Vehicle ID is required'),
  log_date: z.string().min(1, 'Date is required'),
  odometer: z.coerce.number().nonnegative('Odometer must be >= 0'),
  fuel_volume: z.coerce.number().positive('Must be > 0'),
  price_per_litre: z.coerce.number().nonnegative().optional(),
  total_cost: z.coerce.number().nonnegative().optional(),
  full_tank: z.boolean().optional(),
  fuel_type: z.enum(['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG', 'Other']).optional(),
  notes: z.string().max(500).optional()
});

type FormData = z.infer<typeof schema>;

const FUEL_TYPES = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG', 'Other'] as const;

export const RefuelPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const roleId = useAppStore((s) => s.roleId);
  const { list, create, approve } = useRefuel();
  const canApprove = roleId === 1 || roleId === 7; // Admin or Supervisor

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      log_date: todayISO(),
      fuel_type: 'Diesel',
      full_tank: false
    }
  });

  const watchVolume = form.watch('fuel_volume');
  const watchPPL = form.watch('price_per_litre');
  const autoTotal = useMemo(() => {
    if (watchVolume && watchPPL) return Number((watchVolume * watchPPL).toFixed(2));
    return undefined;
  }, [watchVolume, watchPPL]);

  const trendData = useMemo(() => {
    return (list.data || []).slice().reverse().map((x) => ({
      date: new Date(x.log_date).toLocaleDateString(),
      cost: x.total_cost,
      volume: x.fuel_volume
    }));
  }, [list.data]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const base64 = await readFileAsBase64(file);
    setPhotoBase64(base64);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = {
      ...values,
      total_cost: values.total_cost || autoTotal || 0,
      photo: photoBase64 || undefined
    };
    await create.mutateAsync(payload);
    form.reset({ log_date: todayISO(), fuel_type: 'Diesel', full_tank: false });
    setPhotoBase64(null);
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
        <h1 className="text-2xl font-bold">Refueling Logs</h1>
        <Button onClick={() => setIsOpen(true)}>Add Refuel Log</Button>
      </div>

      {/* Trend Chart */}
      <Card>
        <h2 className="mb-3 text-lg font-semibold">Fuel Cost Trend</h2>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Area dataKey="cost" name="Cost" stroke="#365ff8" fill="#8fb2ff" fillOpacity={0.35} />
              <Area dataKey="volume" name="Volume (L)" stroke="#10b981" fill="#6ee7b7" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Table */}
      <DataTable
        isLoading={list.isLoading}
        isError={list.isError}
        columns={[
          { key: 'id', header: 'ID' },
          { key: 'vehicle', header: 'Vehicle' },
          { key: 'log_date', header: 'Date' },
          { key: 'odometer', header: 'Odometer' },
          { key: 'fuel_volume', header: 'Volume (L)' },
          { key: 'total_cost', header: 'Cost' },
          { key: 'fuel_type', header: 'Fuel Type' },
          { key: 'status', header: 'Status' },
          ...(canApprove ? [{ key: 'actions' as const, header: 'Actions' }] : [])
        ]}
        data={(list.data || []).map((row) => ({
          id: row.id,
          vehicle: row.vehicle?.registration_number || row.vehicle_id,
          log_date: new Date(row.log_date).toLocaleDateString(),
          odometer: row.odometer,
          fuel_volume: row.fuel_volume,
          total_cost: row.total_cost,
          fuel_type: row.fuel_type || '-',
          status: row.status,
          actions: canApprove ? (
            <div className="flex gap-1">
              <button
                onClick={() => handleApprove(row.id, true)}
                title="Approve"
                className="rounded p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30"
              >
                <CheckCircle size={16} />
              </button>
              <button
                onClick={() => handleApprove(row.id, false)}
                title="Reject"
                className="rounded p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
              >
                <XCircle size={16} />
              </button>
            </div>
          ) : null
        }))}
      />

      {/* Add Modal */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Add Refuel Log">
        <form className="space-y-3" onSubmit={onSubmit}>
          <div>
            <Input type="number" placeholder="Vehicle ID *" {...form.register('vehicle_id')} />
            <FieldError name="vehicle_id" />
          </div>

          <div>
            <Input type="datetime-local" {...form.register('log_date')} />
            <FieldError name="log_date" />
          </div>

          <div>
            <Input type="number" step="0.1" placeholder="Odometer *" {...form.register('odometer')} />
            <FieldError name="odometer" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Input type="number" step="0.01" placeholder="Fuel Volume (L) *" {...form.register('fuel_volume')} />
              <FieldError name="fuel_volume" />
            </div>
            <div>
              <Input type="number" step="0.01" placeholder="Price/Litre" {...form.register('price_per_litre')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Input
                type="number"
                step="0.01"
                placeholder={autoTotal ? `Total Cost (auto: ${autoTotal})` : 'Total Cost'}
                {...form.register('total_cost')}
              />
            </div>
            <div>
              <select
                className="w-full rounded-xl border border-slate-200 bg-transparent px-4 py-2 text-sm dark:border-slate-700"
                {...form.register('fuel_type')}
              >
                {FUEL_TYPES.map((ft) => (
                  <option key={ft} value={ft}>{ft}</option>
                ))}
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...form.register('full_tank')} className="rounded" />
            Full Tank
          </label>

          <div>
            <textarea
              className="w-full rounded-xl border border-slate-200 bg-transparent px-4 py-2 text-sm dark:border-slate-700"
              placeholder="Notes (optional)"
              rows={2}
              {...form.register('notes')}
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm hover:border-brand-500 dark:border-slate-600">
              <ImageIcon size={18} className="text-slate-400" />
              <span>{photoBase64 ? 'Photo selected' : 'Attach receipt photo'}</span>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
            {photoBase64 && (
              <img src={photoBase64} alt="Preview" className="mt-2 max-h-32 rounded-lg object-cover" />
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
