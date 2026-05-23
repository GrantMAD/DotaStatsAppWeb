import React, { Suspense } from 'react';
import { getServerHeroStats, getServerProMatches } from '@/services/opendota';
import { createClient } from '@/utils/supabase/server';
import { HeroSearchSection } from '@/components/home/HeroSearchSection';
import { FriendsActivitySection } from '@/components/home/FriendsActivitySection';
import { MetaTierListSection } from '@/components/home/MetaTierListSection';
import { TrendsSection } from '@/components/home/TrendsSection';
import { ProSceneHubSection } from '@/components/home/ProSceneHubSection';
import { LiveGamesSection } from '@/components/home/LiveGamesSection';
import { Skeleton } from '@/components/ui/Skeleton';

export const revalidate = 300; // Revalidate the whole page every 5 minutes

export default async function HomePage() {
  // 1. Concurrent fetching of initial data
  const [heroesData, proMatchesData, supabase] = await Promise.all([
    getServerHeroStats(),
    getServerProMatches(10),
    createClient()
  ]);

  // 2. Try to get user bracket if logged in
  const userBracket = 4; // Default to Archon
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('steam_account_id')
      .eq('id', user.id)
      .single();
    
    if (profile?.steam_account_id) {
      // We could fetch the player profile here to get the rank_tier
      // For now, let's assume we might need a separate call or just default
      // In the client component, it will still use the Supabase context if needed
    }
  }

  return (
    <div className="pb-20">
      {/* Hero Section (Client) */}
      <HeroSearchSection />

      {/* Friends Activity (Client) */}
      <FriendsActivitySection />

      {/* Meta Tier List (Hybrid) */}
      <Suspense fallback={<div className="h-60 flex gap-4 overflow-hidden"><Skeleton className="w-45 h-55 shrink-0 rounded-2xl" /></div>}>
        <MetaTierListSection 
          initialHeroesData={heroesData} 
          userBracket={userBracket} 
        />
      </Suspense>

      {/* Trends Section (Client/Hybrid) */}
      <Suspense fallback={<div className="h-60 mt-12 flex gap-4 overflow-hidden"><Skeleton className="w-45 h-55 shrink-0 rounded-2xl" /></div>}>
        <TrendsSection initialHeroesData={heroesData} />
      </Suspense>

      {/* Pro Scene Hub (Hybrid) */}
      <Suspense fallback={<div className="h-60 mt-12 flex gap-4 overflow-hidden"><Skeleton className="w-75 h-48 shrink-0 rounded-2xl" /></div>}>
        <ProSceneHubSection 
          initialHeroesData={heroesData} 
          initialProMatches={proMatchesData} 
        />
      </Suspense>

      {/* Live Games (Client) */}
      <LiveGamesSection />
    </div>
  );
}
