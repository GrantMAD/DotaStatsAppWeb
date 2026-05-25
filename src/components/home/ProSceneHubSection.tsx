'use client';

import React, { useState } from 'react';
import { Star } from '@/components/ui/Icons';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ProMatchCard } from '@/components/ui/ProMatchCard';
import { ProMatch } from '@/types';
import dynamic from 'next/dynamic';
import { ProMatchSkeleton } from '../ui/HomeSkeletons';

const MatchDetailModal = dynamic(() => import('@/components/match/MatchDetailModal').then(mod => mod.MatchDetailModal), {
  ssr: false
});

interface ProSceneHubSectionProps {
  initialProMatches: ProMatch[];
}

export function ProSceneHubSection({ initialProMatches }: ProSceneHubSectionProps) {
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);

  return (
    <div className="mt-12">
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
      </div>
    </div>
  );
}
