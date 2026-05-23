'use client';

import React, { useState, useMemo } from 'react';
import { Star } from 'lucide-react';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { HeroStatsCard } from '@/components/ui/HeroStatsCard';
import { cn } from '@/utils/cn';
import { calculateTierList, BRACKET_NAMES } from '@/services/tierList';
import { HeroStats } from '@/types';
import dynamic from 'next/dynamic';
import { MetaTierSkeleton } from '../ui/HomeSkeletons';

const HeroDetailModal = dynamic(() => import('@/components/hero/HeroDetailModal').then(mod => mod.HeroDetailModal), {
  ssr: false
});

export function MetaTierListSection({ initialHeroesData, userBracket }: { initialHeroesData: HeroStats[], userBracket: number | null }) {
  const [selectedBracket, setSelectedBracket] = useState<number | null>(null);
  const [selectedHeroId, setSelectedHeroId] = useState<number | null>(null);

  const activeBracket = selectedBracket || userBracket;

  const tierList = useMemo(() => {
    if (!initialHeroesData.length) return [];
    return calculateTierList(initialHeroesData, activeBracket || 4);
  }, [initialHeroesData, activeBracket]);

  const topTier = useMemo(() => tierList.slice(0, 15), [tierList]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
      <HeroDetailModal
        isOpen={selectedHeroId !== null}
        onClose={() => setSelectedHeroId(null)}
        heroId={selectedHeroId}
      />

      <SectionHeader
        icon={Star}
        title="Hero Meta Tier List"
        description="Calculated based on win rates and pick frequency in your rank."
        color="text-gaming-accent"
      />

      <div className="flex gap-2 overflow-x-auto pb-6 no-scrollbar">
        {Object.entries(BRACKET_NAMES).map(([b, name]) => (
          <button
            key={b}
            onClick={() => setSelectedBracket(Number(b))}
            className={cn(
              "px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all",
              activeBracket === Number(b)
                ? "bg-gaming-accent text-white shadow-lg shadow-gaming-accent/20"
                : "bg-(--nav-hover) text-gray-500 hover:bg-(--glass-start) hover:text-foreground"
            )}
          >
            {name}
          </button>
        ))}
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 no-scrollbar">
        {topTier.length === 0 ? (
          <MetaTierSkeleton />
        ) : (
          topTier.map((item) => (
            <div key={item.id} onClick={() => setSelectedHeroId(item.id)} className="cursor-pointer">
              <HeroStatsCard
                heroName={item.name}
                heroImg={item.img}
                winRate={item.winRate}
                pickCount={item.picks}
                tier={item.tier}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
