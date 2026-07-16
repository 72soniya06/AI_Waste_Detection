import { useEffect, useState } from 'react';

export type PieSlice = {
  label: string;
  value: number;
  color: string;
};

export function DonutChart({
  data,
  size = 200,
  thickness = 28,
  centerLabel,
  centerValue,
}: {
  data: PieSlice[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string;
}) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setProgress(1), 50);
    return () => clearTimeout(t);
  }, []);

  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const radius = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;
  const segments = data
    .filter((d) => d.value > 0)
    .map((d) => {
      const fraction = d.value / total;
      const length = fraction * circumference * progress;
      const seg = {
        ...d,
        dasharray: `${length} ${circumference}`,
        dashoffset: -offset * progress,
        fraction,
      };
      offset += fraction * circumference;
      return seg;
    });

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          strokeWidth={thickness}
          className="stroke-slate-100 dark:stroke-slate-800"
        />
        {segments.map((seg, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth={thickness}
            strokeDasharray={seg.dasharray}
            strokeDashoffset={seg.dashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.8s ease-out, stroke-dashoffset 0.8s ease-out' }}
          />
        ))}
      </svg>
      {(centerLabel || centerValue) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {centerValue && <span className="text-2xl font-bold">{centerValue}</span>}
          {centerLabel && <span className="text-xs text-muted">{centerLabel}</span>}
        </div>
      )}
    </div>
  );
}

export function ChartLegend({ data }: { data: PieSlice[] }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  return (
    <ul className="space-y-2">
      {data
        .filter((d) => d.value > 0)
        .sort((a, b) => b.value - a.value)
        .map((d, i) => (
          <li key={i} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: d.color }} />
              <span className="text-muted">{d.label}</span>
            </span>
            <span className="font-semibold tabular-nums">
              {d.value} <span className="text-xs text-muted">({Math.round((d.value / total) * 100)}%)</span>
            </span>
          </li>
        ))}
    </ul>
  );
}
