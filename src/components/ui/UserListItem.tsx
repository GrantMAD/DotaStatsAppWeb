'use client';

import React from 'react';
import { User, ChevronRight, GitCompare } from 'lucide-react';
import { usePlayerProfile } from '@/hooks/useOpenDota';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/utils/cn';

interface UserListItemProps {
  user: {
    id: string;
    steam_account_id: string;
    steam_name: string;
  };
  onClick: () => void;
  rightComponent?: React.ReactNode;
}

export function UserListItem({ user: appUser, onClick, rightComponent }: UserListItemProps) {
  const { data: profile, isLoading } = usePlayerProfile(appUser.steam_account_id);
  const avatarUrl = profile?.profile?.avatarfull;

  return (
    <div 
      onClick={onClick}
      className="glass-card p-4 flex items-center gap-4 hover:border-gaming-accent/50 transition-all cursor-pointer group"
    >
      <div className="relative">
        <div className="w-12 h-12 rounded-full overflow-hidden border border-[var(--card-border)] bg-[var(--nav-hover)]">
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt={appUser.steam_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-gaming-accent border-t-transparent rounded-full animate-spin" />
              ) : (
                <User className="w-6 h-6 text-foreground/10" />
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-foreground font-bold truncate group-hover:text-gaming-accent transition-colors">
          {appUser.steam_name || profile?.profile?.personaname || (isLoading ? 'Loading...' : 'Unknown Player')}
        </h3>
        <p className="text-gray-500 text-xs mt-1">
          ID: {appUser.steam_account_id}
        </p>
      </div>

      {rightComponent ? (
        <div onClick={(e) => e.stopPropagation()}>{rightComponent}</div>
      ) : (
        <ChevronRight className="w-5 h-5 text-gray-700 group-hover:text-gaming-accent transition-colors" />
      )}
    </div>
  );
}
