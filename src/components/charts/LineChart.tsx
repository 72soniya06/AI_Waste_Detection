import { useEffect, useState } from 'react';

export type LinePoint = { label: string; value: number };

export function LineChart({
  data,
  height = 220,
  color = '#10b981',
  showArea = true,
}: {
  data: LinePoint[];
  height?: number;
  color?: string;
  showArea?: boolean;
}) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setProgress(1), 50);
    return () => clearTimeout(t);
  }, [data]);

  const width = 600;
  const padding = { top: 16, right: 16, bottom: 32, left: 36 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;
  const max = Math.max(1, ...data.map((d) => d.value));
  const stepX = data.length > 1 ? innerW / (data.length - 1) : 0;

  const points = data.map((d, i) => ({
    x: padding.left + i * stepX,
    y: padding.top + innerH - (d.value / max) * innerH,
    ...d,
  }));

  const linePath = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1]?.x ?? 0} ${padding.top + innerH} L ${points[0]?.x ?? 0} ${padding.top + innerH} Z`;
  const gid = `area-${color.replace('#', '')}`;

  const yTicks = 4;
  const tickValues = Array.from({ length: yTicks + 1 }, (_, i) => Math.round((max / yTicks) * i));

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {tickValues.map((tv, i) => {
        const y = padding.top + innerH - (tv / max) * innerH;
        return (
          <g key={i}>
            <line
              x1={padding.left}
              x2={width - padding.right}
              y1={y}
              y2={y}
              className="stroke-slate-100 dark:stroke-slate-800"
              strokeWidth="1"
            />
            <text x={padding.left - 8} y={y + 4} textAnchor="end" className="fill-slate-400 text-[10px]">
              {tv}
            </text>
          </g>
        );
      })}

      {showArea && <path d={areaPath} fill={`url(#${gid})`} opacity={progress} style={{ transition: 'opacity 0.6s' }} />}
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={1000}
        strokeDashoffset={1000 * (1 - progress)}
        style={{ transition: 'stroke-dashoffset 1s ease-out' }}
      />

      {points.map((p, i) => (
        <g key={i} opacity={progress} style={{ transition: 'opacity 0.6s' }}>
          <circle cx={p.x} cy={p.y} r="4" fill={color} className="stroke-white dark:stroke-slate-900" strokeWidth="2" />
          <text x={p.x} y={height - 10} textAnchor="middle" className="fill-slate-400 text-[10px]">
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
