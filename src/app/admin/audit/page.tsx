'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

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

        // Enrich with admin email
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
    return <div className="text-center py-12">Loading audit logs...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Audit Logs</h1>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex gap-4 flex-col md:flex-row">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Action Type
            </label>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Actions</option>
              <option value="role_change">Role Change</option>
              <option value="user_deactivated">User Deactivated</option>
              <option value="data_deleted">Data Deleted</option>
              <option value="settings_updated">Settings Updated</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Range (Days)
            </label>
            <select
              value={filterDays}
              onChange={(e) => setFilterDays(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value={1}>Last 24 hours</option>
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>
        </div>
      </div>

      {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Admin</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Action</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Target</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Details</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{log.admin_email || 'Unknown'}</td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                    {log.action_type}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {log.target_table} {log.target_id && `(${log.target_id.slice(0, 8)}...)`}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                  {JSON.stringify(log.details)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {new Date(log.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {logs.length === 0 && (
          <div className="text-center py-12 text-gray-500">No audit logs found</div>
        )}
      </div>
    </div>
  );
}
