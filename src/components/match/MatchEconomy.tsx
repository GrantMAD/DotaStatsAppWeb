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

export function MatchEconomy({ match }: { match: MatchDetails }) {
  if (!match.radiant_gold_adv || !match.radiant_xp_adv) {
    return (
      <div className="py-20 flex flex-col items-center justify-center border border-white/5 rounded-3xl">
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
        <GlassCard className="p-6 flex items-center justify-between group overflow-hidden">
          <div className="relative z-10">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Final Gold Advantage</p>
            <h3 className={cn("text-4xl font-black italic", finalGold >= 0 ? "text-win" : "text-loss")}>
              {finalGold >= 0 ? '+' : ''}{finalGold.toLocaleString()}
            </h3>
            <p className="text-xs font-bold text-gray-600 mt-2 uppercase tracking-tighter">
              {finalGold >= 0 ? 'Radiant' : 'Dire'} Lead
            </p>
          </div>
          <Zap size={48} className={cn("opacity-10 absolute -right-2 -bottom-2 group-hover:scale-125 transition-transform duration-700", finalGold >= 0 ? "text-win" : "text-loss")} />
        </GlassCard>

        <GlassCard className="p-6 flex items-center justify-between group overflow-hidden">
          <div className="relative z-10">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Final XP Advantage</p>
            <h3 className={cn("text-4xl font-black italic", finalXp >= 0 ? "text-win" : "text-loss")}>
              {finalXp >= 0 ? '+' : ''}{finalXp.toLocaleString()}
            </h3>
            <p className="text-xs font-bold text-gray-600 mt-2 uppercase tracking-tighter">
              {finalXp >= 0 ? 'Radiant' : 'Dire'} Lead
            </p>
          </div>
          <TrendingUp size={48} className={cn("opacity-10 absolute -right-2 -bottom-2 group-hover:scale-125 transition-transform duration-700", finalXp >= 0 ? "text-win" : "text-loss")} />
        </GlassCard>
      </div>

      <GlassCard className="h-[400px] p-8 bg-black/40">
        <div className="flex items-center justify-between mb-10">
           <h3 className="text-sm font-black text-white uppercase tracking-widest">Advantage Momentum</h3>
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-amber-500" />
                 <span className="text-[10px] font-black text-gray-500 uppercase">Gold</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-purple-500" />
                 <span className="text-[10px] font-black text-gray-500 uppercase">XP</span>
              </div>
           </div>
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#eab308" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
              dataKey="time" 
              stroke="#4b5563" 
              fontSize={10} 
              tickFormatter={(t) => `${t}'`} 
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              stroke="#4b5563" 
              fontSize={10} 
              tickFormatter={(val) => `${val > 0 ? '+' : ''}${Math.round(val / 1000)}k`} 
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}
              itemStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
              labelStyle={{ color: '#9ca3af', fontSize: '10px', marginBottom: '4px' }}
              labelFormatter={(t) => `${t} minutes`}
            />
            <ReferenceLine y={0} stroke="#333" strokeWidth={2} />
            <Area 
              type="monotone" 
              dataKey="gold" 
              stroke="#eab308" 
              strokeWidth={3}
              fill="url(#goldGradient)" 
              animationDuration={1500}
            />
            <Area 
              type="monotone" 
              dataKey="xp" 
              stroke="#8b5cf6" 
              strokeWidth={3}
              fill="url(#xpGradient)" 
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </GlassCard>
    </div>
  );
}
