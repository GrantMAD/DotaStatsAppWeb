'use client';

import React, { useState, useEffect } from 'react';
import { openDotaApi, DistributionData } from '@/services/opendota';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Info, Users, BarChart3, TrendingUp } from 'lucide-react';
import { cn } from '@/utils/cn';

const RANK_NAMES: Record<number, string> = {
  1: 'Herald',
  2: 'Guardian',
  3: 'Crusader',
  4: 'Archon',
  5: 'Legend',
  6: 'Ancient',
  7: 'Divine',
  8: 'Immortal',
};

export function CommunityDistribution() {
  const [data, setData] = useState<any[]>([]);
  const [totalPlayers, setTotalPlayers] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    async function fetchData() {
      setLoading(true);
      try {
        const distribution = await openDotaApi.getDistributions();
        if (distribution && distribution.ranks) {
          const total = distribution.ranks.sum.count;
          setTotalPlayers(total);

          // Group by major rank (first digit of bin)
          const grouped: Record<number, number> = {};
          distribution.ranks.rows.forEach(row => {
            const majorRank = Math.floor(row.bin / 10);
            if (majorRank >= 1 && majorRank <= 8) {
              grouped[majorRank] = (grouped[majorRank] || 0) + row.count;
            }
          });

          const formatted = Object.entries(grouped).map(([rank, count]) => ({
            rankId: parseInt(rank),
            name: RANK_NAMES[parseInt(rank)],
            count,
            percentage: (count / total) * 100,
            color: getRankColor(parseInt(rank))
          })).sort((a, b) => a.rankId - b.rankId);

          setData(formatted);
        }
      } catch (error) {
        console.error('Error fetching distributions:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const getRankColor = (rankId: number) => {
    switch (rankId) {
      case 1: return '#734d26'; // Herald (Bronze-ish)
      case 2: return '#595959'; // Guardian (Silver-ish)
      case 3: return '#999900'; // Crusader (Gold-ish)
      case 4: return '#0099cc'; // Archon (Blue-ish)
      case 5: return '#9933ff'; // Legend (Purple-ish)
      case 6: return '#cc0066'; // Ancient (Pink-ish)
      case 7: return '#ff9900'; // Divine (Orange-ish)
      case 8: return '#ff3300'; // Immortal (Red-ish)
      default: return 'var(--gaming-accent)';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-6 flex items-center gap-4 border-l-4 border-l-gaming-accent">
          <div className="w-12 h-12 rounded-xl bg-gaming-accent/10 flex items-center justify-center text-gaming-accent shrink-0">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-400 font-medium">Sampled Players</p>
            <h3 className="text-2xl font-bold">{totalPlayers.toLocaleString()}</h3>
          </div>
        </div>
        <div className="glass-card p-6 flex items-center gap-4 border-l-4 border-l-indigo-500">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
            <BarChart3 size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-400 font-medium">Average Rank</p>
            <h3 className="text-2xl font-bold">Archon / Legend</h3>
          </div>
        </div>
        <div className="glass-card p-6 flex items-center gap-4 border-l-4 border-l-emerald-500">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-400 font-medium">Global Trend</p>
            <h3 className="text-2xl font-bold">Growing</h3>
          </div>
        </div>
      </div>

      <div className="glass-card p-6 min-h-[450px] flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gaming-accent/10 flex items-center justify-center border border-gaming-accent/20">
              <BarChart3 className="text-gaming-accent w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Global Rank Distribution</h3>
              <p className="text-sm text-gray-400">The bell curve of the Dota 2 community</p>
            </div>
          </div>
        </div>

        <div className="w-full h-[300px] relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gaming-accent"></div>
            </div>
          ) : (data.length > 0 && mounted) ? (
            <ResponsiveContainer width="100%" height={300} minWidth={0}>
              <BarChart data={data} margin={{ top: 5, right: 30, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: '#f8fafc',
                    backdropFilter: 'blur(8px)'
                  }}
                  formatter={(value: number) => [`${value.toFixed(2)}%`, 'Players']}
                />
                <Bar 
                  dataKey="percentage" 
                  radius={[8, 8, 0, 0]}
                  animationDuration={1500}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 space-y-2">
              <Info className="w-8 h-8 opacity-20" />
              <p>Unable to load distribution data</p>
            </div>
          )}
        </div>

        <div className="mt-8 p-4 rounded-xl bg-gaming-accent/5 border border-gaming-accent/10 flex gap-4 items-start">
          <div className="w-10 h-10 rounded-lg bg-gaming-accent/20 flex items-center justify-center text-gaming-accent shrink-0">
            <Info size={20} />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-sm">Understanding the Curve</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              This chart shows where players are distributed across the eight main rank tiers. 
              The majority of players are found in the <span className="text-white font-bold">Archon</span> and <span className="text-white font-bold">Legend</span> brackets. 
              Breaking into <span className="text-indigo-400 font-bold">Ancient</span> and beyond puts you in the top 20% of all sampled players globally.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
