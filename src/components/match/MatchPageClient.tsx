'use client';

import React, { useState } from 'react';
import { useMatchDetails } from '@/hooks/useOpenDota';
import { cn } from '@/utils/cn';
import { requestMatchParse, getParseStatus } from '@/services/opendota';
import { LayoutGrid, BarChart2, Timer, MessageSquare, Trophy, AlertCircle, Lock, Loader2, CheckCircle2, XCircle, type LucideIcon } from '@/components/ui/Icons';
import { Button } from '@/components/ui/Button';
import { trackOpenDotaMatchView, trackEvent, trackMatchSnapshot } from '@/services/analytics';
import { MatchDetails } from '@/types';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';

const MatchScoreboard = dynamic(() => import('@/components/match/MatchScoreboard').then(mod => mod.MatchScoreboard), { ssr: false });
const MatchHighlights = dynamic(() => import('@/components/match/MatchHighlights').then(mod => mod.MatchHighlights), { ssr: false });
const MatchEconomy = dynamic(() => import('@/components/match/MatchEconomy').then(mod => mod.MatchEconomy), { ssr: false });
const MatchTimeline = dynamic(() => import('@/components/match/MatchTimeline').then(mod => mod.MatchTimeline), { ssr: false });
const MatchChat = dynamic(() => import('@/components/match/MatchChat').then(mod => mod.MatchChat), { ssr: false });

type MatchTab = 'Scoreboard' | 'Highlights' | 'Economy' | 'Timeline' | 'Chat';
type ParseStatus = 'idle' | 'queued' | 'parsing' | 'done' | 'failed';

interface MatchPageClientProps {
  initialMatch: MatchDetails;
}

export function MatchPageClient({ initialMatch }: MatchPageClientProps) {
  const matchId = initialMatch.match_id;
  const [activeTab, setActiveTab] = useState<MatchTab>('Scoreboard');
  const [isParsing, setIsParsing] = useState(false);
  const [parseStatus, setParseStatus] = useState<ParseStatus>('idle');
  
  const { data: match, refetch } = useMatchDetails(matchId, {
    initialData: initialMatch,
  });

  const activeMatch = match || initialMatch;

  // Effect to automatically refetch when parsing is "done"
  React.useEffect(() => {
    if (parseStatus === 'done') {
      const timer = setTimeout(() => {
        refetch();
        // Wait a bit then reset to idle so the banner disappears if version is now present
        setTimeout(() => setParseStatus('idle'), 2000);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [parseStatus, refetch]);

  // Polling logic for parse job
  React.useEffect(() => {
    let pollInterval: NodeJS.Timeout;
    let timeoutId: NodeJS.Timeout;

    if (parseStatus === 'queued' || parseStatus === 'parsing') {
      const jobId = localStorage.getItem(`parse_job_${matchId}`);
      if (!jobId) {
        setParseStatus('idle');
        return;
      }

      const checkStatus = async () => {
        try {
          const status = await getParseStatus(jobId);
          // OpenDota returns job info. If it's finished, the job object usually disappears or changes.
          // According to OpenDota API behavior, if the job is done, it might return a different structure 
          // or we can just check if the match now has a version by refetching match details periodically.
          
          // Better approach: OpenDota GET /request/{jobId} returns the job state.
          if (!status || status.state === 'completed' || status.complete) {
            setParseStatus('done');
            localStorage.removeItem(`parse_job_${matchId}`);
            toast.success('Match parsing complete!');
          } else if (status.state === 'active') {
            setParseStatus('parsing');
          }
        } catch (e) {
          console.error('Error checking parse status:', e);
        }
      };

      pollInterval = setInterval(checkStatus, 5000);

      // 5 minute timeout to prevent infinite polling
      timeoutId = setTimeout(() => {
        clearInterval(pollInterval);
        if (parseStatus !== 'done') {
          setParseStatus('failed');
          toast.error('Parsing timed out. Please try again later.');
        }
      }, 300000);
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [parseStatus, matchId]);

  React.useEffect(() => {
    if (activeMatch) {
      trackMatchSnapshot(activeMatch);
    }
  }, [activeMatch]);

  React.useEffect(() => {
    if (matchId) {
      trackOpenDotaMatchView(matchId.toString(), false);
    }
  }, [matchId]);

  React.useEffect(() => {
    if (matchId) {
      trackEvent({
        eventType: 'opendota_match_view',
        metadata: { matchId: matchId.toString(), section: activeTab.toLowerCase() }
      });
    }
  }, [activeTab, matchId]);

  const handleRequestParse = async () => {
    if (!matchId || isParsing) return;
    setIsParsing(true);
    try {
      const result = await requestMatchParse(matchId);
      if (result && result.job) {
        setParseStatus('queued');
        localStorage.setItem(`parse_job_${matchId}`, result.job.jobId);
        toast.info('Parse request submitted to OpenDota');
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to request match parse');
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
        <div className={cn(
          "p-6 rounded-3xl flex items-center gap-6 group animate-in slide-in-from-top-4 duration-500 mb-8 transition-colors border",
          parseStatus === 'idle' && "bg-amber-500/10 border-amber-500/20",
          (parseStatus === 'queued' || parseStatus === 'parsing') && "bg-gaming-accent/10 border-gaming-accent/20",
          parseStatus === 'done' && "bg-green-500/10 border-green-500/20",
          parseStatus === 'failed' && "bg-red-500/10 border-red-500/20",
        )}>
          <div className={cn(
            "p-4 rounded-2xl transition-all duration-500 group-hover:scale-110",
            parseStatus === 'idle' && "bg-amber-500/20 text-amber-500",
            (parseStatus === 'queued' || parseStatus === 'parsing') && "bg-gaming-accent/20 text-gaming-accent",
            parseStatus === 'done' && "bg-green-500/20 text-green-500",
            parseStatus === 'failed' && "bg-red-500/20 text-red-500",
          )}>
            {parseStatus === 'idle' && <AlertCircle size={24} />}
            {(parseStatus === 'queued' || parseStatus === 'parsing') && <Loader2 size={24} className="animate-spin" />}
            {parseStatus === 'done' && <CheckCircle2 size={24} />}
            {parseStatus === 'failed' && <XCircle size={24} />}
          </div>
          
          <div className="flex-1">
            <h3 className={cn(
              "font-black uppercase tracking-widest text-sm mb-1 transition-colors",
              parseStatus === 'idle' && "text-amber-500",
              (parseStatus === 'queued' || parseStatus === 'parsing') && "text-gaming-accent",
              parseStatus === 'done' && "text-green-500",
              parseStatus === 'failed' && "text-red-500",
            )}>
              {parseStatus === 'idle' && "Parsed Data Required"}
              {parseStatus === 'queued' && "Parsing Queued"}
              {parseStatus === 'parsing' && "Analyzing Match Data"}
              {parseStatus === 'done' && "Parsing Complete"}
              {parseStatus === 'failed' && "Parsing Failed"}
            </h3>
            <p className="text-gray-400 font-medium text-sm leading-relaxed">
              {parseStatus === 'idle' && "This match has not been fully parsed yet. Economy trends, timeline events, and detailed combat logs will be available once the parsing process is complete."}
              {parseStatus === 'queued' && "Your request is in the OpenDota queue. We are waiting for an available worker to start processing this match."}
              {parseStatus === 'parsing' && "DotaApp is currently analyzing replay data, item timings, and teamfight momentum. This usually takes 1-2 minutes."}
              {parseStatus === 'done' && "The match has been successfully analyzed. Refreshing detailed statistics now..."}
              {parseStatus === 'failed' && "We encountered an issue while parsing this match. OpenDota may be under high load. Please try again in a few minutes."}
            </p>
          </div>

          {parseStatus === 'idle' && (
            <Button 
              onClick={handleRequestParse} 
              disabled={isParsing}
              variant="secondary"
              className="border-amber-500/20 text-amber-500 hover:bg-amber-500/10"
            >
              {isParsing ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
              Start Parsing
            </Button>
          )}

          {(parseStatus === 'queued' || parseStatus === 'parsing') && (
            <div className="flex flex-col items-end gap-1 shrink-0">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gaming-accent/10 border border-gaming-accent/20">
                <div className="w-2 h-2 rounded-full bg-gaming-accent animate-pulse" />
                <span className="text-[10px] font-black text-gaming-accent uppercase tracking-widest">
                  {parseStatus === 'queued' ? 'In Queue' : 'Processing'}
                </span>
              </div>
              <span className="text-[9px] font-bold text-gray-500 uppercase italic whitespace-nowrap">Do not close this page</span>
            </div>
          )}

          {parseStatus === 'failed' && (
            <Button 
              onClick={() => setParseStatus('idle')}
              variant="outline"
              size="sm"
              className="border-red-500/20 text-red-500 hover:bg-red-500/10"
            >
              Retry
            </Button>
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
