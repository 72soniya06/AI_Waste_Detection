import { Link } from 'react-router-dom';
import { ArrowRight, Play, Sparkles, Recycle, Leaf, Camera } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Logo } from '../../components/ui/Logo';
import { useTheme } from '../../lib/theme';

export function LandingHero() {
  const { theme, toggleTheme } = useTheme();

  return (
    <section className="relative overflow-hidden">
      {/* animated background */}
      <div className="absolute inset-0 -z-10 bg-grid-light bg-[size:40px_40px] dark:bg-grid-dark" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-50/80 via-transparent to-transparent dark:from-brand-950/30" />
      <div className="absolute -left-32 top-20 -z-10 h-72 w-72 rounded-full bg-brand-400/20 blur-3xl animate-float" />
      <div className="absolute -right-20 top-40 -z-10 h-80 w-80 rounded-full bg-accent-400/20 blur-3xl animate-float [animation-delay:1.5s]" />

      {/* nav */}
      <nav className="sticky top-0 z-30 border-b border-transparent">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
          <Logo />
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-muted transition hover:text-slate-900 dark:hover:text-white">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-muted transition hover:text-slate-900 dark:hover:text-white">How it works</a>
            <a href="#categories" className="text-sm font-medium text-muted transition hover:text-slate-900 dark:hover:text-white">Categories</a>
            <a href="#faq" className="text-sm font-medium text-muted transition hover:text-slate-900 dark:hover:text-white">FAQ</a>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-muted transition hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? '☀' : '☾'}
            </button>
            <Link to="/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link to="/register" className="hidden sm:block">
              <Button size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 pb-24 pt-16 lg:px-8 lg:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* copy */}
          <div className="animate-fade-in">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:border-brand-800 dark:bg-brand-950/50 dark:text-brand-300">
              <Sparkles className="h-3.5 w-3.5" />
              AI-Powered · Real-Time · YOLOv8
            </div>
            <h1 className="text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              EcoSort <span className="gradient-text">AI</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
              AI Powered Real-Time Waste Segregation for a Sustainable Future.
              Classify plastic, paper, glass, metal, organic and e-waste instantly
              using your webcam or uploaded images.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register">
                <Button size="lg" rightIcon={<ArrowRight className="h-5 w-5" />}>Get Started</Button>
              </Link>
              <Link to="/app">
                <Button size="lg" variant="outline" leftIcon={<Play className="h-4 w-4" />}>Live Demo</Button>
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
              {[
                { icon: Camera, label: 'Real-time webcam detection' },
                { icon: Recycle, label: '8 waste categories' },
                { icon: Leaf, label: 'Carbon impact tracking' },
              ].map((f) => (
                <div key={f.label} className="flex items-center gap-2 text-sm text-muted">
                  <f.icon className="h-4 w-4 text-brand-600" />
                  {f.label}
                </div>
              ))}
            </div>
          </div>

          {/* visual */}
          <div className="relative animate-scale-in [animation-delay:200ms]">
            <div className="relative mx-auto aspect-square max-w-md">
              <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-brand-400/30 to-accent-400/30 blur-2xl" />
              <div className="relative flex h-full items-center justify-center rounded-[2.5rem] border border-white/40 glass-strong p-8 shadow-2xl">
                {/* orbiting recycling visual */}
                <div className="relative h-64 w-64">
                  <div className="absolute inset-0 animate-spin-slow rounded-full border-2 border-dashed border-brand-300/50" />
                  <div className="absolute inset-8 animate-spin-slow [animation-direction:reverse] rounded-full border-2 border-dashed border-accent-300/40" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-32 w-32 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-glow">
                      <Recycle className="h-16 w-16" />
                    </div>
                  </div>
                  {/* floating category chips */}
                  {[
                    { label: 'Plastic', color: '#3b82f6', top: '0%', left: '50%', delay: '0s' },
                    { label: 'Glass', color: '#10b981', top: '30%', left: '90%', delay: '0.8s' },
                    { label: 'Paper', color: '#f59e0b', top: '75%', left: '85%', delay: '1.2s' },
                    { label: 'Metal', color: '#64748b', top: '95%', left: '45%', delay: '0.4s' },
                    { label: 'Organic', color: '#22c55e', top: '70%', left: '5%', delay: '1.6s' },
                    { label: 'E-Waste', color: '#8b5cf6', top: '25%', left: '0%', delay: '0.6s' },
                  ].map((chip) => (
                    <div
                      key={chip.label}
                      className="absolute -translate-x-1/2 -translate-y-1/2 animate-float"
                      style={{ top: chip.top, left: chip.left, animationDelay: chip.delay }}
                    >
                      <span
                        className="whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold text-white shadow-lg"
                        style={{ backgroundColor: chip.color }}
                      >
                        {chip.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
