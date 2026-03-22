import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Modal } from '../../components/ui/modal';
import { DataTable } from '../../components/common/DataTable';
import { useMachineAsset } from '../../hooks/useMachineAsset';

const todayISO = () => new Date().toISOString().slice(0, 10);

const machineSchema = z.object({
  machine_code: z.string().min(2),
  machine_name: z.string().min(2),
  location: z.string().optional(),
  status: z.string().default('Active'),
  last_service_date: z.string().optional(),
  next_service_date: z.string().optional()
});

const assetSchema = z.object({
  asset_tag: z.string().min(2),
  asset_name: z.string().min(2),
  category: z.string().optional(),
  location: z.string().optional(),
  purchase_date: z.string().optional(),
  status: z.string().default('In Use')
});

const historySchema = z.object({
  machine_id: z.coerce.number().positive('Machine ID is required'),
  service_date: z.string().min(1, 'Date is required'),
  description: z.string().optional(),
  service_cost: z.coerce.number().nonnegative('Must be 0 or greater'),
  technician: z.string().optional()
});

const scheduleSchema = z.object({
  machine_id: z.coerce.number().positive('Machine ID is required'),
  due_date: z.string().min(1, 'Date is required'),
  maintenance_type: z.string().min(2, 'Min 2 characters required'),
  priority: z.string().default('Medium'),
  status: z.string().default('Pending')
});

type MachineForm = z.infer<typeof machineSchema>;
type AssetForm = z.infer<typeof assetSchema>;
type HistoryForm = z.infer<typeof historySchema>;
type ScheduleForm = z.infer<typeof scheduleSchema>;

export const MachineAssetPage = () => {
  const [openMachine, setOpenMachine] = useState(false);
  const [openAsset, setOpenAsset] = useState(false);
  const [openHistory, setOpenHistory] = useState(false);
  const [openSchedule, setOpenSchedule] = useState(false);

  const { machines, assets, serviceHistory, schedules, createMachine, createAsset, createServiceHistory, createSchedule } =
    useMachineAsset();

  const machineForm = useForm<MachineForm>({ resolver: zodResolver(machineSchema) });
  const assetForm = useForm<AssetForm>({ resolver: zodResolver(assetSchema) });
  const historyForm = useForm<HistoryForm>({
    resolver: zodResolver(historySchema),
    defaultValues: { service_date: todayISO() }
  });
  const scheduleForm = useForm<ScheduleForm>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: { due_date: todayISO(), priority: 'Medium', status: 'Pending' }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Machine & Asset Management</h1>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setOpenMachine(true)}>Add Machine</Button>
          <Button variant="secondary" onClick={() => setOpenAsset(true)}>Add Asset</Button>
          <Button variant="secondary" onClick={() => setOpenHistory(true)}>Add Service Log</Button>
          <Button variant="secondary" onClick={() => setOpenSchedule(true)}>Add Maintenance Schedule</Button>
        </div>
      </div>

      <Card>
        <h3 className="mb-2 text-lg font-semibold">Machines</h3>
        <DataTable
          columns={[
            { key: 'machine_code', header: 'Code' },
            { key: 'machine_name', header: 'Machine' },
            { key: 'location', header: 'Location' },
            { key: 'status', header: 'Status' },
            { key: 'next_service_date', header: 'Next Service' }
          ]}
          isLoading={machines.isLoading}
          isError={machines.isError}
          data={(machines.data || []).map((m) => ({ ...m, location: m.location || '-', next_service_date: m.next_service_date || '-' }))}
        />
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <h3 className="mb-2 text-lg font-semibold">Assets</h3>
          <DataTable
            columns={[
              { key: 'asset_tag', header: 'Tag' },
              { key: 'asset_name', header: 'Asset' },
              { key: 'category', header: 'Category' },
              { key: 'location', header: 'Location' },
              { key: 'status', header: 'Status' }
            ]}
            isLoading={assets.isLoading}
            isError={assets.isError}
            data={(assets.data || []).map((a) => ({ ...a, category: a.category || '-', location: a.location || '-' }))}
          />
        </Card>

        <Card>
          <h3 className="mb-2 text-lg font-semibold">Maintenance Schedules</h3>
          <DataTable
            columns={[
              { key: 'machine_id', header: 'Machine ID' },
              { key: 'due_date', header: 'Due Date' },
              { key: 'maintenance_type', header: 'Type' },
              { key: 'priority', header: 'Priority' },
              { key: 'status', header: 'Status' }
            ]}
            isLoading={schedules.isLoading}
            isError={schedules.isError}
            data={schedules.data || []}
          />
        </Card>
      </div>

      <Card>
        <h3 className="mb-2 text-lg font-semibold">Service History</h3>
        <DataTable
          columns={[
            { key: 'machine_id', header: 'Machine ID' },
            { key: 'service_date', header: 'Service Date' },
            { key: 'description', header: 'Description' },
            { key: 'service_cost', header: 'Cost' },
            { key: 'technician', header: 'Technician' }
          ]}
          isLoading={serviceHistory.isLoading}
          isError={serviceHistory.isError}
          data={(serviceHistory.data || []).map((h) => ({ ...h, description: h.description || '-', technician: h.technician || '-' }))}
        />
      </Card>

      <Modal isOpen={openMachine} onClose={() => setOpenMachine(false)} title="Add Machine">
        <form
          className="space-y-3"
          onSubmit={machineForm.handleSubmit(async (values) => {
            await createMachine.mutateAsync(values);
            machineForm.reset();
            setOpenMachine(false);
          })}
        >
          <div>
            <Input placeholder="Machine Code *" {...machineForm.register('machine_code')} />
            {machineForm.formState.errors.machine_code && (
              <p className="mt-1 text-sm text-red-500">{machineForm.formState.errors.machine_code.message}</p>
            )}
          </div>
          <div>
            <Input placeholder="Machine Name *" {...machineForm.register('machine_name')} />
            {machineForm.formState.errors.machine_name && (
              <p className="mt-1 text-sm text-red-500">{machineForm.formState.errors.machine_name.message}</p>
            )}
          </div>
          <Input placeholder="Location" {...machineForm.register('location')} />
          <div className="grid grid-cols-2 gap-2">
            <Input type="date" placeholder="Last Service" {...machineForm.register('last_service_date')} />
            <Input type="date" placeholder="Next Service" {...machineForm.register('next_service_date')} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setOpenMachine(false)}>Cancel</Button>
            <Button type="submit" disabled={createMachine.isPending}>
              {createMachine.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={openAsset} onClose={() => setOpenAsset(false)} title="Add Asset">
        <form
          className="space-y-3"
          onSubmit={assetForm.handleSubmit(async (values) => {
            await createAsset.mutateAsync(values);
            assetForm.reset();
            setOpenAsset(false);
          })}
        >
          <div>
            <Input placeholder="Asset Tag *" {...assetForm.register('asset_tag')} />
            {assetForm.formState.errors.asset_tag && (
              <p className="mt-1 text-sm text-red-500">{assetForm.formState.errors.asset_tag.message}</p>
            )}
          </div>
          <div>
            <Input placeholder="Asset Name *" {...assetForm.register('asset_name')} />
            {assetForm.formState.errors.asset_name && (
              <p className="mt-1 text-sm text-red-500">{assetForm.formState.errors.asset_name.message}</p>
            )}
          </div>
          <Input placeholder="Category" {...assetForm.register('category')} />
          <Input placeholder="Location" {...assetForm.register('location')} />
          <Input type="date" {...assetForm.register('purchase_date')} />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setOpenAsset(false)}>Cancel</Button>
            <Button type="submit" disabled={createAsset.isPending}>
              {createAsset.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={openHistory} onClose={() => setOpenHistory(false)} title="Add Service Log">
        <form
          className="space-y-3"
          onSubmit={historyForm.handleSubmit(async (values) => {
            await createServiceHistory.mutateAsync(values);
            historyForm.reset({ service_date: todayISO() });
            setOpenHistory(false);
          })}
        >
          <div>
            <Input type="number" placeholder="Machine ID *" {...historyForm.register('machine_id')} />
            {historyForm.formState.errors.machine_id && (
              <p className="mt-1 text-sm text-red-500">{historyForm.formState.errors.machine_id.message}</p>
            )}
          </div>
          <div>
            <Input type="date" {...historyForm.register('service_date')} />
            {historyForm.formState.errors.service_date && (
              <p className="mt-1 text-sm text-red-500">{historyForm.formState.errors.service_date.message}</p>
            )}
          </div>
          <Input placeholder="Description" {...historyForm.register('description')} />
          <div>
            <Input type="number" step="0.01" placeholder="Service Cost *" {...historyForm.register('service_cost')} />
            {historyForm.formState.errors.service_cost && (
              <p className="mt-1 text-sm text-red-500">{historyForm.formState.errors.service_cost.message}</p>
            )}
          </div>
          <Input placeholder="Technician" {...historyForm.register('technician')} />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setOpenHistory(false)}>Cancel</Button>
            <Button type="submit" disabled={createServiceHistory.isPending}>
              {createServiceHistory.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={openSchedule} onClose={() => setOpenSchedule(false)} title="Add Maintenance Schedule">
        <form
          className="space-y-3"
          onSubmit={scheduleForm.handleSubmit(async (values) => {
            await createSchedule.mutateAsync(values);
            scheduleForm.reset({ due_date: todayISO(), priority: 'Medium', status: 'Pending' });
            setOpenSchedule(false);
          })}
        >
          <div>
            <Input type="number" placeholder="Machine ID *" {...scheduleForm.register('machine_id')} />
            {scheduleForm.formState.errors.machine_id && (
              <p className="mt-1 text-sm text-red-500">{scheduleForm.formState.errors.machine_id.message}</p>
            )}
          </div>
          <div>
            <Input type="date" {...scheduleForm.register('due_date')} />
            {scheduleForm.formState.errors.due_date && (
              <p className="mt-1 text-sm text-red-500">{scheduleForm.formState.errors.due_date.message}</p>
            )}
          </div>
          <div>
            <Input placeholder="Maintenance Type *" {...scheduleForm.register('maintenance_type')} />
            {scheduleForm.formState.errors.maintenance_type && (
              <p className="mt-1 text-sm text-red-500">{scheduleForm.formState.errors.maintenance_type.message}</p>
            )}
          </div>
          <Input placeholder="Priority (e.g. High/Medium/Low)" {...scheduleForm.register('priority')} />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setOpenSchedule(false)}>Cancel</Button>
            <Button type="submit" disabled={createSchedule.isPending}>
              {createSchedule.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
