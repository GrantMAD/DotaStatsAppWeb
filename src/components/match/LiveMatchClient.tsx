'use client';

import React, { useEffect, useMemo } from 'react';
import { useLiveGames, useMatchDetails } from '@/hooks/useOpenDota';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Radio, Users, RefreshCw } from '@/components/ui/Icons';
import { LiveGame } from '@/types';
import { useRouter } from 'next/navigation';
import { cn } from '@/utils/cn';

interface LiveMatchClientProps {
  matchId: number;
  initialLiveGame: LiveGame;
}

export function LiveMatchClient({ matchId, initialLiveGame }: LiveMatchClientProps) {
  const router = useRouter();
  const { data: liveGames, isLoading } = useLiveGames();
  
  const liveGame = useMemo(() => {
    if (!liveGames) return initialLiveGame;
    return liveGames.find(g => g.match_id === matchId) || initialLiveGame;
  }, [liveGames, matchId, initialLiveGame]);

  // Also check if the match finished while we were looking
  const { data: fullMatch } = useMatchDetails(matchId, {
    enabled: !liveGames?.find(g => g.match_id === matchId) && !isLoading,
  });

  useEffect(() => {
    if (liveGames && !liveGames.find(g => g.match_id === matchId) && fullMatch) {
      // Match finished and is now available as a full match
      router.refresh();
    }
  }, [liveGames, matchId, fullMatch, router]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in duration-700">
      <GlassCard className="p-12 border-red-500/20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,var(--color-loss)_0%,transparent_70%)]" />
        <div className="relative z-10 flex flex-col items-center text-center space-y-8">
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-red-500/20 border border-red-500/30">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm font-black text-red-500 uppercase tracking-widest">Live Match in Progress</span>
          </div>
          
          <div>
            <h1 className="text-5xl font-black text-foreground italic uppercase tracking-tighter mb-4">
              Match {matchId}
            </h1>
            <p className="text-muted-foreground font-bold max-w-lg mx-auto">
              This match is currently being played at a high level. Detailed analytics will be available once the match is parsed by OpenDota.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl">
            <div className="bg-(--nav-hover) border border-(--card-border) p-6 rounded-3xl">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Avg MMR</p>
              <p className="text-2xl font-black text-amber-500 italic">{liveGame.average_mmr}</p>
            </div>
            <div className="bg-(--nav-hover) border border-(--card-border) p-6 rounded-3xl">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Duration</p>
              <p className="text-2xl font-black text-foreground italic">{Math.floor(liveGame.game_time / 60)}m</p>
            </div>
            <div className="bg-(--nav-hover) border border-(--card-border) p-6 rounded-3xl">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Players</p>
              <p className="text-2xl font-black text-foreground italic">{liveGame.players.length}</p>
            </div>
            <div className="bg-(--nav-hover) border border-(--card-border) p-6 rounded-3xl">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Server</p>
              <p className="text-2xl font-black text-foreground italic">#{liveGame.server_id.toString().slice(-4)}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
             <Button size="lg" className="px-10 h-16 bg-red-600 hover:bg-red-500 text-lg font-black italic uppercase tracking-wider gap-3">
               <Radio className="w-6 h-6 animate-pulse" />
               Watch Live in Game
             </Button>
             <Button 
               variant="secondary" 
               size="lg" 
               className="px-10 h-16 text-lg font-black italic uppercase tracking-wider gap-2"
               onClick={() => router.refresh()}
             >
               <RefreshCw className={cn("w-5 h-5", isLoading && "animate-spin")} />
               Refresh Data
             </Button>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <GlassCard className="p-8">
           <h3 className="text-foreground font-black uppercase italic tracking-tight mb-6 flex items-center gap-2">
             <Users className="w-5 h-5 text-gaming-accent" /> Radiant Team
           </h3>
           <div className="space-y-4">
              {liveGame.players.slice(0, 5).map((p, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-(--nav-hover) rounded-2xl border border-(--card-border) group hover:border-gaming-accent/30 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-black text-foreground/20">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <span className="font-bold text-foreground group-hover:text-gaming-accent transition-colors">{p.name || `Player ${i + 1}`}</span>
                    {p.hero_id && (
                       <p className="text-[10px] text-muted-foreground font-bold uppercase">Hero ID: {p.hero_id}</p>
                    )}
                  </div>
                </div>
              ))}
           </div>
         </GlassCard>

         <GlassCard className="p-8">
           <h3 className="text-foreground font-black uppercase italic tracking-tight mb-6 flex items-center gap-2">
             <Users className="w-5 h-5 text-loss" /> Dire Team
           </h3>
           <div className="space-y-4">
              {liveGame.players.slice(5, 10).map((p, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-(--nav-hover) rounded-2xl border border-(--card-border) group hover:border-loss/30 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-black text-foreground/20">
                    {i + 6}
                  </div>
                  <div className="flex-1">
                    <span className="font-bold text-foreground group-hover:text-loss transition-colors">{p.name || `Player ${i + 6}`}</span>
                    {p.hero_id && (
                       <p className="text-[10px] text-muted-foreground font-bold uppercase">Hero ID: {p.hero_id}</p>
                    )}
                  </div>
                </div>
              ))}
           </div>
         </GlassCard>
      </div>
    </div>
  );
}
