'use client';

import React, { useMemo } from 'react';
import { useHeroDurations } from '@/hooks/useOpenDota';
import { Skeleton } from '@/components/ui/Skeleton';
import { GlassCard } from '@/components/ui/GlassCard';
import {
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
} from 'recharts';
import { motion } from 'framer-motion';

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[var(--glass-start)] backdrop-blur-md border border-[var(--card-border)] p-3 rounded-xl shadow-2xl">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 italic">
          {payload[0].payload.name}
        </p>

        <p className="text-sm font-black text-foreground italic">
          Win Rate:{' '}
          <span className={payload[0].value >= 50 ? 'text-win' : 'text-loss'}>
            {payload[0].value.toFixed(1)}%
          </span>
        </p>

        <p className="text-[8px] font-bold text-gray-500 uppercase mt-1">
          {payload[0].payload.games.toLocaleString()} Matches
        </p>
      </div>
    );
  }
  return null;
};

export function HeroPowerSpikes({ heroId }: { heroId: number }) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [ready, setReady] = React.useState(false);

  const { data: durations = [], isLoading } = useHeroDurations(heroId);

  /**
   * ✅ Fix: Wait for REAL layout size instead of timeout
   * This prevents Recharts from receiving width/height = -1
   */
  React.useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;

      if (width > 0 && height > 0) {
        setReady(true);
      }
    });

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  const chartData = useMemo(() => {
    if (!durations || durations.length === 0) return [];

    return durations
      .sort((a, b) => a.duration_bin - b.duration_bin)
      .map(d => ({
        name: `${Math.floor(d.duration_bin / 60)}m`,
        winRate: (d.wins / d.games_played) * 100,
        games: d.games_played,
      }));
  }, [durations]);

  if (isLoading || !ready) {
    return (
      <GlassCard className="p-6 h-[400px] flex items-center justify-center">
        <Skeleton className="w-full h-full rounded-2xl" />
      </GlassCard>
    );
  }

  if (chartData.length === 0) {
    return (
      <GlassCard className="p-6 h-[400px] flex items-center justify-center border-dashed">
        <p className="text-gray-500 font-bold italic uppercase tracking-widest text-[10px]">
          No duration data found
        </p>
      </GlassCard>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-[400px]"
    >
      <GlassCard className="p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-foreground italic">
              Power Spikes
            </h3>
            <p className="text-[8px] font-bold text-gray-500 uppercase">
              Win Rate by Game Duration
            </p>
          </div>

          <div className="px-2 py-0.5 rounded bg-gaming-accent/10 border border-gaming-accent/20">
            <span className="text-[8px] font-black text-gaming-accent uppercase tracking-tighter italic">
              Live Meta
            </span>
          </div>
        </div>

        {/* Chart container */}
        <div
          ref={containerRef}
          className="w-full mt-2 relative"
          style={{ minHeight: '250px' }}
        >
          <div className="absolute inset-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorWr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="rgba(255,255,255,0.05)"
                />

                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }}
                  dy={10}
                />

                <YAxis
                  domain={['auto', 'auto']}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }}
                />

                <Tooltip content={<CustomTooltip />} />

                <Area
                  type="monotone"
                  dataKey="winRate"
                  stroke="#00ff88"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorWr)"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-[var(--card-border)] flex justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gaming-accent shadow-[0_0_8px_var(--gaming-accent)]" />
            <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest italic">
              Win Rate %
            </span>
          </div>

          <p className="text-[8px] font-bold text-gray-600 uppercase italic">
            Trend over last 30 days
          </p>
        </div>
      </GlassCard>
    </motion.div>
  );
}