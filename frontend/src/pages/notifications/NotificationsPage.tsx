import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { DataTable } from '../../components/common/DataTable';
import { useNotifications } from '../../hooks/useNotifications';

export const NotificationsPage = () => {
  const { notifications, thresholds, runEngine, markRead } = useNotifications();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notifications & Alerts</h1>
        <Button onClick={() => runEngine.mutate()}>Run Alert Engine</Button>
      </div>

      <Card>
        <h3 className="mb-2 text-lg font-semibold">Active Alert Thresholds</h3>
        <DataTable
          columns={[
            { key: 'module', header: 'Module' },
            { key: 'metric_key', header: 'Metric' },
            { key: 'comparison_operator', header: 'Operator' },
            { key: 'threshold_value', header: 'Threshold' }
          ]}
          isLoading={thresholds.isLoading}
          isError={thresholds.isError}
          data={thresholds.data || []}
        />
      </Card>

      <Card>
        <h3 className="mb-2 text-lg font-semibold">Notification Stream</h3>
        <div className="space-y-2">
          {(notifications.data || []).map((n) => (
            <div key={n.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-3 dark:border-slate-700">
              <div>
                <p className="font-semibold">{n.title}</p>
                <p className="text-sm text-[var(--muted)]">{n.message}</p>
                <p className="text-xs text-[var(--muted)]">{n.module} | {n.severity}</p>
              </div>
              {!n.is_read && (
                <Button variant="secondary" onClick={() => markRead.mutate(n.id)}>
                  Mark Read
                </Button>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
