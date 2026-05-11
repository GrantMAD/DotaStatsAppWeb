'use client';

import React, { useState, useEffect } from 'react';
import { openDotaApi, HeroStats } from '@/services/opendota';
import { HEROES, getHeroImageUrl } from '@/services/constants';
import { Award, Users, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

const RANKS = [
  { id: 1, name: 'Herald' },
  { id: 2, name: 'Guardian' },
  { id: 3, name: 'Crusader' },
  { id: 4, name: 'Archon' },
  { id: 5, name: 'Legend' },
  { id: 6, name: 'Ancient' },
  { id: 7, name: 'Divine' },
  { id: 8, name: 'Immortal' },
];

interface HeroRankData {
  id: number;
  localized_name: string;
  winRate: number;
  pickRate: number;
  games: number;
}

export function BracketLeaderboards() {
  const [selectedRank, setSelectedRank] = useState<number>(8); // Default to Immortal
  const [data, setData] = useState<HeroRankData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const stats = await openDotaApi.getHeroStats();
        
        const rankKey = selectedRank as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
        
        // Special case for Immortal (8) because 8_pick/8_win often returns 0 from OpenDota API
        // We fallback to pro_pick/pro_win for Immortal insights
        const isImmortal = selectedRank === 8;
        const pickKey = (isImmortal ? 'pro_pick' : `${rankKey}_pick`) as keyof HeroStats;
        const winKey = (isImmortal ? 'pro_win' : `${rankKey}_win`) as keyof HeroStats;

        const formatted: HeroRankData[] = stats
          .map(hero => {
            const picks = Number(hero[pickKey] || 0);
            const wins = Number(hero[winKey] || 0);
            return {
              id: hero.id,
              localized_name: hero.localized_name,
              winRate: picks > 0 ? (wins / picks) * 100 : 0,
              pickRate: picks,
              games: picks
            };
          })
          .filter(h => h.games > (isImmortal ? 20 : 100)) // Lower threshold for pro stats sample size
          .sort((a, b) => b.winRate - a.winRate)
          .slice(0, 10);

        setData(formatted);
      } catch (error) {
        console.error('Error fetching bracket stats:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [selectedRank]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 p-1 bg-[var(--nav-hover)] rounded-xl w-fit border border-[var(--card-border)]">
        {RANKS.map((rank) => (
          <button
            key={rank.id}
            onClick={() => setSelectedRank(rank.id)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              selectedRank === rank.id
                ? "bg-gaming-accent text-white shadow-lg"
                : "text-gray-400 hover:text-foreground"
            )}
          >
            {rank.name}
          </button>
        ))}
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-[var(--card-border)] bg-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-gaming-accent" />
            <h3 className="font-bold">Top Heroes in {RANKS.find(r => r.id === selectedRank)?.name}</h3>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Users size={14} />
            <span>Bracket specific win rates</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Hero</th>
                <th className="px-6 py-4 font-medium">Win Rate</th>
                <th className="px-6 py-4 font-medium text-right">Matches</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--card-border)]">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-10 bg-white/5 rounded-lg w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-10 bg-white/5 rounded-lg w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-8 bg-white/5 rounded-lg w-8 ml-auto"></div></td>
                  </tr>
                ))
              ) : data.length > 0 ? (
                data.map((hero) => (
                  <tr key={hero.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 shrink-0">
                          <img 
                            src={getHeroImageUrl(hero.id)} 
                            alt={hero.localized_name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="font-bold text-foreground">
                          {hero.localized_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        <span className={cn(
                          "font-mono font-bold",
                          hero.winRate >= 53 ? "text-emerald-500" : "text-foreground"
                        )}>
                          {hero.winRate.toFixed(1)}%
                        </span>
                        <div className="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full",
                              hero.winRate >= 53 ? "bg-emerald-500" : "bg-gaming-accent"
                            )}
                            style={{ width: `${hero.winRate}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-xs font-bold text-gray-500 uppercase">
                        {hero.games.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-gray-400">
                    No data found for this bracket
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
