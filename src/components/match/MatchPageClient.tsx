'use client';

import React, { useState } from 'react';
import { useMatchDetails } from '@/hooks/useOpenDota';
import { cn } from '@/utils/cn';
import { requestMatchParse } from '@/services/opendota';
import { LayoutGrid, BarChart2, Timer, MessageSquare, Trophy, AlertCircle, Lock, type LucideIcon } from '@/components/ui/Icons';
import { Button } from '@/components/ui/Button';
import { MatchDetails } from '@/types';
import dynamic from 'next/dynamic';

const MatchScoreboard = dynamic(() => import('@/components/match/MatchScoreboard').then(mod => mod.MatchScoreboard), { ssr: false });
const MatchHighlights = dynamic(() => import('@/components/match/MatchHighlights').then(mod => mod.MatchHighlights), { ssr: false });
const MatchEconomy = dynamic(() => import('@/components/match/MatchEconomy').then(mod => mod.MatchEconomy), { ssr: false });
const MatchTimeline = dynamic(() => import('@/components/match/MatchTimeline').then(mod => mod.MatchTimeline), { ssr: false });
const MatchChat = dynamic(() => import('@/components/match/MatchChat').then(mod => mod.MatchChat), { ssr: false });

type MatchTab = 'Scoreboard' | 'Highlights' | 'Economy' | 'Timeline' | 'Chat';

interface MatchPageClientProps {
  initialMatch: MatchDetails;
}

export function MatchPageClient({ initialMatch }: MatchPageClientProps) {
  const matchId = initialMatch.match_id;
  const [activeTab, setActiveTab] = useState<MatchTab>('Scoreboard');
  const [isParsing, setIsParsing] = useState(false);
  const [parseRequested, setParseRequested] = useState(false);
  
  const { data: match } = useMatchDetails(matchId, {
    initialData: initialMatch,
    refetchInterval: (query) => {
      const data = query.state.data as { version?: unknown } | undefined;
      // If we requested a parse and don't have a version yet, poll every 20s
      if (parseRequested && !data?.version) return 20000;
      return false;
    }
  });

  const activeMatch = match || initialMatch;

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

  const TABS: { id: MatchTab; label: string; icon: LucideIcon }[] = [
    { id: 'Scoreboard', label: 'Scoreboard', icon: LayoutGrid },
    { id: 'Highlights', label: 'Highlights', icon: Trophy },
    { id: 'Economy', label: 'Economy', icon: BarChart2 },
    { id: 'Timeline', label: 'Timeline', icon: Timer },
    { id: 'Chat', label: 'Chat Log', icon: MessageSquare },
  ];

  return (
    <>
      {!activeMatch.version && (
        <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-3xl flex items-center gap-6 group animate-in slide-in-from-top-4 duration-500 mb-8">
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
      <div className="flex flex-wrap gap-2 p-1.5 bg-(--card-bg) backdrop-blur-xl border border-(--card-border) rounded-2xl sticky top-4 z-40 shadow-2xl mb-8">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isLocked = ['Economy', 'Timeline', 'Chat'].includes(tab.id) && !activeMatch.version;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 min-w-30 flex items-center justify-center gap-2 px-6 py-4 rounded-xl transition-all duration-300 font-black uppercase text-[10px] tracking-widest",
                isActive 
                  ? "bg-gaming-accent text-white shadow-lg shadow-gaming-accent/30 scale-[1.02]" 
                  : "text-gray-500 hover:text-foreground hover:bg-(--nav-hover)",
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
        {activeTab === 'Scoreboard' && <MatchScoreboard match={activeMatch} />}
        {activeTab === 'Highlights' && <MatchHighlights match={activeMatch} />}
        {activeTab === 'Economy' && <MatchEconomy match={activeMatch} />}
        {activeTab === 'Timeline' && <MatchTimeline match={activeMatch} />}
        {activeTab === 'Chat' && <MatchChat match={activeMatch} />}
      </div>
    </>
  );
}
