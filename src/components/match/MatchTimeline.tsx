'use client';

import React, { useMemo } from 'react';
import { MatchDetails } from '@/services/opendota';
import { getHeroImageUrl, getItemImageUrlByName } from '@/services/constants';
import { GlassCard } from '../ui/GlassCard';
import { cn } from '@/utils/cn';
import { Activity, Timer, Zap, Shield, Swords, Castle, Crown, TrendingUp, Skull, RotateCcw, Check, Minus, X, Package, Trophy } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import { calculateLaningGrade } from '@/utils/matchAnalytics';

export function MatchTimeline({ match }: { match: MatchDetails }) {
  if (!match.version) {
    return (
      <div className="py-20 flex flex-col items-center justify-center border border-[var(--overlay-border)] rounded-3xl">
        <Activity className="w-12 h-12 text-gray-700 mb-4" />
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Parsed data required for timeline</p>
      </div>
    );
  }

  const durationMins = Math.ceil(match.duration / 60);

  // Prepare advantage data for the background waveform
  const advantageData = useMemo(() => {
    if (!match.radiant_gold_adv) return [];
    return match.radiant_gold_adv.map((gold, i) => ({
      time: i,
      gold,
    }));
  }, [match.radiant_gold_adv]);

  // Filter and group objectives
  const objectives = useMemo(() => {
    if (!match.objectives) return [];

    return match.objectives.filter(obj =>
      ['building_kill', 'chat_roshan_kill', 'chat_aegis_pickup', 'chat_aegis_snatch'].includes(obj.type)
    ).map(obj => {
      let icon = null;
      let imageUrl = null;
      let color = 'text-gray-400';
      let bgColor = 'bg-gray-500/10';
      let label = 'Objective';
      let teamColor = obj.team === 2 ? 'text-win' : obj.team === 3 ? 'text-loss' : 'text-gray-400';

      if (obj.type.includes('roshan')) {
        icon = Skull;
        color = 'text-amber-500';
        bgColor = 'bg-amber-500/10';
        label = 'Roshan Slain';
      } else if (obj.type.includes('aegis')) {
        imageUrl = getItemImageUrlByName('aegis');
        color = 'text-purple-500';
        bgColor = 'bg-purple-500/10';
        label = obj.type.includes('snatch') ? 'Aegis Snatched!' : 'Aegis Picked Up';
      } else if (obj.type === 'building_kill') {
        icon = Castle;
        label = obj.key?.replace('npc_dota_', '').replace(/_/g, ' ') || 'Building Destroyed';
        if (obj.team === 2) {
          color = 'text-win';
          bgColor = 'bg-win/10';
        } else {
          color = 'text-loss';
          bgColor = 'bg-loss/10';
        }
      }

      return { ...obj, icon, imageUrl, color, bgColor, label, teamColor };
    });
  }, [match.objectives]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-4">
        <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Event Trajectory</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Check className="w-3 h-3 text-emerald-500" />
            <span className="text-[9px] font-black text-gray-500 uppercase">Won Lane</span>
          </div>
          <div className="flex items-center gap-2">
            <Package className="w-3 h-3 text-amber-500" />
            <span className="text-[9px] font-black text-gray-500 uppercase">Courier Kill</span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="w-3 h-3 text-win" />
            <span className="text-[9px] font-black text-gray-500 uppercase">Triple+ Kill</span>
          </div>
          <div className="flex items-center gap-2">
            <Skull className="w-3 h-3 text-amber-500" />
            <span className="text-[9px] font-black text-gray-500 uppercase">Roshan</span>
          </div>
          <div className="flex items-center gap-2">
            <img src={getItemImageUrlByName('aegis')} className="w-4 h-3 object-contain" alt="aegis" />
            <span className="text-[9px] font-black text-gray-500 uppercase">Aegis</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gaming-accent" />
            <span className="text-[9px] font-black text-gray-500 uppercase">Major Item</span>
          </div>
          <div className="flex items-center gap-2">
            <RotateCcw className="w-3 h-3 text-orange-500" />
            <span className="text-[9px] font-black text-gray-500 uppercase">Buyback</span>
          </div>
        </div>
      </div>

      <GlassCard className="p-0 overflow-x-auto no-scrollbar bg-[var(--tech-bg)] border-[var(--overlay-border)] relative">
        <div className="min-w-[1200px] p-6 relative">
          {/* Background Momentum Waveform */}
          <div className="absolute top-24 left-[246px] right-6 bottom-6 opacity-[0.07] pointer-events-none">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={advantageData} margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="timelineGold" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-win)" stopOpacity={1} />
                    <stop offset="50%" stopColor="gray" stopOpacity={0.1} />
                    <stop offset="100%" stopColor="var(--color-loss)" stopOpacity={1} />
                  </linearGradient>
                </defs>
                <YAxis hide domain={['auto', 'auto']} />
                <Area
                  type="monotone"
                  dataKey="gold"
                  stroke="none"
                  fill="url(#timelineGold)"
                  baseValue={0}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Time scale */}
          <div className="relative h-10 border-b border-[var(--overlay-border)] mb-4">
            <div className="absolute left-48 right-0 h-full">
              {/* Pre-game buffer indicator */}
              <div className="absolute left-0 top-0 flex flex-col items-center -translate-x-1/2" style={{ left: '5%' }}>
                <span className="text-[10px] font-black text-gray-700 uppercase">Start</span>
                <div className="w-px h-2 bg-[var(--overlay-border)] mt-1" />
              </div>

              {Array.from({ length: Math.ceil(durationMins / 5) }).map((_, i) => (
                <div
                  key={i}
                  className="absolute top-0 flex flex-col items-center -translate-x-1/2"
                  style={{ left: `${5 + ((i + 1) * 5 / durationMins) * 95}%` }}
                >
                  <span className="text-[10px] font-black text-gray-600">{(i + 1) * 5}'</span>
                  <div className="w-px h-2 bg-[var(--overlay-border)] mt-1" />
                </div>
              ))}
            </div>
          </div>

          {/* Advantage Ribbon (Momentum Overlay) */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-48 flex items-center gap-3 shrink-0">
              <div className="w-12 h-7 rounded border border-[var(--overlay-border)] bg-[var(--overlay-light)] flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-gray-400" />
              </div>
              <div>
                <p className="text-[10px] font-black text-foreground uppercase tracking-tighter">Advantage</p>
                <p className="text-[8px] font-bold text-gray-600 uppercase">Momentum</p>
              </div>
            </div>
            <div className="flex-1 h-8 relative bg-black/20 rounded border border-white/5 overflow-hidden">
              <div className="absolute inset-y-0 left-0 right-0 opacity-40">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={advantageData} margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="ribbonGold" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-win)" stopOpacity={1} />
                        <stop offset="50%" stopColor="transparent" stopOpacity={0} />
                        <stop offset="100%" stopColor="var(--color-loss)" stopOpacity={1} />
                      </linearGradient>
                    </defs>
                    <YAxis hide domain={['auto', 'auto']} />
                    <Area
                      type="monotone"
                      dataKey="gold"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth={1}
                      fill="url(#ribbonGold)"
                      baseValue={0}
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              {/* Visual Center Line */}
              <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10 -translate-y-1/2" />
            </div>
          </div>

          {/* Objectives Row */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-48 flex items-center gap-3 shrink-0">
              <div className="w-12 h-7 rounded border border-[var(--overlay-border)] bg-[var(--overlay-light)] flex items-center justify-center">
                <Castle className="w-4 h-4 text-gray-400" />
              </div>
              <div>
                <p className="text-[10px] font-black text-foreground uppercase tracking-tighter">Objectives</p>
                <p className="text-[8px] font-bold text-gray-600 uppercase">Global Events</p>
              </div>
            </div>
            <div className="flex-1 h-12 relative bg-[var(--overlay-light)] rounded-lg border border-[var(--overlay-border)] overflow-hidden">
              <div className="absolute top-1/2 left-0 right-0 h-px bg-[var(--overlay-medium)] -translate-y-1/2" />

              {objectives.map((obj, oIdx) => {
                const leftPos = 5 + (obj.time / 60 / durationMins) * 95;
                const Icon = obj.icon;
                return (
                  <div
                    key={oIdx}
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 group/obj z-20"
                    style={{ left: `${leftPos}%` }}
                  >
                    <div className={cn(
                      "p-1 rounded-lg border transition-all hover:scale-125 cursor-help shadow-lg flex items-center justify-center",
                      obj.bgColor,
                      obj.type.includes('roshan') ? "border-amber-500/50" : obj.type.includes('aegis') ? "border-purple-500/50" : "border-white/10"
                    )}>
                      {obj.imageUrl ? (
                        <img src={obj.imageUrl} className="w-5 h-4 object-contain" alt="obj" />
                      ) : Icon && (
                        <Icon className={cn("w-3.5 h-3.5", obj.color)} />
                      )}
                    </div>

                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover/obj:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-30">
                      <div className="bg-black/90 border border-white/10 px-3 py-1.5 rounded-xl text-[10px] font-black text-white uppercase tracking-tight shadow-2xl backdrop-blur-md">
                        <div className="flex items-center gap-2">
                          <span>{Math.floor(obj.time / 60)}:{String(obj.time % 60).padStart(2, '0')}</span>
                          <div className="w-px h-3 bg-white/20" />
                          <span className={obj.teamColor}>{obj.label}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Player Rows */}
          <div className="space-y-4">
            {match.players.map((p, pIdx) => {
              const laningGrade = calculateLaningGrade(p.lane_efficiency_pct || null, p.benchmarks?.lhten?.pct || null);
              const events: { time: number; type: 'purchase' | 'buyback' | 'milestone'; key?: string; icon?: any; label?: string; color?: string }[] = [];

              if (p.purchase_log) {
                p.purchase_log.forEach(item => {
                  const minorItems = ['recipe', 'ward_observer', 'ward_sentry', 'smoke_of_deceit', 'dust', 'clarity', 'flask', 'tango', 'enchanted_mango', 'bottle', 'tpscroll', 'ward_dispenser', 'faerie_fire'];
                  if (!minorItems.some(minor => item.key.includes(minor))) {
                    events.push({ time: item.time, type: 'purchase', key: item.key });
                  }
                });
              }
              if (p.buyback_log) {
                p.buyback_log.forEach(bb => events.push({ time: bb.time, type: 'buyback', key: 'buyback' }));
              }

              // Triple Kills Detection
              if (p.kill_log) {
                let comboCount = 0;
                let lastKillTime = -100;
                p.kill_log.forEach((k) => {
                  if (k.time <= lastKillTime + 18) {
                    comboCount++;
                    if (comboCount >= 3) {
                      let label = 'Triple Kill!';
                      if (comboCount === 4) label = 'Ultra Kill!';
                      if (comboCount >= 5) label = 'RAMPAGE!';
                      events.push({ time: k.time, type: 'milestone', icon: Trophy, label, color: 'text-win' });
                    }
                  } else {
                    comboCount = 1;
                  }
                  lastKillTime = k.time;
                });
              }

              // Courier Kills Detection
              (match.objectives || []).forEach(obj => {
                if (obj.type === 'courier_kill' && (obj.player_slot === p.player_slot || obj.slot === p.player_slot)) {
                  events.push({ time: obj.time, type: 'milestone', icon: Package, label: 'Courier Sniped!', color: 'text-amber-500' });
                }
              });

              // Collision handling logic similar to mobile
              const bucketSize = 12; // pixels roughly
              const usedPositions: Record<number, number> = {};

              return (
                <div key={pIdx} className="flex items-center gap-4 group">
                  {/* Player Info */}
                  <div className="w-48 flex items-center gap-3 shrink-0">
                    <div className="relative shrink-0">
                      <img src={getHeroImageUrl(p.hero_id)} className="w-12 h-7 rounded border border-[var(--overlay-border)]" alt="hero" />
                      {p.avatar && (
                        <img src={p.avatar} className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border border-black shadow-lg" alt="av" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-foreground truncate leading-tight">{p.personaname || 'Anonymous'}</p>
                      <p className="text-[8px] font-bold text-gray-600 uppercase">Slot {p.player_slot}</p>
                    </div>
                  </div>

                  {/* Event Lane */}
                  <div className="flex-1 h-12 relative bg-[var(--overlay-light)] rounded-lg border border-[var(--overlay-light)] group-hover:bg-[var(--overlay-medium)] transition-colors overflow-hidden">
                    {/* Horizontal grid line */}
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-[var(--overlay-medium)] -translate-y-1/2" />

                    {/* Lane Outcome Marker at 10m */}
                    {laningGrade && durationMins >= 10 && (
                      <div
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 group/lane z-10"
                        style={{ left: `${5 + (10 / durationMins) * 95}%` }}
                      >
                        <div className={cn(
                          "p-1 rounded-full border shadow-lg transition-transform hover:scale-150 cursor-help bg-black/40",
                          laningGrade.color.replace('text-', 'border-').replace('400', '500/50').replace('500', '500/50').replace('700', '700/50')
                        )}>
                          {laningGrade.grade.startsWith('A') ? <Check className={cn("w-3 h-3", laningGrade.color)} /> :
                            laningGrade.grade.startsWith('B') || laningGrade.grade.startsWith('C+') ? <Minus className={cn("w-3 h-3", laningGrade.color)} /> :
                              <X className={cn("w-3 h-3", laningGrade.color)} />}
                        </div>
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover/lane:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-30">
                          <div className="bg-black/90 border border-white/10 px-2 py-1 rounded text-[8px] font-black text-white uppercase tracking-tighter shadow-2xl backdrop-blur-md">
                            10:00 • Lane {laningGrade.grade} ({laningGrade.label})
                          </div>
                        </div>
                      </div>
                    )}

                    {events.map((event, eIdx) => {
                      const baseLeft = 5 + (event.time / 60 / durationMins) * 95;
                      if (baseLeft < 0 || baseLeft > 100) return null;

                      // Bucket-based offsetting
                      const bucket = Math.round(baseLeft * 20); // 20 buckets per 100%
                      const offsetCount = usedPositions[bucket] || 0;
                      usedPositions[bucket] = offsetCount + 1;

                      const leftPos = baseLeft + (offsetCount * 0.8); // Offset by 0.8% per item in same bucket

                      const BuybackIcon = RotateCcw;
                      const MilestoneIcon = event.icon;
                      const itemUrl = (event.type === 'buyback' || event.type === 'milestone') ? null : getItemImageUrlByName(event.key || '');

                      return (
                        <div
                          key={eIdx}
                          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 group/event z-10"
                          style={{ left: `${leftPos}%` }}
                        >
                          <div className={cn(
                            "p-0.5 rounded border transition-transform duration-300 hover:scale-150 hover:z-20 shadow-xl",
                            event.type === 'buyback' ? "bg-orange-500 border-orange-300 shadow-orange-500/20" :
                              event.type === 'milestone' ? "bg-black/60 border-white/20" :
                                "bg-zinc-800 border-zinc-600"
                          )}>
                            {event.type === 'buyback' ? (
                              <BuybackIcon className="w-6 h-4 p-0.5 text-white" />
                            ) : event.type === 'milestone' ? (
                              <MilestoneIcon className={cn("w-6 h-4 p-0.5", event.color)} />
                            ) : (
                              <img src={itemUrl || ''} className="w-6 h-4 rounded-[1px] object-cover" alt="ev" />
                            )}
                          </div>

                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover/event:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-30">
                            <div className="bg-black/90 border border-white/10 px-2 py-1 rounded text-[8px] font-black text-white uppercase tracking-tighter shadow-2xl backdrop-blur-md">
                              {Math.floor(event.time / 60)}:{String(event.time % 60).padStart(2, '0')} • {event.label || event.key?.replace(/_/g, ' ')}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </GlassCard>

      <p className="text-center text-[9px] font-bold text-gray-600 uppercase tracking-widest italic">
        Hover over items to see exact timings • Events are spaced to prevent overlapping
      </p>
    </div>
  );
}
