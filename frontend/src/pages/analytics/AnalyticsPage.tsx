import { useMemo, useState } from 'react';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { useCostLog } from '../../hooks/useCostLog';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export const AnalyticsPage = () => {
  const { list: costList } = useCostLog();

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
    costs.forEach((r: any) => {
      const label = r.vehicle?.registration_number || `#${r.vehicle_id}`;
      map[label] = (map[label] || 0) + (r.amount || 0);
    });
    return Object.entries(map).map(([vehicle, total]) => ({ vehicle, total }));
  }, [costs]);

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

    </div>
  );
};
