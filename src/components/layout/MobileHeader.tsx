'use client';

import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { NotificationBell } from './NotificationBell';
import Image from 'next/image';

export function MobileHeader() {
  const { user } = useSupabaseAuth();

  return (
    <header
      className="lg:hidden fixed top-0 left-0 right-0 h-16 rounded-none border-x-0 border-t-0 z-50 flex items-center justify-between px-6 border-b border-(--card-border)"
      style={{ 
        background: 'var(--sidebar-bg)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)'
      }}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gaming-accent rounded-lg flex items-center justify-center shadow-lg shadow-gaming-accent/20">
          <span className="text-white font-bold text-lg">D</span>
        </div>
        <h1 className="text-lg font-bold text-gradient tracking-tight">DotaApp</h1>
      </div>

      <div className="flex items-center gap-4">
        {user && <NotificationBell />}
        <div className="w-8 h-8 rounded-full bg-gaming-accent/20 border border-gaming-accent/50 overflow-hidden shadow-inner">
          {user?.user_metadata?.avatar_url ? (
            <Image
              src={user.user_metadata.avatar_url}
              alt="avatar"
              width={32}
              height={32}
              className="w-full h-full object-cover"
            />
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
