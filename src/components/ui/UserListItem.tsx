'use client';

import React from 'react';
import { User, ChevronRight, EyeOff } from '@/components/ui/Icons';
import { usePlayerProfile, isProfilePrivate } from '@/hooks/useOpenDota';
import { usePresence } from '@/context/PresenceContext';
import Image from "next/image";
import { AnimationWrapper } from './AnimationWrapper';
import { cn } from '@/utils/cn';

interface UserListItemProps {
  user: {
    id: string;
    steam_account_id: string;
    steam_name: string;
  };
  onClick: () => void;
  rightComponent?: React.ReactNode;
  stackMetadata?: boolean;
}

export function UserListItem({ user: appUser, onClick, rightComponent, stackMetadata = false }: UserListItemProps) {
  const { data: profile, isLoading } = usePlayerProfile(appUser.steam_account_id);
  const { isUserOnline, onlineUsers } = usePresence();
  const avatarUrl = profile?.profile?.avatarfull;
  const isPrivate = isProfilePrivate(profile ?? null);
  const isOnline = isUserOnline(appUser.id);
  const presenceInfo = isOnline ? onlineUsers[appUser.id][0] : null;

  return (
    <AnimationWrapper animationType="fade-in">
      <div
        onClick={onClick}
        className="glass-card p-4 flex items-center gap-4 hover:border-gaming-accent/50 transition-all cursor-pointer group"
      >
        <div className="relative">
          <div className="w-12 h-12 rounded-full overflow-hidden border border-(--card-border) bg-(--nav-hover)">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={appUser.steam_name}
                fill
                unoptimized
                className="object-cover"
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
          {isOnline && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-background rounded-full flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-foreground font-bold truncate group-hover:text-gaming-accent transition-colors">
              {appUser.steam_name || profile?.profile?.personaname || (isLoading ? 'Loading...' : 'Unknown Player')}
            </h3>
            {isOnline && presenceInfo?.activity && (
              <span className="text-[10px] font-medium text-green-500/80 italic truncate animate-in fade-in slide-in-from-left-1">
                • {presenceInfo.activity}
              </span>
            )}
          </div>
          {stackMetadata ? (
            <div className="mt-1 space-y-1">
              <p className="text-muted-foreground text-xs">ID: {appUser.steam_account_id}</p>
              {isPrivate && !isLoading && (
                <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-[8px] font-black uppercase tracking-tighter">
                  <EyeOff size={8} />
                  Private
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 mt-1">
              <p className="text-muted-foreground text-xs">
                ID: {appUser.steam_account_id}
              </p>
              {isPrivate && !isLoading && (
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-[8px] font-black uppercase tracking-tighter">
                  <EyeOff size={8} />
                  Private
                </div>
              )}
            </div>
          )}
        </div>

        {rightComponent ? (
          <div onClick={(e) => e.stopPropagation()}>{rightComponent}</div>
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-700 group-hover:text-gaming-accent transition-colors" />
        )}
      </div>
    </AnimationWrapper>
  );
}
