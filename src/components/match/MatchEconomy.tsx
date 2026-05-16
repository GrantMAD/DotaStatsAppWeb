'use client';

import React from 'react';
import { MatchDetails } from '@/services/opendota';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { GlassCard } from '../ui/GlassCard';
import { TrendingUp, Zap, Activity } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useTheme } from '@/context/ThemeContext';

export function MatchEconomy({ match }: { match: MatchDetails }) {
  const { resolvedTheme } = useTheme();

  if (!match.radiant_gold_adv || !match.radiant_xp_adv) {
    return (
      <div className="py-20 flex flex-col items-center justify-center border border-[var(--overlay-border)] rounded-3xl">
        <Activity className="w-12 h-12 text-gray-700 mb-4" />
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No parsed economy data available</p>
      </div>
    );
  }

  const data = match.radiant_gold_adv.map((gold, i) => ({
    time: i,
    gold,
    xp: match.radiant_xp_adv[i]
  }));

  const finalGold = match.radiant_gold_adv[match.radiant_gold_adv.length - 1];
  const finalXp = match.radiant_xp_adv[match.radiant_xp_adv.length - 1];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="p-8 flex items-center justify-between group overflow-hidden relative border-none">
          <div className={cn(
            "absolute inset-0 opacity-10 transition-opacity group-hover:opacity-20",
            finalGold >= 0 ? "bg-win" : "bg-loss"
          )} />
          <div className="relative z-10">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 italic">Net Worth Differential</p>
            <h3 className={cn("text-5xl font-black italic tracking-tighter", finalGold >= 0 ? "text-win" : "text-loss")}>
              {finalGold >= 0 ? '+' : ''}{finalGold.toLocaleString()}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <div className={cn("w-2 h-2 rounded-full animate-pulse", finalGold >= 0 ? "bg-win shadow-[0_0_8px_var(--color-win)]" : "bg-loss shadow-[0_0_8px_var(--color-loss)]")} />
              <p className="text-[10px] font-black text-foreground uppercase tracking-widest">
                {finalGold >= 0 ? 'Radiant Control' : 'Dire Dominance'}
              </p>
            </div>
          </div>
          <Zap size={64} className={cn("opacity-10 absolute -right-4 -bottom-4 group-hover:scale-125 transition-transform duration-1000", finalGold >= 0 ? "text-win" : "text-loss")} />
        </GlassCard>

        <GlassCard className="p-8 flex items-center justify-between group overflow-hidden relative border-none">
          <div className={cn(
            "absolute inset-0 opacity-10 transition-opacity group-hover:opacity-20",
            finalXp >= 0 ? "bg-win" : "bg-loss"
          )} />
          <div className="relative z-10">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 italic">Experience Differential</p>
            <h3 className={cn("text-5xl font-black italic tracking-tighter", finalXp >= 0 ? "text-win" : "text-loss")}>
              {finalXp >= 0 ? '+' : ''}{finalXp.toLocaleString()}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <div className={cn("w-2 h-2 rounded-full animate-pulse", finalXp >= 0 ? "bg-win shadow-[0_0_8px_var(--color-win)]" : "bg-loss shadow-[0_0_8px_var(--color-loss)]")} />
              <p className="text-[10px] font-black text-foreground uppercase tracking-widest">
                {finalXp >= 0 ? 'Radiant Control' : 'Dire Dominance'}
              </p>
            </div>
          </div>
          <TrendingUp size={64} className={cn("opacity-10 absolute -right-4 -bottom-4 group-hover:scale-125 transition-transform duration-1000", finalXp >= 0 ? "text-win" : "text-loss")} />
        </GlassCard>
      </div>

      <GlassCard className="h-[450px] p-8 bg-[var(--tech-bg)] border-[var(--overlay-border)] relative overflow-hidden">
        {/* Runic decorative corners */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-win/5 blur-[80px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-loss/5 blur-[80px] rounded-full" />

        <div className="flex items-center justify-between mb-10 relative z-10">
          <div>
            <h3 className="text-sm font-black text-foreground uppercase tracking-[0.2em] italic">Momentum Trajectory</h3>
            <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mt-1">Real-time advantage fluctuations</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 group cursor-help">
              <div className="w-8 h-1 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
              <span className="text-[9px] font-black text-gray-400 uppercase group-hover:text-amber-500 transition-colors">Gold</span>
            </div>
            <div className="flex items-center gap-2 group cursor-help">
              <div className="w-8 h-1 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(139,92,246,0.4)]" />
              <span className="text-[9px] font-black text-gray-400 uppercase group-hover:text-purple-500 transition-colors">Experience</span>
            </div>
          </div>
        </div>

        <div className="h-[300px] relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#eab308" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#eab308" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={resolvedTheme === 'dark' ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)"} vertical={false} />
              <XAxis
                dataKey="time"
                stroke="#4b5563"
                fontSize={9}
                fontFamily="inherit"
                fontWeight="900"
                tickFormatter={(t) => `${t}'`}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                stroke="#4b5563"
                fontSize={9}
                fontFamily="inherit"
                fontWeight="900"
                tickFormatter={(val) => `${val > 0 ? '+' : ''}${Math.round(val / 1000)}k`}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(9, 9, 11, 0.9)',
                  borderRadius: '16px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                }}
                itemStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                labelStyle={{ color: '#6b7280', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '8px' }}
                labelFormatter={(t) => `Game Time: ${t} minutes`}
                cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
              />
              <ReferenceLine y={0} stroke={resolvedTheme === 'dark' ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"} strokeWidth={1} />
              <Area
                type="monotone"
                dataKey="gold"
                stroke="#eab308"
                strokeWidth={3}
                fill="url(#goldGradient)"
                animationDuration={2000}
                strokeLinecap="round"
              />
              <Area
                type="monotone"
                dataKey="xp"
                stroke="#8b5cf6"
                strokeWidth={3}
                fill="url(#xpGradient)"
                animationDuration={2000}
                strokeLinecap="round"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex justify-between mt-6 px-4">
          <div className="text-[10px] font-black text-win uppercase tracking-widest flex items-center gap-2">
            <TrendingUp size={12} /> Radiant Advantage
          </div>
          <div className="text-[10px] font-black text-loss uppercase tracking-widest flex items-center gap-2">
            Dire Advantage <TrendingUp size={12} className="rotate-180" />
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
