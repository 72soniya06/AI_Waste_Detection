import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from './Card';
import { cn } from '../../lib/utils';

type StatCardProps = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
  trend?: { value: string; up: boolean };
  loading?: boolean;
};

export function StatCard({ label, value, icon: Icon, color = '#10b981', trend, loading }: StatCardProps) {
  return (
    <Card hover className="relative overflow-hidden">
      <div
        className="absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-10 blur-2xl"
        style={{ backgroundColor: color }}
      />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted">{label}</p>
          {loading ? (
            <div className="mt-2 h-8 w-24 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
          ) : (
            <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
          )}
          {trend && !loading && (
            <p
              className={cn(
                'mt-2 flex items-center gap-1 text-xs font-semibold',
                trend.up ? 'text-brand-600' : 'text-error-600',
              )}
            >
              {trend.up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              {trend.value}
            </p>
          )}
        </div>
        <span
          className="flex h-12 w-12 items-center justify-center rounded-2xl"
          style={{ backgroundColor: `${color}1a`, color }}
        >
          <Icon className="h-6 w-6" />
        </span>
      </div>
    </Card>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-12 text-center">
      <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
        <Icon className="h-8 w-8" />
      </span>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
