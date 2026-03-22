import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Modal } from '../../components/ui/modal';
import { Card } from '../../components/ui/card';
import { DataTable } from '../../components/common/DataTable';
import { useFuel } from '../../hooks/useFuel';

const todayISO = () => new Date().toISOString().slice(0, 10);

const schema = z.object({
  vehicle_id: z.coerce.number().int().positive('Vehicle ID is required'),
  log_date: z.string().min(1, 'Date is required'),
  fuel_quantity: z.coerce.number().positive('Must be greater than 0'),
  cost: z.coerce.number().nonnegative('Must be 0 or greater'),
  mileage: z.coerce.number().nonnegative('Must be 0 or greater')
});

type FormData = z.infer<typeof schema>;

export const FuelPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { list, create } = useFuel();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { log_date: todayISO() }
  });

  const trendData = useMemo(() => {
    return (list.data || []).map((x) => ({
      date: x.log_date,
      cost: x.cost,
      qty: x.fuel_quantity
    }));
  }, [list.data]);

  const onSubmit = form.handleSubmit(async (values) => {
    await create.mutateAsync(values);
    form.reset({ log_date: todayISO() });
    setIsOpen(false);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Fuel Management</h1>
        <Button onClick={() => setIsOpen(true)}>Add Fuel Log</Button>
      </div>

      <Card>
        <h2 className="mb-3 text-lg font-semibold">Fuel Cost Trend</h2>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area dataKey="cost" stroke="#365ff8" fill="#8fb2ff" fillOpacity={0.35} />
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
          { key: 'fuel_quantity', header: 'Quantity (L)' },
          { key: 'cost', header: 'Cost' },
          { key: 'fuel_efficiency', header: 'Efficiency' }
        ]}
        data={(list.data || []).map((row) => ({
          id: row.id,
          vehicle: row.vehicle?.registration_number || row.vehicle_id,
          log_date: row.log_date,
          fuel_quantity: row.fuel_quantity,
          cost: row.cost,
          fuel_efficiency: row.fuel_efficiency
        }))}
      />

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Add Fuel Log">
        <form className="space-y-3" onSubmit={onSubmit}>
          <div>
            <Input type="number" placeholder="Vehicle ID *" {...form.register('vehicle_id')} />
            {form.formState.errors.vehicle_id && (
              <p className="mt-1 text-sm text-red-500">{form.formState.errors.vehicle_id.message}</p>
            )}
          </div>
          <div>
            <Input type="date" {...form.register('log_date')} />
            {form.formState.errors.log_date && (
              <p className="mt-1 text-sm text-red-500">{form.formState.errors.log_date.message}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Input type="number" step="0.01" placeholder="Fuel Quantity (L) *" {...form.register('fuel_quantity')} />
              {form.formState.errors.fuel_quantity && (
                <p className="mt-1 text-sm text-red-500">{form.formState.errors.fuel_quantity.message}</p>
              )}
            </div>
            <div>
              <Input type="number" step="0.01" placeholder="Cost *" {...form.register('cost')} />
              {form.formState.errors.cost && (
                <p className="mt-1 text-sm text-red-500">{form.formState.errors.cost.message}</p>
              )}
            </div>
          </div>
          <div>
            <Input type="number" step="0.01" placeholder="Mileage *" {...form.register('mileage')} />
            {form.formState.errors.mileage && (
              <p className="mt-1 text-sm text-red-500">{form.formState.errors.mileage.message}</p>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
