import React from 'react';
import { getServerMatchDetails, getLiveGames, GAME_MODES } from '@/services/opendota';
import { MatchPageClient } from '@/components/match/MatchPageClient';
import { LiveMatchClient } from '@/components/match/LiveMatchClient';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import { Timer, AlertCircle, ChevronLeft } from '@/components/ui/Icons';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MatchPage({ params }: PageProps) {
  const { id } = await params;
  const matchId = Number(id);

  // 1. Concurrent fetching of match data and live games
  const [match, liveGames] = await Promise.all([
    getServerMatchDetails(matchId),
    getLiveGames()
  ]);

  const liveGame = liveGames.find(g => g.match_id === matchId);

  // 2. Handle Live Match Case
  if (!match && liveGame) {
    return <LiveMatchClient matchId={matchId} initialLiveGame={liveGame} />;
  }

  // 3. Handle Not Found Case
  if (!match) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <GlassCard className="p-10 border-dashed max-w-md">
          <AlertCircle className="w-16 h-16 text-loss mx-auto mb-6" />
          <h2 className="text-2xl font-black text-foreground mb-2 uppercase tracking-tight">Match Not Found</h2>
          <p className="text-muted-foreground font-medium mb-8">
            We couldn&apos;t retrieve details for Match ID: {matchId}. It might be too old or private.
          </p>
          <Link href="/">
            <Button variant="secondary">
              Go Home
            </Button>
          </Link>
        </GlassCard>
      </div>
    );
  }

  // 4. Render Server-Side Match Header
  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between gap-4 mt-8">
        <Link href="/">
          <Button variant="secondary" size="sm" className="inline-flex items-center gap-2">
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
      </div>

      {/* Match Hero Header - Immersive Redesign */}
      <GlassCard className="p-0 overflow-hidden border-none relative bg-transparent">
        {/* Dynamic Background Splitting */}
        <div className="absolute inset-0 flex">
          <div className="flex-1 bg-linear-to-br from-win/20 via-win/5 to-transparent" />
          <div className="flex-1 bg-linear-to-bl from-loss/20 via-loss/5 to-transparent" />
        </div>
        
        {/* Atmosphere/Glow effects */}
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-win/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-loss/10 rounded-full blur-[100px] animate-pulse" />

        <div className="p-10 md:p-14 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12">
            {/* Radiant Info */}
            <div className="flex-1 text-center md:text-left space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-win/10 border border-win/20">
                <div className="w-1.5 h-1.5 rounded-full bg-win shadow-[0_0_8px_var(--color-win)]" />
                <span className="text-[10px] font-black text-win uppercase tracking-widest">Radiant Faction</span>
              </div>
              <div>
                <h2 className="text-win font-black text-6xl md:text-8xl tracking-tighter italic leading-none">{match.radiant_score}</h2>
                <p className="text-win/40 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Battle Score</p>
              </div>
            </div>

            {/* Central Conflict Area */}
            <div className="flex flex-col items-center shrink-0">
               <div className="relative group">
                  <div className="absolute -inset-8 bg-gaming-accent/10 rounded-full blur-2xl group-hover:bg-gaming-accent/20 transition-colors" />
                  <div className="relative bg-zinc-900/80 border border-white/10 px-8 py-4 rounded-3xl backdrop-blur-2xl shadow-2xl flex flex-col items-center min-w-45">
                     <div className="flex items-center gap-2 mb-1">
                        <Timer className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xl font-black text-foreground italic tracking-tight">
                          {Math.floor(match.duration / 60)}:{String(match.duration % 60).padStart(2, '0')}
                        </span>
                     </div>
                     <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Game Duration</p>
                     
                     <div className="w-full h-px bg-linear-to-r from-transparent via-white/10 to-transparent my-3" />
                     
                     <div className={cn(
                       "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-lg",
                       match.radiant_win ? "bg-win/20 text-win border-win/30 shadow-win/10" : "bg-loss/20 text-loss border-loss/30 shadow-loss/10"
                     )}>
                       {match.radiant_win ? 'Radiant Victory' : 'Dire Victory'}
                     </div>
                  </div>
               </div>
               
               <div className="mt-8 text-center">
                  <p className="text-foreground font-black text-sm uppercase tracking-[0.2em] italic mb-1">{GAME_MODES[match.game_mode] || 'Standard Match'}</p>
                  <p className="text-muted-foreground font-bold text-[9px] uppercase tracking-widest">Match ID: {match.match_id}</p>
               </div>
            </div>

            {/* Dire Info */}
            <div className="flex-1 text-center md:text-right space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-loss/10 border border-loss/20">
                <span className="text-[10px] font-black text-loss uppercase tracking-widest">Dire Faction</span>
                <div className="w-1.5 h-1.5 rounded-full bg-loss shadow-[0_0_8px_var(--color-loss)]" />
              </div>
              <div>
                <h2 className="text-loss font-black text-6xl md:text-8xl tracking-tighter italic leading-none">{match.dire_score}</h2>
                <p className="text-loss/40 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Battle Score</p>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Client Logic (Tabs & Polling) */}
      <MatchPageClient initialMatch={match} />
    </div>
  );
}
