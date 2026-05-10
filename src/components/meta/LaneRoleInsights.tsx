'use client';

import React, { useState, useEffect } from 'react';
import { openDotaApi, LaneRoleScenario } from '@/services/opendota';
import { HEROES, getHeroImageUrl } from '@/services/constants';
import { ChevronRight, Award, Users } from 'lucide-react';
import { cn } from '@/utils/cn';

const LANE_ROLES = [
  { id: 1, name: 'Safe Lane' },
  { id: 2, name: 'Mid Lane' },
  { id: 3, name: 'Off Lane' },
];

interface AggregatedHeroStats {
  hero_id: number;
  winRate: number;
  games: number;
}

export function LaneRoleInsights() {
  const [selectedLane, setSelectedLane] = useState<number>(2); // Mid
  const [data, setData] = useState<AggregatedHeroStats[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const scenarios = await openDotaApi.getScenariosLaneRoles({
          lane_role: selectedLane
        });
        // Aggregate by hero_id and find best ones
        const heroStats: Record<number, { wins: number, games: number }> = {};
        scenarios.forEach(s => {
          // OpenDota API has corrupted data at the 3600s time slice with inflated games/wins
          if (s.time === 3600) return;

          if (!heroStats[s.hero_id]) heroStats[s.hero_id] = { wins: 0, games: 0 };
          heroStats[s.hero_id].wins += Number(s.wins || 0);
          heroStats[s.hero_id].games += Number(s.games || 0);
        });

        const formatted: AggregatedHeroStats[] = Object.entries(heroStats)
          .map(([hero_id, stats]) => ({
            hero_id: parseInt(hero_id),
            winRate: (stats.wins / stats.games) * 100,
            games: stats.games
          }))
          .filter(h => h.games > 500) // Minimum sample size
          .sort((a, b) => b.winRate - a.winRate)
          .slice(0, 10);

        setData(formatted);
      } catch (error) {
        console.error('Error fetching lane scenarios:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [selectedLane]);

  return (
    <div className="space-y-6">
      <div className="flex gap-2 p-1 bg-[var(--nav-hover)] rounded-xl w-fit border border-[var(--card-border)]">
        {LANE_ROLES.map((lane) => (
          <button
            key={lane.id}
            onClick={() => setSelectedLane(lane.id)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              selectedLane === lane.id
                ? "bg-gaming-accent text-white shadow-lg"
                : "text-gray-400 hover:text-foreground"
            )}
          >
            {lane.name}
          </button>
        ))}
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-[var(--card-border)] bg-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold">Top Performance by Lane</h3>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Users size={14} />
            <span>Sample size {'>'} 500 games</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Hero</th>
                <th className="px-6 py-4 font-medium">Win Rate</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
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
                  <tr key={hero.hero_id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 shrink-0">
                          <img 
                            src={getHeroImageUrl(hero.hero_id)} 
                            alt={HEROES[hero.hero_id]?.localized_name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="font-bold text-foreground">
                          {HEROES[hero.hero_id]?.localized_name || `Unknown Hero (${hero.hero_id})`}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        <span className={cn(
                          "font-mono font-bold",
                          hero.winRate >= 52 ? "text-emerald-500" : "text-foreground"
                        )}>
                          {hero.winRate.toFixed(1)}%
                        </span>
                        <div className="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full",
                              hero.winRate >= 52 ? "bg-emerald-500" : "bg-gaming-accent"
                            )}
                            style={{ width: `${hero.winRate}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase mt-0.5">
                          {hero.games.toLocaleString()} Matches
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 rounded-lg bg-white/5 hover:bg-gaming-accent hover:text-white transition-all text-gray-400">
                        <ChevronRight size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                    No data found for this lane role
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
