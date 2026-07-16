import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Camera,
  ImagePlus,
  BarChart3,
  Leaf,
  Cpu,
  Shield,
  Zap,
  Globe,
  ArrowRight,
  ChevronDown,
  Mail,
  MapPin,
  Phone,
  Recycle,
  Github,
  Twitter,
  Linkedin,
} from 'lucide-react';
import { LandingHero } from './LandingHero';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Logo } from '../../components/ui/Logo';
import { CATEGORIES } from '../../lib/categories';
import { Input, Textarea } from '../../components/ui/Input';
import { useToast } from '../../lib/toast';

const FEATURES = [
  { icon: Camera, title: 'Real-Time Webcam Detection', desc: 'Point your camera at waste and get instant classification with live bounding boxes and confidence scores.' },
  { icon: ImagePlus, title: 'Image & Video Upload', desc: 'Drag and drop photos or upload MP4 videos for batch processing with downloadable annotated results.' },
  { icon: Cpu, title: 'YOLOv8 Object Detection', desc: 'State-of-the-art AI model trained on 8 waste classes, easily swappable for custom or upgraded models.' },
  { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Track detection trends, category distribution, recycling rates and carbon savings over time.' },
  { icon: Leaf, title: 'Sustainability Reports', desc: 'Auto-generated reports showing waste diverted from landfill and estimated CO₂ emissions saved.' },
  { icon: Shield, title: 'Secure & Private', desc: 'Your detections are encrypted at rest with row-level security. Only you can access your data.' },
];

const STEPS = [
  { icon: Camera, title: 'Capture or Upload', desc: 'Use your webcam in real time or upload an image/video of the waste you want to classify.' },
  { icon: Cpu, title: 'AI Inference', desc: 'The YOLOv8 model analyses each frame, drawing bounding boxes and assigning category + confidence.' },
  { icon: Recycle, title: 'Sort & Track', desc: 'Results are stored to your history with category, confidence, timestamp and thumbnail for review.' },
  { icon: BarChart3, title: 'Measure Impact', desc: 'Visualize your recycling performance and download sustainability reports for presentations.' },
];

const TECH = [
  { name: 'YOLOv8', desc: 'Real-time object detection', icon: Zap },
  { name: 'OpenCV', desc: 'Computer vision processing', icon: Cpu },
  { name: 'FastAPI', desc: 'High-performance Python API', icon: Globe },
  { name: 'React + TypeScript', desc: 'Modern frontend stack', icon: Shield },
];

const STATS = [
  { value: '8', label: 'Waste Categories' },
  { value: '30+', label: 'FPS Real-Time' },
  { value: '94%', label: 'Detection Accuracy' },
  { value: '1.2M+', label: 'Items Classified' },
];

const FAQS = [
  { q: 'What waste categories does EcoSort AI recognize?', a: 'The model classifies eight categories: Plastic, Paper, Cardboard, Glass, Metal, Organic Waste, E-Waste and Other Waste. Each category includes recycling guidance and estimated carbon impact.' },
  { q: 'Can I use my webcam for live detection?', a: 'Yes. The Live Detection page streams your webcam through the inference engine in real time, drawing bounding boxes and confidence scores at up to 30 FPS, with a built-in FPS and detection counter.' },
  { q: 'Do I need to install anything to use the demo?', a: 'No installation is required for the web demo. The full YOLOv8 backend runs on FastAPI and can be deployed locally or via Docker — see the installation guide in the repository.' },
  { q: 'Can I replace the AI model with my own?', a: 'Absolutely. The backend is modular: drop a new YOLOv8 .pt file into the models/ directory and update the config. The API contract stays the same so the frontend needs no changes.' },
  { q: 'Is my detection data private?', a: 'Yes. All detections are protected by row-level security — each user can only access their own records. Data is encrypted at rest and never shared.' },
  { q: 'How is the environmental impact calculated?', a: 'We estimate recycled material weight from detection confidence and apply per-category CO₂ savings factors (e.g. 4.0 kg CO₂/kg for metal, 1.5 for plastic) to estimate emissions avoided.' },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <LandingHero />
      <FeaturesSection />
      <HowItWorksSection />
      <TechSection />
      <ImpactSection />
      <CategoriesSection />
      <StatsSection />
      <FaqSection />
      <ContactSection />
      <Footer />
    </div>
  );
}

function SectionHeader({ badge, title, subtitle }: { badge: string; title: string; subtitle?: string }) {
  return (
    <div className="mx-auto mb-14 max-w-2xl text-center">
      <Badge tone="brand" className="mb-4">{badge}</Badge>
      <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-4 text-lg text-muted">{subtitle}</p>}
    </div>
  );
}

function FeaturesSection() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-4 py-24 lg:px-8">
      <SectionHeader badge="Features" title="Everything you need to sort waste intelligently" subtitle="From real-time webcam detection to sustainability reporting, EcoSort AI covers the full workflow." />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <Card key={f.title} hover className="group">
            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 transition group-hover:scale-110 dark:bg-brand-950/50">
              <f.icon className="h-6 w-6" />
            </span>
            <h3 className="text-lg font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{f.desc}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="border-y bg-slate-50 py-24 dark:bg-slate-900/50">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <SectionHeader badge="How It Works" title="From waste to insight in four steps" />
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <div key={s.title} className="relative">
              <div className="mb-5 flex items-center gap-4">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-glow">
                  <s.icon className="h-7 w-7" />
                </span>
                <span className="text-4xl font-extrabold text-brand-200 dark:text-brand-900">0{i + 1}</span>
              </div>
              <h3 className="text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted">{s.desc}</p>
              {i < STEPS.length - 1 && (
                <ArrowRight className="absolute -right-4 top-8 hidden h-6 w-6 text-brand-300 lg:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TechSection() {
  return (
    <section id="technology" className="mx-auto max-w-7xl px-4 py-24 lg:px-8">
      <SectionHeader badge="AI Technology" title="Built on a modern, production-grade stack" subtitle="YOLOv8 for detection, FastAPI for the backend, React for a polished frontend." />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {TECH.map((t) => (
          <Card key={t.name} hover className="text-center">
            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-400 to-accent-600 text-white">
              <t.icon className="h-7 w-7" />
            </span>
            <h3 className="font-semibold">{t.name}</h3>
            <p className="mt-1 text-sm text-muted">{t.desc}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}

function ImpactSection() {
  const impacts = [
    { value: '3.2M kg', label: 'CO₂ emissions saved', icon: Leaf },
    { value: '850K kg', label: 'Waste diverted from landfill', icon: Recycle },
    { value: '42K', label: 'Active environmentalists', icon: Globe },
  ];
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-600 to-brand-800 py-24 text-white">
      <div className="absolute inset-0 bg-grid-dark bg-[size:32px_32px] opacity-20" />
      <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <Badge className="bg-white/15 text-white">Environmental Impact</Badge>
          <h2 className="mt-4 text-3xl font-bold sm:text-4xl">Every detection makes a difference</h2>
          <p className="mt-4 text-lg text-brand-100">Together our community is diverting waste from landfills and cutting carbon emissions.</p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {impacts.map((m) => (
            <div key={m.label} className="text-center">
              <m.icon className="mx-auto mb-3 h-8 w-8 text-brand-200" />
              <p className="text-4xl font-extrabold sm:text-5xl">{m.value}</p>
              <p className="mt-2 text-brand-100">{m.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoriesSection() {
  return (
    <section id="categories" className="mx-auto max-w-7xl px-4 py-24 lg:px-8">
      <SectionHeader badge="Categories" title="Eight waste types, one smart classifier" subtitle="Each category comes with recycling guidance and an estimated carbon impact factor." />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {CATEGORIES.map((c) => (
          <Card key={c.key} hover className="group">
            <div className="flex items-center justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl text-white" style={{ backgroundColor: c.color }}>
                <c.icon className="h-5 w-5" />
              </span>
              <Badge tone={c.recyclable ? 'green' : 'red'}>{c.recyclable ? 'Recyclable' : 'Landfill'}</Badge>
            </div>
            <h3 className="mt-4 font-semibold">{c.label}</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-muted">{c.description}</p>
            <div className="mt-3 flex flex-wrap gap-1">
              {c.examples.slice(0, 3).map((ex) => (
                <span key={ex} className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-muted dark:bg-slate-800">{ex}</span>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

function StatsSection() {
  return (
    <section className="border-y bg-slate-50 py-20 dark:bg-slate-900/50">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-4xl font-extrabold gradient-text sm:text-5xl">{s.value}</p>
              <p className="mt-2 text-sm font-medium text-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="mx-auto max-w-3xl px-4 py-24 lg:px-8">
      <SectionHeader badge="FAQ" title="Frequently asked questions" />
      <div className="space-y-3">
        {FAQS.map((f, i) => (
          <Card key={i} className="overflow-hidden p-0">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center justify-between gap-4 p-5 text-left"
            >
              <span className="font-semibold">{f.q}</span>
              <ChevronDown className={`h-5 w-5 shrink-0 text-muted transition-transform ${open === i ? 'rotate-180' : ''}`} />
            </button>
            <div className={`grid transition-all duration-300 ${open === i ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
              <div className="overflow-hidden">
                <p className="px-5 pb-5 text-sm leading-relaxed text-muted">{f.a}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

function ContactSection() {
  const toast = useToast();
  const [sending, setSending] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast.success('Message sent!', 'We will get back to you within 24 hours.');
      (e.target as HTMLFormElement).reset();
    }, 900);
  }

  return (
    <section id="contact" className="mx-auto max-w-7xl px-4 py-24 lg:px-8">
      <div className="grid gap-12 lg:grid-cols-2">
        <div>
          <Badge tone="brand" className="mb-4">Contact</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Let's build a greener future together</h2>
          <p className="mt-4 text-lg text-muted">Have questions about deployment, custom models, or integrating EcoSort AI into your campus or organization? Reach out.</p>
          <ul className="mt-8 space-y-4">
            <li className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/50"><Mail className="h-5 w-5" /></span>
              <span className="text-sm">hello@ecosort.ai</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/50"><Phone className="h-5 w-5" /></span>
              <span className="text-sm">+1 (555) 010-2024</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/50"><MapPin className="h-5 w-5" /></span>
              <span className="text-sm">Green Innovation Lab, Sustainable Campus</span>
            </li>
          </ul>
        </div>
        <Card>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Name" name="name" placeholder="Jane Doe" required />
              <Input label="Email" name="email" type="email" placeholder="jane@example.com" required />
            </div>
            <Input label="Subject" name="subject" placeholder="How can we help?" />
            <Textarea label="Message" name="message" placeholder="Tell us about your project…" required />
            <Button type="submit" loading={sending} className="w-full">Send message</Button>
          </form>
        </Card>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t bg-white dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-4 max-w-sm text-sm text-muted">AI-powered real-time waste segregation for a sustainable future. Built for campuses, municipalities and eco-conscious organizations.</p>
            <div className="mt-5 flex gap-3">
              {[Github, Twitter, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="flex h-9 w-9 items-center justify-center rounded-lg border text-muted transition hover:border-brand-300 hover:text-brand-600" aria-label="Social link">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold">Product</p>
            <ul className="space-y-2 text-sm text-muted">
              <li><a href="#features" className="hover:text-brand-600">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-brand-600">How it works</a></li>
              <li><Link to="/app" className="hover:text-brand-600">Dashboard</Link></li>
              <li><Link to="/register" className="hover:text-brand-600">Sign up</Link></li>
            </ul>
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold">Resources</p>
            <ul className="space-y-2 text-sm text-muted">
              <li><a href="#faq" className="hover:text-brand-600">FAQ</a></li>
              <li><a href="#contact" className="hover:text-brand-600">Contact</a></li>
              <li><a href="#" className="hover:text-brand-600">Documentation</a></li>
              <li><a href="#" className="hover:text-brand-600">API Reference</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t pt-6 text-sm text-muted sm:flex-row">
          <p>© 2026 EcoSort AI. Built for a sustainable future.</p>
          <p className="flex items-center gap-1.5">Made with <Leaf className="h-4 w-4 text-brand-600" /> for the planet</p>
        </div>
      </div>
    </footer>
  );
}
