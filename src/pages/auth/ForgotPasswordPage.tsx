import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { AuthLayout } from './AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../lib/auth';
import { useToast } from '../../lib/toast';

export function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) {
      toast.error('Could not send email', error);
      return;
    }
    setSent(true);
    toast.success('Reset link sent', 'Check your inbox for instructions.');
  }

  return (
    <AuthLayout title="Forgot password?" subtitle="Enter your email and we'll send you a reset link.">
      {sent ? (
        <div className="text-center">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950/50">
            <CheckCircle2 className="h-7 w-7" />
          </span>
          <p className="font-semibold">Check your email</p>
          <p className="mt-2 text-sm text-muted">We sent a reset link to <span className="font-medium">{email}</span>.</p>
          <Link to="/login" className="mt-6 inline-block">
            <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />}>Back to sign in</Button>
          </Link>
        </div>
      ) : (
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
          />
          <Button type="submit" loading={loading} className="w-full">Send reset link</Button>
          <Link to="/login" className="flex items-center justify-center gap-1.5 text-sm text-muted hover:text-brand-600">
            <ArrowLeft className="h-4 w-4" /> Back to sign in
          </Link>
        </form>
      )}
    </AuthLayout>
  );
}
