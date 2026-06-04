'use client';

import React from 'react';
import { Modal } from '../ui/Modal';
import { LiveGame } from '@/types';
import { STEAM_CDN_BASE } from '@/services/constants';
import { useHeroStats } from '@/hooks/useOpenDota';
import { 
  Users, 
  Timer, 
  Trophy,
  ShieldCheck,
} from '@/components/ui/Icons';
import { cn } from '@/utils/cn';
import Image from 'next/image';
import { Button } from '../ui/Button';

interface LiveMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: LiveGame | null;
}

export function LiveMatchModal({
  isOpen,
  onClose,
  game,
}: LiveMatchModalProps) {
  const { data: heroStats = [] } = useHeroStats();

  if (!isOpen || !game) return null;

  const getHeroImg = (heroId: number) => {
    const hero = heroStats.find(h => h.id === heroId);
    return hero ? `${STEAM_CDN_BASE}${hero.img}` : null;
  };

  const getHeroName = (heroId: number) => {
    const hero = heroStats.find(h => h.id === heroId);
    return hero ? hero.localized_name : 'Unknown Hero';
  };

  const formatGold = (gold: number) => {
    const absoluteGold = Math.abs(gold);
    if (absoluteGold >= 1000) return `${(absoluteGold / 1000).toFixed(1)}k`;
    return absoluteGold.toString();
  };

  const radiantPlayers = game.players.filter(p => p.team === 0 || game.players.indexOf(p) < 5);
  const direPlayers = game.players.filter(p => p.team === 1 || game.players.indexOf(p) >= 5);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Live Match ${game.match_id}`}
      className="max-w-4xl h-auto overflow-y-auto"
    >
      <div className="space-y-6">
        {/* Live Indicator & Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-red-500/20 border border-red-500/30">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Live in Progress</span>
          </div>
          <div className="flex items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Timer size={14} className="text-gaming-accent" />
              <span className="text-xs font-bold">{Math.floor(game.game_time / 60)}:{String(game.game_time % 60).padStart(2, '0')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users size={14} className="text-amber-500" />
              <span className="text-xs font-bold">{game.spectators} Spectators</span>
            </div>
            <div className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] font-black text-amber-500 italic">
              {game.average_mmr} AVG MMR
            </div>
          </div>
        </div>

        {/* Scoreboard Header */}
        <div className="bg-(--nav-hover) rounded-3xl p-8 border border-(--card-border) relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_center,var(--color-gaming-accent)_0%,transparent_70%)]" />
          
          <div className="relative z-10 flex items-center justify-between gap-8">
            <div className="flex-1 text-center">
              <p className="text-4xl font-black italic text-win mb-1">{game.radiant_score}</p>
              <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Radiant</p>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="px-4 py-2 rounded-2xl bg-black/40 border border-white/5 shadow-2xl">
                <p className={cn(
                  "text-sm font-black italic uppercase tracking-tight",
                  game.radiant_lead > 0 ? "text-win" : game.radiant_lead < 0 ? "text-loss" : "text-gray-400"
                )}>
                  {game.radiant_lead > 0 ? 'Radiant' : game.radiant_lead < 0 ? 'Dire' : 'Even'}
                  <span className="ml-2">+{formatGold(game.radiant_lead)} Gold</span>
                </p>
              </div>
              <div className="h-px w-12 bg-linear-to-r from-transparent via-(--card-border) to-transparent" />
              <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">Live Score</p>
            </div>

            <div className="flex-1 text-center">
              <p className="text-4xl font-black italic text-loss mb-1">{game.dire_score}</p>
              <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Dire</p>
            </div>
          </div>
        </div>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Radiant */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-2">
              <Trophy size={14} className="text-win" />
              <h4 className="text-[10px] font-black uppercase tracking-widest text-win">Radiant Heroes</h4>
            </div>
            <div className="space-y-2">
              {radiantPlayers.map((player, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all">
                  <div className="w-12 h-9 rounded-lg overflow-hidden border border-white/10 shrink-0">
                    {getHeroImg(player.hero_id) ? (
                      <Image 
                        src={getHeroImg(player.hero_id)!} 
                        alt="hero" 
                        width={48} 
                        height={36} 
                        unoptimized
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-zinc-800" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-foreground truncate">{player.name || `Anonymous`}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">{getHeroName(player.hero_id)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dire */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-2">
              <Trophy size={14} className="text-loss" />
              <h4 className="text-[10px] font-black uppercase tracking-widest text-loss">Dire Heroes</h4>
            </div>
            <div className="space-y-2">
              {direPlayers.map((player, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all">
                  <div className="w-12 h-9 rounded-lg overflow-hidden border border-white/10 shrink-0">
                    {getHeroImg(player.hero_id) ? (
                      <Image 
                        src={getHeroImg(player.hero_id)!} 
                        alt="hero" 
                        width={48} 
                        height={36} 
                        unoptimized
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-zinc-800" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-foreground truncate">{player.name || `Anonymous`}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">{getHeroName(player.hero_id)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Privacy Disclaimer */}
        <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 flex items-start gap-3">
          <ShieldCheck size={18} className="text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-500">Privacy Notice</p>
            <p className="text-[11px] font-bold text-muted-foreground leading-relaxed">
              Some players have not set their Dota 2 or Steam profiles to public. Their names and individual statistics are protected and may not be available in real-time.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-6 border-t border-(--card-border) flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] font-bold text-muted-foreground italic max-w-xs">
            Detailed post-match analysis will be available once the match finishes and is parsed.
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose} className="px-8">
              Close
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}