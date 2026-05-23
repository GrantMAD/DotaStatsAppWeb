'use client';

import React, { useState } from 'react';
import { Radio } from '@/components/ui/Icons';
import { LiveGameCard } from '@/components/ui/LiveGameCard';
import { useLiveGames } from '@/hooks/useOpenDota';
import dynamic from 'next/dynamic';

const MatchDetailModal = dynamic(() => import('@/components/match/MatchDetailModal').then(mod => mod.MatchDetailModal), {
  ssr: false
});

export function LiveGamesSection() {
  const { data: liveGames = [] } = useLiveGames();
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);

  if (liveGames.length === 0) return null;

  return (
    <div className="lg:col-span-2 space-y-8 mt-12">
      <MatchDetailModal
        isOpen={selectedMatchId !== null}
        onClose={() => setSelectedMatchId(null)}
        matchId={selectedMatchId}
      />

      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-(--nav-hover) text-loss">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <h3 className="text-xl font-black text-foreground">Live High-MMR</h3>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
          {liveGames.map((game) => (
            <LiveGameCard
              key={game.match_id}
              game={game}
              onPress={(id) => setSelectedMatchId(id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
