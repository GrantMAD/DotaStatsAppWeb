'use client';

import React from 'react';
import { MatchDetails } from '@/services/opendota';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
  Tooltip,
} from 'recharts';
import { GlassCard } from '../ui/GlassCard';
import { TrendingUp, Zap, Activity } from '@/components/ui/Icons';
import { cn } from '@/utils/cn';
import { useTheme } from '@/context/ThemeContext';

export function MatchEconomy({ match }: { match: MatchDetails }) {
  const { resolvedTheme } = useTheme();

  if (!match.radiant_gold_adv || !match.radiant_xp_adv) {
    return (
      <div className="py-20 flex flex-col items-center justify-center border border-(--overlay-border) rounded-3xl">
        <Activity className="w-12 h-12 text-gray-700 mb-4" />
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
          No parsed economy data available
        </p>
      </div>
    );
  }

  const data = match.radiant_gold_adv.map((gold, i) => ({
    time: i,
    gold,
    xp: match.radiant_xp_adv[i],
  }));

  const finalGold =
    match.radiant_gold_adv[match.radiant_gold_adv.length - 1];
  const finalXp =
    match.radiant_xp_adv[match.radiant_xp_adv.length - 1];

  return (
    <div className="space-y-8">
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="p-8 flex items-center justify-between group overflow-hidden relative border-none">
          <div
            className={cn(
              'absolute inset-0 opacity-10 transition-opacity group-hover:opacity-20',
              finalGold >= 0 ? 'bg-win' : 'bg-loss'
            )}
          />
          <div className="relative z-10">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 italic">
              Net Worth Differential
            </p>
            <h3
              className={cn(
                'text-5xl font-black italic tracking-tighter',
                finalGold >= 0 ? 'text-win' : 'text-loss'
              )}
            >
              {finalGold >= 0 ? '+' : ''}
              {finalGold.toLocaleString()}
            </h3>
          </div>
          <Zap
            size={64}
            className={cn(
              'opacity-10 absolute -right-4 -bottom-4 group-hover:scale-125 transition-transform duration-1000',
              finalGold >= 0 ? 'text-win' : 'text-loss'
            )}
          />
        </GlassCard>

        <GlassCard className="p-8 flex items-center justify-between group overflow-hidden relative border-none">
          <div
            className={cn(
              'absolute inset-0 opacity-10 transition-opacity group-hover:opacity-20',
              finalXp >= 0 ? 'bg-win' : 'bg-loss'
            )}
          />
          <div className="relative z-10">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 italic">
              Experience Differential
            </p>
            <h3
              className={cn(
                'text-5xl font-black italic tracking-tighter',
                finalXp >= 0 ? 'text-win' : 'text-loss'
              )}
            >
              {finalXp >= 0 ? '+' : ''}
              {finalXp.toLocaleString()}
            </h3>
          </div>
          <TrendingUp
            size={64}
            className={cn(
              'opacity-10 absolute -right-4 -bottom-4 group-hover:scale-125 transition-transform duration-1000',
              finalXp >= 0 ? 'text-win' : 'text-loss'
            )}
          />
        </GlassCard>
      </div>

      {/* Chart */}
      <GlassCard className="h-auto min-h-[450px] p-4 md:p-8 bg-(--tech-bg) border-(--overlay-border) relative overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-win/5 blur-[80px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-loss/5 blur-[80px] rounded-full" />

        <div className="h-[350px] relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#eab308" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={
                  resolvedTheme === 'dark'
                    ? 'rgba(255,255,255,0.03)'
                    : 'rgba(0,0,0,0.03)'
                }
                vertical={false}
              />

              <XAxis
                dataKey="time"
                stroke="#4b5563"
                fontSize={9}
                fontWeight="900"
                tickFormatter={(t) => `${t}'`}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                stroke="#4b5563"
                fontSize={9}
                fontWeight="900"
                tickFormatter={(val) =>
                  `${val > 0 ? '+' : ''}${Math.round(val / 1000)}k`
                }
                axisLine={false}
                tickLine={false}
              />

              <ReferenceLine
                y={0}
                stroke={
                  resolvedTheme === 'dark'
                    ? 'rgba(255,255,255,0.1)'
                    : 'rgba(0,0,0,0.1)'
                }
              />

              <Tooltip 
                trigger="click"
                allowEscapeViewBox={{ x: true, y: true }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="glass-card bg-(--card-bg) p-3 border-(--card-border) shadow-2xl backdrop-blur-md">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{payload[0].payload.time} Minutes</p>
                        <div className="space-y-1">
                          <p className="text-sm font-black text-amber-500">
                            Gold: {(payload[0].value as number) > 0 ? '+' : ''}
                            {payload[0].value?.toLocaleString()}
                          </p>
                          <p className="text-sm font-black text-indigo-500">
                            XP: {(payload[1].value as number) > 0 ? '+' : ''}
                            {payload[1].value?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Area
                type="monotone"
                dataKey="gold"
                stroke="#eab308"
                strokeWidth={3}
                fill="url(#goldGradient)"
                activeDot={{ r: 6, strokeWidth: 0 }}
              />

              <Area
                type="monotone"
                dataKey="xp"
                stroke="#8b5cf6"
                strokeWidth={3}
                fill="url(#xpGradient)"
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </div>
  );
}