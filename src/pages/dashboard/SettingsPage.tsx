import { useState } from 'react';
import { Sun, Moon, Cpu, Globe } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardHeader } from '../../components/ui/Card';
import { Toggle } from '../../components/ui/Toggle';
import { Select } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useTheme } from '../../lib/theme';
import { useToast } from '../../lib/toast';

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const toast = useToast();

  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [weeklyReport, setWeeklyReport] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [mirrorCamera, setMirrorCamera] = useState(false);

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted">Customize your EcoSort AI experience.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* appearance */}
        <Card>
          <CardHeader title="Appearance" subtitle="Choose how EcoSort AI looks to you" />
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setTheme('light')}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition ${theme === 'light' ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30' : 'border-slate-200 dark:border-slate-700'}`}
              >
                <Sun className="h-6 w-6 text-amber-500" />
                <span className="text-sm font-semibold">Light</span>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition ${theme === 'dark' ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30' : 'border-slate-200 dark:border-slate-700'}`}
              >
                <Moon className="h-6 w-6 text-accent-500" />
                <span className="text-sm font-semibold">Dark</span>
              </button>
            </div>
            <Toggle checked={theme === 'dark'} onChange={(v) => setTheme(v ? 'dark' : 'light')} label="Dark mode" description="Use a dark theme across the app." />
          </div>
        </Card>

        {/* notifications */}
        <Card>
          <CardHeader title="Notifications" subtitle="Manage how you receive alerts" />
          <div className="space-y-4">
            <Toggle checked={notifications} onChange={setNotifications} label="Push notifications" description="Receive in-app notifications for new detections." />
            <Toggle checked={emailAlerts} onChange={setEmailAlerts} label="Email alerts" description="Get emailed when significant waste is detected." />
            <Toggle checked={weeklyReport} onChange={setWeeklyReport} label="Weekly sustainability report" description="Auto-generate a weekly impact summary." />
          </div>
        </Card>

        {/* camera */}
        <Card>
          <CardHeader title="Camera Settings" subtitle="Configure webcam detection preferences" />
          <div className="space-y-4">
            <Select label="Default camera" defaultValue="environment">
              <option value="environment">Rear / Environment</option>
              <option value="user">Front / User</option>
            </Select>
            <Select label="Detection resolution" defaultValue="640">
              <option value="480">480p (faster)</option>
              <option value="640">640p (balanced)</option>
              <option value="720">720p (higher accuracy)</option>
            </Select>
            <Toggle checked={mirrorCamera} onChange={setMirrorCamera} label="Mirror camera feed" description="Flip the webcam preview horizontally." />
            <Toggle checked={autoSave} onChange={setAutoSave} label="Auto-save detections" description="Automatically store live detections to history." />
          </div>
        </Card>

        {/* model */}
        <Card>
          <CardHeader
            title="Model Settings"
            subtitle="AI model configuration"
            action={<Badge tone="green">Active</Badge>}
          />
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl border p-3">
              <Cpu className="h-5 w-5 text-brand-600" />
              <div className="flex-1">
                <p className="text-sm font-semibold">YOLOv8n</p>
                <p className="text-xs text-muted">Nano model · 8 classes · 30 FPS</p>
              </div>
              <Badge tone="brand">v2.1</Badge>
            </div>
            <Select label="Active model" defaultValue="yolov8n">
              <option value="yolov8n">YOLOv8n — Nano (fastest)</option>
              <option value="yolov8s">YOLOv8s — Small (balanced)</option>
              <option value="yolov8m">YOLOv8m — Medium (accurate)</option>
            </Select>
            <Select label="Confidence threshold" defaultValue="0.4">
              <option value="0.3">30% (more detections)</option>
              <option value="0.4">40% (recommended)</option>
              <option value="0.5">50% (fewer, more certain)</option>
            </Select>
            <div className="flex items-center gap-2 rounded-xl bg-accent-50 p-3 text-xs text-accent-700 dark:bg-accent-950/40 dark:text-accent-300">
              <Globe className="h-4 w-4 shrink-0" />
              Swap models by placing a new .pt file in the backend models/ directory.
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={() => toast.success('Settings saved', 'Your preferences have been updated.')}>Save Settings</Button>
      </div>
    </DashboardLayout>
  );
}


