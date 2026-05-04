'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { usePlayerProfile, usePlayerWinLoss } from '@/hooks/useOpenDota';
import { useFriends } from '@/hooks/useFriends';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { PlayerOverviewContent } from '@/components/profile/PlayerOverviewContent';
import { Skeleton } from '@/components/ui/Skeleton';
import { GlassCard } from '@/components/ui/GlassCard';
import { AlertCircle } from 'lucide-react';

export default function ProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const { steamAccountId } = useSupabaseAuth();
  
  const { data: profile, isLoading: profileLoading, error: profileError } = usePlayerProfile(id);
  const { data: wl, isLoading: wlLoading } = usePlayerWinLoss(id);
  const { friends, following } = useFriends();

  const isCurrentUser = steamAccountId === id;

  if (profileLoading || wlLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <Skeleton className="h-64 w-full rounded-3xl" />
        <Skeleton className="h-16 w-full rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 space-y-4">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
           </div>
           <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <GlassCard className="p-10 border-dashed max-w-md">
          <AlertCircle className="w-16 h-16 text-loss mx-auto mb-6" />
          <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Player Not Found</h2>
          <p className="text-gray-500 font-medium mb-8">
            We couldn't find a Dota 2 profile for this account ID. Make sure the ID is correct and the profile is public.
          </p>
        </GlassCard>
      </div>
    );
  }

  return (
    <PlayerOverviewContent
      accountId={id}
      profile={profile}
      wl={wl || null}
      isCurrentUser={isCurrentUser}
      friendsCount={friends.length}
      followingCount={following.length}
      isPrivate={!profile.profile}
    />
  );
}
