import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { AuthLayout } from './AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../lib/auth';
import { useToast } from '../../lib/toast';

export function LoginPage() {
  const { signIn } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/app';

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setError(error);
      toast.error('Sign in failed', error);
      return;
    }
    toast.success('Welcome back!', 'You are now signed in.');
    navigate(from, { replace: true });
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your EcoSort AI account to continue.">
      <form onSubmit={onSubmit} className="space-y-5">
        <Input
          label="Email"
          type="email"
          name="email"
          placeholder="you@example.com"
          required
          leftIcon={<Mail className="h-4 w-4" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={error && !email ? error : undefined}
        />
        <Input
          label="Password"
          type="password"
          name="password"
          placeholder="••••••••"
          required
          leftIcon={<Lock className="h-4 w-4" />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-muted">
            <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
            Remember me
          </label>
          <Link to="/forgot-password" className="font-medium text-brand-600 hover:text-brand-700">Forgot password?</Link>
        </div>
        <Button type="submit" loading={loading} className="w-full" rightIcon={<ArrowRight className="h-4 w-4" />}>
          Sign in
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        Don't have an account? <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">Sign up</Link>
      </p>
    </AuthLayout>
  );
}
