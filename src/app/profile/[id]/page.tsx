import React from 'react';
import { getServerPlayerProfile, getServerPlayerWinLoss } from '@/services/opendota';
import { ProfilePageClient } from '@/components/profile/ProfilePageClient';
import { GlassCard } from '@/components/ui/GlassCard';
import { AlertCircle } from '@/components/ui/Icons';
import { createClient } from '@/utils/supabase/server';
import { Metadata } from 'next';

export const revalidate = 600; // Update player data every 10 minutes

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const profile = await getServerPlayerProfile(id);
  
  const playerName = profile?.profile?.personaname || 'Unknown Player';
  
  return {
    title: `${playerName} - Dota 2 Player Profile | Dota Intelligence`,
    description: `View Dota 2 match history, win/loss stats, and hero performance for ${playerName}.`,
  };
}

export default async function ProfilePage({ params }: PageProps) {
  const { id } = await params;
  
  // 1. Fetch data on the server
  const [profile, wl, supabase] = await Promise.all([
    getServerPlayerProfile(id),
    getServerPlayerWinLoss(id),
    createClient()
  ]);

  // 2. Handle errors / Not found
  if (!profile) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <GlassCard className="p-10 border-dashed max-w-md">
          <AlertCircle className="w-16 h-16 text-loss mx-auto mb-6" />
          <h2 className="text-2xl font-black text-foreground mb-2 uppercase tracking-tight">Player Not Found</h2>
          <p className="text-muted-foreground font-medium mb-8">
            We couldn&apos;t find a Dota 2 profile for this account ID. Make sure the ID is correct and the profile is public.
          </p>
        </GlassCard>
      </div>
    );
  }

  // 3. Get Auth state for friends/following counts
  const { data: { user } } = await supabase.auth.getUser();
  let friendsCount = 0;
  let followingCount = 0;
  let isCurrentUser = false;

  if (user) {
    const { data: appUser } = await supabase
      .from('users')
      .select('steam_account_id')
      .eq('id', user.id)
      .single();
    
    isCurrentUser = appUser?.steam_account_id === id;

    // Fetch following/friends counts from DB if logged in
    const [{ count: following }, { count: friends }] = await Promise.all([
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', user.id),
      supabase.from('friendships').select('*', { count: 'exact', head: true })
        .eq('status', 'accepted')
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
    ]);
    
    followingCount = following || 0;
    friendsCount = friends || 0;
  }

  return (
    <ProfilePageClient
      accountId={id}
      initialProfile={profile}
      initialWL={wl}
      isCurrentUser={isCurrentUser}
      friendsCount={friendsCount}
      followingCount={followingCount}
    />
  );
}
