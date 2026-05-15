'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMatchDetails, useLiveGames } from '@/hooks/useOpenDota';
import { MatchScoreboard } from '@/components/match/MatchScoreboard';
import { MatchHighlights } from '@/components/match/MatchHighlights';
import { MatchEconomy } from '@/components/match/MatchEconomy';
import { MatchTimeline } from '@/components/match/MatchTimeline';
import { MatchChat } from '@/components/match/MatchChat';
import { Skeleton } from '@/components/ui/Skeleton';
import { GlassCard } from '@/components/ui/GlassCard';
import { GAME_MODES, requestMatchParse } from '@/services/opendota';
import { cn } from '@/utils/cn';
import { LayoutGrid, BarChart2, Timer, MessageSquare, Trophy, AlertCircle, Radio, Users, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';

type MatchTab = 'Scoreboard' | 'Highlights' | 'Economy' | 'Timeline' | 'Chat';

export default function MatchPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = Number(params.id);
  const [activeTab, setActiveTab] = useState<MatchTab>('Scoreboard');
  const [isParsing, setIsParsing] = useState(false);
  const [parseRequested, setParseRequested] = useState(false);
  const [pollCount, setPollCount] = useState(0);
  
  const { data: match, isLoading, error } = useMatchDetails(matchId);

  // Auto-refresh polling logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (parseRequested && !match?.version && pollCount < 10) {
      interval = setInterval(() => {
        setPollCount(prev => prev + 1);
        // Next.js client-side re-fetching happens via useMatchDetails (React Query)
      }, 20000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [parseRequested, match?.version, pollCount]);
  const { data: liveGames = [] } = useLiveGames();

  const handleRequestParse = async () => {
    if (!matchId || isParsing) return;
    setIsParsing(true);
    try {
      const result = await requestMatchParse(matchId);
      if (result) {
        setParseRequested(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsParsing(false);
    }
  };

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
              <p className="text-gray-400 font-bold max-w-lg mx-auto">
                This match is currently being played at a high level. Detailed analytics will be available once the match is parsed by OpenDota.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl">
              <div className="bg-[var(--nav-hover)] border border-[var(--card-border)] p-6 rounded-3xl">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Avg MMR</p>
                <p className="text-2xl font-black text-amber-500 italic">{liveGame.average_mmr}</p>
              </div>
              <div className="bg-[var(--nav-hover)] border border-[var(--card-border)] p-6 rounded-3xl">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Duration</p>
                <p className="text-2xl font-black text-foreground italic">{Math.floor(liveGame.game_time / 60)}m</p>
              </div>
              <div className="bg-[var(--nav-hover)] border border-[var(--card-border)] p-6 rounded-3xl">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Players</p>
                <p className="text-2xl font-black text-foreground italic">{liveGame.players.length}</p>
              </div>
              <div className="bg-[var(--nav-hover)] border border-[var(--card-border)] p-6 rounded-3xl">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Server</p>
                <p className="text-2xl font-black text-foreground italic">#{liveGame.server_id.slice(-4)}</p>
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
             <h3 className="text-foreground font-black uppercase italic tracking-tight mb-6 flex items-center gap-2">
               <Users className="w-5 h-5 text-gaming-accent" /> Radiant Team
             </h3>
             <div className="space-y-4">
                {liveGame.players.slice(0, 5).map((p, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-[var(--nav-hover)] rounded-2xl border border-[var(--card-border)]">
                    <div className="w-10 h-10 rounded-full bg-zinc-800" />
                    <span className="font-bold text-foreground">{p.name || `Player ${i + 1}`}</span>
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
                  <div key={i} className="flex items-center gap-4 p-4 bg-[var(--nav-hover)] rounded-2xl border border-[var(--card-border)]">
                    <div className="w-10 h-10 rounded-full bg-zinc-800" />
                    <span className="font-bold text-foreground">{p.name || `Player ${i + 6}`}</span>
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
          <h2 className="text-2xl font-black text-foreground mb-2 uppercase tracking-tight">Match Not Found</h2>
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
      {/* Match Hero Header */}
      <GlassCard className="p-0 overflow-hidden border-[var(--card-border)] relative">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,var(--color-gaming-accent)_0%,transparent_70%)]" />
        
        <div className="p-8 md:p-12 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-foreground font-black text-3xl md:text-4xl tracking-tighter uppercase">Match Analysis</h1>
                <div className={cn(
                  "px-2 py-1 rounded-md border text-[8px] font-black uppercase tracking-widest",
                  match.version ? "bg-win/10 border-win/20 text-win" : "bg-amber-500/10 border-amber-500/20 text-amber-500"
                )}>
                  {match.version ? 'Full Analysis' : 'Basic Data'}
                </div>
              </div>
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
                  <div className="bg-[var(--glass-start)] border border-[var(--card-border)] px-6 py-2 rounded-2xl backdrop-blur-xl">
                     <p className="text-foreground font-black text-xl">
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

      {!match.version && (
        <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-3xl flex items-center gap-6 group animate-in slide-in-from-top-4 duration-500">
          <div className="p-4 rounded-2xl bg-amber-500/20 text-amber-500 group-hover:scale-110 transition-transform">
            <AlertCircle size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-amber-500 font-black uppercase tracking-widest text-sm mb-1">Parsed Data Required</h3>
            <p className="text-gray-400 font-medium text-sm leading-relaxed">
              This match has not been fully parsed yet. Economy trends, timeline events, and detailed combat logs will be available once the parsing process is complete.
            </p>
          </div>
          {!parseRequested ? (
            <Button 
              onClick={handleRequestParse} 
              disabled={isParsing}
              variant="secondary"
              className="border-amber-500/20 text-amber-500 hover:bg-amber-500/10"
            >
              Start Parsing
            </Button>
          ) : (
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Polling Data...</span>
              </div>
              <span className="text-[9px] font-bold text-gray-500 uppercase italic">This may take a few minutes</span>
            </div>
          )}
        </div>
      )}

      {/* Tab Nav */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-[var(--card-bg)] backdrop-blur-xl border border-[var(--card-border)] rounded-2xl sticky top-4 z-40 shadow-2xl">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isLocked = ['Economy', 'Timeline', 'Chat'].includes(tab.id) && !match.version;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 min-w-[120px] flex items-center justify-center gap-2 px-6 py-4 rounded-xl transition-all duration-300 font-black uppercase text-[10px] tracking-[0.1em]",
                isActive 
                  ? "bg-gaming-accent text-white shadow-lg shadow-gaming-accent/30 scale-[1.02]" 
                  : "text-gray-500 hover:text-foreground hover:bg-[var(--nav-hover)]",
                isLocked && "opacity-40"
              )}
            >
              <Icon size={14} className={cn(isActive ? "text-white" : "text-gray-600")} />
              {tab.label}
              {isLocked && <Lock size={10} className="ml-1" />}
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
