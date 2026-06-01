'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { Shield, Users, BarChart2, ShieldAlert, Settings } from '@/components/ui/Icons';
import { AdminSkeleton } from '@/components/ui/AdminSkeleton';

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
    // ... (logic remains same)
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
    return <AdminSkeleton />;
  }

  if (error) {
    return <div className="text-center py-12 text-red-600">{error}</div>;
  }

  return (
    <div>
      <div className="flex items-center gap-4 mt-8 mb-8">
        <div className="p-3 bg-red-600/10 rounded-2xl border border-red-600/20">
          <Shield className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-4xl font-black text-foreground">Admin Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="glass-card p-6">
          <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider">Total Users</p>
          <p className="text-3xl font-bold text-foreground mt-2">{stats?.totalUsers || 0}</p>
        </div>
        <div className="glass-card p-6">
          <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider">Active Users (7d)</p>
          <p className="text-3xl font-bold text-foreground mt-2">{stats?.activeUsers || 0}</p>
        </div>
        <div className="glass-card p-6">
          <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider">Total Events</p>
          <p className="text-3xl font-bold text-foreground mt-2">{stats?.totalEvents || 0}</p>
        </div>
        <div className="glass-card p-6">
          <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider">Recent Audit Logs (30d)</p>
          <p className="text-3xl font-bold text-foreground mt-2">{stats?.recentAuditLogs || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/admin/users"
          className="glass-card p-6 block hover:scale-[1.02] transition-all"
        >
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-6 h-6 text-gaming-accent" />
            <h2 className="text-xl font-bold text-foreground">User Management</h2>
          </div>
          <p className="text-muted-foreground">Manage users, roles, and account status</p>
        </Link>
        <Link
          href="/admin/analytics"
          className="glass-card p-6 block hover:scale-[1.02] transition-all"
        >
          <div className="flex items-center gap-3 mb-2">
            <BarChart2 className="w-6 h-6 text-gaming-accent" />
            <h2 className="text-xl font-bold text-foreground">Analytics</h2>
          </div>
          <p className="text-muted-foreground">View event data and user engagement metrics</p>
        </Link>
        <Link
          href="/admin/audit"
          className="glass-card p-6 block hover:scale-[1.02] transition-all"
        >
          <div className="flex items-center gap-3 mb-2">
            <ShieldAlert className="w-6 h-6 text-gaming-accent" />
            <h2 className="text-xl font-bold text-foreground">Audit Logs</h2>
          </div>
          <p className="text-muted-foreground">Review admin actions and system changes</p>
        </Link>
        <Link
          href="/admin/settings"
          className="glass-card p-6 block hover:scale-[1.02] transition-all"
        >
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-6 h-6 text-gaming-accent" />
            <h2 className="text-xl font-bold text-foreground">Settings</h2>
          </div>
          <p className="text-muted-foreground">Configure admin preferences and system settings</p>
        </Link>
      </div>
    </div>
  );
}
