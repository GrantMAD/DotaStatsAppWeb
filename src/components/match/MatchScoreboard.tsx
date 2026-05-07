'use client';

import React, { useMemo } from 'react';
import { MatchDetails, PickBan } from '@/services/opendota';
import { HEROES, getHeroImageUrl, getItemImageUrl, getItemImageUrlByName } from '@/services/constants';
import { cn } from '@/utils/cn';
import { GlassCard } from '../ui/GlassCard';
import { ChevronRight, Shield, User, Users } from 'lucide-react';
import Link from 'next/link';
import { usePlayerPeers } from '@/hooks/useOpenDota';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';

interface DraftDisplayProps {
  picksBans: PickBan[];
  gameMode: number;
}

function DraftDisplay({ picksBans, gameMode }: DraftDisplayProps) {
  const radiantPicks = picksBans.filter(pb => pb.team === 0 && pb.is_pick).sort((a, b) => a.order - b.order);
  const direPicks = picksBans.filter(pb => pb.team === 1 && pb.is_pick).sort((a, b) => a.order - b.order);
  
  const allBans = picksBans.filter(pb => !pb.is_pick).sort((a, b) => a.order - b.order);
  const radiantBans = allBans.filter(pb => pb.team === 0);
  const direBans = allBans.filter(pb => pb.team === 1);

  const isStructuredDraft = gameMode === 2 || gameMode === 16;

  return (
    <GlassCard className="p-6 border-white/5 bg-black/40">
      <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] text-center mb-8">Draft Phase Analysis</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-8 items-center">
        {/* Radiant Side */}
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-win text-xs font-black uppercase tracking-widest mb-3">Radiant Picks</p>
            <div className="flex flex-wrap justify-center gap-2">
              {radiantPicks.map((p, i) => (
                <div key={i} className="group relative">
                  <img src={getHeroImageUrl(p.hero_id)} className="w-12 h-7 rounded border border-win/20 hover:border-win transition-colors" alt="hero" />
                  <div className="absolute -bottom-1 -right-1 bg-black/80 text-[8px] font-bold text-win px-1 rounded border border-win/20">{i + 1}</div>
                </div>
              ))}
            </div>
          </div>
          {isStructuredDraft && radiantBans.length > 0 && (
            <div className="text-center">
              <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest mb-2">Radiant Bans</p>
              <div className="flex flex-wrap justify-center gap-1.5 opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-all">
                {radiantBans.map((b, i) => (
                  <img key={i} src={getHeroImageUrl(b.hero_id)} className="w-8 h-5 rounded border border-white/10" alt="ban" />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="hidden md:block w-px h-full bg-gradient-to-b from-transparent via-white/10 to-transparent" />

        {/* Dire Side */}
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-loss text-xs font-black uppercase tracking-widest mb-3">Dire Picks</p>
            <div className="flex flex-wrap justify-center gap-2">
              {direPicks.map((p, i) => (
                <div key={i} className="group relative">
                  <img src={getHeroImageUrl(p.hero_id)} className="w-12 h-7 rounded border border-loss/20 hover:border-loss transition-colors" alt="hero" />
                  <div className="absolute -bottom-1 -right-1 bg-black/80 text-[8px] font-bold text-loss px-1 rounded border border-loss/20">{i + 1}</div>
                </div>
              ))}
            </div>
          </div>
          {isStructuredDraft && direBans.length > 0 && (
            <div className="text-center">
              <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest mb-2">Dire Bans</p>
              <div className="flex flex-wrap justify-center gap-1.5 opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-all">
                {direBans.map((b, i) => (
                  <img key={i} src={getHeroImageUrl(b.hero_id)} className="w-8 h-5 rounded border border-white/10" alt="ban" />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {!isStructuredDraft && allBans.length > 0 && (
        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest mb-4">Strategic Bans</p>
          <div className="flex flex-wrap justify-center gap-2 opacity-40 grayscale">
            {allBans.map((b, i) => (
              <img key={i} src={getHeroImageUrl(b.hero_id)} className="w-9 h-5 rounded border border-white/10" alt="ban" />
            ))}
          </div>
        </div>
      )}
    </GlassCard>
  );
}

function ScoreboardRow({ player, userPeers }: { player: any, userPeers: any[] }) {
  const isRadiant = player.player_slot < 128;
  const items = [player.item_0, player.item_1, player.item_2, player.item_3, player.item_4, player.item_5];
  const peer = player.account_id ? userPeers.find(up => up.account_id === player.account_id) : null;

  return (
    <div className="group border-b border-white/5 hover:bg-white/5 transition-all duration-300">
      <div className="flex flex-wrap items-center gap-4 p-4">
        {/* Hero & Level */}
        <div className="flex items-center gap-4 w-56 shrink-0">
          <div className="relative shrink-0">
            <img 
              src={getHeroImageUrl(player.hero_id)} 
              className="w-14 h-8 rounded shadow-lg border border-white/10" 
              alt="hero" 
            />
            <div className="absolute -bottom-1 -right-1 bg-black/90 text-[8px] font-black text-white px-1 rounded border border-white/10">
              {player.level}
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {player.account_id ? (
                <Link 
                  href={`/profile/${player.account_id}`}
                  className="text-sm font-black text-white hover:text-gaming-accent transition-colors truncate block"
                >
                  {player.personaname}
                </Link>
              ) : (
                <span className="text-sm font-black text-gray-500 italic">Anonymous</span>
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
        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
          {/* KDA */}
          <div className="text-center md:text-left">
            <p className="text-lg font-black text-white">
              {player.kills}<span className="text-gray-700 text-xs mx-1">/</span>
              <span className="text-loss">{player.deaths}</span>
              <span className="text-gray-700 text-xs mx-1">/</span>
              {player.assists}
            </p>
            <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">K / D / A</p>
          </div>

          {/* LH/D */}
          <div className="hidden md:block">
            <p className="text-sm font-black text-gray-300">
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
          <div className="flex items-center gap-2 bg-black/20 p-1.5 rounded-xl border border-white/5">
            <div className="flex gap-1">
              {items.map((itemId, i) => (
                <div key={i} className="w-8 h-6 rounded bg-zinc-900 overflow-hidden border border-white/5">
                  {itemId > 0 && (
                    <img src={getItemImageUrl(itemId)} className="w-full h-full object-cover" alt="item" />
                  )}
                </div>
              ))}
            </div>
            <div className="w-px h-6 bg-white/10 mx-1" />
            <div className="w-7 h-7 rounded-full bg-zinc-900 overflow-hidden border border-white/10">
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
                      className="w-5 h-4 rounded-sm border border-white/10 opacity-70 group-hover/buff:opacity-100 transition-opacity"
                      alt={buffImg}
                    />
                    {buff.stack_count > 1 && (
                      <div className="absolute -bottom-1 -right-1 bg-black/80 px-0.5 rounded border border-white/10">
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
          <GlassCard className="p-0 overflow-hidden border-white/5">
            {radiantPlayers.map((p, i) => (
              <ScoreboardRow key={i} player={p} userPeers={userPeers} />
            ))}
          </GlassCard>
        </div>

        {/* Dire */}
        <div>
          <div className="flex items-center gap-3 mb-4 px-4 justify-end">
            <h3 className="text-sm font-black text-loss uppercase tracking-[0.2em]">Dire Forces</h3>
            <div className="w-10 h-1 rounded-full bg-loss" />
          </div>
          <GlassCard className="p-0 overflow-hidden border-white/5">
            {direPlayers.map((p, i) => (
              <ScoreboardRow key={i} player={p} userPeers={userPeers} />
            ))}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
