'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { Users, Search, ArrowLeft } from '@/components/ui/Icons';
import { AdminSkeleton } from '@/components/ui/AdminSkeleton';
import { cn } from '@/utils/cn';

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
    return <AdminSkeleton />;
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
          <Users className="w-8 h-8 text-gaming-accent" />
        </div>
        <h1 className="text-4xl font-black text-foreground">User Management</h1>
      </div>

      <div className="glass-card p-6 mb-6">
        <div className="flex gap-4 flex-col md:flex-row">
          <div className="flex-1">
            <label className="block text-sm font-bold text-muted-foreground mb-2 uppercase tracking-wider">
              Search by Email
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search email..."
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                className="w-full pl-11 px-4 py-2 bg-(--nav-hover) border border-(--card-border) rounded-xl text-foreground focus:outline-none focus:border-gaming-accent transition-all"
              />
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-bold text-muted-foreground mb-2 uppercase tracking-wider">
              Filter by Role
            </label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as 'all' | 'admin' | 'user')}
              className="w-full px-4 py-2 bg-(--nav-hover) border border-(--card-border) rounded-xl text-foreground focus:outline-none focus:border-gaming-accent transition-all"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>
        </div>
      </div>

      {error && <div className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-500">{error}</div>}

      <div className="glass-card overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-(--nav-hover) border-b border-(--card-border)">
            <tr>
              <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Full Name</th>
              <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Steam ID</th>
              <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Joined</th>
              <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-(--card-border)">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-(--nav-hover) transition-colors">
                <td className="px-6 py-4 text-sm text-foreground">{user.email}</td>
                <td className="px-6 py-4 text-sm text-foreground">{user.full_name || '-'}</td>
                <td className="px-6 py-4 text-sm text-foreground">{user.steam_id || '-'}</td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                      user.role === 'admin'
                        ? 'bg-gaming-accent/10 text-gaming-accent'
                        : 'bg-(--nav-hover) text-muted-foreground'
                    )}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-foreground">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm">
                  <button
                    onClick={() => toggleAdminRole(user.id, user.role)}
                    className="text-gaming-accent font-bold hover:text-white hover:bg-gaming-accent px-3 py-1 rounded-lg transition-all"
                  >
                    {user.role === 'admin' ? 'Demote' : 'Promote'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">No users found</div>
        )}
      </div>
    </div>
  );
}
