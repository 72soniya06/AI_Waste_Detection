import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Camera,
  CameraOff,
  RefreshCw,
  Square,
  Play,
  Activity,
  Tag,
  Clock,
  Gauge,
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { DetectionOverlay } from '../../components/DetectionOverlay';
import { runInference, type InferenceResult } from '../../lib/inference';
import { getCategory } from '../../lib/categories';
import { saveDetection } from '../../lib/detections';
import { useToast } from '../../lib/toast';
import { formatPercent } from '../../lib/utils';

export function LiveDetectionPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const facingRef = useRef<'environment' | 'user'>('environment');
  const lastSaveRef = useRef(0);

  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fps, setFps] = useState(0);
  const [result, setResult] = useState<InferenceResult | null>(null);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setActive(false);
    setResult(null);
    setFps(0);
  }, []);

  const startCamera = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingRef.current, width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setActive(true);
      toast.success('Camera started', 'Live detection is now running.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not access camera.';
      setError(msg);
      toast.error('Camera error', msg);
    }
  }, [toast]);

  const switchCamera = useCallback(async () => {
    facingRef.current = facingRef.current === 'environment' ? 'user' : 'environment';
    if (active) {
      stopCamera();
      await startCamera();
    }
  }, [active, startCamera, stopCamera]);

  const loop = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(loop);
      return;
    }
    const w = video.videoWidth || 640;
    const h = video.videoHeight || 480;
    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, w, h);

    const t0 = performance.now();
    const res = runInference(canvas, 4);
    const dt = performance.now() - t0;
    setFps(Math.round(1000 / Math.max(dt, 1)));
    setResult(res);

    // save a detection every ~5s
    const now = Date.now();
    if (now - lastSaveRef.current > 5000 && res.totalCount > 0) {
      lastSaveRef.current = now;
      setSaving(true);
      void saveDetection({
        category: res.primaryCategory,
        confidence: res.primaryConfidence,
        source: 'webcam',
        boxes: res.boxes.map((b) => ({ x: b.x, y: b.y, w: b.w, h: b.h, label: b.label, confidence: b.confidence })),
      }).finally(() => setSaving(false));
    }

    rafRef.current = requestAnimationFrame(loop);
  }, []);

  useEffect(() => {
    if (active) rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, loop]);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const primaryCat = result ? getCategory(result.primaryCategory) : null;
  const counts = result
    ? Object.entries(result.counts).sort((a, b) => b[1] - a[1])
    : [];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Live Webcam Detection</h1>
        <p className="mt-1 text-sm text-muted">Point your camera at waste items for real-time AI classification.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* video feed */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden p-0">
            <div className="relative aspect-video bg-slate-900">
              <video
                ref={videoRef}
                playsInline
                muted
                className="h-full w-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />
              {active && result && <DetectionOverlay boxes={result.boxes} />}

              {!active && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center text-slate-400">
                  <Camera className="h-14 w-14" />
                  <div>
                    <p className="font-semibold text-slate-300">Camera is off</p>
                    <p className="text-sm">Press start to begin live detection.</p>
                  </div>
                </div>
              )}

              {active && (
                <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-slate-900/70 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                  LIVE
                </div>
              )}

              {error && (
                <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
                  <div className="rounded-2xl bg-error-600/90 p-6 text-white">
                    <CameraOff className="mx-auto mb-2 h-8 w-8" />
                    <p className="font-semibold">{error}</p>
                    <p className="mt-1 text-sm opacity-90">Check browser permissions and try again.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 border-t p-4">
              {!active ? (
                <Button onClick={startCamera} leftIcon={<Play className="h-4 w-4" />}>Start Camera</Button>
              ) : (
                <Button onClick={stopCamera} variant="danger" leftIcon={<Square className="h-4 w-4" />}>Stop Camera</Button>
              )}
              <Button onClick={switchCamera} variant="outline" leftIcon={<RefreshCw className="h-4 w-4" />}>
                Switch Camera
              </Button>
              {saving && <Badge tone="brand" className="animate-pulse">Saving…</Badge>}
            </div>
          </Card>
        </div>

        {/* live stats */}
        <div className="space-y-4">
          <Card>
            <CardHeader title="Live Metrics" />
            <div className="grid grid-cols-2 gap-4">
              <Metric icon={Gauge} label="FPS" value={fps} color="#10b981" />
              <Metric icon={Tag} label="Detections" value={result?.totalCount ?? 0} color="#3b82f6" />
              <Metric icon={Activity} label="Confidence" value={result ? formatPercent(result.primaryConfidence, 0) : '—'} color="#f59e0b" />
              <Metric icon={Clock} label="Status" value={active ? 'Running' : 'Idle'} color={active ? '#22c55e' : '#64748b'} />
            </div>
          </Card>

          {primaryCat && (
            <Card>
              <CardHeader title="Primary Detection" />
              <div className="flex items-center gap-4">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl text-white" style={{ backgroundColor: primaryCat.color }}>
                  <primaryCat.icon className="h-7 w-7" />
                </span>
                <div>
                  <p className="text-lg font-bold">{primaryCat.label}</p>
                  <p className="text-sm text-muted">{formatPercent(result!.primaryConfidence)} confidence</p>
                  <Badge tone={primaryCat.recyclable ? 'green' : 'red'} className="mt-1">
                    {primaryCat.recyclable ? 'Recyclable' : 'Landfill'}
                  </Badge>
                </div>
              </div>
            </Card>
          )}

          {counts.length > 0 && (
            <Card>
              <CardHeader title="Categories in Frame" />
              <ul className="space-y-2">
                {counts.map(([key, count]) => {
                  const cat = getCategory(key);
                  return (
                    <li key={key} className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm">
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color }} />
                        {cat.label}
                      </span>
                      <span className="text-sm font-semibold">{count}</span>
                    </li>
                  );
                })}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function Metric({ icon: Icon, label, value, color }: { icon: typeof Gauge; label: string; value: string | number; color: string }) {
  return (
    <div className="rounded-xl border p-3">
      <Icon className="h-4 w-4" style={{ color }} />
      <p className="mt-2 text-2xl font-bold tabular-nums">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}
