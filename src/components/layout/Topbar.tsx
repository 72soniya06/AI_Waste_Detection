import { useState } from 'react';
import { Bell, Menu, Moon, Search, Sun } from 'lucide-react';
import { useTheme } from '../../lib/theme';
import { useAuth } from '../../lib/auth';
import { initials } from '../../lib/utils';
import { Badge } from '../ui/Badge';

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { theme, toggleTheme } = useTheme();
  const { profile } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const name = profile?.name || 'User';

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b glass-strong px-4 lg:px-6">
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-muted hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="relative hidden flex-1 sm:block sm:max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          placeholder="Search detections, categories…"
          className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm transition focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:border-slate-700 dark:bg-slate-800"
        />
      </div>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-3">
        <div className="relative">
          <button
            onClick={() => setNotifOpen((o) => !o)}
            className="relative rounded-xl p-2.5 text-muted transition hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand-500 ring-2 ring-white dark:ring-slate-900" />
          </button>
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border card-base p-4 shadow-card animate-scale-in">
              <p className="mb-3 text-sm font-semibold">Notifications</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-brand-500" />
                  <div>
                    <p className="text-sm font-medium">New detection recorded</p>
                    <p className="text-xs text-muted">Plastic detected via webcam · 92% confidence</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-accent-500" />
                  <div>
                    <p className="text-sm font-medium">Weekly sustainability report ready</p>
                    <p className="text-xs text-muted">You diverted 3.2kg from landfill</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-amber-500" />
                  <div>
                    <p className="text-sm font-medium">Model update available</p>
                    <p className="text-xs text-muted">YOLOv8n v2.1 improves glass accuracy</p>
                  </div>
                </li>
              </ul>
            </div>
          )}
        </div>

        <button
          onClick={toggleTheme}
          className="rounded-xl p-2.5 text-muted transition hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 py-1.5 pl-1.5 pr-3 dark:border-slate-700">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 dark:bg-brand-900 dark:text-brand-300">
            {initials(name)}
          </span>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold leading-tight">{name}</p>
            <Badge tone="brand" className="mt-0.5">Free</Badge>
          </div>
        </div>
      </div>
    </header>
  );
}
