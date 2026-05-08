'use client';

import React, { useMemo } from 'react';
import { RecentMatch, PlayerTotal } from '@/services/opendota';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  CartesianGrid
} from 'recharts';
import { 
  TrendingUp, 
  Zap, 
  Flame, 
  Skull, 
  Activity, 
  Target, 
  Crosshair,
  Timer,
  Users,
  Map,
  Shield
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { GlassCard } from '../ui/GlassCard';
import { Skeleton } from '../ui/Skeleton';

interface PerformanceTrendsProps {
  matches: RecentMatch[];
  totals: PlayerTotal[];
  loading?: boolean;
}

export default function PerformanceTrends({ matches, totals, loading }: PerformanceTrendsProps) {
  const trends = useMemo(() => {
    const recent = matches?.slice(0, 20) || [];
    if (recent.length === 0 || loading) return null;

    const recentCount = Math.max(1, recent.length);
    const avgKDA = recent.reduce((acc, m) => acc + (m.kills + m.assists) / Math.max(1, m.deaths), 0) / recentCount;
    const avgGPM = recent.reduce((acc, m) => acc + (m.gold_per_min || 0), 0) / recentCount;
    const avgXPM = recent.reduce((acc, m) => acc + (m.xp_per_min || 0), 0) / recentCount;
    const avgHDM = recent.reduce((acc, m) => acc + (m.hero_damage || 0), 0) / recentCount;
    const avgTD = recent.reduce((acc, m) => acc + (m.tower_damage || 0), 0) / recentCount;
    const avgLH = recent.reduce((acc, m) => acc + (m.last_hits || 0), 0) / recentCount;
    const avgHealing = recent.reduce((acc, m) => acc + (m.hero_healing || 0), 0) / recentCount;
    
    const laneCounts: Record<number, number> = {};
    recent.forEach(m => {
      if (m.lane) laneCounts[m.lane] = (laneCounts[m.lane] || 0) + 1;
    });
    const topLaneEntry = Object.entries(laneCounts).sort((a, b) => b[1] - a[1])[0];
    const topLane = topLaneEntry ? Number(topLaneEntry[0]) : null;

    const uniqueHeroes = new Set(recent.map(m => m.hero_id)).size;

    const safeTotals = totals || [];
    const lifetimeKills = safeTotals.find(t => t.field === 'kills')?.sum || 0;
    const lifetimeDeaths = safeTotals.find(t => t.field === 'deaths')?.sum || 0;
    const lifetimeAssists = safeTotals.find(t => t.field === 'assists')?.sum || 0;
    const lifetimeMatches = safeTotals.find(t => t.field === 'kills')?.n || 1;
    
    const lifetimeKDA = (lifetimeKills + lifetimeAssists) / Math.max(1, lifetimeDeaths);
    const lifetimeGPM = (safeTotals.find(t => t.field === 'gold_per_min')?.sum || 0) / lifetimeMatches;
    const lifetimeXPM = (safeTotals.find(t => t.field === 'xp_per_min')?.sum || 0) / lifetimeMatches;
    const lifetimeHDM = (safeTotals.find(t => t.field === 'hero_damage')?.sum || 0) / lifetimeMatches;
    const lifetimeTD = (safeTotals.find(t => t.field === 'tower_damage')?.sum || 0) / lifetimeMatches;
    const lifetimeLH = (safeTotals.find(t => t.field === 'last_hits')?.sum || 0) / lifetimeMatches;
    const lifetimeHealing = (safeTotals.find(t => t.field === 'hero_healing')?.sum || 0) / lifetimeMatches;

    const kdaHistory = [...recent].reverse().map((m, i) => ({
      index: i + 1,
      kda: Number(((m.kills + m.assists) / Math.max(1, m.deaths)).toFixed(2))
    }));

    const winRateRecent = (recent.filter(m => {
      const isRadiant = m.player_slot < 128;
      return (isRadiant && m.radiant_win) || (!isRadiant && !m.radiant_win);
    }).length / recentCount) * 100;

    const isOnFire = winRateRecent >= 65 || (lifetimeKDA > 0 && avgKDA > lifetimeKDA * 1.25);

    return {
      avgKDA, lifetimeKDA,
      avgGPM, lifetimeGPM,
      avgXPM, lifetimeXPM,
      avgHDM, lifetimeHDM,
      avgTD, lifetimeTD,
      avgLH, lifetimeLH,
      avgHealing, lifetimeHealing,
      topLane,
      uniqueHeroes,
      kdaHistory,
      winRateRecent,
      isOnFire
    };
  }, [matches, totals, loading]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-gaming-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 font-bold mt-4 uppercase tracking-widest text-xs">Analyzing trends...</p>
      </div>
    );
  }

  if (!matches || matches.length < 3) {
    return (
      <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-[var(--card-border)] rounded-3xl">
        <Activity className="w-12 h-12 text-gray-700 mb-4" />
        <p className="text-gray-500 font-bold text-center px-10 max-w-sm">
          Not enough match data to calculate trends. Play more matches or clear filters!
        </p>
      </div>
    );
  }

  if (!trends) return null;

  const renderTrendMetric = (label: string, recent: number, lifetime: number, icon: any, colorClass: string, isInteger: boolean = false) => {
    const Icon = icon;
    const diff = lifetime > 0 ? ((recent - lifetime) / lifetime) * 100 : 0;
    const isPositive = diff >= 0;

    return (
      <GlassCard className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn("p-1.5 rounded-lg bg-[var(--nav-hover)]", colorClass)}>
              <Icon size={16} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{label}</span>
          </div>
          {lifetime > 0 && (
            <div className={cn(
              "px-2 py-0.5 rounded-full text-[10px] font-black tracking-tighter",
              isPositive ? "bg-win/10 text-win" : "bg-loss/10 text-loss"
            )}>
              {isPositive ? '+' : ''}{diff.toFixed(0)}%
            </div>
          )}
        </div>
        
        <div className="flex items-baseline justify-between mt-auto">
          <div>
            <h4 className="text-3xl font-black text-foreground leading-none">
              {isInteger ? Math.round(recent).toLocaleString() : recent.toFixed(1)}
            </h4>
            <p className="text-[10px] font-bold text-gray-500 uppercase mt-1">Recent Avg</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-black text-gray-400">
              {isInteger ? Math.round(lifetime).toLocaleString() : lifetime.toFixed(1)}
            </p>
            <p className="text-[8px] font-bold text-gray-600 uppercase">Lifetime</p>
          </div>
        </div>
      </GlassCard>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-foreground tracking-tight uppercase">Form Analysis</h2>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-1">Performance trend over last 20 matches</p>
        </div>
        <div className="p-3 bg-gaming-accent/10 text-gaming-accent rounded-2xl">
          <TrendingUp size={24} />
        </div>
      </div>

      {trends.isOnFire && (
        <div className="bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30 p-6 rounded-3xl flex items-center gap-6 overflow-hidden relative group">
          <div className="bg-orange-500 p-3 rounded-2xl shadow-lg shadow-orange-500/50 group-hover:scale-110 transition-transform duration-500">
            <Flame className="w-8 h-8 text-white animate-pulse" />
          </div>
          <div className="flex-1">
            <h3 className="text-orange-400 font-black uppercase tracking-widest text-sm mb-1">On Fire</h3>
            <p className="text-foreground font-bold text-sm leading-snug">
              Your current performance is significantly above your lifetime average! Keep the momentum going.
            </p>
          </div>
          <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-foreground/5 to-transparent pointer-events-none" />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {renderTrendMetric('Avg KDA', trends.avgKDA, trends.lifetimeKDA, Target, 'text-gaming-accent')}
        {renderTrendMetric('Avg GPM', trends.avgGPM, trends.lifetimeGPM, Zap, 'text-amber-500', true)}
        {renderTrendMetric('Avg XPM', trends.avgXPM, trends.lifetimeXPM, Activity, 'text-blue-500', true)}
        {renderTrendMetric('Impact', trends.avgHDM, trends.lifetimeHDM, Skull, 'text-loss', true)}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <GlassCard className="h-[300px] flex flex-col p-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-sm font-black text-foreground uppercase tracking-widest">KDA Momentum</h3>
                <p className="text-gray-500 text-[10px] font-bold mt-1">Match by match trajectory</p>
              </div>
              <div className="bg-[var(--nav-hover)] px-3 py-1 rounded-lg text-gaming-accent text-[10px] font-black uppercase">
                Trend Visualizer
              </div>
            </div>
            
            <div className="flex-1 w-full -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends.kdaHistory}>
                  <defs>
                    <linearGradient id="kdaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area 
                    type="monotone" 
                    dataKey="kda" 
                    stroke="#8b5cf6" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#kdaGradient)" 
                    animationDuration={1500}
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="glass-card bg-[var(--card-bg)] p-2 border-[var(--card-border)] shadow-2xl">
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Match {payload[0].payload.index}</p>
                            <p className="text-xl font-black text-foreground">{payload[0].value} KDA</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        <div className="space-y-4">
          <GlassCard className="flex flex-col gap-3">
             <div className="flex items-center gap-2">
                <Users size={16} className="text-blue-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Diversity</span>
             </div>
             <h4 className="text-2xl font-black text-foreground">{trends.uniqueHeroes} Heroes</h4>
             <div className="bg-blue-500/10 px-2 py-1 rounded-lg self-start">
               <span className="text-blue-500 text-[9px] font-black uppercase tracking-tighter">
                 {((trends.uniqueHeroes / 20) * 100).toFixed(0)}% Flex Rate
               </span>
             </div>
          </GlassCard>

          <GlassCard className="flex flex-col gap-3 text-right items-end">
             <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Current Role</span>
                <Map size={16} className="text-gaming-accent" />
             </div>
             <h4 className="text-2xl font-black text-foreground">
                {trends.topLane === 1 ? 'Safelane' : 
                 trends.topLane === 2 ? 'Midlane' : 
                 trends.topLane === 3 ? 'Offlane' : 
                 trends.topLane === 4 ? 'Jungle' : 'Roaming/Flex'}
             </h4>
             <div className="bg-gaming-accent/10 px-2 py-1 rounded-lg">
               <span className="text-gaming-accent text-[9px] font-black uppercase tracking-tighter">
                 Predominant
               </span>
             </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
