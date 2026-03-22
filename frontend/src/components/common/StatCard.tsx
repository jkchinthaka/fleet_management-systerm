import { Card } from '../ui/card';
import type { LucideIcon } from 'lucide-react';

type Props = {
  title: string;
  value: string;
  icon: LucideIcon;
};

export const StatCard = ({ title, value, icon: Icon }: Props) => (
  <Card className="relative overflow-hidden">
    <div className="absolute -right-5 -top-5 h-24 w-24 rounded-full bg-brand-100/70 dark:bg-brand-500/20" />
    <div className="relative flex items-center justify-between">
      <div>
        <p className="text-sm text-[var(--muted)]">{title}</p>
        <p className="mt-1 text-2xl font-bold">{value}</p>
      </div>
      <div className="rounded-xl bg-brand-600 p-2 text-white">
        <Icon size={18} />
      </div>
    </div>
  </Card>
);
