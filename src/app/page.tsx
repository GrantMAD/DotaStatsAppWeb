import React, { Suspense } from 'react';
import { getServerHeroStats, getServerProMatches } from '@/services/opendota';
import { createClient } from '@/utils/supabase/server';
import { HeroSearchSection } from '@/components/home/HeroSearchSection';
import { SocialHubSection } from '@/components/home/SocialHubSection';
import { MetaTierListSection } from '@/components/home/MetaTierListSection';
import { TrendsSection } from '@/components/home/TrendsSection';
import { ProSceneHubSection } from '@/components/home/ProSceneHubSection';
import { LiveGamesSection } from '@/components/home/LiveGamesSection';
import { WelcomeHero } from '@/components/home/WelcomeHero';
import { SteamLinkCTA } from '@/components/home/SteamLinkCTA';
import { CommunityTrendsSection } from '@/components/home/CommunityTrendsSection';
import { MetaTierSkeleton, ProMatchSkeleton, HeroTrendsSkeleton } from '@/components/ui/HomeSkeletons';

export const revalidate = 300;

async function CommunityTrendsWrapper() {
  const heroesData = await getServerHeroStats();
  return <CommunityTrendsSection initialHeroesData={heroesData} />;
}

async function MetaTierListWrapper({ userBracket }: { userBracket: number | null }) {
  const heroesData = await getServerHeroStats();
  return <MetaTierListSection initialHeroesData={heroesData} userBracket={userBracket} />;
}

async function TrendsWrapper() {
  const heroesData = await getServerHeroStats();
  return <TrendsSection initialHeroesData={heroesData} />;
}

async function ProSceneWrapper() {
  const proMatchesData = await getServerProMatches(10);
  return <ProSceneHubSection initialProMatches={proMatchesData} />;
}

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const userBracket = 4;
  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('steam_account_id')
      .eq('id', user.id)
      .single();
    
    if (profile?.steam_account_id) {
      // Placeholder for actual bracket fetch if needed
    }
  }

  return (
    <div className="pb-20">
      {!user && <WelcomeHero />}

      <div id="main-content">
        <SteamLinkCTA />
        <HeroSearchSection />

        <SocialHubSection />

        <Suspense fallback={<HeroTrendsSkeleton />}>
          <CommunityTrendsWrapper />
        </Suspense>

        <Suspense fallback={<MetaTierSkeleton />}>
          <MetaTierListWrapper userBracket={userBracket} />
        </Suspense>

        <Suspense fallback={<HeroTrendsSkeleton />}>
          <TrendsWrapper />
        </Suspense>

        <Suspense fallback={<ProMatchSkeleton />}>
          <ProSceneWrapper />
        </Suspense>

        <LiveGamesSection />
      </div>
    </div>
  );
}
