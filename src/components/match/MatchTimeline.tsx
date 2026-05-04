'use client';

import React, { useMemo } from 'react';
import { MatchDetails } from '@/services/opendota';
import { getHeroImageUrl, getItemImageUrlByName } from '@/services/constants';
import { GlassCard } from '../ui/GlassCard';
import { cn } from '@/utils/cn';
import { Activity, Timer, Zap } from 'lucide-react';

export function MatchTimeline({ match }: { match: MatchDetails }) {
  if (!match.version) {
    return (
      <div className="py-20 flex flex-col items-center justify-center border border-white/5 rounded-3xl">
        <Activity className="w-12 h-12 text-gray-700 mb-4" />
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Parsed data required for timeline</p>
      </div>
    );
  }

  const durationMins = Math.ceil(match.duration / 60);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-4">
         <h3 className="text-sm font-black text-white uppercase tracking-widest">Event Trajectory</h3>
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-gaming-accent" />
               <span className="text-[9px] font-black text-gray-500 uppercase">Major Item</span>
            </div>
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-orange-500" />
               <span className="text-[9px] font-black text-gray-500 uppercase">Buyback</span>
            </div>
         </div>
      </div>

      <GlassCard className="p-0 overflow-x-auto no-scrollbar bg-black/40 border-white/5">
        <div className="min-w-[1200px] p-6">
          {/* Time scale */}
          <div className="relative h-10 border-b border-white/5 mb-8">
            <div className="absolute left-48 right-0 h-full">
              {Array.from({ length: Math.ceil(durationMins / 5) + 1 }).map((_, i) => (
                <div 
                  key={i} 
                  className="absolute top-0 flex flex-col items-center -translate-x-1/2"
                  style={{ left: `${(i * 5 / durationMins) * 100}%` }}
                >
                  <span className="text-[10px] font-black text-gray-600">{i * 5}'</span>
                  <div className="w-px h-2 bg-white/10 mt-1" />
                </div>
              ))}
            </div>
          </div>

          {/* Player Rows */}
          <div className="space-y-4">
            {match.players.map((p, pIdx) => {
              const events: { time: number; type: 'purchase' | 'buyback'; key: string }[] = [];
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

              return (
                <div key={pIdx} className="flex items-center gap-4 group">
                  {/* Player Info */}
                  <div className="w-48 flex items-center gap-3 shrink-0">
                    <div className="relative shrink-0">
                       <img src={getHeroImageUrl(p.hero_id)} className="w-12 h-7 rounded border border-white/10" alt="hero" />
                       {p.avatar && (
                         <img src={p.avatar} className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border border-black shadow-lg" alt="av" />
                       )}
                    </div>
                    <div className="min-w-0">
                       <p className="text-[10px] font-black text-white truncate leading-tight">{p.personaname || 'Anonymous'}</p>
                       <p className="text-[8px] font-bold text-gray-600 uppercase">Slot {p.player_slot}</p>
                    </div>
                  </div>

                  {/* Event Lane */}
                  <div className="flex-1 h-10 relative bg-white/[0.02] rounded-lg border border-white/[0.02] group-hover:bg-white/[0.05] transition-colors">
                    {/* Horizontal grid line */}
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-white/5 -translate-y-1/2" />
                    
                    {events.map((event, eIdx) => {
                      const leftPos = (event.time / 60 / durationMins) * 100;
                      if (leftPos < 0 || leftPos > 100) return null;

                      const buybackIcon = 'https://www.opendota.com/assets/images/dota2/buyback_icon.png';
                      const itemUrl = event.type === 'buyback' ? buybackIcon : getItemImageUrlByName(event.key);

                      return (
                        <div 
                          key={eIdx}
                          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 group/event z-10"
                          style={{ left: `${leftPos}%` }}
                        >
                          <div className={cn(
                            "p-0.5 rounded border transition-transform duration-300 hover:scale-150 hover:z-20",
                            event.type === 'buyback' ? "bg-orange-500 border-orange-300 shadow-orange-500/20 shadow-lg" : "bg-zinc-800 border-zinc-600"
                          )}>
                             <img src={itemUrl} className="w-6 h-4 rounded-[1px] object-cover" alt="ev" />
                          </div>
                          
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover/event:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-30">
                            <div className="bg-black/90 border border-white/10 px-2 py-1 rounded text-[8px] font-black text-white uppercase tracking-tighter">
                               {Math.floor(event.time / 60)}:{String(event.time % 60).padStart(2, '0')} • {event.key.replace(/_/g, ' ')}
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
        Hover over items to see exact timings and details
      </p>
    </div>
  );
}
