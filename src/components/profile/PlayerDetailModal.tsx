'use client';

import React from 'react';
import { usePlayerProfile, usePlayerWinLoss } from '@/hooks/useOpenDota';
import { useFriends } from '@/hooks/useFriends';
import { Modal } from '../ui/Modal';
import { PlayerOverviewContent } from './PlayerOverviewContent';
import { Skeleton } from '../ui/Skeleton';
import { AlertCircle } from 'lucide-react';

interface PlayerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountId: string | null;
  isCurrentUser?: boolean;
}

export function PlayerDetailModal({
  isOpen,
  onClose,
  accountId,
  isCurrentUser = false,
}: PlayerDetailModalProps) {
  const { data: profile, isLoading: profileLoading, error: profileError } = usePlayerProfile(isOpen && accountId ? accountId : null);
  const { data: wl, isLoading: wlLoading } = usePlayerWinLoss(isOpen && accountId ? accountId : null);
  const { friends = [], following = [] } = useFriends();

  const loading = profileLoading || wlLoading;

  // Header Title Logic
  const playerName = profile?.profile?.personaname || "Player Details";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={playerName} size="xl">
      <div className="h-full flex flex-col">
        {loading ? (
          <div className="space-y-8 animate-pulse p-4">
            <Skeleton className="h-48 w-full rounded-3xl" />
            <Skeleton className="h-12 w-full rounded-2xl" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}
              </div>
              <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
          </div>
        ) : profileError || !profile || !accountId ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertCircle className="w-16 h-16 text-loss mb-6" />
            <h2 className="text-2xl font-black text-foreground mb-2 uppercase tracking-tight">
              {profileError ? "Search Error" : "Player Not Found"}
            </h2>
            <p className="text-gray-500 font-medium max-w-xs mx-auto">
              {profileError 
                ? "There was an issue connecting to the archives. Please try again later."
                : "We couldn't retrieve profile details for this account ID."}
            </p>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <PlayerOverviewContent
              accountId={accountId}
              profile={profile}
              wl={wl || null}
              isCurrentUser={isCurrentUser}
              friendsCount={friends.length}
              followingCount={following.length}
              isPrivate={!profile.profile}
            />
          </div>
        )}
      </div>
    </Modal>
  );
}
