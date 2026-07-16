import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/utils';

type CardProps = HTMLAttributes<HTMLDivElement> & {
  hover?: boolean;
  glass?: boolean;
};

export function Card({ className, hover, glass, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border p-6 transition-all duration-300',
        glass ? 'glass border-white/20 dark:border-white/10' : 'card-base',
        hover && 'hover:shadow-card hover:-translate-y-0.5',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mb-5 flex items-start justify-between gap-4', className)}>
      <div>
        <h3 className="text-base font-semibold leading-tight">{title}</h3>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
