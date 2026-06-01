'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Settings, ArrowLeft } from '@/components/ui/Icons';
import { cn } from '@/utils/cn';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    enableEventTracking: true,
    enableAuditLogs: true,
    retentionDays: 90,
    analyticsNotifications: true,
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem('adminSettings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <div className="flex items-center gap-4 mt-8 mb-8">
        <Link 
          href="/admin" 
          className="p-3 bg-(--nav-hover) rounded-2xl border border-(--card-border) hover:bg-gaming-accent/10 hover:border-gaming-accent/20 transition-all text-muted-foreground hover:text-gaming-accent"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div className="p-3 bg-gaming-accent/10 rounded-2xl border border-gaming-accent/20">
          <Settings className="w-8 h-8 text-gaming-accent" />
        </div>
        <h1 className="text-4xl font-black text-foreground">Admin Settings</h1>
      </div>

      <div className="glass-card p-6 max-w-2xl">
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-6 border-b border-(--card-border)">
            <div>
              <h3 className="font-bold text-foreground">Enable Event Tracking</h3>
              <p className="text-sm text-muted-foreground">Collect user interaction events from web and mobile</p>
            </div>
            <input
              type="checkbox"
              checked={settings.enableEventTracking}
              onChange={(e) =>
                setSettings({ ...settings, enableEventTracking: e.target.checked })
              }
              className="w-5 h-5 accent-gaming-accent cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between pb-6 border-b border-(--card-border)">
            <div>
              <h3 className="font-bold text-foreground">Enable Audit Logs</h3>
              <p className="text-sm text-muted-foreground">Record all admin actions and changes</p>
            </div>
            <input
              type="checkbox"
              checked={settings.enableAuditLogs}
              onChange={(e) =>
                setSettings({ ...settings, enableAuditLogs: e.target.checked })
              }
              className="w-5 h-5 accent-gaming-accent cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between pb-6 border-b border-(--card-border)">
            <div>
              <h3 className="font-bold text-foreground">Enable Analytics Notifications</h3>
              <p className="text-sm text-muted-foreground">Get notified of unusual activity patterns</p>
            </div>
            <input
              type="checkbox"
              checked={settings.analyticsNotifications}
              onChange={(e) =>
                setSettings({ ...settings, analyticsNotifications: e.target.checked })
              }
              className="w-5 h-5 accent-gaming-accent cursor-pointer"
            />
          </div>

          <div className="pt-2">
            <label className="block text-sm font-bold text-muted-foreground mb-2 uppercase tracking-wider">
              Data Retention Period (Days)
            </label>
            <input
              type="number"
              min="1"
              max="365"
              value={settings.retentionDays}
              onChange={(e) =>
                setSettings({ ...settings, retentionDays: Number(e.target.value) })
              }
              className="w-full px-4 py-2 bg-(--nav-hover) border border-(--card-border) rounded-xl text-foreground focus:outline-none focus:border-gaming-accent transition-all"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Analytics events older than this will be automatically archived
            </p>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-gaming-accent text-white rounded-xl font-bold hover:bg-gaming-accent-light transition-all shadow-lg shadow-gaming-accent/20"
          >
            Save Settings
          </button>
          {saved && (
            <div className="flex items-center text-green-500 font-bold">
              ✓ Settings saved
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 glass-card p-6 border-gaming-accent/20 bg-gaming-accent/5">
        <h3 className="font-bold text-foreground mb-2">About Admin Settings</h3>
        <p className="text-muted-foreground text-sm">
          These settings control how the admin area collects and manages data. Changes are applied
          immediately to new events.
        </p>
      </div>
    </div>
  );
}
