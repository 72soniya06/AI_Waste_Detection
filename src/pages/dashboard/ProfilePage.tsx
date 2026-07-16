import { useState, type FormEvent } from 'react';
import { User, Mail, Building2, Camera, Save } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../lib/auth';
import { updateProfile } from '../../lib/detections';
import { useToast } from '../../lib/toast';
import { initials } from '../../lib/utils';

export function ProfilePage() {
  const { profile, user, refreshProfile } = useAuth();
  const toast = useToast();
  const [name, setName] = useState(profile?.name ?? '');
  const [organization, setOrganization] = useState(profile?.organization ?? '');
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    const updated = await updateProfile({ name, organization });
    setSaving(false);
    if (updated) {
      await refreshProfile();
      toast.success('Profile updated', 'Your changes have been saved.');
    } else {
      toast.error('Update failed', 'Could not save your profile. Try again.');
    }
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="mt-1 text-sm text-muted">Manage your personal information and organization details.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* avatar card */}
        <Card className="text-center">
          <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-3xl font-bold text-white shadow-glow">
            {initials(name || 'User')}
          </div>
          <p className="text-lg font-bold">{name || 'User'}</p>
          <p className="text-sm text-muted">{user?.email}</p>
          {organization && <Badge tone="brand" className="mt-2">{organization}</Badge>}
          <button className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700">
            <Camera className="h-4 w-4" /> Change photo
          </button>
        </Card>

        {/* form */}
        <Card className="lg:col-span-2">
          <CardHeader title="Personal Information" subtitle="Update your account details" />
          <form onSubmit={onSubmit} className="space-y-5">
            <Input label="Name" name="name" leftIcon={<User className="h-4 w-4" />} value={name} onChange={(e) => setName(e.target.value)} required />
            <Input label="Email" name="email" type="email" leftIcon={<Mail className="h-4 w-4" />} value={user?.email ?? ''} disabled hint="Email cannot be changed directly." />
            <Input label="Organization" name="organization" leftIcon={<Building2 className="h-4 w-4" />} placeholder="Your college or company" value={organization} onChange={(e) => setOrganization(e.target.value)} />
            <div className="flex justify-end">
              <Button type="submit" loading={saving} leftIcon={<Save className="h-4 w-4" />}>Save Changes</Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
