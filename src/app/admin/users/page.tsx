'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  steam_id: string;
  created_at: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchEmail, setSearchEmail] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'user'>('all');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const supabase = createClient();
        let query = supabase.from('users').select('*').order('created_at', { ascending: false });

        if (searchEmail) {
          query = query.ilike('email', `%${searchEmail}%`);
        }

        if (filterRole !== 'all') {
          query = query.eq('role', filterRole);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;
        setUsers(data || []);
      } catch (err) {
        console.error('Failed to fetch users:', err);
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [searchEmail, filterRole]);

  const toggleAdminRole = async (userId: string, currentRole: string) => {
    try {
      const newRole = currentRole === 'admin' ? 'user' : 'admin';
      const supabase = createClient();

      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));

      // Log the action
      await supabase.from('admin_audit_logs').insert({
        admin_user_id: (await supabase.auth.getUser()).data.user?.id,
        action_type: 'role_change',
        target_table: 'users',
        target_id: userId,
        details: { from_role: currentRole, to_role: newRole },
      });
    } catch (err) {
      console.error('Failed to update user role:', err);
      setError('Failed to update user role');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading users...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">User Management</h1>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex gap-4 flex-col md:flex-row">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search by Email
            </label>
            <input
              type="text"
              placeholder="Search email..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Role
            </label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as 'all' | 'admin' | 'user')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>
        </div>
      </div>

      {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Email</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Full Name</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Steam ID</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Role</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Joined</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{user.email}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{user.full_name || '-'}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{user.steam_id || '-'}</td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm">
                  <button
                    onClick={() => toggleAdminRole(user.id, user.role)}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {user.role === 'admin' ? 'Demote' : 'Promote'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="text-center py-12 text-gray-500">No users found</div>
        )}
      </div>
    </div>
  );
}
