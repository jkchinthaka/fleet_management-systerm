import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import {
  DashboardPage,
  VehiclesPage,
  UtilityPage,
  InventoryPage,
  MachineAssetPage,
  AttendancePage,
  NotificationsPage,
  LoginPage,
  ServicePage,
  UsersPage,
  RefuelPage,
  CostLogPage,
  RemindersPage,
  AnalyticsPage
} from './pages';
import { Toaster } from './components/common/Toaster';
import { useAppStore } from './store/appStore';

const ProtectedOutlet = () => {
  const token = useAppStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return <AppLayout />;
};

export default function App() {
  const roleId = useAppStore((s) => s.roleId);

  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedOutlet />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/vehicles" element={<VehiclesPage />} />
          <Route path="/utility" element={<UtilityPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/machine-asset" element={<MachineAssetPage />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/service" element={<ServicePage />} />
          <Route path="/users" element={roleId === 1 ? <UsersPage /> : <Navigate to="/" replace />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/refuel" element={<RefuelPage />} />
          <Route path="/cost-logs" element={<CostLogPage />} />
          <Route path="/reminders" element={<RemindersPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  );
}
