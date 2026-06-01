'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

interface AdminStats {
  totalUsers: number;
  totalEvents: number;
  activeUsers: number;
  recentAuditLogs: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const supabase = createClient();

        const [usersRes, eventsRes, auditRes] = await Promise.all([
          supabase.from('users').select('id', { count: 'exact', head: true }),
          supabase
            .from('analytics_events')
            .select('id', { count: 'exact', head: true }),
          supabase
            .from('admin_audit_logs')
            .select('id', { count: 'exact', head: true })
            .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
        ]);

        const activeUsersRes = await supabase
          .from('analytics_events')
          .select('user_id')
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

        const activeUserIds = new Set(
          activeUsersRes.data?.map((e) => e.user_id).filter(Boolean)
        );

        setStats({
          totalUsers: usersRes.count || 0,
          totalEvents: eventsRes.count || 0,
          activeUsers: activeUserIds.size,
          recentAuditLogs: auditRes.count || 0,
        });
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        setError('Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="text-center py-12">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="text-center py-12 text-red-600">{error}</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600 text-sm font-medium">Total Users</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.totalUsers || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600 text-sm font-medium">Active Users (7d)</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.activeUsers || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600 text-sm font-medium">Total Events</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.totalEvents || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600 text-sm font-medium">Recent Audit Logs (30d)</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.recentAuditLogs || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/admin/users"
          className="block bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-2">User Management</h2>
          <p className="text-gray-600">Manage users, roles, and account status</p>
        </Link>
        <Link
          href="/admin/analytics"
          className="block bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-2">Analytics</h2>
          <p className="text-gray-600">View event data and user engagement metrics</p>
        </Link>
        <Link
          href="/admin/audit"
          className="block bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-2">Audit Logs</h2>
          <p className="text-gray-600">Review admin actions and system changes</p>
        </Link>
        <Link
          href="/admin/settings"
          className="block bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-2">Settings</h2>
          <p className="text-gray-600">Configure admin preferences and system settings</p>
        </Link>
      </div>
    </div>
  );
}
