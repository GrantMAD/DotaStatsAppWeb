'use client';

import React, { useState } from 'react';
import { Radio } from '@/components/ui/Icons';
import { LiveGameCard } from '@/components/ui/LiveGameCard';
import { useLiveGames } from '@/hooks/useOpenDota';
import { LiveMatchModal } from '@/components/match/LiveMatchModal';
import { LiveGame } from '@/types';

export function LiveGamesSection() {
  const { data: liveGames = [] } = useLiveGames();
  const [selectedGame, setSelectedGame] = useState<LiveGame | null>(null);

  // Filter out matches that might return 404s (e.g. low MMR, invalid server, or unparsable)
  const validLiveGames = liveGames.filter(game => game.average_mmr > 2000);

  if (validLiveGames.length === 0) return null;

  return (
    <div className="lg:col-span-2 space-y-8 mt-12">
      <LiveMatchModal
        isOpen={selectedGame !== null}
        onClose={() => setSelectedGame(null)}
        game={selectedGame}
      />

      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-(--nav-hover) text-loss">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <h3 className="text-xl font-black text-foreground">Live High-MMR</h3>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
          {validLiveGames.map((game) => (
            <LiveGameCard
              key={game.match_id}
              game={game}
              onPress={() => setSelectedGame(game)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
