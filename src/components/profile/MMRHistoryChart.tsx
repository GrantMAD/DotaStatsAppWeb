'use client';

import React, { useMemo } from 'react';
import { PlayerRating } from '@/services/opendota';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  CartesianGrid,
  YAxisProps
} from 'recharts';
import { TrendingUp, Activity, Award } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Skeleton } from '../ui/Skeleton';
import { format } from 'date-fns';
import { useTheme } from '@/context/ThemeContext';

interface MMRHistoryChartProps {
  ratings: PlayerRating[];
  loading?: boolean;
}

export default function MMRHistoryChart({ ratings, loading }: MMRHistoryChartProps) {
  const { resolvedTheme } = useTheme();

  const chartData = useMemo(() => {
    if (!ratings || !Array.isArray(ratings) || ratings.length === 0) return [];
    
    // Filter and map to chart format with fallback for competitive_rank
    const validRatings = ratings
      .filter(r => {
        const mmrValue = r.solo_competitive_rank || r.competitive_rank;
        return (
          mmrValue != null && 
          !isNaN(Number(mmrValue)) && 
          r.time != null && 
          !isNaN(Number(r.time))
        );
      })
      .sort((a, b) => a.time - b.time);

    return validRatings.map(r => {
      const mmr = Number(r.solo_competitive_rank || r.competitive_rank);
      const timestamp = r.time * 1000;
      const dateObj = new Date(timestamp);
      
      return {
        time: timestamp,
        mmr: mmr,
        date: format(dateObj, 'MMM d, yyyy')
      };
    });
  }, [ratings]);

  const stats = useMemo(() => {
    if (chartData.length === 0) return null;
    const values = chartData.map(d => d.mmr);
    
    const highest = Math.max(...values);
    const lowest = Math.min(...values);
    const current = values[values.length - 1];
    const start = values[0];

    return {
      current,
      highest,
      lowest,
      start,
      gain: current - start
    };
  }, [chartData]);

  if (loading) {
    return <Skeleton className="h-[400px] w-full rounded-3xl" />;
  }

  if (chartData.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-[var(--card-border)] rounded-3xl">
        <Activity className="w-12 h-12 text-gray-700 mb-4" />
        <p className="text-gray-500 font-bold text-center px-10 max-w-sm">
          No historical MMR data found for this player.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard className="p-4">
           <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Peak Rating</p>
           <h4 className="text-2xl font-black text-foreground">{stats?.highest?.toLocaleString() || 'N/A'}</h4>
        </GlassCard>
        <GlassCard className="p-4">
           <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Entry Rating</p>
           <h4 className="text-2xl font-black text-foreground">{stats?.start?.toLocaleString() || 'N/A'}</h4>
        </GlassCard>
        <GlassCard className="p-4">
           <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Gain/Loss</p>
           <h4 className={`text-2xl font-black ${stats && (stats.gain ?? 0) >= 0 ? 'text-win' : 'text-loss'}`}>
              {stats && (stats.gain ?? 0) >= 0 ? '+' : ''}{stats?.gain?.toLocaleString() || '0'}
           </h4>
        </GlassCard>
        <GlassCard className="p-4 bg-gaming-accent/10 border-gaming-accent/20">
           <p className="text-[10px] font-black text-gaming-accent uppercase tracking-widest mb-1">Current Estimate</p>
           <h4 className="text-2xl font-black text-foreground">{stats?.current?.toLocaleString() || 'N/A'}</h4>
        </GlassCard>
      </div>

      <GlassCard className="h-[400px] p-8 bg-[var(--tech-bg)] border-[var(--overlay-border)] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <TrendingUp size={120} />
        </div>
        
        <div className="flex items-center justify-between mb-10 relative z-10">
           <div>
              <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Rank Progression</h3>
              <p className="text-gray-500 text-[10px] font-bold mt-1">Historical MMR adjustments over time</p>
           </div>
        </div>

        <div className="h-[280px] w-full relative z-10 min-h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="mmrGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-gaming-accent)" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="var(--color-gaming-accent)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={resolvedTheme === 'dark' ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} vertical={false} />
              <XAxis 
                dataKey="time" 
                stroke="#4b5563" 
                fontSize={10} 
                tickFormatter={(t) => {
                  try {
                    return format(new Date(t), 'MMM yy');
                  } catch {
                    return '';
                  }
                }} 
                axisLine={false}
                tickLine={false}
                minTickGap={30}
              />
              <YAxis 
                stroke="#4b5563" 
                fontSize={10} 
                domain={['dataMin - 100', 'dataMax + 100']}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => val?.toLocaleString() || ''}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="glass-card bg-[var(--card-bg)] p-3 border-[var(--card-border)] shadow-2xl backdrop-blur-xl">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{payload[0].payload.date}</p>
                        <p className="text-2xl font-black text-foreground">{payload[0].value?.toLocaleString()} MMR</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area 
                type="monotone" 
                dataKey="mmr" 
                stroke="var(--color-gaming-accent)" 
                strokeWidth={4}
                fillOpacity={1} 
                fill="url(#mmrGradient)" 
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </div>
  );
}
