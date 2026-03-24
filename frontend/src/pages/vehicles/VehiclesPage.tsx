import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Modal } from '../../components/ui/modal';
import { DataTable } from '../../components/common/DataTable';
import { Card } from '../../components/ui/card';
import { useVehicles } from '../../hooks/useVehicles';
import { useVehicleDocuments } from '../../hooks/useVehicleDocuments';

const schema = z.object({
  registration_number: z.string().min(3, 'Min 3 characters required'),
  make: z.string().optional(),
  model: z.string().optional(),
  year: z.preprocess(
    (v) => (!v || v === '') ? undefined : Number(v),
    z.number().int().min(1980).max(2100).optional()
  ),
  status: z.string().default('Active'),
  branch: z.string().optional()
});

type FormData = z.infer<typeof schema>;

type Tab = 'details' | 'service' | 'documents';

export const VehiclesPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDocOpen, setIsDocOpen] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [tab, setTab] = useState<Tab>('details');
  const { list, create } = useVehicles();
  const { list: docList, create: docCreate, remove: docRemove } = useVehicleDocuments(selectedVehicleId);

  const docForm = useForm<{ document_type: string; document_number: string; expiry_date: string }>({
    defaultValues: { document_type: '', document_number: '', expiry_date: '' }
  });

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'Active' }
  });

  const selectedVehicle = useMemo(
    () => list.data?.find((v) => v.id === selectedVehicleId) ?? null,
    [list.data, selectedVehicleId]
  );

  const onSubmit = form.handleSubmit(async (values) => {
    await create.mutateAsync(values);
    form.reset();
    setIsOpen(false);
  });

  const onDocSubmit = docForm.handleSubmit(async (values) => {
    await docCreate.mutateAsync({
      document_type: values.document_type,
      document_number: values.document_number || undefined,
      expiry_date: values.expiry_date || undefined
    });
    docForm.reset();
    setIsDocOpen(false);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Vehicle Management</h1>
        <Button onClick={() => setIsOpen(true)}>Add Vehicle</Button>
      </div>

      <DataTable
        isLoading={list.isLoading}
        isError={list.isError}
        columns={[
          { key: 'id', header: 'ID' },
          { key: 'registration_number', header: 'Registration' },
          { key: 'make', header: 'Make' },
          { key: 'model', header: 'Model' },
          { key: 'status', header: 'Status' },
          { key: 'branch', header: 'Branch' }
        ]}
        data={(list.data || []).map((v) => ({
          ...v,
          registration_number: v.registration_number,
          make: v.make || '-',
          model: v.model || '-',
          status: v.status || '-',
          branch: v.branch || '-'
        }))}
      />

      <Card>
        <h2 className="mb-3 text-lg font-semibold">Vehicle Profile</h2>
        <div className="mb-4 flex flex-wrap gap-2">
          {(list.data || []).slice(0, 8).map((v) => (
            <button
              key={v.id}
              onClick={() => { setSelectedVehicleId(v.id); setTab('details'); }}
              className={`rounded-lg border px-3 py-2 text-sm ${selectedVehicleId === v.id ? 'border-brand-600 bg-brand-50 font-medium dark:bg-brand-900/20' : 'border-slate-300 dark:border-slate-700'}`}
            >
              {v.registration_number}
            </button>
          ))}
        </div>

        {!selectedVehicle && <p className="text-sm text-[var(--muted)]">Select a vehicle to view profile tabs.</p>}

        {selectedVehicle && (
          <>
            <div className="mb-3 flex gap-2">
              {(['details', 'service', 'documents'] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`rounded-lg px-3 py-1 text-sm ${tab === t ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}
                >
                  {t}
                </button>
              ))}
            </div>

            {tab === 'details' && (
              <div className="text-sm space-y-1">
                <p><span className="font-medium">Registration:</span> {selectedVehicle.registration_number}</p>
                <p><span className="font-medium">Make / Model:</span> {selectedVehicle.make || '-'} {selectedVehicle.model || ''}</p>
                <p><span className="font-medium">Year:</span> {selectedVehicle.year ?? '-'}</p>
                <p><span className="font-medium">Status:</span> {selectedVehicle.status || '-'}</p>
                <p><span className="font-medium">Branch:</span> {selectedVehicle.branch || '-'}</p>
                <p><span className="font-medium">Last Service:</span> {selectedVehicle.last_service_date ? new Date(selectedVehicle.last_service_date).toLocaleDateString() : '-'}</p>
              </div>
            )}

            {tab === 'service' && (
              <div className="text-sm space-y-2">
                <p className="text-[var(--muted)]">
                  Manage all service requests in the{' '}
                  <a href="/service" className="text-brand-600 underline hover:no-underline">
                    Service module
                  </a>
                  .
                </p>
              </div>
            )}

            {tab === 'documents' && (
              <div className="space-y-3">
                <div className="flex justify-end">
                  <Button onClick={() => setIsDocOpen(true)}>+ Add Document</Button>
                </div>
                <DataTable
                  isLoading={docList.isLoading}
                  isError={docList.isError}
                  columns={[
                    { key: 'document_type', header: 'Type' },
                    { key: 'document_number', header: 'Document #' },
                    { key: 'expiry_date', header: 'Expiry' },
                    { key: '_actions', header: '' }
                  ]}
                  data={(docList.data || []).map((d) => ({
                    ...d,
                    expiry_date: d.expiry_date ? new Date(d.expiry_date).toLocaleDateString() : '-',
                    document_number: d.document_number || '-',
                    _actions: (
                      <button
                        onClick={() => docRemove.mutate(d.id)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    )
                  }))}
                />
              </div>
            )}
          </>
        )}
      </Card>

      {/* Add Vehicle Modal */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Create Vehicle">
        <form className="space-y-3" onSubmit={onSubmit}>
          <div>
            <Input placeholder="Registration Number *" {...form.register('registration_number')} />
            {form.formState.errors.registration_number && (
              <p className="mt-1 text-sm text-red-500">{form.formState.errors.registration_number.message}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Make" {...form.register('make')} />
            <Input placeholder="Model" {...form.register('model')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Input type="number" placeholder="Year (e.g. 2020)" {...form.register('year')} />
              {form.formState.errors.year && (
                <p className="mt-1 text-sm text-red-500">{form.formState.errors.year.message}</p>
              )}
            </div>
            <Input placeholder="Branch" {...form.register('branch')} />
          </div>
          <Input placeholder="Status" {...form.register('status')} />
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

      {/* Add Document Modal */}
      <Modal isOpen={isDocOpen} onClose={() => setIsDocOpen(false)} title="Add Vehicle Document">
        <form className="space-y-3" onSubmit={onDocSubmit}>
          <div>
            <Input placeholder="Document Type (e.g. Insurance, Permit) *" {...docForm.register('document_type', { required: true })} />
          </div>
          <Input placeholder="Document Number" {...docForm.register('document_number')} />
          <div>
            <label className="mb-1 block text-xs text-[var(--muted)]">Expiry Date</label>
            <Input type="date" {...docForm.register('expiry_date')} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsDocOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={docCreate.isPending}>
              {docCreate.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
