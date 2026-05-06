'use client';

import React from 'react';
import { Trophy, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/utils/cn';
import { getLeagueImageUrl } from '@/services/constants';

interface League {
  leagueid: number;
  name: string;
  tier: string | null;
  banner: string | null;
}

interface LeagueCardProps {
  league: League;
  onClick: (id: number) => void;
}

export function LeagueCard({ league, onClick }: LeagueCardProps) {
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
          <img 
            src={bannerUrl} 
            alt={league.name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Trophy className="w-12 h-12 text-white/10" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className={cn(
            "px-2 py-1 rounded text-[10px] font-black uppercase border backdrop-blur-md",
            getTierColor(league.tier)
          )}>
            {league.tier || 'Unknown'}
          </span>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-white font-bold text-lg line-clamp-2 mb-4 group-hover:text-gaming-accent transition-colors">
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
