import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { MapPin, Clock, CheckCircle, Pencil } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Modal } from '../../components/ui/modal';
import { DataTable } from '../../components/common/DataTable';
import { useAttendance } from '../../hooks/useAttendance';
import type { AttendanceRecord } from '../../types';

const todayISO = () => new Date().toISOString().slice(0, 10);
const nowTime = () => new Date().toTimeString().slice(0, 5);

const schema = z.object({
  attendance_date: z.string().min(1),
  check_in: z.string().optional(),
  check_out: z.string().optional(),
  status: z.enum(['Present', 'Absent', 'Leave']),
  location: z.string().optional()
});

type FormData = z.infer<typeof schema>;

export const AttendancePage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<AttendanceRecord | null>(null);
  const [locationLabel, setLocationLabel] = useState<string>('Detecting location...');
  const [locationLoading, setLocationLoading] = useState(false);
  const { records, monthlySummary, markAttendance, updateAttendance } = useAttendance();

  // --- Mark (create) form ---
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'Present', attendance_date: todayISO(), check_in: nowTime() }
  });

  // --- Edit (update) form ---
  const editForm = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'Present' }
  });

  // Auto-detect location when create modal opens
  useEffect(() => {
    if (!isOpen) return;
    form.setValue('attendance_date', todayISO());
    form.setValue('check_in', nowTime());

    if (!navigator.geolocation) {
      setLocationLabel('Geolocation not supported');
      form.setValue('location', 'Unknown');
      return;
    }

    setLocationLoading(true);
    setLocationLabel('Detecting location...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const label = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
        setLocationLabel(label);
        form.setValue('location', label);
        setLocationLoading(false);
      },
      () => {
        setLocationLabel('Location unavailable');
        form.setValue('location', 'Location unavailable');
        setLocationLoading(false);
      },
      { timeout: 8000, maximumAge: 0 }
    );
  }, [isOpen, form]);

  // Pre-fill edit form when a record is selected
  useEffect(() => {
    if (!editRecord) return;
    editForm.reset({
      attendance_date: editRecord.attendance_date ? editRecord.attendance_date.slice(0, 10) : todayISO(),
      check_in: editRecord.check_in || '',
      check_out: editRecord.check_out || '',
      status: editRecord.status,
      location: editRecord.location || ''
    });
  }, [editRecord, editForm]);

  const openEdit = (record: AttendanceRecord) => setEditRecord(record);
  const closeEdit = () => setEditRecord(null);

  const openModal = () => setIsOpen(true);
  const closeModal = () => {
    setIsOpen(false);
    form.reset({ status: 'Present', attendance_date: todayISO(), check_in: nowTime() });
  };

  const tableData = (records.data || []).map((r) => ({
    ...r,
    attendance_date: r.attendance_date ? r.attendance_date.slice(0, 10) : '-',
    check_in: r.check_in || '-',
    check_out: r.check_out || '-',
    location: r.location || '-'
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Attendance System</h1>
        <Button onClick={openModal}>Mark Attendance</Button>
      </div>

      <Card>
        <h3 className="mb-2 text-lg font-semibold">Daily Attendance Records</h3>
        <DataTable
          isLoading={records.isLoading}
          isError={records.isError}
          columns={[
            { key: 'user_email', header: 'User' },
            { key: 'attendance_date', header: 'Date' },
            { key: 'check_in', header: 'Check In' },
            { key: 'check_out', header: 'Check Out' },
            { key: 'status', header: 'Status' },
            { key: 'location', header: 'Location' }
          ]}
          data={tableData}
          actions={(row) => (
            <button
              className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-brand-600 hover:bg-brand-50 border border-brand-200"
              onClick={() => {
                const original = (records.data || []).find((r) => r.id === (row as AttendanceRecord).id);
                if (original) openEdit(original);
              }}
            >
              <Pencil size={12} /> Edit
            </button>
          )}
        />
      </Card>

      <Card>
        <h3 className="mb-2 text-lg font-semibold">Monthly Summary</h3>
        <DataTable
          isLoading={monthlySummary.isLoading}
          isError={monthlySummary.isError}
          columns={[
            { key: 'user_email', header: 'User' },
            { key: 'presentDays', header: 'Present Days' },
            { key: 'absentDays', header: 'Absent Days' }
          ]}
          data={monthlySummary.data || []}
        />
      </Card>

      {/* ── Mark Attendance Modal ── */}
      <Modal isOpen={isOpen} onClose={closeModal} title="Mark Attendance">
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit(async (values) => {
            await markAttendance.mutateAsync(values);
            closeModal();
          })}
        >
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Clock size={15} className="text-brand-500 shrink-0" />
              <span className="font-medium">Check-in Time:</span>
              <span className="font-mono text-slate-800">{form.watch('check_in') || nowTime()}</span>
              <span className="ml-auto text-xs text-slate-400 italic">Auto-detected</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <MapPin size={15} className={`shrink-0 ${locationLoading ? 'animate-pulse text-amber-500' : 'text-brand-500'}`} />
              <span className="font-medium">Location:</span>
              <span className="text-slate-800 text-xs break-all">{locationLabel}</span>
              <span className="ml-auto text-xs text-slate-400 italic">Auto-detected</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Date</label>
            <div className="mt-1 flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
              <CheckCircle size={14} className="text-green-500" />
              {form.watch('attendance_date')}
              <span className="ml-auto text-xs text-slate-400 italic">Today (auto)</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Check-out Time (optional)</label>
            <input
              type="time"
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
              {...form.register('check_out')}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Status</label>
            <select
              className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400"
              {...form.register('status')}
            >
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Leave">Leave</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button type="submit" disabled={markAttendance.isPending || locationLoading}>
              {markAttendance.isPending ? 'Saving...' : 'Save Attendance'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Edit Attendance Modal ── */}
      <Modal isOpen={!!editRecord} onClose={closeEdit} title="Edit Attendance Record">
        <form
          className="space-y-4"
          onSubmit={editForm.handleSubmit(async (values) => {
            if (!editRecord) return;
            await updateAttendance.mutateAsync({ id: editRecord.id, ...values });
            closeEdit();
          })}
        >
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Date</label>
            <div className="mt-1 flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
              <CheckCircle size={14} className="text-green-500" />
              {editForm.watch('attendance_date')}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">User</label>
            <div className="mt-1 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
              {editRecord?.user_email || editRecord?.user_id || '-'}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Check-in Time</label>
            <input
              type="time"
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
              {...editForm.register('check_in')}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Check-out Time</label>
            <input
              type="time"
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
              {...editForm.register('check_out')}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Status</label>
            <select
              className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400"
              {...editForm.register('status')}
            >
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Leave">Leave</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Location</label>
            <input
              type="text"
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
              placeholder="e.g. 6.92720, 79.86128"
              {...editForm.register('location')}
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="secondary" onClick={closeEdit}>Cancel</Button>
            <Button type="submit" disabled={updateAttendance.isPending}>
              {updateAttendance.isPending ? 'Updating...' : 'Update Attendance'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

