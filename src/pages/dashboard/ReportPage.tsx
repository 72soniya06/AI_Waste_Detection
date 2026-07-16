import { Leaf, Download, Recycle, Cloud, Trash2, Factory, ArrowRight } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { StatCard } from '../../components/ui/StatCard';
import { DonutChart, ChartLegend } from '../../components/charts/DonutChart';
import { useDetections } from '../../lib/useDetections';
import { computeStats } from '../../lib/analytics';
import { CATEGORIES } from '../../lib/categories';
import { useToast } from '../../lib/toast';
import { downloadFile, formatNumber } from '../../lib/utils';
import { useAuth } from '../../lib/auth';

export function ReportPage() {
  const { detections } = useDetections();
  const { profile } = useAuth();
  const toast = useToast();
  const stats = computeStats(detections);

  const pieData = stats.byCategory
    .filter((c) => c.count > 0)
    .map((c) => ({ label: c.label, value: c.count, color: c.color }));

  const treesEquivalent = Math.round(stats.co2SavedKg / 21); // ~21kg CO2 per tree per year
  const carKmSaved = Math.round(stats.co2SavedKg * 8); // ~8km per kg CO2

  function downloadReport() {
    const lines = [
      'ECOSORT AI — SUSTAINABILITY REPORT',
      '=====================================',
      `Generated: ${new Date().toLocaleString()}`,
      `Organization: ${profile?.organization || 'Individual'}`,
      '',
      'SUMMARY',
      '-------',
      `Total detections: ${stats.total}`,
      `Recyclable items: ${stats.recyclable}`,
      `Non-recyclable items: ${stats.nonRecyclable}`,
      `Estimated material recycled: ${stats.estimatedRecycledKg} kg`,
      `CO2 emissions saved: ${stats.co2SavedKg} kg`,
      `Equivalent to: ${treesEquivalent} trees absorbing CO2 for a year`,
      `Equivalent to: ${carKmSaved} km of car travel avoided`,
      '',
      'CATEGORY BREAKDOWN',
      '------------------',
      ...stats.byCategory.map((c) => `${c.label}: ${c.count} detections`),
    ].join('\n');
    downloadFile(lines, 'ecosort-sustainability-report.txt', 'text/plain');
    toast.success('Report downloaded', 'Your sustainability report has been saved.');
  }

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sustainability Report</h1>
          <p className="mt-1 text-sm text-muted">Track your environmental impact and download shareable reports.</p>
        </div>
        <Button onClick={downloadReport} leftIcon={<Download className="h-4 w-4" />}>Download Report</Button>
      </div>

      {/* hero impact card */}
      <Card className="mb-6 overflow-hidden border-brand-200 bg-gradient-to-br from-brand-600 to-brand-800 text-white dark:border-brand-800">
        <div className="relative">
          <div className="absolute inset-0 bg-grid-dark bg-[size:32px_32px] opacity-20" />
          <div className="relative grid gap-6 sm:grid-cols-3">
            <div>
              <Leaf className="mb-3 h-8 w-8 text-brand-200" />
              <p className="text-4xl font-extrabold">{stats.co2SavedKg}</p>
              <p className="text-sm text-brand-100">kg CO₂ emissions saved</p>
            </div>
            <div>
              <Recycle className="mb-3 h-8 w-8 text-brand-200" />
              <p className="text-4xl font-extrabold">{stats.estimatedRecycledKg}</p>
              <p className="text-sm text-brand-100">kg waste diverted from landfill</p>
            </div>
            <div>
              <Cloud className="mb-3 h-8 w-8 text-brand-200" />
              <p className="text-4xl font-extrabold">{treesEquivalent}</p>
              <p className="text-sm text-brand-100">trees worth of CO₂ absorbed</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Plastic Recycled" value={`${(stats.plastic * 0.12).toFixed(1)} kg`} icon={Recycle} color="#3b82f6" />
        <StatCard label="CO₂ Saved" value={`${stats.co2SavedKg} kg`} icon={Leaf} color="#10b981" />
        <StatCard label="Landfill Diverted" value={`${stats.recyclable} items`} icon={Trash2} color="#f59e0b" />
        <StatCard label="Car km Avoided" value={formatNumber(carKmSaved)} icon={Factory} color="#8b5cf6" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Waste Diverted by Category" subtitle="Recyclable material breakdown" />
          {pieData.length > 0 ? (
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-around">
              <DonutChart data={pieData} centerValue={formatNumber(stats.recyclable)} centerLabel="Recyclable" />
              <ChartLegend data={pieData} />
            </div>
          ) : (
            <EmptyChart />
          )}
        </Card>

        <Card>
          <CardHeader title="Environmental Equivalents" subtitle="What your impact means in real terms" />
          <ul className="space-y-3">
            {[
              { icon: Leaf, label: 'Trees absorbing CO₂ for a year', value: `${treesEquivalent} trees`, color: '#10b981' },
              { icon: Cloud, label: 'Kilometres of car travel avoided', value: `${formatNumber(carKmSaved)} km`, color: '#3b82f6' },
              { icon: Recycle, label: 'Plastic bottles equivalent', value: `${Math.round(stats.plastic * 6)} bottles`, color: '#f59e0b' },
              { icon: Factory, label: 'Smartphone charges powered', value: `${formatNumber(Math.round(stats.co2SavedKg * 125))}`, color: '#8b5cf6' },
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-4 rounded-xl border p-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl text-white" style={{ backgroundColor: item.color }}>
                  <item.icon className="h-5 w-5" />
                </span>
                <div className="flex-1">
                  <p className="text-sm text-muted">{item.label}</p>
                  <p className="text-lg font-bold">{item.value}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted" />
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader title="Category Impact Details" subtitle="Per-category recycling contribution and CO₂ savings" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wider text-muted">
                <th className="pb-3 pr-4">Category</th>
                <th className="pb-3 pr-4">Detections</th>
                <th className="pb-3 pr-4">Recyclable</th>
                <th className="pb-3 pr-4">CO₂ Factor (kg/kg)</th>
                <th className="pb-3">Est. CO₂ Saved (kg)</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {CATEGORIES.map((c) => {
                const count = stats.byCategory.find((b) => b.key === c.key)?.count ?? 0;
                const kg = count * 0.12;
                const co2 = kg * c.co2PerKg;
                return (
                  <tr key={c.key} className="transition hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 pr-4">
                      <span className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: c.color }} />
                        <span className="font-medium">{c.label}</span>
                      </span>
                    </td>
                    <td className="py-3 pr-4 tabular-nums">{count}</td>
                    <td className="py-3 pr-4">
                      <Badge tone={c.recyclable ? 'green' : 'red'}>{c.recyclable ? 'Yes' : 'No'}</Badge>
                    </td>
                    <td className="py-3 pr-4 tabular-nums">{c.co2PerKg}</td>
                    <td className="py-3 tabular-nums font-semibold">{co2.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </DashboardLayout>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-48 flex-col items-center justify-center text-center">
      <Leaf className="mb-3 h-10 w-10 text-slate-300 dark:text-slate-700" />
      <p className="text-sm font-medium text-muted">No data yet</p>
      <p className="mt-1 text-xs text-muted">Run detections to generate your report.</p>
    </div>
  );
}
