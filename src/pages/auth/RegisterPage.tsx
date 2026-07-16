import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { AuthLayout } from './AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../lib/auth';
import { useToast } from '../../lib/toast';

export function RegisterPage() {
  const { signUp } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    const { error } = await signUp(name, email, password);
    setLoading(false);
    if (error) {
      setError(error);
      toast.error('Sign up failed', error);
      return;
    }
    toast.success('Account created!', 'Welcome to EcoSort AI.');
    navigate('/app', { replace: true });
  }

  return (
    <AuthLayout title="Create your account" subtitle="Start classifying waste and tracking your environmental impact.">
      <form onSubmit={onSubmit} className="space-y-5">
        <Input
          label="Name"
          name="name"
          placeholder="Jane Doe"
          required
          leftIcon={<User className="h-4 w-4" />}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          label="Email"
          type="email"
          name="email"
          placeholder="you@example.com"
          required
          leftIcon={<Mail className="h-4 w-4" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label="Password"
          type="password"
          name="password"
          placeholder="At least 6 characters"
          required
          leftIcon={<Lock className="h-4 w-4" />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={error ?? undefined}
        />
        <Button type="submit" loading={loading} className="w-full" rightIcon={<ArrowRight className="h-4 w-4" />}>
          Create account
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        Already have an account? <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
