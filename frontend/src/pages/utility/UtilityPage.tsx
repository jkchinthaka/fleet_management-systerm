import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Modal } from '../../components/ui/modal';
import { DataTable } from '../../components/common/DataTable';
import { useUtility } from '../../hooks/useUtility';
import { formatLkr } from '../../utils/currency';

const schema = z.object({
  reading_date: z.string().min(1, 'Date is required'),
  meter_location: z.string().min(2, 'Location must be at least 2 characters'),
  units_consumed: z.coerce.number().positive('Must be greater than 0'),
  cost: z.coerce.number().nonnegative('Must be 0 or greater')
});

type FormData = z.infer<typeof schema>;

interface UtilityRow {
  id: number;
  reading_date: string;
  meter_location: string;
  units_consumed: number;
  cost: number;
}

const todayISO = () => new Date().toISOString().split('T')[0];

export const UtilityPage = () => {
  const [openWater, setOpenWater] = useState(false);
  const [openElectricity, setOpenElectricity] = useState(false);
  const [editWater, setEditWater] = useState<UtilityRow | null>(null);
  const [editElectricity, setEditElectricity] = useState<UtilityRow | null>(null);

  const { water, electricity, comparison, createWater, createElectricity, updateWater, updateElectricity } = useUtility();

  const waterForm = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { reading_date: todayISO() }
  });
  const electricityForm = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { reading_date: todayISO() }
  });
  const editWaterForm = useForm<FormData>({ resolver: zodResolver(schema) });
  const editElectricityForm = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (editWater) {
      editWaterForm.reset({
        reading_date: editWater.reading_date?.split('T')[0] ?? editWater.reading_date,
        meter_location: editWater.meter_location,
        units_consumed: editWater.units_consumed,
        cost: editWater.cost
      });
    }
  }, [editWater]);

  useEffect(() => {
    if (editElectricity) {
      editElectricityForm.reset({
        reading_date: editElectricity.reading_date?.split('T')[0] ?? editElectricity.reading_date,
        meter_location: editElectricity.meter_location,
        units_consumed: editElectricity.units_consumed,
        cost: editElectricity.cost
      });
    }
  }, [editElectricity]);

  const submitWater = waterForm.handleSubmit(async (values) => {
    try {
      await createWater.mutateAsync(values);
      waterForm.reset({ reading_date: todayISO() });
      setOpenWater(false);
    } catch {
      // Error toast handled in hook.
    }
  });

  const submitElectricity = electricityForm.handleSubmit(async (values) => {
    try {
      await createElectricity.mutateAsync(values);
      electricityForm.reset({ reading_date: todayISO() });
      setOpenElectricity(false);
    } catch {
      // Error toast handled in hook.
    }
  });

  const submitEditWater = editWaterForm.handleSubmit(async (values) => {
    if (!editWater) return;
    try {
      await updateWater.mutateAsync({ id: editWater.id, ...values });
      setEditWater(null);
    } catch {
      // Error toast handled in hook.
    }
  });

  const submitEditElectricity = editElectricityForm.handleSubmit(async (values) => {
    if (!editElectricity) return;
    try {
      await updateElectricity.mutateAsync({ id: editElectricity.id, ...values });
      setEditElectricity(null);
    } catch {
      // Error toast handled in hook.
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Water & Electricity Monitoring</h1>
        <div className="flex gap-2">
          <Button onClick={() => setOpenWater(true)}>Add Water Reading</Button>
          <Button onClick={() => setOpenElectricity(true)} variant="secondary">
            Add Electricity Reading
          </Button>
        </div>
      </div>

      <Card>
        <h2 className="mb-3 text-lg font-semibold">Consumption & Cost Comparison</h2>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={comparison.data || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value, name) => {
                if (String(name).toLowerCase().includes('cost')) {
                  return formatLkr(Number(value));
                }
                return value;
              }} />
              <Legend />
              <Line dataKey="waterUnits" stroke="#00a3a3" strokeWidth={2} />
              <Line dataKey="electricityUnits" stroke="#365ff8" strokeWidth={2} />
              <Line dataKey="waterCost" stroke="#16a34a" strokeDasharray="4 4" />
              <Line dataKey="electricityCost" stroke="#f97316" strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <div>
          <h3 className="mb-2 text-lg font-semibold">Water Readings</h3>
          <DataTable
            columns={[
              { key: 'reading_date', header: 'Date', render: (v) => String(v ?? '').split('T')[0] },
              { key: 'meter_location', header: 'Location' },
              { key: 'units_consumed', header: 'Units' },
              { key: 'cost', header: 'Cost (Rs.)', render: (v) => formatLkr(Number(v)) }
            ]}
            isLoading={water.isLoading}
            isError={water.isError}
            data={(water.data || []) as unknown as Record<string, unknown>[]}
            actions={(row) => (
              <button
                className="flex items-center gap-1 rounded px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                onClick={() => setEditWater(row as unknown as UtilityRow)}
              >
                <Pencil size={12} /> Edit
              </button>
            )}
          />
        </div>

        <div>
          <h3 className="mb-2 text-lg font-semibold">Electricity Readings</h3>
          <DataTable
            columns={[
              { key: 'reading_date', header: 'Date', render: (v) => String(v ?? '').split('T')[0] },
              { key: 'meter_location', header: 'Location' },
              { key: 'units_consumed', header: 'Units' },
              { key: 'cost', header: 'Cost (Rs.)', render: (v) => formatLkr(Number(v)) }
            ]}
            isLoading={electricity.isLoading}
            isError={electricity.isError}
            data={(electricity.data || []) as unknown as Record<string, unknown>[]}
            actions={(row) => (
              <button
                className="flex items-center gap-1 rounded px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                onClick={() => setEditElectricity(row as unknown as UtilityRow)}
              >
                <Pencil size={12} /> Edit
              </button>
            )}
          />
        </div>
      </div>

      {/* Add Water Modal */}
      <Modal isOpen={openWater} onClose={() => setOpenWater(false)} title="Add Water Reading">
        <form className="space-y-3" onSubmit={submitWater}>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Reading Date</label>
            <Input type="date" {...waterForm.register('reading_date')} />
            {waterForm.formState.errors.reading_date && (
              <p className="mt-1 text-xs text-red-500">{waterForm.formState.errors.reading_date.message}</p>
            )}
          </div>
          <div>
            <Input placeholder="Meter Location" {...waterForm.register('meter_location')} />
            {waterForm.formState.errors.meter_location && (
              <p className="mt-1 text-xs text-red-500">{waterForm.formState.errors.meter_location.message}</p>
            )}
          </div>
          <div>
            <Input type="number" step="0.01" placeholder="Units Consumed" {...waterForm.register('units_consumed')} />
            {waterForm.formState.errors.units_consumed && (
              <p className="mt-1 text-xs text-red-500">{waterForm.formState.errors.units_consumed.message}</p>
            )}
          </div>
          <div>
            <Input type="number" step="0.01" placeholder="Cost" {...waterForm.register('cost')} />
            {waterForm.formState.errors.cost && (
              <p className="mt-1 text-xs text-red-500">{waterForm.formState.errors.cost.message}</p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setOpenWater(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createWater.isPending}>
              {createWater.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Electricity Modal */}
      <Modal isOpen={openElectricity} onClose={() => setOpenElectricity(false)} title="Add Electricity Reading">
        <form className="space-y-3" onSubmit={submitElectricity}>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Reading Date</label>
            <Input type="date" {...electricityForm.register('reading_date')} />
            {electricityForm.formState.errors.reading_date && (
              <p className="mt-1 text-xs text-red-500">{electricityForm.formState.errors.reading_date.message}</p>
            )}
          </div>
          <div>
            <Input placeholder="Meter Location" {...electricityForm.register('meter_location')} />
            {electricityForm.formState.errors.meter_location && (
              <p className="mt-1 text-xs text-red-500">{electricityForm.formState.errors.meter_location.message}</p>
            )}
          </div>
          <div>
            <Input type="number" step="0.01" placeholder="Units Consumed" {...electricityForm.register('units_consumed')} />
            {electricityForm.formState.errors.units_consumed && (
              <p className="mt-1 text-xs text-red-500">{electricityForm.formState.errors.units_consumed.message}</p>
            )}
          </div>
          <div>
            <Input type="number" step="0.01" placeholder="Cost" {...electricityForm.register('cost')} />
            {electricityForm.formState.errors.cost && (
              <p className="mt-1 text-xs text-red-500">{electricityForm.formState.errors.cost.message}</p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setOpenElectricity(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createElectricity.isPending}>
              {createElectricity.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Water Modal */}
      <Modal isOpen={!!editWater} onClose={() => setEditWater(null)} title="Edit Water Reading">
        <form className="space-y-3" onSubmit={submitEditWater}>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Reading Date</label>
            <Input type="date" {...editWaterForm.register('reading_date')} />
            {editWaterForm.formState.errors.reading_date && (
              <p className="mt-1 text-xs text-red-500">{editWaterForm.formState.errors.reading_date.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Meter Location</label>
            <Input placeholder="Meter Location" {...editWaterForm.register('meter_location')} />
            {editWaterForm.formState.errors.meter_location && (
              <p className="mt-1 text-xs text-red-500">{editWaterForm.formState.errors.meter_location.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Units Consumed</label>
            <Input type="number" step="0.01" placeholder="Units Consumed" {...editWaterForm.register('units_consumed')} />
            {editWaterForm.formState.errors.units_consumed && (
              <p className="mt-1 text-xs text-red-500">{editWaterForm.formState.errors.units_consumed.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Cost</label>
            <Input type="number" step="0.01" placeholder="Cost" {...editWaterForm.register('cost')} />
            {editWaterForm.formState.errors.cost && (
              <p className="mt-1 text-xs text-red-500">{editWaterForm.formState.errors.cost.message}</p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setEditWater(null)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateWater.isPending}>
              {updateWater.isPending ? 'Saving...' : 'Update'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Electricity Modal */}
      <Modal isOpen={!!editElectricity} onClose={() => setEditElectricity(null)} title="Edit Electricity Reading">
        <form className="space-y-3" onSubmit={submitEditElectricity}>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Reading Date</label>
            <Input type="date" {...editElectricityForm.register('reading_date')} />
            {editElectricityForm.formState.errors.reading_date && (
              <p className="mt-1 text-xs text-red-500">{editElectricityForm.formState.errors.reading_date.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Meter Location</label>
            <Input placeholder="Meter Location" {...editElectricityForm.register('meter_location')} />
            {editElectricityForm.formState.errors.meter_location && (
              <p className="mt-1 text-xs text-red-500">{editElectricityForm.formState.errors.meter_location.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Units Consumed</label>
            <Input type="number" step="0.01" placeholder="Units Consumed" {...editElectricityForm.register('units_consumed')} />
            {editElectricityForm.formState.errors.units_consumed && (
              <p className="mt-1 text-xs text-red-500">{editElectricityForm.formState.errors.units_consumed.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Cost</label>
            <Input type="number" step="0.01" placeholder="Cost" {...editElectricityForm.register('cost')} />
            {editElectricityForm.formState.errors.cost && (
              <p className="mt-1 text-xs text-red-500">{editElectricityForm.formState.errors.cost.message}</p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setEditElectricity(null)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateElectricity.isPending}>
              {updateElectricity.isPending ? 'Saving...' : 'Update'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
