import { Activity, Car, ReceiptIndianRupee, Wrench } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { StatCard } from '../../components/common/StatCard';
import { useDashboard } from '../../hooks/useDashboard';
import { useAppStore } from '../../store/appStore';
import { ROLE_TASKS_BY_ID } from '../../config/roleTasks';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  Legend
} from 'recharts';

export const DashboardPage = () => {
  const { data, isLoading } = useDashboard();
  const roleId = useAppStore((s) => s.roleId);

  if (isLoading) return <p>Loading dashboard...</p>;

  const overview = data?.overview;
  const currentRoleTasks = roleId != null ? ROLE_TASKS_BY_ID[roleId] : undefined;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Vehicles" value={String(overview?.totalVehicles ?? 0)} icon={Car} />
        <StatCard title="Total Fuel Consumption" value={`${overview?.totalFuelConsumption ?? 0} L`} icon={Activity} />
        <StatCard title="Monthly Expenses" value={`INR ${overview?.monthlyExpenses ?? 0}`} icon={ReceiptIndianRupee} />
        <StatCard title="Active Service Requests" value={String(overview?.activeServiceRequests ?? 0)} icon={Wrench} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 text-lg font-semibold">Fuel Usage Trends</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.charts.fuelTrend || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line dataKey="fuelQuantity" stroke="#365ff8" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 text-lg font-semibold">Electricity vs Water</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.charts.electricityWaterTrend || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="electricity" fill="#2748db" />
                <Bar dataKey="water" fill="#5f89ff" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </section>

      <Card>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <h3 className="text-lg font-semibold">Role-Based Tasks</h3>
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
            {currentRoleTasks?.roleName ?? 'Unknown Role'}
          </span>
        </div>
        <ul className="space-y-2 text-sm text-[var(--muted)]">
          {(currentRoleTasks?.responsibilities ?? ['No role tasks configured for this user.']).map((task) => (
            <li key={task} className="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700">
              {task}
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <h3 className="mb-4 text-lg font-semibold">Recent Activities</h3>
        <ul className="space-y-3">
          {(data?.recentActivities || []).map((activity) => (
            <li key={activity.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800">
              <span>{activity.text}</span>
              <span className="text-xs text-[var(--muted)]">{activity.at}</span>
            </li>
          ))}
        </ul>
      </Card>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 text-lg font-semibold">Most Impactful Capabilities</h3>
          <ul className="space-y-2 text-sm text-[var(--muted)]">
            <li className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800">
              Service and maintenance workflows that reduce downtime and missed SLAs.
            </li>
            <li className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800">
              Inventory and purchasing controls that prevent stockouts and urgent procurement.
            </li>
            <li className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800">
              Role-based security and approvals that strengthen governance and audit readiness.
            </li>
            <li className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800">
              Unified analytics that expose cost trends across fleet, fuel, and utilities.
            </li>
          </ul>
        </Card>

        <Card>
          <h3 className="mb-3 text-lg font-semibold">Best-Use Scenarios</h3>
          <div className="space-y-2 text-sm text-[var(--muted)]">
            <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
              <p className="font-semibold text-slate-700 dark:text-slate-200">Fleet Operations</p>
              <p>Track vehicles, fuel efficiency, service due dates, and driver activity in one place.</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
              <p className="font-semibold text-slate-700 dark:text-slate-200">Maintenance Teams</p>
              <p>Prioritize service tickets, complete tasks faster, and control machine uptime risk.</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
              <p className="font-semibold text-slate-700 dark:text-slate-200">Finance and Management</p>
              <p>Monitor spend, identify cost leakage, and enforce approvals with role-based visibility.</p>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
};
