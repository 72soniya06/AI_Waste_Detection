import { CATEGORIES, CATEGORY_MAP } from './categories';

/**
 * Client-side waste inference engine.
 *
 * In production this logic lives in a YOLOv8 model running on the FastAPI
 * backend (see backend/). In the browser we approximate it with a real
 * color-spatial analysis pipeline so the demo produces genuine bounding boxes
 * and confidence scores from the actual pixel data of the camera/image feed.
 */

export type InferenceBox = {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  category: string;
  color: string;
  confidence: number;
};

export type InferenceResult = {
  boxes: InferenceBox[];
  primaryCategory: string;
  primaryConfidence: number;
  counts: Record<string, number>;
  totalCount: number;
};

type CategoryScores = Record<string, number>;

const CATEGORY_COLORS: Record<string, number[]> = {
  plastic: [200, 220, 240], // light translucent blue
  paper: [235, 210, 160], // warm beige
  cardboard: [180, 130, 70], // brown
  glass: [120, 220, 200], // teal/cyan translucent
  metal: [180, 185, 195], // silver/gray
  organic: [90, 170, 80], // green
  ewaste: [60, 60, 70], // dark
  other: [200, 80, 70], // red
};

function colorDistance(r: number, g: number, b: number, target: number[]): number {
  const dr = r - target[0];
  const dg = g - target[1];
  const db = b - target[2];
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function classifyPixel(r: number, g: number, b: number): string {
  let bestKey = 'other';
  let bestDist = Infinity;
  for (const [key, target] of Object.entries(CATEGORY_COLORS)) {
    const d = colorDistance(r, g, b, target);
    if (d < bestDist) {
      bestDist = d;
      bestKey = key;
    }
  }
  return bestKey;
}

function analyzeRegion(
  data: Uint8ClampedArray,
  width: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
): CategoryScores {
  const scores: CategoryScores = {};
  for (const c of CATEGORIES) scores[c.key] = 0;
  let total = 0;

  const step = Math.max(1, Math.floor((x1 - x0) / 24));
  for (let y = y0; y < y1; y += step) {
    for (let x = x0; x < x1; x += step) {
      const i = (y * width + x) * 4;
      if (i + 3 >= data.length) continue;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      if (a < 32) continue;
      const key = classifyPixel(r, g, b);
      scores[key] += 1;
      total += 1;
    }
  }

  if (total === 0) return scores;
  for (const key of Object.keys(scores)) scores[key] /= total;
  return scores;
}

function topCategory(scores: CategoryScores): { key: string; score: number } {
  let key = 'other';
  let score = 0;
  for (const [k, s] of Object.entries(scores)) {
    if (s > score) {
      score = s;
      key = k;
    }
  }
  return { key, score };
}

/**
 * Run a grid-based detection pass over the canvas pixel data.
 * Divides the frame into a grid of candidate regions, classifies each, and
 * merges neighbouring regions of the same category into bounding boxes.
 */
export function runInference(
  canvas: HTMLCanvasElement,
  grid = 4,
): InferenceResult {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    return emptyResult();
  }
  const width = canvas.width;
  const height = canvas.height;
  const imageData = ctx.getImageData(0, 0, width, height);

  const cellW = Math.floor(width / grid);
  const cellH = Math.floor(height / grid);
  const cells: { x: number; y: number; w: number; h: number; key: string; score: number }[] = [];

  for (let gy = 0; gy < grid; gy++) {
    for (let gx = 0; gx < grid; gx++) {
      const x0 = gx * cellW;
      const y0 = gy * cellH;
      const x1 = gx === grid - 1 ? width : (gx + 1) * cellW;
      const y1 = gy === grid - 1 ? height : (gy + 1) * cellH;
      const scores = analyzeRegion(imageData.data, width, x0, y0, x1, y1);
      const { key, score } = topCategory(scores);
      if (key !== 'other' && score > 0.32) {
        cells.push({ x: x0, y: y0, w: x1 - x0, h: y1 - y0, key, score });
      }
    }
  }

  // Merge adjacent cells of same category.
  const merged = mergeCells(cells);

  const boxes: InferenceBox[] = merged.map((m) => {
    const cat = CATEGORY_MAP[m.key] ?? CATEGORY_MAP.other;
    const confidence = clampConfidence(0.45 + m.score * 0.5);
    return {
      x: m.x / width,
      y: m.y / height,
      w: m.w / width,
      h: m.h / height,
      label: cat.label,
      category: m.key,
      color: cat.color,
      confidence,
    };
  });

  const counts: Record<string, number> = {};
  let primaryScore = 0;
  let primaryCategory = 'other';
  for (const box of boxes) {
    counts[box.category] = (counts[box.category] ?? 0) + 1;
    if (box.confidence > primaryScore) {
      primaryScore = box.confidence;
      primaryCategory = box.category;
    }
  }

  if (boxes.length === 0) {
    // Fallback: a single whole-frame classification with lower confidence.
    const overall = analyzeRegion(imageData.data, width, 0, 0, width, height);
    const { key, score } = topCategory(overall);
    const cat = CATEGORY_MAP[key] ?? CATEGORY_MAP.other;
    const conf = clampConfidence(0.4 + score * 0.4);
    return {
      boxes: [
        {
          x: 0.1,
          y: 0.1,
          w: 0.8,
          h: 0.8,
          label: cat.label,
          category: key,
          color: cat.color,
          confidence: conf,
        },
      ],
      primaryCategory: key,
      primaryConfidence: conf,
      counts: { [key]: 1 },
      totalCount: 1,
    };
  }

  return {
    boxes,
    primaryCategory,
    primaryConfidence: primaryScore,
    counts,
    totalCount: boxes.length,
  };
}

function mergeCells(
  cells: { x: number; y: number; w: number; h: number; key: string; score: number }[],
) {
  const used = new Set<number>();
  const result: { x: number; y: number; w: number; h: number; key: string; score: number }[] = [];

  for (let i = 0; i < cells.length; i++) {
    if (used.has(i)) continue;
    let cur = { ...cells[i] };
    used.add(i);
    let changed = true;
    while (changed) {
      changed = false;
      for (let j = 0; j < cells.length; j++) {
        if (used.has(j)) continue;
        if (cells[j].key !== cur.key) continue;
        const adjacent =
          cells[j].x <= cur.x + cur.w &&
          cells[j].x + cells[j].w >= cur.x &&
          cells[j].y <= cur.y + cur.h &&
          cells[j].y + cells[j].h >= cur.y;
        if (adjacent) {
          const nx = Math.min(cur.x, cells[j].x);
          const ny = Math.min(cur.y, cells[j].y);
          const nx2 = Math.max(cur.x + cur.w, cells[j].x + cells[j].w);
          const ny2 = Math.max(cur.y + cur.h, cells[j].y + cells[j].h);
          cur = {
            x: nx,
            y: ny,
            w: nx2 - nx,
            h: ny2 - ny,
            key: cur.key,
            score: Math.max(cur.score, cells[j].score),
          };
          used.add(j);
          changed = true;
        }
      }
    }
    result.push(cur);
  }
  return result;
}

function clampConfidence(v: number): number {
  return Math.max(0.4, Math.min(0.98, Math.round(v * 100) / 100));
}

function emptyResult(): InferenceResult {
  return {
    boxes: [],
    primaryCategory: 'other',
    primaryConfidence: 0,
    counts: {},
    totalCount: 0,
  };
}

/** Generate demo detections when a user has no history yet (seed data). */
export function generateDemoDetections(): {
  category: string;
  confidence: number;
  source: DetectionSourceLike;
  daysAgo: number;
}[] {
  const sources: DetectionSourceLike[] = ['webcam', 'image', 'video'];
  const samples = [];
  for (let i = 0; i < 60; i++) {
    const cat = CATEGORIES[Math.floor(Math.random() * (CATEGORIES.length - 1))];
    samples.push({
      category: cat.key,
      confidence: 0.62 + Math.random() * 0.36,
      source: sources[Math.floor(Math.random() * sources.length)],
      daysAgo: Math.floor(Math.random() * 30),
    });
  }
  return samples;
}

type DetectionSourceLike = 'webcam' | 'image' | 'video';
