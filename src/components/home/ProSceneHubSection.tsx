'use client';

import React, { useState, useMemo } from 'react';
import { Star, Ban, ChevronDown, ChevronUp } from '@/components/ui/Icons';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ProMatchCard } from '@/components/ui/ProMatchCard';
import { GlassCard } from '@/components/ui/GlassCard';
import { STEAM_CDN_BASE } from '@/services/constants';
import { HeroStats, ProMatch } from '@/types';
import { processHeroStats } from '@/utils/heroStats';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { ProMatchSkeleton } from '../ui/HomeSkeletons';

const HeroDetailModal = dynamic(() => import('@/components/hero/HeroDetailModal').then(mod => mod.HeroDetailModal), {
  ssr: false
});

const MatchDetailModal = dynamic(() => import('@/components/match/MatchDetailModal').then(mod => mod.MatchDetailModal), {
  ssr: false
});

interface ProSceneHubSectionProps {
  initialHeroesData: HeroStats[];
  initialProMatches: ProMatch[];
}

export function ProSceneHubSection({ initialHeroesData, initialProMatches }: ProSceneHubSectionProps) {
  const [selectedHeroId, setSelectedHeroId] = useState<number | null>(null);
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);
  const [isBansExpanded, setIsBansExpanded] = useState(false);

  const { proBans } = useMemo(() => processHeroStats(initialHeroesData), [initialHeroesData]);

  return (
    <div className="mt-12">
      <HeroDetailModal
        isOpen={selectedHeroId !== null}
        onClose={() => setSelectedHeroId(null)}
        heroId={selectedHeroId}
      />

      <MatchDetailModal
        isOpen={selectedMatchId !== null}
        onClose={() => setSelectedMatchId(null)}
        matchId={selectedMatchId}
      />

      <SectionHeader
        icon={Star}
        title="Pro Scene Hub"
        description="Follow the latest tournament results and pro meta trends."
        color="text-gaming-accent"
      />

      {/* Recent Pro Matches */}
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 no-scrollbar">
        {initialProMatches.length === 0 ? (
          <ProMatchSkeleton />
        ) : (
          initialProMatches.map((item) => (
            <div key={item.match_id} onClick={() => setSelectedMatchId(item.match_id)} className="cursor-pointer">
              <ProMatchCard
                radiantName={item.radiant_name}
                direName={item.dire_name}
                radiantScore={item.radiant_score}
                direScore={item.dire_score}
                radiantWin={item.radiant_win}
                duration={item.duration}
                leagueName={item.league_name}
                startTime={item.start_time}
                radiantLogo={item.radiant_logo}
                direLogo={item.dire_logo}
              />
            </div>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
        {/* Pro Bans List */}
        <div className="lg:col-span-1">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-(--nav-hover) text-loss">
                <Ban className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-black text-foreground">Top Pro Bans</h3>
            </div>
          </div>
          <div className="space-y-2">
            {(isBansExpanded ? proBans : proBans.slice(0, 5)).map((hero, idx) => (
              <GlassCard
                key={hero.id}
                hoverable
                className="p-3 flex items-center gap-4 cursor-pointer"
                onClick={() => setSelectedHeroId(hero.id)}
              >
                <span className="w-6 text-sm font-black text-loss italic">{idx + 1}</span>
                <div className="relative w-12 h-7 rounded overflow-hidden bg-(--nav-hover)">
                  <Image
                    src={`${STEAM_CDN_BASE}${hero.img}`}
                    alt={hero.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="flex-1 text-sm font-bold text-foreground truncate">{hero.name}</span>
                <span className="text-xs font-black text-loss bg-loss/10 px-2 py-1 rounded-lg">
                  {hero.picks}
                </span>
              </GlassCard>
            ))}
            <button
              onClick={() => setIsBansExpanded(!isBansExpanded)}
              className="w-full py-3 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-foreground transition-colors"
            >
              {isBansExpanded ? <><ChevronUp className="inline w-4 h-4 mr-1" /> Show Less</> : <><ChevronDown className="inline w-4 h-4 mr-1" /> Show All Bans</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
