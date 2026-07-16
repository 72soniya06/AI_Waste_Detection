import {
  LayoutDashboard,
  Camera,
  ImagePlus,
  Video,
  History,
  BarChart3,
  Leaf,
  User,
  Settings,
  LogOut,
  X,
  type LucideIcon,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { Logo } from '../ui/Logo';
import { useAuth } from '../../lib/auth';
import { cn, initials } from '../../lib/utils';

type NavItem = { to: string; label: string; icon: LucideIcon };

const NAV: { section: string; items: NavItem[] }[] = [
  {
    section: 'Overview',
    items: [
      { to: '/app', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/app/analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
  {
    section: 'Detection',
    items: [
      { to: '/app/live', label: 'Live Detection', icon: Camera },
      { to: '/app/upload-image', label: 'Upload Image', icon: ImagePlus },
      { to: '/app/upload-video', label: 'Upload Video', icon: Video },
      { to: '/app/history', label: 'Detection History', icon: History },
    ],
  },
  {
    section: 'Sustainability',
    items: [{ to: '/app/report', label: 'Sustainability Report', icon: Leaf }],
  },
  {
    section: 'Account',
    items: [
      { to: '/app/profile', label: 'Profile', icon: User },
      { to: '/app/settings', label: 'Settings', icon: Settings },
    ],
  },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { profile, signOut } = useAuth();
  const name = profile?.name || 'User';

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm lg:hidden" onClick={onClose} aria-hidden />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r bg-white transition-transform duration-300 dark:bg-slate-900 lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-6">
          <Logo />
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden" aria-label="Close sidebar">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto scrollbar-thin px-4 py-6">
          {NAV.map((group) => (
            <div key={group.section} className="mb-6">
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted">{group.section}</p>
              <ul className="space-y-1">
                {group.items.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.to === '/app'}
                      onClick={onClose}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                          isActive
                            ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30'
                            : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
                        )
                      }
                    >
                      <item.icon className="h-[18px] w-[18px]" />
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t p-4">
          <div className="flex items-center gap-3 rounded-xl p-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 dark:bg-brand-900 dark:text-brand-300">
              {initials(name)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{name}</p>
              <p className="truncate text-xs text-muted">{profile?.organization || 'Member'}</p>
            </div>
            <button
              onClick={signOut}
              className="rounded-lg p-2 text-muted transition hover:bg-error-50 hover:text-error-600 dark:hover:bg-error-950/40"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
