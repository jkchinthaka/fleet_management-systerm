import { useMemo, useState } from 'react';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { useRefuel } from '../../hooks/useRefuel';
import { useCostLog } from '../../hooks/useCostLog';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export const AnalyticsPage = () => {
  const { list: refuelList } = useRefuel();
  const { list: costList } = useCostLog();

  const refuels = useMemo(() => refuelList.data || [], [refuelList.data]);
  const costs = useMemo(() => costList.data || [], [costList.data]);

  /* ── Trip Calculator ── */
  const [calc, setCalc] = useState({ distance: '', litres: '', price: '' });
  const calcResult = useMemo(() => {
    const d = parseFloat(calc.distance);
    const l = parseFloat(calc.litres);
    const p = parseFloat(calc.price);
    if (!d || !l) return null;
    const efficiency = d / l;
    const costPerKm = l && p ? (l * p) / d : 0;
    return { efficiency: efficiency.toFixed(2), costPerKm: costPerKm.toFixed(2), totalCost: (l * (p || 0)).toFixed(2) };
  }, [calc]);

  /* ── Fuel trend: cost + volume per month ── */
  const fuelTrend = useMemo(() => {
    const map: Record<string, { month: string; cost: number; volume: number }> = {};
    refuels.forEach((r) => {
      const m = new Date(r.log_date).toISOString().slice(0, 7);
      if (!map[m]) map[m] = { month: m, cost: 0, volume: 0 };
      map[m].cost += r.total_cost || 0;
      map[m].volume += r.fuel_volume || 0;
    });
    return Object.values(map).sort((a, b) => a.month.localeCompare(b.month));
  }, [refuels]);

  /* ── Cost breakdown by type ── */
  const costByType = useMemo(() => {
    const map: Record<string, number> = {};
    costs.forEach((c) => {
      map[c.cost_type] = (map[c.cost_type] || 0) + c.amount;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [costs]);

  /* ── Cost per vehicle ── */
  const costPerVehicle = useMemo(() => {
    const map: Record<string, number> = {};
    [...refuels, ...costs].forEach((r: any) => {
      const label = r.vehicle?.registration_number || `#${r.vehicle_id}`;
      map[label] = (map[label] || 0) + (r.total_cost || r.amount || 0);
    });
    return Object.entries(map).map(([vehicle, total]) => ({ vehicle, total }));
  }, [refuels, costs]);

  /* ── Anomaly detection (simple: flag refuels > 2 std devs from mean) ── */
  const anomalies = useMemo(() => {
    if (refuels.length < 3) return [];
    const amounts = refuels.map((r) => r.total_cost || 0);
    const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const std = Math.sqrt(amounts.reduce((s, v) => s + (v - mean) ** 2, 0) / amounts.length);
    const threshold = mean + 2 * std;
    return refuels.filter((r) => (r.total_cost || 0) > threshold);
  }, [refuels]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics &amp; Calculator</h1>

      {/* Trip Cost Calculator */}
      <Card>
        <h2 className="mb-3 text-lg font-semibold">Trip Cost Calculator</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Input type="number" placeholder="Distance (km)" value={calc.distance} onChange={(e) => setCalc((p) => ({ ...p, distance: e.target.value }))} />
          <Input type="number" placeholder="Litres used" value={calc.litres} onChange={(e) => setCalc((p) => ({ ...p, litres: e.target.value }))} />
          <Input type="number" placeholder="Price per litre" value={calc.price} onChange={(e) => setCalc((p) => ({ ...p, price: e.target.value }))} />
        </div>
        {calcResult && (
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-indigo-50 p-3 text-center dark:bg-indigo-900/30">
              <p className="text-sm text-slate-500">Fuel Efficiency</p>
              <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{calcResult.efficiency} km/L</p>
            </div>
            <div className="rounded-lg bg-amber-50 p-3 text-center dark:bg-amber-900/30">
              <p className="text-sm text-slate-500">Cost per km</p>
              <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{calcResult.costPerKm}</p>
            </div>
            <div className="rounded-lg bg-green-50 p-3 text-center dark:bg-green-900/30">
              <p className="text-sm text-slate-500">Total Cost</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">{calcResult.totalCost}</p>
            </div>
          </div>
        )}
      </Card>

      {/* Fuel Trend Chart */}
      <Card>
        <h2 className="mb-3 text-lg font-semibold">Monthly Fuel Trend</h2>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={fuelTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="cost" name="Cost" stroke="#6366f1" strokeWidth={2} />
              <Line yAxisId="right" type="monotone" dataKey="volume" name="Volume (L)" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Cost Breakdown Pie */}
        <Card>
          <h2 className="mb-3 text-lg font-semibold">Cost Breakdown by Type</h2>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={costByType} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {costByType.map((_entry, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Cost per Vehicle */}
        <Card>
          <h2 className="mb-3 text-lg font-semibold">Total Cost per Vehicle</h2>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costPerVehicle}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="vehicle" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Anomaly Detection */}
      {anomalies.length > 0 && (
        <Card>
          <h2 className="mb-3 text-lg font-semibold text-red-600 dark:text-red-400">Anomaly Alerts</h2>
          <p className="mb-2 text-sm text-slate-500">Refuel entries with unusually high cost (more than 2 standard deviations above average).</p>
          <div className="space-y-2">
            {anomalies.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-lg border border-red-200 px-4 py-2 dark:border-red-800">
                <span>Refuel #{a.id} &middot; Vehicle #{a.vehicle_id}</span>
                <span className="font-semibold text-red-600">{a.total_cost?.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
