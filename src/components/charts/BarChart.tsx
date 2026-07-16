import { useEffect, useState } from 'react';

export type BarDatum = { label: string; value: number; color: string };

export function BarChart({
  data,
  height = 240,
  horizontal = false,
}: {
  data: BarDatum[];
  height?: number;
  horizontal?: boolean;
}) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setProgress(1), 50);
    return () => clearTimeout(t);
  }, [data]);

  const max = Math.max(1, ...data.map((d) => d.value));

  if (horizontal) {
    return (
      <div className="space-y-3" style={{ minHeight: height }}>
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="w-28 shrink-0 truncate text-right text-sm text-muted">{d.label}</span>
            <div className="relative h-7 flex-1 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-lg transition-all duration-700 ease-out"
                style={{
                  width: `${(d.value / max) * 100 * progress}%`,
                  backgroundColor: d.color,
                }}
              />
            </div>
            <span className="w-10 shrink-0 text-right text-sm font-semibold tabular-nums">{d.value}</span>
          </div>
        ))}
      </div>
    );
  }

  const width = 600;
  const padding = { top: 16, right: 16, bottom: 40, left: 36 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;
  const barW = innerW / data.length;
  const gap = barW * 0.25;
  const tickValues = [0, Math.round(max / 2), max];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }}>
      {tickValues.map((tv, i) => {
        const y = padding.top + innerH - (tv / max) * innerH;
        return (
          <g key={i}>
            <line x1={padding.left} x2={width - padding.right} y1={y} y2={y} className="stroke-slate-100 dark:stroke-slate-800" strokeWidth="1" />
            <text x={padding.left - 8} y={y + 4} textAnchor="end" className="fill-slate-400 text-[10px]">{tv}</text>
          </g>
        );
      })}
      {data.map((d, i) => {
        const h = (d.value / max) * innerH * progress;
        const x = padding.left + i * barW + gap / 2;
        const y = padding.top + innerH - h;
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barW - gap}
              height={h}
              rx="6"
              fill={d.color}
              style={{ transition: 'height 0.7s ease-out, y 0.7s ease-out' }}
            />
            <text x={x + (barW - gap) / 2} y={height - 12} textAnchor="middle" className="fill-slate-400 text-[10px]">
              {d.label.length > 8 ? d.label.slice(0, 7) + '…' : d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
