import { useCallback, useRef, useState } from 'react';
import { Upload, Download, Sparkles, Trash2, Loader2 } from 'lucide-react';
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

export function UploadImagePage() {
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [result, setResult] = useState<InferenceResult | null>(null);
  const [running, setRunning] = useState(false);
  const [dragging, setDragging] = useState(false);
  const toast = useToast();

  const onFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Invalid file', 'Please upload an image file.');
      return;
    }
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setResult(null);
  }, [toast]);

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  }

  function runAnalysis() {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;
    setRunning(true);
    // wait for image decode
    const draw = () => {
      const w = img.naturalWidth || 640;
      const h = img.naturalHeight || 480;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, w, h);
      const res = runInference(canvas, 5);
      setResult(res);
      setRunning(false);
      toast.success('Analysis complete', `${res.totalCount} object(s) detected.`);
      void saveDetection({
        category: res.primaryCategory,
        confidence: res.primaryConfidence,
        source: 'image',
        boxes: res.boxes.map((b) => ({ x: b.x, y: b.y, w: b.w, h: b.h, label: b.label, confidence: b.confidence })),
      });
    };
    if (img.complete) draw();
    else img.onload = draw;
  }

  function downloadResult() {
    const canvas = canvasRef.current;
    if (!canvas || !result) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // redraw boxes permanently
    result.boxes.forEach((b) => {
      ctx.strokeStyle = b.color;
      ctx.lineWidth = 3;
      ctx.strokeRect(b.x * canvas.width, b.y * canvas.height, b.w * canvas.width, b.h * canvas.height);
      ctx.fillStyle = b.color;
      ctx.fillRect(b.x * canvas.width, b.y * canvas.height - 24, ctx.measureText(b.label).width + 60, 24);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(`${b.label} ${formatPercent(b.confidence, 0)}`, b.x * canvas.width + 6, b.y * canvas.height - 6);
    });
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ecosort-result.png';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Downloaded', 'Result image saved.');
    });
  }

  function reset() {
    setImageUrl(null);
    setResult(null);
  }

  const counts = result ? Object.entries(result.counts).sort((a, b) => b[1] - a[1]) : [];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Upload Image Detection</h1>
        <p className="mt-1 text-sm text-muted">Upload an image of waste to run AI classification with bounding boxes.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {!imageUrl ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              className="flex min-h-[400px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center transition"
              style={{ borderColor: dragging ? '#10b981' : undefined }}
              onClick={() => document.getElementById('img-input')?.click()}
            >
              <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950/50">
                <Upload className="h-8 w-8" />
              </span>
              <p className="text-lg font-semibold">Drag & drop an image here</p>
              <p className="mt-1 text-sm text-muted">or click to browse · PNG, JPG, WEBP</p>
              <input id="img-input" type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
            </div>
          ) : (
            <Card className="overflow-hidden p-0">
              <div className="relative bg-slate-900">
                <img ref={imgRef} src={imageUrl} alt="Upload" className="mx-auto max-h-[500px] w-full object-contain" />
                <canvas ref={canvasRef} className="hidden" />
                {result && <DetectionOverlay boxes={result.boxes} />}
                {running && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50">
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 border-t p-4">
                <Button onClick={runAnalysis} loading={running} leftIcon={<Sparkles className="h-4 w-4" />}>
                  Run Inference
                </Button>
                {result && (
                  <Button onClick={downloadResult} variant="outline" leftIcon={<Download className="h-4 w-4" />}>
                    Download Result
                  </Button>
                )}
                <Button onClick={reset} variant="ghost" leftIcon={<Trash2 className="h-4 w-4" />}>
                  Clear
                </Button>
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Detection Results" />
            {!result ? (
              <p className="py-8 text-center text-sm text-muted">Upload an image and run inference to see results.</p>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-xl bg-brand-50 p-3 dark:bg-brand-950/40">
                  <span className="text-sm font-medium">Objects detected</span>
                  <span className="text-2xl font-bold text-brand-600">{result.totalCount}</span>
                </div>
                <ul className="space-y-2">
                  {counts.map(([key, count]) => {
                    const cat = getCategory(key);
                    return (
                      <li key={key} className="flex items-center justify-between rounded-xl border p-3">
                        <span className="flex items-center gap-2">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg text-white" style={{ backgroundColor: cat.color }}>
                            <cat.icon className="h-4 w-4" />
                          </span>
                          <div>
                            <p className="text-sm font-semibold">{cat.label}</p>
                            <Badge tone={cat.recyclable ? 'green' : 'red'} className="mt-0.5">{cat.recyclable ? 'Recyclable' : 'Landfill'}</Badge>
                          </div>
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
