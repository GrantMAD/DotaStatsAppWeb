'use client';

import React from 'react';
import { Trophy, ChevronRight } from '@/components/ui/Icons';
import { cn } from '@/utils/cn';
import { getLeagueImageUrl } from '@/services/constants';
import Image from 'next/image';

interface League {
  leagueid: number;
  name: string;
  tier: string | null;
  banner: string | null;
}

interface LeagueCardProps {
  league: League;
  isActive?: boolean;
  onClick: (id: number) => void;
}

export function LeagueCard({ league, isActive, onClick }: LeagueCardProps) {
  const [imageError, setImageError] = React.useState(false);

  const getTierColor = (tier: string | null) => {
    switch (tier) {
      case 'premium': return 'text-purple-400 border-purple-400/30 bg-purple-400/10';
      case 'professional': return 'text-blue-400 border-blue-400/30 bg-blue-400/10';
      default: return 'text-gray-400 border-gray-400/30 bg-gray-400/10';
    }
  };

  const bannerUrl = getLeagueImageUrl(league.banner);

  return (
    <div
      onClick={() => onClick(league.leagueid)}
      className="glass-card overflow-hidden hover:border-gaming-accent/50 transition-all cursor-pointer group flex flex-col h-full"
    >
      <div className="relative aspect-video w-full bg-black/40 overflow-hidden">
        {bannerUrl && !imageError ? (
          <Image
            src={bannerUrl}
            alt={league.name}
            fill
            unoptimized
            onError={() => setImageError(true)}
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Trophy className="w-12 h-12 text-white/10" />
          </div>
        )}

        {/* Status & Tier Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <span className={cn(
            "px-2 py-1 rounded text-[10px] font-black uppercase border backdrop-blur-md",
            getTierColor(league.tier)
          )}>
            {league.tier || 'Unknown'}
          </span>

          <div className={cn(
            "px-2 py-1 rounded text-[8px] font-black uppercase border backdrop-blur-md flex items-center gap-1 w-fit",
            isActive
              ? "bg-win/20 text-win border-win/30 animate-pulse"
              : "bg-gray-500/20 text-gray-400 border-gray-500/30"
          )}>
            <div className={cn("w-1.5 h-1.5 rounded-full", isActive ? "bg-win" : "bg-gray-500")} />
            {isActive ? 'Live / Active' : 'Archived'}
          </div>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-foreground font-bold text-lg line-clamp-2 mb-4 group-hover:text-gaming-accent transition-colors">
          {league.name}
        </h3>

        <div className="mt-auto flex items-center justify-between">
          <span className="text-xs text-gray-500 font-medium">ID: {league.leagueid}</span>
          <div className="flex items-center gap-1 text-gaming-accent text-xs font-black uppercase tracking-wider">
            View Matches
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
