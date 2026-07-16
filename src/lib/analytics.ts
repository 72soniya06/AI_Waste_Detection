import { CATEGORIES, RECYCLABLE_KEYS } from './categories';
import type { Detection } from './supabase';

export type DashboardStats = {
  total: number;
  recyclable: number;
  nonRecyclable: number;
  plastic: number;
  today: number;
  estimatedRecycledKg: number;
  co2SavedKg: number;
  byCategory: { key: string; label: string; color: string; count: number }[];
};

export type TrendPoint = {
  label: string;
  value: number;
};

function isSameDay(iso: string, ref: Date): boolean {
  const d = new Date(iso);
  return (
    d.getFullYear() === ref.getFullYear() &&
    d.getMonth() === ref.getMonth() &&
    d.getDate() === ref.getDate()
  );
}

export function computeStats(detections: Detection[]): DashboardStats {
  const now = new Date();
  let recyclable = 0;
  let nonRecyclable = 0;
  let plastic = 0;
  let today = 0;
  let recycledKg = 0;
  let co2 = 0;
  const counts: Record<string, number> = {};
  for (const c of CATEGORIES) counts[c.key] = 0;

  for (const d of detections) {
    counts[d.category] = (counts[d.category] ?? 0) + 1;
    if (RECYCLABLE_KEYS.includes(d.category)) {
      recyclable += 1;
      const cat = CATEGORIES.find((c) => c.key === d.category);
      if (cat) {
        const kg = 0.12 * d.confidence;
        recycledKg += kg;
        co2 += kg * cat.co2PerKg;
      }
    } else {
      nonRecyclable += 1;
    }
    if (d.category === 'plastic') plastic += 1;
    if (isSameDay(d.created_at, now)) today += 1;
  }

  const byCategory = CATEGORIES.map((c) => ({
    key: c.key,
    label: c.label,
    color: c.color,
    count: counts[c.key] ?? 0,
  })).sort((a, b) => b.count - a.count);

  return {
    total: detections.length,
    recyclable,
    nonRecyclable,
    plastic,
    today,
    estimatedRecycledKg: Math.round(recycledKg * 100) / 100,
    co2SavedKg: Math.round(co2 * 100) / 100,
    byCategory,
  };
}

export function weeklyTrend(detections: Detection[]): TrendPoint[] {
  const days: TrendPoint[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const ref = new Date(now);
    ref.setDate(now.getDate() - i);
    const count = detections.filter((d) => isSameDay(d.created_at, ref)).length;
    days.push({
      label: ref.toLocaleDateString('en-US', { weekday: 'short' }),
      value: count,
    });
  }
  return days;
}

export function monthlyTrend(detections: Detection[]): TrendPoint[] {
  const months: TrendPoint[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const ref = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const count = detections.filter((d) => {
      const dt = new Date(d.created_at);
      return dt.getFullYear() === ref.getFullYear() && dt.getMonth() === ref.getMonth();
    }).length;
    months.push({
      label: ref.toLocaleDateString('en-US', { month: 'short' }),
      value: count,
    });
  }
  return months;
}

export function dailyTrend(detections: Detection[], days = 14): TrendPoint[] {
  const out: TrendPoint[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const ref = new Date(now);
    ref.setDate(now.getDate() - i);
    const count = detections.filter((d) => isSameDay(d.created_at, ref)).length;
    out.push({
      label: ref.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
      value: count,
    });
  }
  return out;
}
