'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { useMatchDetails } from '@/hooks/useOpenDota';
import { MatchScoreboard } from './MatchScoreboard';
import { MatchHighlights } from './MatchHighlights';
import { MatchEconomy } from './MatchEconomy';
import { MatchTimeline } from './MatchTimeline';
import { MatchChat } from './MatchChat';
import { cn } from '@/utils/cn';
import {
  LayoutGrid,
  BarChart2,
  Timer,
  MessageSquare,
  Trophy,
  AlertCircle,
  Lock,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { useRouter } from 'next/navigation';

type MatchTab = 'Scoreboard' | 'Highlights' | 'Economy' | 'Timeline' | 'Chat';

interface MatchDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchId: number | null;
}

export function MatchDetailModal({
  isOpen,
  onClose,
  matchId,
}: MatchDetailModalProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<MatchTab>('Scoreboard');

  const { data: match, isLoading, error } = useMatchDetails(matchId || 0, {
    enabled: !!matchId && isOpen,
  });

  if (!isOpen) return null;

  const TABS: { id: MatchTab; label: string; icon: LucideIcon }[] = [
    { id: 'Scoreboard', label: 'Score', icon: LayoutGrid },
    { id: 'Highlights', label: 'Feats', icon: Trophy },
    { id: 'Economy', label: 'Gold', icon: BarChart2 },
    { id: 'Timeline', label: 'Events', icon: Timer },
    { id: 'Chat', label: 'Chat', icon: MessageSquare },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Match ${matchId}`}
      className="max-w-5xl h-[90vh]"
    >
      {isLoading ? (
        <div className="space-y-6 animate-pulse p-4">
          <div className="h-32 w-full bg-(--nav-hover) rounded-3xl" />
          <div className="h-12 w-full bg-(--nav-hover) rounded-xl" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-16 w-full bg-(--nav-hover) rounded-xl"
              />
            ))}
          </div>
        </div>
      ) : error || !match ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle className="w-16 h-16 text-loss mb-4 opacity-20" />
          <h3 className="text-xl font-black text-foreground uppercase tracking-tight">
            Match Data Unavailable
          </h3>
          <p className="text-gray-500 max-w-xs mx-auto mt-2">
            This match might be too old or private. Full details are not
            available.
          </p>

          <Button
            variant="secondary"
            className="mt-6"
            onClick={() => {
              if (matchId) router.push(`/match/${matchId}`);
              onClose();
            }}
          >
            Go to Match Page
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-(--nav-hover) rounded-3xl p-6 border border-(--card-border)">
            <div className="flex items-center justify-between gap-8">
              <div className="flex-1 text-center">
                <p
                  className={cn(
                    'text-3xl font-black italic',
                    match.radiant_win ? 'text-win' : 'text-gray-500'
                  )}
                >
                  {match.radiant_score}
                </p>
                <p className="text-[10px] font-black uppercase text-gray-600 tracking-widest mt-1">
                  Radiant
                </p>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="px-3 py-1 bg-black/20 rounded-xl border border-white/5 text-[10px] font-black text-foreground/40 italic">
                  {Math.floor(match.duration / 60)}:
                  {String(match.duration % 60).padStart(2, '0')}
                </div>

                <div
                  className={cn(
                    'px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-lg',
                    match.radiant_win
                      ? 'bg-win/20 text-win border-win/30'
                      : 'bg-loss/20 text-loss border-loss/30'
                  )}
                >
                  {match.radiant_win ? 'Radiant Victory' : 'Dire Victory'}
                </div>
              </div>

              <div className="flex-1 text-center">
                <p
                  className={cn(
                    'text-3xl font-black italic',
                    !match.radiant_win ? 'text-win' : 'text-gray-500'
                  )}
                >
                  {match.dire_score}
                </p>
                <p className="text-[10px] font-black uppercase text-gray-600 tracking-widest mt-1">
                  Dire
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1.5 p-1 bg-black/20 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const isLocked =
                ['Economy', 'Timeline', 'Chat'].includes(tab.id) &&
                !match.version;

              return (
                <button
                  key={tab.id}
                  onClick={() => !isLocked && setActiveTab(tab.id)}
                  className={cn(
                    'flex-1 min-w-25 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 font-black uppercase text-[10px] tracking-widest',
                    isActive
                      ? 'bg-gaming-accent text-white shadow-lg shadow-gaming-accent/30'
                      : 'text-gray-500 hover:text-foreground hover:bg-white/5',
                    isLocked && 'opacity-30 cursor-not-allowed'
                  )}
                >
                  <Icon size={12} />
                  {tab.label}
                  {isLocked && <Lock size={10} className="ml-1" />}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="min-h-100">
            {activeTab === 'Scoreboard' && (
              <MatchScoreboard match={match} />
            )}
            {activeTab === 'Highlights' && <MatchHighlights match={match} />}
            {activeTab === 'Economy' && <MatchEconomy match={match} />}
            {activeTab === 'Timeline' && <MatchTimeline match={match} />}
            {activeTab === 'Chat' && <MatchChat match={match} />}
          </div>

          <div className="pt-6 border-t border-(--card-border) flex justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                router.push(`/match/${matchId}`);
                onClose();
              }}
              className="gap-2"
            >
              Full Match Analysis
              <LayoutGrid size={16} />
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}