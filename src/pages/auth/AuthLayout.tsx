import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Recycle, Leaf, BarChart3, Shield } from 'lucide-react';
import { Logo } from '../../components/ui/Logo';
import { useTheme } from '../../lib/theme';

export function AuthLayout({ children, title, subtitle }: { children: ReactNode; title: string; subtitle: string }) {
  const { theme, toggleTheme } = useTheme();
  return (
    <div className="flex min-h-screen">
      {/* form side */}
      <div className="flex w-full flex-col px-6 py-8 lg:max-w-xl lg:px-12">
        <div className="flex items-center justify-between">
          <Logo />
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-muted transition hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '☀' : '☾'}
          </button>
        </div>

        <div className="flex flex-1 items-center">
          <div className="w-full max-w-sm mx-auto animate-fade-in">
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            <p className="mt-2 text-muted">{subtitle}</p>
            <div className="mt-8">{children}</div>
          </div>
        </div>

        <p className="text-center text-xs text-muted">
          By continuing you agree to our Terms and Privacy Policy.
        </p>
      </div>

      {/* visual side */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand-600 to-brand-800 lg:flex lg:w-1/2">
        <div className="absolute inset-0 bg-grid-dark bg-[size:32px_32px] opacity-20" />
        <div className="absolute -left-20 top-1/4 h-72 w-72 rounded-full bg-brand-400/30 blur-3xl animate-float" />
        <div className="absolute -right-10 bottom-1/4 h-80 w-80 rounded-full bg-accent-400/20 blur-3xl animate-float [animation-delay:1.5s]" />
        <div className="relative flex h-full flex-col justify-center p-16 text-white">
          <Recycle className="mb-6 h-12 w-12 text-brand-200" />
          <h2 className="text-4xl font-extrabold leading-tight">Sort smarter.<br />Waste less.</h2>
          <p className="mt-4 max-w-md text-lg text-brand-100">Join thousands using AI to classify waste in real time and track their environmental impact.</p>
          <ul className="mt-10 space-y-5">
            {[
              { icon: BarChart3, text: 'Real-time analytics & sustainability reports' },
              { icon: Leaf, text: 'Track CO₂ savings and waste diverted from landfill' },
              { icon: Shield, text: 'Private & secure — your data stays yours' },
            ].map((f, i) => (
              <li key={i} className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                  <f.icon className="h-5 w-5" />
                </span>
                <span className="text-brand-50">{f.text}</span>
              </li>
            ))}
          </ul>
          <p className="mt-12 text-sm text-brand-200">
            New here? <Link to="/register" className="font-semibold text-white underline underline-offset-4">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
