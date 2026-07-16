import { Link } from 'react-router-dom';
import {
  Recycle,
  Trash2,
  Camera,
  CalendarDays,
  Leaf,
  Package,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { StatCard } from '../../components/ui/StatCard';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { DonutChart, ChartLegend } from '../../components/charts/DonutChart';
import { LineChart } from '../../components/charts/LineChart';
import { BarChart } from '../../components/charts/BarChart';
import { useDetections } from '../../lib/useDetections';
import { computeStats, weeklyTrend } from '../../lib/analytics';
import { getCategory } from '../../lib/categories';
import { formatNumber, timeAgo } from '../../lib/utils';
import { SkeletonCard } from '../../components/ui/Skeleton';

export function DashboardPage() {
  const { detections, loading } = useDetections();
  const stats = computeStats(detections);
  const trend = weeklyTrend(detections);
  const recent = detections.slice(0, 6);

  const pieData = stats.byCategory
    .filter((c) => c.count > 0)
    .slice(0, 6)
    .map((c) => ({ label: c.label, value: c.count, color: c.color }));

  const barData = stats.byCategory
    .filter((c) => c.count > 0)
    .slice(0, 6)
    .map((c) => ({ label: c.label, value: c.count, color: c.color }));

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted">Overview of your waste detection activity and sustainability impact.</p>
        </div>
        <Link to="/app/live">
          <Button leftIcon={<Camera className="h-4 w-4" />}>Start Live Detection</Button>
        </Link>
      </div>

      {/* stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard label="Total Detections" value={formatNumber(stats.total)} icon={Recycle} color="#10b981" trend={{ value: '+12% this week', up: true }} />
            <StatCard label="Plastic Detected" value={formatNumber(stats.plastic)} icon={Package} color="#3b82f6" />
            <StatCard label="Recyclable" value={formatNumber(stats.recyclable)} icon={Leaf} color="#22c55e" trend={{ value: '+8%', up: true }} />
            <StatCard label="Non-Recyclable" value={formatNumber(stats.nonRecyclable)} icon={Trash2} color="#ef4444" />
            <StatCard label="Today's Activity" value={formatNumber(stats.today)} icon={CalendarDays} color="#f59e0b" />
            <StatCard label="Est. Recycled (kg)" value={stats.estimatedRecycledKg} icon={Recycle} color="#8b5cf6" />
          </>
        )}
      </div>

      {/* charts */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Weekly Detection Trend" subtitle="Detections over the last 7 days" action={<Badge tone="brand">+12%</Badge>} />
          <LineChart data={trend} />
        </Card>
        <Card>
          <CardHeader title="Waste Distribution" subtitle="By category" />
          {pieData.length > 0 ? (
            <div className="flex flex-col items-center gap-4">
              <DonutChart data={pieData} centerValue={formatNumber(stats.total)} centerLabel="Total" />
              <ChartLegend data={pieData} />
            </div>
          ) : (
            <EmptyChart />
          )}
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Category Statistics" subtitle="Detections per waste category" />
          {barData.length > 0 ? (
            <BarChart data={barData} />
          ) : (
            <EmptyChart />
          )}
        </Card>

        {/* recent activity */}
        <Card>
          <CardHeader
            title="Recent Activity"
            action={
              <Link to="/app/history" className="text-sm font-medium text-brand-600 hover:text-brand-700">
                View all
              </Link>
            }
          />
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
              ))}
            </div>
          ) : recent.length > 0 ? (
            <ul className="space-y-2">
              {recent.map((d) => {
                const cat = getCategory(d.category);
                return (
                  <li key={d.id} className="flex items-center gap-3 rounded-xl p-2.5 transition hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white" style={{ backgroundColor: cat.color }}>
                      <cat.icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{cat.label}</p>
                      <p className="truncate text-xs text-muted">{timeAgo(d.created_at)} · {d.source}</p>
                    </div>
                    <Badge tone="brand">{Math.round(d.confidence * 100)}%</Badge>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyChart />
          )}
        </Card>
      </div>

      {/* sustainability banner */}
      <Card className="mt-6 overflow-hidden border-brand-200 bg-gradient-to-r from-brand-50 to-accent-50 dark:border-brand-800 dark:from-brand-950/40 dark:to-accent-950/30">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-glow">
              <Leaf className="h-7 w-7" />
            </span>
            <div>
              <p className="flex items-center gap-2 text-lg font-bold">
                You've saved an estimated {stats.co2SavedKg} kg of CO₂
                <Sparkles className="h-4 w-4 text-brand-600" />
              </p>
              <p className="text-sm text-muted">
                {stats.estimatedRecycledKg} kg of material diverted from landfill across {stats.recyclable} recyclable detections.
              </p>
            </div>
          </div>
          <Link to="/app/report">
            <Button variant="subtle" rightIcon={<ArrowRight className="h-4 w-4" />}>View Report</Button>
          </Link>
        </div>
      </Card>
    </DashboardLayout>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-48 flex-col items-center justify-center text-center">
      <Recycle className="mb-3 h-10 w-10 text-slate-300 dark:text-slate-700" />
      <p className="text-sm font-medium text-muted">No detections yet</p>
      <p className="mt-1 text-xs text-muted">Run a detection to see your analytics here.</p>
    </div>
  );
}
