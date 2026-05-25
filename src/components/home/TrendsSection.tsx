'use client';

import React, { useState, useMemo } from 'react';
import { Trophy, Flame, Ban } from '@/components/ui/Icons';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { HeroStatsCard } from '@/components/ui/HeroStatsCard';
import { GlassCard } from '@/components/ui/GlassCard';
import { HeroStats } from '@/types';
import { STEAM_CDN_BASE } from '@/services/constants';
import { processHeroStats } from '@/utils/heroStats';
import dynamic from 'next/dynamic';
import { HeroTrendsSkeleton } from '../ui/HomeSkeletons';
import Image from 'next/image';

const HeroDetailModal = dynamic(() => import('@/components/hero/HeroDetailModal').then(mod => mod.HeroDetailModal), {
  ssr: false
});

interface TrendsSectionProps {
  initialHeroesData: HeroStats[];
}

export function TrendsSection({ initialHeroesData }: TrendsSectionProps) {
  const [selectedHeroId, setSelectedHeroId] = useState<number | null>(null);

  const processedStats = useMemo(() => processHeroStats(initialHeroesData), [initialHeroesData]);
  const { topWinRate, mostPicked, proBans } = processedStats;

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

      {/* Top Pro Bans */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
        <SectionHeader
          icon={Ban}
          title="Top Pro Bans"
          description="Most banned heroes in professional play."
          color="text-rose-500"
        />
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 no-scrollbar">
          {proBans.length === 0 ? (
            <HeroTrendsSkeleton />
          ) : (
            proBans.slice(0, 10).map((item, idx) => (
              <div key={item.id} onClick={() => setSelectedHeroId(item.id)} className="cursor-pointer">
                <GlassCard
                  hoverable
                  className="w-40 p-3 flex flex-col gap-2 items-center"
                >
                  <div className="relative w-full aspect-4/3 rounded overflow-hidden">
                    <Image
                      src={`${STEAM_CDN_BASE}${item.img}`}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-1 left-1 bg-black/60 px-1.5 py-0.5 rounded text-[10px] font-black text-white">
                      #{idx + 1}
                    </div>
                  </div>
                  <span className="text-xs font-bold text-foreground truncate w-full text-center">
                    {item.name}
                  </span>
                  <span className="text-[10px] font-black text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded">
                    {item.picks} Bans
                  </span>
                </GlassCard>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
