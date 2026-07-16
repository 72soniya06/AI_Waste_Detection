import { useMemo, useState } from 'react';
import { Search, Download, Trash2, History, Filter } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input, Select } from '../../components/ui/Input';
import { EmptyState } from '../../components/ui/StatCard';
import { SkeletonRow } from '../../components/ui/Skeleton';
import { useDetections } from '../../lib/useDetections';
import { deleteDetection } from '../../lib/detections';
import { CATEGORIES, getCategory } from '../../lib/categories';
import { formatDateTime, toCSV, downloadFile } from '../../lib/utils';
import { useToast } from '../../lib/toast';

export function HistoryPage() {
  const { detections, loading, reload } = useDetections();
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [source, setSource] = useState('all');

  const filtered = useMemo(() => {
    return detections.filter((d) => {
      if (category !== 'all' && d.category !== category) return false;
      if (source !== 'all' && d.source !== source) return false;
      if (query) {
        const cat = getCategory(d.category);
        const q = query.toLowerCase();
        if (!cat.label.toLowerCase().includes(q) && !d.source.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [detections, query, category, source]);

  function exportCsv() {
    const rows = filtered.map((d) => ({
      timestamp: formatDateTime(d.created_at),
      category: getCategory(d.category).label,
      confidence: Math.round(d.confidence * 100),
      source: d.source,
    }));
    const csv = toCSV(rows);
    downloadFile(csv, 'ecosort-detection-history.csv', 'text/csv');
    toast.success('Exported', `${rows.length} records exported to CSV.`);
  }

  async function onDelete(id: string) {
    const ok = await deleteDetection(id);
    if (ok) {
      toast.success('Deleted', 'Detection removed.');
      void reload();
    }
  }

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Detection History</h1>
          <p className="mt-1 text-sm text-muted">Search, filter and export your past detections.</p>
        </div>
        <Button onClick={exportCsv} variant="outline" leftIcon={<Download className="h-4 w-4" />} disabled={filtered.length === 0}>
          Export CSV
        </Button>
      </div>

      <Card className="mb-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Input
              placeholder="Search by category or source…"
              leftIcon={<Search className="h-4 w-4" />}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="all">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
          </Select>
          <Select value={source} onChange={(e) => setSource(e.target.value)}>
            <option value="all">All sources</option>
            <option value="webcam">Webcam</option>
            <option value="image">Image</option>
            <option value="video">Video</option>
          </Select>
        </div>
        <div className="mt-3 flex items-center gap-2 text-sm text-muted">
          <Filter className="h-4 w-4" />
          {filtered.length} of {detections.length} detections
        </div>
      </Card>

      {loading ? (
        <Card className="p-0">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}
        </Card>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={History}
          title="No detections found"
          description={detections.length === 0 ? "Run a detection from the Live, Image or Video pages to start building your history." : "Try adjusting your search or filters."}
          action={detections.length === 0 ? <a href="/app/live"><Button>Start Detecting</Button></a> : undefined}
        />
      ) : (
        <Card className="overflow-hidden p-0">
          {/* table header */}
          <div className="hidden border-b px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted sm:grid sm:grid-cols-12">
            <span className="col-span-1"></span>
            <span className="col-span-3">Category</span>
            <span className="col-span-2">Confidence</span>
            <span className="col-span-2">Source</span>
            <span className="col-span-3">Timestamp</span>
            <span className="col-span-1 text-right">Action</span>
          </div>
          <ul className="divide-y">
            {filtered.map((d) => {
              const cat = getCategory(d.category);
              return (
                <li key={d.id} className="grid grid-cols-2 gap-3 px-4 py-3 transition hover:bg-slate-50 dark:hover:bg-slate-800/40 sm:grid-cols-12 sm:items-center">
                  <span className="col-span-1 flex h-10 w-10 items-center justify-center rounded-xl text-white" style={{ backgroundColor: cat.color }}>
                    <cat.icon className="h-5 w-5" />
                  </span>
                  <div className="col-span-1 sm:col-span-3">
                    <p className="font-semibold">{cat.label}</p>
                    <Badge tone={cat.recyclable ? 'green' : 'red'} className="mt-0.5">{cat.recyclable ? 'Recyclable' : 'Landfill'}</Badge>
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div className="h-full rounded-full" style={{ width: `${d.confidence * 100}%`, backgroundColor: cat.color }} />
                      </div>
                      <span className="text-sm font-semibold tabular-nums">{Math.round(d.confidence * 100)}%</span>
                    </div>
                  </div>
                  <span className="col-span-1 text-sm capitalize text-muted sm:col-span-2">{d.source}</span>
                  <span className="col-span-1 text-sm text-muted sm:col-span-3">{formatDateTime(d.created_at)}</span>
                  <button
                    onClick={() => onDelete(d.id)}
                    className="col-span-1 justify-self-end rounded-lg p-2 text-muted transition hover:bg-error-50 hover:text-error-600 dark:hover:bg-error-950/40"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </DashboardLayout>
  );
}
