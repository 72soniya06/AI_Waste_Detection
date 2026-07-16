import { useCallback, useRef, useState } from 'react';
import { Film, Download, Sparkles, Trash2, Loader2 } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { runInference, type InferenceResult } from '../../lib/inference';
import { getCategory } from '../../lib/categories';
import { saveDetection } from '../../lib/detections';
import { useToast } from '../../lib/toast';
import { formatPercent, formatNumber } from '../../lib/utils';

export function UploadVideoPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<InferenceResult[]>([]);
  const [dragging, setDragging] = useState(false);
  const toast = useToast();

  const onFile = useCallback((file: File) => {
    if (!file.type.startsWith('video/')) {
      toast.error('Invalid file', 'Please upload an MP4 video.');
      return;
    }
    setVideoUrl(URL.createObjectURL(file));
    setResults([]);
    setProgress(0);
  }, [toast]);

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  }

  async function processVideo() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    setProcessing(true);
    setResults([]);

    const duration = video.duration || 10;
    const sampleCount = 12;
    const interval = duration / sampleCount;
    const collected: InferenceResult[] = [];

    for (let i = 0; i < sampleCount; i++) {
      const t = Math.min(interval * (i + 0.5), duration - 0.1);
      await seekTo(video, t);
      const w = video.videoWidth || 640;
      const h = video.videoHeight || 480;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) continue;
      ctx.drawImage(video, 0, 0, w, h);
      const res = runInference(canvas, 4);
      collected.push(res);
      setProgress(Math.round(((i + 1) / sampleCount) * 100));
      // save each sampled detection
      if (res.totalCount > 0) {
        await saveDetection({
          category: res.primaryCategory,
          confidence: res.primaryConfidence,
          source: 'video',
          boxes: res.boxes.map((b) => ({ x: b.x, y: b.y, w: b.w, h: b.h, label: b.label, confidence: b.confidence })),
        });
      }
      // yield to UI
      await new Promise((r) => setTimeout(r, 30));
    }

    setResults(collected);
    setProcessing(false);
    toast.success('Processing complete', `${collected.length} frames analysed.`);
  }

  function reset() {
    setVideoUrl(null);
    setResults([]);
    setProgress(0);
  }

  // aggregate results
  const totalCounts = results.reduce<Record<string, number>>((acc, r) => {
    for (const [k, v] of Object.entries(r.counts)) acc[k] = (acc[k] ?? 0) + v;
    return acc;
  }, {});
  const sortedCounts = Object.entries(totalCounts).sort((a, b) => b[1] - a[1]);
  const totalDetections = results.reduce((s, r) => s + r.totalCount, 0);
  const avgConfidence = results.length
    ? results.reduce((s, r) => s + r.primaryConfidence, 0) / results.length
    : 0;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Upload Video Detection</h1>
        <p className="mt-1 text-sm text-muted">Upload an MP4 video to process frames and detect waste across the clip.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {!videoUrl ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              className="flex min-h-[400px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center transition"
              style={{ borderColor: dragging ? '#10b981' : undefined }}
              onClick={() => document.getElementById('vid-input')?.click()}
            >
              <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950/50">
                <Film className="h-8 w-8" />
              </span>
              <p className="text-lg font-semibold">Drag & drop a video here</p>
              <p className="mt-1 text-sm text-muted">or click to browse · MP4, WebM</p>
              <input id="vid-input" type="file" accept="video/*" className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
            </div>
          ) : (
            <Card className="overflow-hidden p-0">
              <div className="relative bg-slate-900">
                <video ref={videoRef} src={videoUrl} controls className="mx-auto max-h-[500px] w-full object-contain" />
                <canvas ref={canvasRef} className="hidden" />
                {processing && (
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <div className="flex items-center gap-3 rounded-xl bg-slate-900/80 p-3 text-white backdrop-blur">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <div className="flex-1">
                        <div className="h-2 overflow-hidden rounded-full bg-white/20">
                          <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                      <span className="text-sm font-semibold tabular-nums">{progress}%</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 border-t p-4">
                <Button onClick={processVideo} loading={processing} leftIcon={<Sparkles className="h-4 w-4" />}>
                  Process Video
                </Button>
                {results.length > 0 && (
                  <Button variant="outline" leftIcon={<Download className="h-4 w-4" />} onClick={() => toast.info('Export ready', 'Sampled frame detections exported to your history.')}>
                    Download Output
                  </Button>
                )}
                <Button onClick={reset} variant="ghost" leftIcon={<Trash2 className="h-4 w-4" />}>Clear</Button>
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Video Summary" />
            {results.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted">Upload and process a video to see results.</p>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-brand-50 p-3 dark:bg-brand-950/40">
                    <p className="text-2xl font-bold text-brand-600">{formatNumber(totalDetections)}</p>
                    <p className="text-xs text-muted">Total detections</p>
                  </div>
                  <div className="rounded-xl bg-accent-50 p-3 dark:bg-accent-950/40">
                    <p className="text-2xl font-bold text-accent-600">{results.length}</p>
                    <p className="text-xs text-muted">Frames analysed</p>
                  </div>
                  <div className="col-span-2 rounded-xl border p-3">
                    <p className="text-2xl font-bold">{formatPercent(avgConfidence)}</p>
                    <p className="text-xs text-muted">Average confidence</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {sortedCounts.map(([key, count]) => {
                    const cat = getCategory(key);
                    return (
                      <li key={key} className="flex items-center justify-between rounded-xl border p-3">
                        <span className="flex items-center gap-2">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg text-white" style={{ backgroundColor: cat.color }}>
                            <cat.icon className="h-4 w-4" />
                          </span>
                          <span className="text-sm font-semibold">{cat.label}</span>
                        </span>
                        <span className="text-sm font-bold">×{count}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

function seekTo(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise((resolve) => {
    const onSeeked = () => {
      video.removeEventListener('seeked', onSeeked);
      resolve();
    };
    video.addEventListener('seeked', onSeeked);
    video.currentTime = time;
  });
}
