import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

export function Logo({
  className,
  size = 32,
  showText = true,
  to = '/',
}: {
  className?: string;
  size?: number;
  showText?: boolean;
  to?: string;
}) {
  return (
    <Link to={to} className={cn('flex items-center gap-2.5', className)} aria-label="EcoSort AI home">
      <span
        className="relative inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-glow"
        style={{ width: size, height: size }}
      >
        <svg viewBox="0 0 24 24" fill="none" width={size * 0.62} height={size * 0.62}>
          <path
            d="M12 3C7.03 3 3 7.03 3 12c0 3.6 2.12 6.7 5.18 8.15L5.5 24h13l-2.68-3.85C18.88 18.7 21 15.6 21 12c0-4.97-4.03-9-9-9Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path d="M12 8v4l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      {showText && (
        <span className="text-lg font-extrabold tracking-tight">
          EcoSort<span className="text-brand-600"> AI</span>
        </span>
      )}
    </Link>
  );
}
