'use client';

import { useState } from 'react';

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
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Settings</h1>

      <div className="bg-white p-6 rounded-lg shadow max-w-2xl">
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b">
            <div>
              <h3 className="font-medium text-gray-900">Enable Event Tracking</h3>
              <p className="text-sm text-gray-600">Collect user interaction events from web and mobile</p>
            </div>
            <input
              type="checkbox"
              checked={settings.enableEventTracking}
              onChange={(e) =>
                setSettings({ ...settings, enableEventTracking: e.target.checked })
              }
              className="w-5 h-5 rounded"
            />
          </div>

          <div className="flex items-center justify-between pb-4 border-b">
            <div>
              <h3 className="font-medium text-gray-900">Enable Audit Logs</h3>
              <p className="text-sm text-gray-600">Record all admin actions and changes</p>
            </div>
            <input
              type="checkbox"
              checked={settings.enableAuditLogs}
              onChange={(e) =>
                setSettings({ ...settings, enableAuditLogs: e.target.checked })
              }
              className="w-5 h-5 rounded"
            />
          </div>

          <div className="flex items-center justify-between pb-4 border-b">
            <div>
              <h3 className="font-medium text-gray-900">Enable Analytics Notifications</h3>
              <p className="text-sm text-gray-600">Get notified of unusual activity patterns</p>
            </div>
            <input
              type="checkbox"
              checked={settings.analyticsNotifications}
              onChange={(e) =>
                setSettings({ ...settings, analyticsNotifications: e.target.checked })
              }
              className="w-5 h-5 rounded"
            />
          </div>

          <div className="pt-4 border-t">
            <label className="block text-sm font-medium text-gray-900 mb-2">
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <p className="text-sm text-gray-600 mt-1">
              Analytics events older than this will be automatically archived
            </p>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            Save Settings
          </button>
          {saved && (
            <div className="flex items-center text-green-600 font-medium">
              ✓ Settings saved
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-bold text-blue-900 mb-2">About Admin Settings</h3>
        <p className="text-blue-800 text-sm">
          These settings control how the admin area collects and manages data. Changes are applied
          immediately to new events.
        </p>
      </div>
    </div>
  );
}
