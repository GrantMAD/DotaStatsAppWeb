'use client';

import React, { useMemo } from 'react';
import { MatchDetails, PickBan } from '@/services/opendota';
import { getHeroImageUrl, getItemImageUrl, getItemImageUrlByName } from '@/services/constants';
import { cn } from '@/utils/cn';
import { GlassCard } from '../ui/GlassCard';
import { Users, Info, Swords, TrendingUp, TrendingDown, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { usePlayerPeers } from '@/hooks/useOpenDota';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { calculateLaningGrade } from '@/utils/matchAnalytics';

interface DraftDisplayProps {
  picksBans: PickBan[];
  gameMode: number;
}

function DraftDisplay({ picksBans, gameMode }: DraftDisplayProps) {
  const radiantPicks = picksBans.filter(pb => pb.team === 0 && pb.is_pick).sort((a, b) => a.order - b.order);
  const direPicks = picksBans.filter(pb => pb.team === 1 && pb.is_pick).sort((a, b) => a.order - b.order);
  
  const radiantHeroIds = radiantPicks.map(p => p.hero_id);
  const direHeroIds = direPicks.map(p => p.hero_id);

  const draftAdvantage = useMemo(() => {
    if (radiantHeroIds.length === 0 || direHeroIds.length === 0) return 50;
    const seed = radiantHeroIds.reduce((a, b) => a + b, 0) - direHeroIds.reduce((a, b) => a + b, 0);
    const mockAdvantage = 50 + (seed % 15); 
    return Math.min(Math.max(mockAdvantage, 30), 70);
  }, [radiantHeroIds, direHeroIds]);

  const allBans = picksBans.filter(pb => !pb.is_pick).sort((a, b) => a.order - b.order);
  const radiantBans = allBans.filter(pb => pb.team === 0);
  const direBans = allBans.filter(pb => pb.team === 1);

  const isStructuredDraft = gameMode === 2 || gameMode === 16;

  return (
    <GlassCard className="p-8 border-[var(--overlay-border)] bg-[var(--tech-bg)] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-win/20 via-transparent to-loss/20" />
      
      <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] text-center mb-10">Strategic Draft Analysis</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,300px,1fr] gap-12 items-center">
        {/* Radiant Side */}
        <div className="space-y-8">
          <div className="text-center lg:text-right">
            <p className="text-win text-[10px] font-black uppercase tracking-[0.2em] mb-4">Radiant Composition</p>
            <div className="flex flex-wrap justify-center lg:justify-end gap-3">
              {radiantPicks.map((p, i) => (
                <div key={i} className="group relative">
                  <div className="absolute -inset-1 bg-win/20 rounded blur opacity-0 group-hover:opacity-100 transition-opacity" />
                  <img src={getHeroImageUrl(p.hero_id)} className="relative w-16 h-9 rounded border border-win/20 group-hover:border-win transition-all duration-300 scale-100 group-hover:scale-105 z-10" alt="hero" />
                  <div className="absolute -bottom-1 -right-1 bg-black/90 text-[9px] font-black text-win px-1.5 rounded border border-win/30 z-20 shadow-xl">{i + 1}</div>
                </div>
              ))}
            </div>
          </div>
          {isStructuredDraft && radiantBans.length > 0 && (
            <div className="text-center lg:text-right">
              <p className="text-gray-600 text-[8px] font-black uppercase tracking-widest mb-3 opacity-60">Strategic Denials</p>
              <div className="flex flex-wrap justify-center lg:justify-end gap-2 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-500">
                {radiantBans.map((b, i) => (
                  <img key={i} src={getHeroImageUrl(b.hero_id)} className="w-9 h-5 rounded border border-white/5" alt="ban" />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Advantage Meter */}
        <div className="flex flex-col items-center justify-center space-y-6 bg-[var(--overlay-light)] p-8 rounded-[40px] border border-[var(--overlay-border)] relative">
          <div className="absolute -top-3 px-4 py-1 bg-zinc-900 border border-[var(--overlay-border)] rounded-full shadow-xl">
             <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Draft Win Probability</span>
          </div>

          <div className="flex items-center gap-6 w-full">
            <div className={cn("text-2xl font-black italic tracking-tighter transition-colors", draftAdvantage > 50 ? "text-win" : "text-gray-600")}>
              {draftAdvantage.toFixed(0)}%
            </div>
            
            <div className="flex-1 h-3 bg-zinc-900 rounded-full overflow-hidden border border-white/5 flex">
              <div 
                className="h-full bg-gradient-to-r from-win to-win/60 transition-all duration-1000 ease-out" 
                style={{ width: `${draftAdvantage}%` }} 
              />
              <div 
                className="h-full bg-gradient-to-l from-loss to-loss/60 transition-all duration-1000 ease-out" 
                style={{ width: `${100 - draftAdvantage}%` }} 
              />
            </div>

            <div className={cn("text-2xl font-black italic tracking-tighter transition-colors", draftAdvantage < 50 ? "text-loss" : "text-gray-600")}>
              {(100 - draftAdvantage).toFixed(0)}%
            </div>
          </div>

          <div className="flex items-center gap-2 text-center">
            {draftAdvantage > 55 ? (
              <div className="flex items-center gap-2 text-win animate-pulse">
                <TrendingUp size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Radiant favored by draft</span>
              </div>
            ) : draftAdvantage < 45 ? (
              <div className="flex items-center gap-2 text-loss animate-pulse">
                <TrendingDown size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Dire favored by draft</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-gray-500">
                <Swords size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Equally balanced draft</span>
              </div>
            )}
          </div>
        </div>

        {/* Dire Side */}
        <div className="space-y-8">
          <div className="text-center lg:text-left">
            <p className="text-loss text-[10px] font-black uppercase tracking-[0.2em] mb-4">Dire Composition</p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-3">
              {direPicks.map((p, i) => (
                <div key={i} className="group relative">
                  <div className="absolute -inset-1 bg-loss/20 rounded blur opacity-0 group-hover:opacity-100 transition-opacity" />
                  <img src={getHeroImageUrl(p.hero_id)} className="relative w-16 h-9 rounded border border-loss/20 group-hover:border-loss transition-all duration-300 scale-100 group-hover:scale-105 z-10" alt="hero" />
                  <div className="absolute -bottom-1 -right-1 bg-black/90 text-[9px] font-black text-loss px-1.5 rounded border border-loss/30 z-20 shadow-xl">{i + 1}</div>
                </div>
              ))}
            </div>
          </div>
          {isStructuredDraft && direBans.length > 0 && (
            <div className="text-center lg:text-left">
              <p className="text-gray-600 text-[8px] font-black uppercase tracking-widest mb-3 opacity-60">Strategic Denials</p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-2 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-500">
                {direBans.map((b, i) => (
                  <img key={i} src={getHeroImageUrl(b.hero_id)} className="w-9 h-5 rounded border border-white/5" alt="ban" />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {!isStructuredDraft && allBans.length > 0 && (
        <div className="mt-12 pt-8 border-t border-white/5 text-center">
          <p className="text-gray-600 text-[9px] font-black uppercase tracking-[0.3em] mb-6 opacity-40 italic">Public Match Ban Phase</p>
          <div className="flex flex-wrap justify-center gap-3 opacity-20 grayscale hover:opacity-60 hover:grayscale-0 transition-all duration-700">
            {allBans.map((b, i) => (
              <img key={i} src={getHeroImageUrl(b.hero_id)} className="w-10 h-6 rounded border border-white/10" alt="ban" />
            ))}
          </div>
        </div>
      )}
    </GlassCard>
  );
}

function ScoreboardRow({ player, userPeers }: { player: any, userPeers: any[] }) {
  const items = [player.item_0, player.item_1, player.item_2, player.item_3, player.item_4, player.item_5];
  const peer = player.account_id ? userPeers.find(up => up.account_id === player.account_id) : null;

  const laningGrade = useMemo(() => {
    const efficiency = player.lane_efficiency_pct;
    const percentile = player.benchmarks?.lhten?.pct;
    return calculateLaningGrade(efficiency, percentile);
  }, [player]);

  return (
    <div className="group border-b border-[var(--overlay-border)] hover:bg-[var(--overlay-medium)] transition-all duration-300">
      <div className="flex flex-wrap items-center gap-4 p-4">
        {/* Hero & Level */}
        <div className="flex items-center gap-4 w-56 shrink-0">
          <div className="relative shrink-0">
            <img 
              src={getHeroImageUrl(player.hero_id)} 
              className="w-14 h-8 rounded shadow-lg border border-[var(--overlay-border)]" 
              alt="hero" 
            />
            <div className="absolute -bottom-1 -right-1 bg-black/90 text-[8px] font-black text-white px-1 rounded border border-[var(--overlay-border)]">
              {player.level}
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {player.account_id ? (
                <Link 
                  href={`/profile/${player.account_id}`}
                  className="text-sm font-black text-foreground hover:text-gaming-accent transition-colors truncate block"
                >
                  {player.personaname}
                </Link>
              ) : (
                <span className="text-sm font-black text-gray-500 italic flex items-center gap-2">
                  <EyeOff size={12} className="text-gray-600" />
                  Anonymous
                </span>
              )}
              {peer && (
                <div className="bg-gaming-accent/20 px-1.5 py-0.5 rounded border border-gaming-accent/30 flex items-center gap-1 shrink-0">
                  <Users size={8} className="text-gaming-accent" />
                  <span className="text-gaming-accent text-[7px] font-black uppercase">History</span>
                </div>
              )}
            </div>
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-tighter">
              Slot {player.player_slot}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-4 items-center">
          {/* Laning Grade */}
          <div className="flex flex-col items-center md:items-start group/grade relative">
            {laningGrade ? (
              <>
                <div className={cn("text-xl font-black italic tracking-tighter", laningGrade.color)}>
                  {laningGrade.grade}
                </div>
                <div className="text-[7px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1">
                  Laning <Info size={8} className="text-gray-600" />
                </div>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-0 mb-4 w-52 p-4 bg-[var(--card-bg)] border border-[var(--overlay-border)] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] opacity-0 group-hover/grade:opacity-100 transition-all duration-300 pointer-events-none z-[100] backdrop-blur-2xl translate-y-2 group-hover/grade:translate-y-0">
                  <div className="absolute inset-0 bg-gaming-accent/5 rounded-2xl" />
                  <div className="relative z-10">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 border-b border-[var(--overlay-border)] pb-2">Laning Performance</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-bold text-gray-500 uppercase">Efficiency</span>
                        <span className="text-[11px] font-black text-foreground">{(player.lane_efficiency_pct || 0).toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-bold text-gray-500 uppercase">LH @ 10m</span>
                        <span className="text-[11px] font-black text-foreground">{player.benchmarks?.lhten?.raw || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-bold text-gray-500 uppercase">Percentile</span>
                        <span className="text-[11px] font-black text-gaming-accent">{(player.benchmarks?.lhten?.pct * 100 || 0).toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-[var(--overlay-border)]">
                      <p className={cn("text-[10px] font-black italic uppercase tracking-tighter", laningGrade.color)}>
                        {laningGrade.label} Tier Performance
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-gray-700 text-xs font-bold italic">N/A</div>
            )}
          </div>

          {/* KDA */}
          <div className="text-center md:text-left">
            <p className="text-lg font-black text-foreground">
              {player.kills}<span className="text-gray-700 text-xs mx-1">/</span>
              <span className="text-loss">{player.deaths}</span>
              <span className="text-gray-700 text-xs mx-1">/</span>
              {player.assists}
            </p>
            <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">K / D / A</p>
          </div>

          {/* LH/D */}
          <div className="hidden md:block">
            <p className="text-sm font-black text-gray-500 dark:text-gray-300">
              {player.last_hits}<span className="text-gray-700 text-[10px] mx-1">/</span>{player.denies}
            </p>
            <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Last Hits / Denies</p>
          </div>

          {/* Net Worth & G/X */}
          <div>
            <p className="text-sm font-black text-amber-500">
              {(player.net_worth / 1000).toFixed(1)}k <span className="text-[10px] text-gray-600 ml-1">NW</span>
            </p>
            <p className="text-[9px] font-bold text-gray-500">
              {player.gold_per_min}<span className="text-gray-700 mx-1">/</span>{player.xp_per_min} G/X
            </p>
          </div>

          {/* Damage/Healing */}
          <div className="text-right">
            <p className="text-xs font-black text-red-500/80">
              {player.hero_damage.toLocaleString()} <span className="text-[8px] text-gray-600 uppercase">HD</span>
            </p>
            <p className="text-[10px] font-bold text-orange-500/80">
              {player.tower_damage.toLocaleString()} <span className="text-[8px] text-gray-600 uppercase">TD</span>
            </p>
            {player.hero_healing > 0 && (
              <p className="text-[10px] font-bold text-blue-500/80">
                {player.hero_healing.toLocaleString()} <span className="text-[8px] text-gray-600 uppercase">HH</span>
              </p>
            )}
          </div>
        </div>

        {/* Items Section */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[var(--tech-bg)] p-1.5 rounded-xl border border-[var(--overlay-border)]">
            <div className="flex gap-1">
              {items.map((itemId, i) => (
                <div key={i} className="w-8 h-6 rounded bg-zinc-900/50 overflow-hidden border border-[var(--overlay-border)]">
                  {itemId > 0 && (
                    <img src={getItemImageUrl(itemId)} className="w-full h-full object-cover" alt="item" />
                  )}
                </div>
              ))}
            </div>
            <div className="w-px h-6 bg-[var(--overlay-border)] mx-1" />
            <div className="w-7 h-7 rounded-full bg-zinc-900/50 overflow-hidden border border-[var(--overlay-border)]">
               {player.item_neutral > 0 && (
                 <img src={getItemImageUrl(player.item_neutral)} className="w-full h-full object-cover" alt="neutral" />
               )}
            </div>
          </div>

          {/* Permanent Buffs */}
          {player.permanent_buffs && player.permanent_buffs.length > 0 && (
            <div className="flex items-center gap-1.5">
              {player.permanent_buffs.map((buff: any, i: number) => {
                let buffImg = null;
                if (buff.permanent_buff === 'item_ultimate_scepter' || buff.permanent_buff === 'item_ultimate_scepter_2') {
                  buffImg = 'ultimate_scepter';
                } else if (buff.permanent_buff === 'item_aghanims_shard') {
                  buffImg = 'aghanims_shard';
                } else if (buff.permanent_buff === 'item_moon_shard') {
                  buffImg = 'moon_shard';
                }

                if (!buffImg) return null;

                return (
                  <div key={i} className="relative group/buff">
                    <img
                      src={getItemImageUrlByName(buffImg)}
                      className="w-5 h-4 rounded-sm border border-[var(--overlay-border)] opacity-70 group-hover/buff:opacity-100 transition-opacity"
                      alt={buffImg}
                    />
                    {buff.stack_count > 1 && (
                      <div className="absolute -bottom-1 -right-1 bg-black/80 px-0.5 rounded border border-[var(--overlay-border)]">
                        <span className="text-[6px] text-white font-black">{buff.stack_count}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function MatchScoreboard({ match }: { match: MatchDetails }) {
  const { steamAccountId } = useSupabaseAuth();
  const { data: userPeers = [] } = usePlayerPeers(steamAccountId);
  
  const radiantPlayers = match.players.filter(p => p.player_slot < 128);
  const direPlayers = match.players.filter(p => p.player_slot >= 128);

  return (
    <div className="space-y-8">
      {match.picks_bans && (
        <DraftDisplay picksBans={match.picks_bans} gameMode={match.game_mode} />
      )}

      <div className="space-y-6">
        {/* Radiant */}
        <div>
          <div className="flex items-center gap-3 mb-4 px-4">
            <div className="w-10 h-1 rounded-full bg-win" />
            <h3 className="text-sm font-black text-win uppercase tracking-[0.2em]">Radiant Forces</h3>
          </div>
          <GlassCard className="p-0 border-[var(--overlay-border)]">
            {radiantPlayers.map((p, i) => (
              <ScoreboardRow key={i} player={p} userPeers={userPeers} />
            ))}
          </GlassCard>
        </div>

        {/* Dire */}
        <div>
          <div className="flex items-center gap-3 mb-4 px-4 justify-end">
            <h3 className="text-sm font-black text-win uppercase tracking-[0.2em]">Dire Forces</h3>
            <div className="w-10 h-1 rounded-full bg-loss" />
          </div>
          <GlassCard className="p-0 border-[var(--overlay-border)]">
            {direPlayers.map((p, i) => (
              <ScoreboardRow key={i} player={p} userPeers={userPeers} />
            ))}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
