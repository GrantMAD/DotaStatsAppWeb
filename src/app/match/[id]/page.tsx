'use client';

import React, { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMatchDetails, useLiveGames } from '@/hooks/useOpenDota';
import { MatchScoreboard } from '@/components/match/MatchScoreboard';
import { MatchHighlights } from '@/components/match/MatchHighlights';
import { MatchEconomy } from '@/components/match/MatchEconomy';
import { MatchTimeline } from '@/components/match/MatchTimeline';
import { MatchChat } from '@/components/match/MatchChat';
import { Skeleton } from '@/components/ui/Skeleton';
import { GlassCard } from '@/components/ui/GlassCard';
import { GAME_MODES } from '@/services/opendota';
import { cn } from '@/utils/cn';
import { LayoutGrid, BarChart2, Timer, MessageSquare, Trophy, AlertCircle, ArrowLeft, Radio, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';

type MatchTab = 'Scoreboard' | 'Highlights' | 'Economy' | 'Timeline' | 'Chat';

export default function MatchPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = Number(params.id);
  const [activeTab, setActiveTab] = useState<MatchTab>('Scoreboard');
  
  const { data: match, isLoading, error } = useMatchDetails(matchId);
  const { data: liveGames = [] } = useLiveGames();

  const liveGame = useMemo(() => {
    return liveGames.find(g => g.match_id === matchId);
  }, [liveGames, matchId]);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <Skeleton className="h-48 w-full rounded-3xl" />
        <Skeleton className="h-16 w-full rounded-2xl" />
        <div className="space-y-4">
           {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (!match && liveGame) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 pb-20">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors font-black uppercase text-[10px] tracking-widest"
        >
          <ArrowLeft size={14} /> Back to previous
        </button>

        <GlassCard className="p-12 border-red-500/20 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,var(--color-loss)_0%,transparent_70%)]" />
          <div className="relative z-10 flex flex-col items-center text-center space-y-8">
            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-red-500/20 border border-red-500/30">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm font-black text-red-500 uppercase tracking-widest">Live Match in Progress</span>
            </div>
            
            <div>
              <h1 className="text-5xl font-black text-white italic uppercase tracking-tighter mb-4">
                Match {matchId}
              </h1>
              <p className="text-gray-400 font-bold max-w-lg mx-auto">
                This match is currently being played at a high level. Detailed analytics will be available once the match is parsed by OpenDota.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl">
              <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Avg MMR</p>
                <p className="text-2xl font-black text-amber-500 italic">{liveGame.average_mmr}</p>
              </div>
              <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Duration</p>
                <p className="text-2xl font-black text-white italic">{Math.floor(liveGame.game_time / 60)}m</p>
              </div>
              <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Players</p>
                <p className="text-2xl font-black text-white italic">{liveGame.players.length}</p>
              </div>
              <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Server</p>
                <p className="text-2xl font-black text-white italic">#{liveGame.server_id.slice(-4)}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
               <Button size="lg" className="px-10 h-16 bg-red-600 hover:bg-red-500 text-lg font-black italic uppercase tracking-wider gap-3">
                 <Radio className="w-6 h-6 animate-pulse" />
                 Watch Live in Game
               </Button>
               <Button variant="secondary" size="lg" className="px-10 h-16 text-lg font-black italic uppercase tracking-wider" onClick={() => router.refresh()}>
                 Refresh Data
               </Button>
            </div>
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <GlassCard className="p-8">
             <h3 className="text-white font-black uppercase italic tracking-tight mb-6 flex items-center gap-2">
               <Users className="w-5 h-5 text-gaming-accent" /> Radiant Team
             </h3>
             <div className="space-y-4">
                {liveGame.players.slice(0, 5).map((p, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                    <div className="w-10 h-10 rounded-full bg-zinc-800" />
                    <span className="font-bold text-white">{p.name || `Player ${i + 1}`}</span>
                  </div>
                ))}
             </div>
           </GlassCard>

           <GlassCard className="p-8">
             <h3 className="text-white font-black uppercase italic tracking-tight mb-6 flex items-center gap-2">
               <Users className="w-5 h-5 text-loss" /> Dire Team
             </h3>
             <div className="space-y-4">
                {liveGame.players.slice(5, 10).map((p, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                    <div className="w-10 h-10 rounded-full bg-zinc-800" />
                    <span className="font-bold text-white">{p.name || `Player ${i + 6}`}</span>
                  </div>
                ))}
             </div>
           </GlassCard>
        </div>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <GlassCard className="p-10 border-dashed max-w-md">
          <AlertCircle className="w-16 h-16 text-loss mx-auto mb-6" />
          <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Match Not Found</h2>
          <p className="text-gray-500 font-medium mb-8">
            We couldn't retrieve details for Match ID: {matchId}. It might be too old or private.
          </p>
          <Button onClick={() => router.back()} variant="secondary">
            Go Back
          </Button>
        </GlassCard>
      </div>
    );
  }

  const TABS: { id: MatchTab; label: string; icon: any }[] = [
    { id: 'Scoreboard', label: 'Scoreboard', icon: LayoutGrid },
    { id: 'Highlights', label: 'Highlights', icon: Trophy },
    { id: 'Economy', label: 'Economy', icon: BarChart2 },
    { id: 'Timeline', label: 'Timeline', icon: Timer },
    { id: 'Chat', label: 'Chat Log', icon: MessageSquare },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors font-black uppercase text-[10px] tracking-widest"
      >
        <ArrowLeft size={14} /> Back to previous
      </button>

      {/* Match Hero Header */}
      <GlassCard className="p-0 overflow-hidden border-white/10 relative">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,var(--color-gaming-accent)_0%,transparent_70%)]" />
        
        <div className="p-8 md:p-12 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
              <h1 className="text-white font-black text-3xl md:text-4xl tracking-tighter uppercase mb-2">Match Analysis</h1>
              <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.3em]">
                {GAME_MODES[match.game_mode] || 'Standard Match'} • ID {match.match_id}
              </p>
            </div>

            <div className="flex items-center gap-12">
               <div className="text-center">
                  <p className="text-win font-black text-5xl md:text-6xl tracking-tighter">{match.radiant_score}</p>
                  <p className="text-win/50 text-[10px] font-black uppercase tracking-widest mt-1">Radiant</p>
               </div>
               
               <div className="flex flex-col items-center">
                  <div className="bg-black/40 border border-white/10 px-6 py-2 rounded-2xl backdrop-blur-xl">
                     <p className="text-white font-black text-xl">
                       {Math.floor(match.duration / 60)}:{String(match.duration % 60).padStart(2, '0')}
                     </p>
                  </div>
                  <div className={cn(
                    "mt-3 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                    match.radiant_win ? "bg-win/10 text-win border-win/20" : "bg-loss/10 text-loss border-loss/20"
                  )}>
                    {match.radiant_win ? 'Radiant Victory' : 'Dire Victory'}
                  </div>
               </div>

               <div className="text-center">
                  <p className="text-loss font-black text-5xl md:text-6xl tracking-tighter">{match.dire_score}</p>
                  <p className="text-loss/50 text-[10px] font-black uppercase tracking-widest mt-1">Dire</p>
               </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Tab Nav */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl sticky top-4 z-40 shadow-2xl">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 min-w-[120px] flex items-center justify-center gap-2 px-6 py-4 rounded-xl transition-all duration-300 font-black uppercase text-[10px] tracking-[0.1em]",
                isActive 
                  ? "bg-gaming-accent text-white shadow-lg shadow-gaming-accent/30 scale-[1.02]" 
                  : "text-gray-500 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon size={14} className={cn(isActive ? "text-white" : "text-gray-600")} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in duration-500">
        {activeTab === 'Scoreboard' && <MatchScoreboard match={match} />}
        {activeTab === 'Highlights' && <MatchHighlights match={match} />}
        {activeTab === 'Economy' && <MatchEconomy match={match} />}
        {activeTab === 'Timeline' && <MatchTimeline match={match} />}
        {activeTab === 'Chat' && <MatchChat match={match} />}
      </div>
    </div>
  );
}
