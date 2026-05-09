'use client';

import { GlassCard } from "./GlassCard";
import { LiveGame } from "@/services/opendota";
import { STEAM_CDN_BASE } from "@/services/constants";
import { Users } from "lucide-react";
import { useHeroStats } from "@/hooks/useOpenDota";

interface LiveGameCardProps {
  game: LiveGame;
  onPress: (matchId: number) => void;
}

export function LiveGameCard({ game, onPress }: LiveGameCardProps) {
  const { data: heroStats = [] } = useHeroStats();

  const getHeroImg = (heroId: number) => {
    const hero = heroStats.find(h => h.id === heroId);
    return hero ? `${STEAM_CDN_BASE}${hero.img}` : null;
  };

  const formatMmr = (mmr: number) => {
    if (mmr >= 1000) return `${(mmr / 1000).toFixed(1)}k`;
    return mmr.toString();
  };

  return (
    <GlassCard 
      hoverable 
      onClick={() => onPress(game.match_id)}
      className="w-[280px] shrink-0 p-4 cursor-pointer"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 px-2 py-1 rounded bg-red-500/20 border border-red-500/30">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] font-black text-red-500 uppercase tracking-tighter">Live Match</span>
        </div>
        <div className="flex items-center gap-1.5 text-amber-500">
          <span className="text-xs font-black italic">{formatMmr(game.average_mmr)} MMR AVG</span>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-1 mb-3">
        {game.players.slice(0, 5).map((p, idx) => (
          <div key={idx} className="aspect-[4/3] rounded overflow-hidden bg-[var(--overlay-medium)] border border-[var(--overlay-border)]">
            {getHeroImg(p.hero_id) && (
              <img src={getHeroImg(p.hero_id)!} alt="hero" className="w-full h-full object-cover" />
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 mb-3">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[var(--overlay-border)]" />
        <span className="text-[10px] font-black text-gray-600 uppercase">VS</span>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[var(--overlay-border)]" />
      </div>

      <div className="grid grid-cols-5 gap-1 mb-4">
        {game.players.slice(5, 10).map((p, idx) => (
          <div key={idx} className="aspect-[4/3] rounded overflow-hidden bg-[var(--overlay-medium)] border border-[var(--overlay-border)]">
            {getHeroImg(p.hero_id) && (
              <img src={getHeroImg(p.hero_id)!} alt="hero" className="w-full h-full object-cover" />
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-gray-500">
        <div className="flex items-center gap-1.5">
           <Users className="w-3.5 h-3.5" />
           <span className="text-[10px] font-bold">Watch Live</span>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-gaming-accent">Spectate</span>
      </div>
    </GlassCard>
  );
}
