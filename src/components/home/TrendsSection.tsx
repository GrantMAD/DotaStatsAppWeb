'use client';

import React, { useState, useMemo } from 'react';
import { Trophy, Flame } from '@/components/ui/Icons';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { HeroStatsCard } from '@/components/ui/HeroStatsCard';
import { HeroStats } from '@/types';
import { processHeroStats } from '@/utils/heroStats';
import dynamic from 'next/dynamic';
import { HeroTrendsSkeleton } from '../ui/HomeSkeletons';

const HeroDetailModal = dynamic(() => import('@/components/hero/HeroDetailModal').then(mod => mod.HeroDetailModal), {
  ssr: false
});

interface TrendsSectionProps {
  initialHeroesData: HeroStats[];
}

export function TrendsSection({ initialHeroesData }: TrendsSectionProps) {
  const [selectedHeroId, setSelectedHeroId] = useState<number | null>(null);

  const processedStats = useMemo(() => processHeroStats(initialHeroesData), [initialHeroesData]);
  const { topWinRate, mostPicked } = processedStats;

  return (
    <div className="space-y-8 mt-12">
      <HeroDetailModal
        isOpen={selectedHeroId !== null}
        onClose={() => setSelectedHeroId(null)}
        heroId={selectedHeroId}
      />

      {/* Highest Win Rate */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
        <SectionHeader
          icon={Trophy}
          title="Highest Win Rate"
          description="Heroes with the highest win probability today."
          color="text-amber-500"
        />
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 no-scrollbar">
          {topWinRate.length === 0 ? (
            <HeroTrendsSkeleton />
          ) : (
            topWinRate.map((item, idx) => (
              <div key={item.id} onClick={() => setSelectedHeroId(item.id)} className="cursor-pointer">
                <HeroStatsCard
                  heroName={item.name}
                  heroImg={item.img}
                  winRate={item.winRate}
                  pickCount={item.picks}
                  rank={idx + 1}
                />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Most Picked */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
        <SectionHeader
          icon={Flame}
          title="Most Picked"
          description="The most popular heroes in pub matches."
          color="text-loss"
        />
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 no-scrollbar">
          {mostPicked.length === 0 ? (
            <HeroTrendsSkeleton />
          ) : (
            mostPicked.map((item, idx) => (
              <div key={item.id} onClick={() => setSelectedHeroId(item.id)} className="cursor-pointer">
                <HeroStatsCard
                  heroName={item.name}
                  heroImg={item.img}
                  winRate={item.winRate}
                  pickCount={item.picks}
                  rank={idx + 1}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
