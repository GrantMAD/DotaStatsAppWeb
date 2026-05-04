'use client';

import React from 'react';
import { MatchDetails } from '@/services/opendota';
import { getHeroImageUrl, LOBBY_TYPES, REGIONS } from '@/services/constants';
import { GlassCard } from '../ui/GlassCard';
import { cn } from '@/utils/cn';
import { 
  Flame, 
  Coins, 
  TowerControl as Tower, 
  Heart, 
  Layers, 
  Eye, 
  Info,
  Calendar,
  Map,
  Shield,
  Activity
} from 'lucide-react';

export function MatchHighlights({ match }: { match: MatchDetails }) {
  const getHighlights = (m: MatchDetails) => {
    const sortedPlayers = [...m.players];
    const topDamage = [...sortedPlayers].sort((a, b) => b.hero_damage - a.hero_damage)[0];
    const topNetWorth = [...sortedPlayers].sort((a, b) => b.net_worth - a.net_worth)[0];
    const topTowers = [...sortedPlayers].sort((a, b) => b.tower_damage - a.tower_damage)[0];
    const topHealing = [...sortedPlayers].sort((a, b) => b.hero_healing - a.hero_healing)[0];
    const topStacks = [...sortedPlayers].sort((a, b) => (b.camps_stacked || 0) - (a.camps_stacked || 0))[0];
    const topWards = [...sortedPlayers].sort((a, b) => ((b.obs_placed || 0) + (b.sen_placed || 0)) - ((a.obs_placed || 0) + (a.sen_placed || 0)))[0];
    return { topDamage, topNetWorth, topTowers, topHealing, topStacks, topWards };
  };

  const h = getHighlights(match);

  const HighlightItem = ({ icon: Icon, title, player, value, colorClass }: any) => (
    <GlassCard className="p-6 flex items-center gap-6 group hover:bg-white/[0.05] transition-all">
      <div className={cn("p-4 rounded-2xl bg-white/5 shadow-lg group-hover:scale-110 transition-transform duration-500", colorClass)}>
        <Icon size={32} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("text-[10px] font-black uppercase tracking-[0.2em] mb-1", colorClass)}>{title}</p>
        <h4 className="text-xl font-black text-white truncate">{player.personaname || 'Anonymous'}</h4>
        <p className="text-sm font-bold text-gray-500 mt-1">{value}</p>
      </div>
    </GlassCard>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <HighlightItem 
          icon={Flame} 
          title="Top Damage" 
          player={h.topDamage} 
          value={`${h.topDamage.hero_damage.toLocaleString()} Total Damage`}
          colorClass="text-red-500"
        />
        <HighlightItem 
          icon={Coins} 
          title="Top Net Worth" 
          player={h.topNetWorth} 
          value={`${(h.topNetWorth.net_worth / 1000).toFixed(1)}k Gold Accumulated`}
          colorClass="text-amber-500"
        />
        <HighlightItem 
          icon={Tower} 
          title="Objective MVP" 
          player={h.topTowers} 
          value={`${h.topTowers.tower_damage.toLocaleString()} Tower Damage`}
          colorClass="text-orange-500"
        />
        
        {h.topHealing.hero_healing > 0 && (
          <HighlightItem 
            icon={Heart} 
            title="Support MVP" 
            player={h.topHealing} 
            value={`${h.topHealing.hero_healing.toLocaleString()} Healing Provided`}
            colorClass="text-blue-500"
          />
        )}

        {(h.topStacks.camps_stacked || 0) > 0 && (
          <HighlightItem 
            icon={Layers} 
            title="Master Stacker" 
            player={h.topStacks} 
            value={`${h.topStacks.camps_stacked} Neutral Camps Stacked`}
            colorClass="text-purple-500"
          />
        )}

        {((h.topWards.obs_placed || 0) + (h.topWards.sen_placed || 0)) > 0 && (
          <HighlightItem 
            icon={Eye} 
            title="Vision Specialist" 
            player={h.topWards} 
            value={`${(h.topWards.obs_placed || 0) + (h.topWards.sen_placed || 0)} Wards Placed`}
            colorClass="text-emerald-500"
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2 p-8">
           <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8 flex items-center gap-3">
             <Info size={18} className="text-gaming-accent" /> Match Metadata
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              <div className="space-y-4">
                 <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <div className="flex items-center gap-2 text-gray-500 font-bold text-xs uppercase tracking-tighter">
                       <Activity size={14} /> Lobby Type
                    </div>
                    <span className="text-sm font-black text-white">{LOBBY_TYPES[match.lobby_type] || 'Standard'}</span>
                 </div>
                 <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <div className="flex items-center gap-2 text-gray-500 font-bold text-xs uppercase tracking-tighter">
                       <Map size={14} /> Region
                    </div>
                    <span className="text-sm font-black text-white">{REGIONS[match.region] || `Region ${match.region}`}</span>
                 </div>
              </div>
              <div className="space-y-4">
                 <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <div className="flex items-center gap-2 text-gray-500 font-bold text-xs uppercase tracking-tighter">
                       <Shield size={14} /> Patch
                    </div>
                    <span className="text-sm font-black text-white">{match.patch ? `Patch ${match.patch}` : '7.35'}</span>
                 </div>
                 <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <div className="flex items-center gap-2 text-gray-500 font-bold text-xs uppercase tracking-tighter">
                       <Calendar size={14} /> Start Time
                    </div>
                    <span className="text-sm font-black text-white">{new Date(match.start_time * 1000).toLocaleString()}</span>
                 </div>
              </div>
           </div>
        </GlassCard>

        {!match.version && (
          <GlassCard className="p-8 border-dashed border-white/10 flex flex-col items-center justify-center text-center">
            <Info size={32} className="text-gray-700 mb-4" />
            <p className="text-gray-500 font-medium text-xs leading-relaxed">
              Additional performance metrics like "Master Stacker" and "Support Impact" are only available for fully parsed matches.
            </p>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
