import { useState } from 'react';
import { BarChart3, TrendingUp, Leaf, Calendar, Download } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { StatCard } from '../../components/ui/StatCard';
import { DonutChart, ChartLegend } from '../../components/charts/DonutChart';
import { LineChart } from '../../components/charts/LineChart';
import { BarChart } from '../../components/charts/BarChart';
import { useDetections } from '../../lib/useDetections';
import { computeStats, weeklyTrend, monthlyTrend, dailyTrend } from '../../lib/analytics';
import { formatNumber, downloadFile, toCSV } from '../../lib/utils';
import { useToast } from '../../lib/toast';

export function AnalyticsPage() {
  const { detections } = useDetections();
  const toast = useToast();
  const [range, setRange] = useState<'week' | 'month' | '14d'>('week');

  const stats = computeStats(detections);
  const week = weeklyTrend(detections);
  const month = monthlyTrend(detections);
  const fortnight = dailyTrend(detections, 14);
  const trendData = range === 'week' ? week : range === 'month' ? month : fortnight;

  const pieData = stats.byCategory
    .filter((c) => c.count > 0)
    .map((c) => ({ label: c.label, value: c.count, color: c.color }));

  const barData = stats.byCategory
    .filter((c) => c.count > 0)
    .map((c) => ({ label: c.label, value: c.count, color: c.color }));

  function exportReport() {
    const rows = stats.byCategory.map((c) => ({
      category: c.label,
      detections: c.count,
      percentage: stats.total ? Math.round((c.count / stats.total) * 100) : 0,
    }));
    const csv = toCSV(rows);
    downloadFile(csv, 'ecosort-analytics.csv', 'text/csv');
    toast.success('Exported', 'Analytics data downloaded as CSV.');
  }

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="mt-1 text-sm text-muted">Deep dive into your detection patterns and recycling performance.</p>
        </div>
        <Button onClick={exportReport} variant="outline" leftIcon={<Download className="h-4 w-4" />}>Export Data</Button>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Detections" value={formatNumber(stats.total)} icon={BarChart3} color="#10b981" />
        <StatCard label="Recyclable Rate" value={stats.total ? `${Math.round((stats.recyclable / stats.total) * 100)}%` : '0%'} icon={TrendingUp} color="#22c55e" />
        <StatCard label="CO₂ Saved (kg)" value={stats.co2SavedKg} icon={Leaf} color="#3b82f6" />
        <StatCard label="Material Diverted (kg)" value={stats.estimatedRecycledKg} icon={Calendar} color="#f59e0b" />
      </div>

      <Card className="mb-6">
        <CardHeader
          title="Detection Trend"
          subtitle="Detections over time"
          action={
            <div className="flex gap-1 rounded-xl border p-1">
              {(['week', '14d', 'month'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${range === r ? 'bg-brand-600 text-white' : 'text-muted hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                  {r === 'week' ? '7 days' : r === '14d' ? '14 days' : '6 months'}
                </button>
              ))}
            </div>
          }
        />
        <LineChart data={trendData} />
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Category Distribution" subtitle="Share of detections by waste type" />
          {pieData.length > 0 ? (
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-around">
              <DonutChart data={pieData} centerValue={formatNumber(stats.total)} centerLabel="Total" />
              <ChartLegend data={pieData} />
            </div>
          ) : (
            <EmptyChart />
          )}
        </Card>
        <Card>
          <CardHeader title="Category Statistics" subtitle="Detection count per category" />
          {barData.length > 0 ? (
            <BarChart data={barData} horizontal />
          ) : (
            <EmptyChart />
          )}
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader title="Recycling Performance" subtitle="Breakdown of recyclable vs non-recyclable waste" />
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border p-5 text-center">
            <p className="text-4xl font-bold text-brand-600">{formatNumber(stats.recyclable)}</p>
            <p className="mt-1 text-sm text-muted">Recyclable items</p>
            <Badge tone="green" className="mt-2">{stats.total ? Math.round((stats.recyclable / stats.total) * 100) : 0}% of total</Badge>
          </div>
          <div className="rounded-2xl border p-5 text-center">
            <p className="text-4xl font-bold text-error-500">{formatNumber(stats.nonRecyclable)}</p>
            <p className="mt-1 text-sm text-muted">Non-recyclable items</p>
            <Badge tone="red" className="mt-2">{stats.total ? Math.round((stats.nonRecyclable / stats.total) * 100) : 0}% of total</Badge>
          </div>
          <div className="rounded-2xl border p-5 text-center">
            <p className="text-4xl font-bold text-accent-600">{stats.co2SavedKg}</p>
            <p className="mt-1 text-sm text-muted">kg CO₂ saved</p>
            <Badge tone="blue" className="mt-2">Estimated</Badge>
          </div>
        </div>
      </Card>
    </DashboardLayout>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-48 flex-col items-center justify-center text-center">
      <BarChart3 className="mb-3 h-10 w-10 text-slate-300 dark:text-slate-700" />
      <p className="text-sm font-medium text-muted">No data yet</p>
      <p className="mt-1 text-xs text-muted">Run detections to populate analytics.</p>
    </div>
  );
}
