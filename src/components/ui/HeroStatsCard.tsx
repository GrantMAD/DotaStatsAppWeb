'use client';

import { GlassCard } from "./GlassCard";
import { STEAM_CDN_BASE } from "@/services/constants";
import { cn } from "@/utils/cn";

interface HeroStatsCardProps {
  heroName: string;
  heroImg: string;
  winRate: number;
  pickCount: number;
  tier?: string;
  rank?: number;
  mode?: 'winrate' | 'picks';
}

export function HeroStatsCard({ 
  heroName, 
  heroImg, 
  winRate, 
  pickCount, 
  tier, 
  rank, 
  mode = 'winrate' 
}: HeroStatsCardProps) {
  const imgUrl = `${STEAM_CDN_BASE}${heroImg}`;

  return (
    <GlassCard hoverable className="w-[180px] shrink-0 p-3 flex flex-col gap-3 group relative overflow-hidden">
      {tier && (
        <div className={cn(
          "absolute top-0 right-0 w-12 h-12 flex items-center justify-center font-black text-xl italic rounded-bl-2xl border-l border-b border-[var(--card-border)] z-10",
          tier === 'S' ? "bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.5)]" : "bg-gaming-accent text-white"
        )}>
          {tier}
        </div>
      )}

      {rank && (
        <div className="absolute top-2 left-2 bg-[var(--card-bg)] backdrop-blur-md w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white z-10 border border-[var(--card-border)]">
          {rank}
        </div>
      )}

      <div className="relative aspect-[16/9] rounded-lg overflow-hidden bg-[var(--nav-hover)] border border-[var(--card-border)]">
        <img 
          src={imgUrl} 
          alt={heroName} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <div className="flex-1">
        <h4 className="text-sm font-bold text-foreground truncate group-hover:text-gaming-accent transition-colors">
          {heroName}
        </h4>
        <div className="mt-1 flex items-center justify-between text-[10px] text-gray-400 font-medium">
          <span>{pickCount.toLocaleString()} matches</span>
        </div>
      </div>

      <div className="mt-auto">
        <div className="w-full bg-[var(--nav-hover)] h-1.5 rounded-full overflow-hidden">
          <div 
            className={cn(
              "h-full rounded-full transition-all duration-1000",
              winRate >= 50 ? "bg-win" : "bg-loss"
            )}
            style={{ width: `${winRate}%` }}
          />
        </div>
        <p className={cn(
          "text-sm font-black mt-1",
          winRate >= 50 ? "text-win" : "text-loss"
        )}>
          {winRate.toFixed(1)}% <span className="text-[10px] font-bold text-gray-500 uppercase ml-1">Win Rate</span>
        </p>
      </div>
    </GlassCard>
  );
}
