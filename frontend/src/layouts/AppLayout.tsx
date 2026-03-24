import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Bell, LayoutDashboard, LogOut, Moon, Sun, Truck, Droplets, Boxes, Cpu, CalendarDays, Wrench, Users, Receipt, Clock, BarChart3, Fuel } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/appStore';
import { cn } from '../utils/cn';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/vehicles', label: 'Vehicles', icon: Truck },
  { to: '/utility', label: 'Utility', icon: Droplets },
  { to: '/inventory', label: 'Inventory', icon: Boxes },
  { to: '/machine-asset', label: 'Machine & Asset', icon: Cpu },
  { to: '/attendance', label: 'Attendance', icon: CalendarDays },
  { to: '/service', label: 'Service', icon: Wrench },
  { to: '/refuel', label: 'Refuel', icon: Fuel },
  { to: '/cost-logs', label: 'Cost Logs', icon: Receipt },
  { to: '/reminders', label: 'Reminders', icon: Clock },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/users', label: 'Users', icon: Users },
  { to: '/notifications', label: 'Notifications', icon: Bell }
];

export const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const isDark = useAppStore((s) => s.isDark);
  const roleId = useAppStore((s) => s.roleId);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const setToken = useAppStore((s) => s.setToken);
  const navigate = useNavigate();
  const visibleNavItems = navItems.filter((item) => item.to !== '/users' || roleId === 1);

  const handleLogout = () => {
    setToken(null);
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen">
      <aside className={cn('border-r border-slate-200 bg-[var(--card)] p-4 transition-all dark:border-slate-800', collapsed ? 'w-20' : 'w-64')}>
        <button className="mb-4 text-sm text-brand-600" onClick={() => setCollapsed((v) => !v)}>
          {collapsed ? 'Expand' : 'Collapse'}
        </button>
        <Link to="/" className="mb-8 block text-xl font-bold text-brand-700">
          {collapsed ? 'FM' : 'FleetMatrix'}
        </Link>
        <nav className="space-y-1">
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 rounded-xl px-3 py-2 text-sm',
                  isActive ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                )
              }
            >
              <item.icon size={16} />
              {!collapsed && item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-[var(--card)] px-6 py-4 dark:border-slate-800">
          <input
            placeholder="Search vehicles, assets, service tickets..."
            className="w-full max-w-lg rounded-xl border border-slate-200 bg-transparent px-4 py-2 text-sm dark:border-slate-700"
          />
          <div className="ml-4 flex items-center gap-3">
            <button className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={toggleTheme}>
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
              <Bell size={18} />
            </button>
            <div className="h-9 w-9 rounded-full bg-brand-600" />
            <button
              onClick={handleLogout}
              title="Logout"
              className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-red-50 hover:text-red-600 dark:text-slate-300 dark:hover:bg-red-900/30 dark:hover:text-red-400"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        <motion.main
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex-1 p-6"
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
};
