import { useEffect, useRef } from 'react';
import type { InferenceBox } from '../lib/inference';
import { formatPercent } from '../lib/utils';

type DetectionOverlayProps = {
  boxes: InferenceBox[];
  className?: string;
};

/**
 * Renders bounding boxes over a media element. Positioned absolutely inside
 * a relative container that wraps the <video>/<img>/<canvas>.
 * Box coordinates are normalized (0..1) so they scale with the container.
 */
export function DetectionOverlay({ boxes, className }: DetectionOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // re-render on resize via state isn't needed; percentages handle it.
  }, [boxes]);

  return (
    <div ref={containerRef} className={`pointer-events-none absolute inset-0 ${className ?? ''}`}>
      {boxes.map((box, i) => (
        <div
          key={i}
          className="absolute animate-scale-in"
          style={{
            left: `${box.x * 100}%`,
            top: `${box.y * 100}%`,
            width: `${box.w * 100}%`,
            height: `${box.h * 100}%`,
            border: `2px solid ${box.color}`,
            borderRadius: 8,
            boxShadow: `0 0 0 1px rgba(0,0,0,0.2), 0 4px 12px ${box.color}40`,
          }}
        >
          <div
            className="absolute -top-6 left-0 flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-bold text-white shadow"
            style={{ backgroundColor: box.color }}
          >
            <span>{box.label}</span>
            <span className="opacity-90">{formatPercent(box.confidence, 0)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
