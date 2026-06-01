'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { ShieldAlert, Search, ArrowLeft } from '@/components/ui/Icons';
import { cn } from '@/utils/cn';

interface AuditLog {
  id: string;
  admin_user_id: string;
  action_type: string;
  target_table: string;
  target_id: string;
  details: Record<string, any>;
  created_at: string;
  admin_email?: string;
}

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterDays, setFilterDays] = useState<number>(30);

  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        const supabase = createClient();
        const since = new Date(Date.now() - filterDays * 24 * 60 * 60 * 1000).toISOString();

        let query = supabase
          .from('admin_audit_logs')
          .select('*')
          .gte('created_at', since)
          .order('created_at', { ascending: false });

        if (filterAction !== 'all') {
          query = query.eq('action_type', filterAction);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;

        if (data) {
          const adminIds = [...new Set(data.map((log) => log.admin_user_id))];
          const { data: adminData } = await supabase
            .from('users')
            .select('id, email')
            .in('id', adminIds);

          const adminMap = new Map(adminData?.map((user) => [user.id, user.email]));

          setLogs(
            data.map((log) => ({
              ...log,
              admin_email: adminMap.get(log.admin_user_id),
            }))
          );
        }
      } catch (err) {
        console.error('Failed to fetch audit logs:', err);
        setError('Failed to load audit logs');
      } finally {
        setLoading(false);
      }
    };

    fetchAuditLogs();
  }, [filterAction, filterDays]);

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Loading audit logs...</div>;
  }

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
          <ShieldAlert className="w-8 h-8 text-gaming-accent" />
        </div>
        <h1 className="text-4xl font-black text-foreground">Audit Logs</h1>
      </div>

      <div className="glass-card p-6 mb-6">
        <div className="flex gap-4 flex-col md:flex-row">
          <div className="flex-1">
            <label className="block text-sm font-bold text-muted-foreground mb-2 uppercase tracking-wider">
              Action Type
            </label>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="w-full px-4 py-2 bg-(--nav-hover) border border-(--card-border) rounded-xl text-foreground focus:outline-none focus:border-gaming-accent transition-all"
            >
              <option value="all">All Actions</option>
              <option value="role_change">Role Change</option>
              <option value="user_deactivated">User Deactivated</option>
              <option value="data_deleted">Data Deleted</option>
              <option value="settings_updated">Settings Updated</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-bold text-muted-foreground mb-2 uppercase tracking-wider">
              Time Range (Days)
            </label>
            <select
              value={filterDays}
              onChange={(e) => setFilterDays(Number(e.target.value))}
              className="w-full px-4 py-2 bg-(--nav-hover) border border-(--card-border) rounded-xl text-foreground focus:outline-none focus:border-gaming-accent transition-all"
            >
              <option value={1}>Last 24 hours</option>
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>
        </div>
      </div>

      {error && <div className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-500">{error}</div>}

      <div className="glass-card overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-(--nav-hover) border-b border-(--card-border)">
            <tr>
              <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Admin</th>
              <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Action</th>
              <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Target</th>
              <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Details</th>
              <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-(--card-border)">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-(--nav-hover) transition-colors">
                <td className="px-6 py-4 text-sm text-foreground">{log.admin_email || 'Unknown'}</td>
                <td className="px-6 py-4 text-sm">
                  <span className="px-2 py-1 bg-gaming-accent/10 text-gaming-accent rounded-lg text-xs font-bold uppercase tracking-wider">
                    {log.action_type}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-foreground">
                  {log.target_table} <span className="text-muted-foreground">{log.target_id && `(${log.target_id.slice(0, 8)}...)`}</span>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground max-w-xs truncate">
                  {JSON.stringify(log.details)}
                </td>
                <td className="px-6 py-4 text-sm text-foreground">
                  {new Date(log.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {logs.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">No audit logs found</div>
        )}
      </div>
    </div>
  );
}
