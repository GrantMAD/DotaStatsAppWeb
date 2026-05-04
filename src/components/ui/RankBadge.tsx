'use client';

import React from 'react';
import { getRankBadgeUrl, getRankStarsUrl, RANK_NAMES } from '../../services/constants';
import { cn } from '@/utils/cn';

interface RankBadgeProps {
  rankTier: number | null;
  leaderboardRank?: number | null;
  size?: number;
  showText?: boolean;
}

export default function RankBadge({ 
  rankTier, 
  leaderboardRank, 
  size = 60,
  showText = true 
}: RankBadgeProps) {
  if (!rankTier && !leaderboardRank) return null;

  const badgeUrl = getRankBadgeUrl(rankTier);
  const starsUrl = getRankStarsUrl(rankTier);
  const rankDigit = rankTier ? Math.floor(rankTier / 10) : 0;
  const starsDigit = rankTier ? rankTier % 10 : 0;
  const rankName = RANK_NAMES[rankDigit] || "Unranked";

  return (
    <div className="flex flex-col items-center shrink-0">
      <div 
        style={{ width: size, height: size }} 
        className="relative flex items-center justify-center"
      >
        <img 
          src={badgeUrl} 
          alt={rankName}
          className="absolute inset-0 w-full h-full object-contain"
        />
        
        {starsUrl && rankDigit < 8 && (
          <img 
            src={starsUrl} 
            alt="stars"
            className="absolute inset-0 w-full h-full object-contain"
          />
        )}

        {rankDigit === 8 && leaderboardRank && (
          <div className="absolute bottom-0 bg-black/80 border border-amber-500/50 px-1.5 rounded text-[10px] font-black text-white shadow-lg">
            {leaderboardRank}
          </div>
        )}
      </div>
      
      {showText && (
        <span className="text-gaming-accent text-[10px] font-black mt-1 uppercase tracking-widest whitespace-nowrap">
          {rankName} {rankDigit < 8 && starsDigit > 0 ? starsDigit : ''}
        </span>
      )}
    </div>
  );
};
