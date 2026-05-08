'use client';

import Link from 'next/link';
import { Menu, Bell } from 'lucide-react';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { NotificationBell } from './NotificationBell';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/utils/cn';

export function MobileHeader() {
  const { resolvedTheme } = useTheme();
  const { user } = useSupabaseAuth();

  return (
    <header 
      className="lg:hidden fixed top-0 left-0 right-0 h-16 rounded-none border-x-0 border-t-0 z-50 flex items-center justify-between px-6 border-b border-[var(--card-border)]"
      style={{ background: 'var(--sidebar-bg)' }}
    >
      <div className="flex items-center gap-3">
        <button className={cn("p-1 transition-colors", resolvedTheme === 'light' ? "text-gaming-accent" : "text-gray-400")}>
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-gradient">DotaApp</h1>
      </div>

      <div className="flex items-center gap-4">
        {user && <NotificationBell />}
        <div className="w-8 h-8 rounded-full bg-gaming-accent/20 border border-gaming-accent/50 overflow-hidden">
          {user?.user_metadata?.avatar_url ? (
            <img src={user.user_metadata.avatar_url} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gaming-accent text-xs font-bold">
              {user ? user.email?.[0].toUpperCase() : '?'}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
