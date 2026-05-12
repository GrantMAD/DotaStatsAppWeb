'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { openDotaApi, ItemTimingScenario } from '@/services/opendota';
import { HEROES, ITEM_IDS } from '@/services/constants';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  Label
} from 'recharts';
import { Info, TrendingDown, TrendingUp, Target, Clock, AlertTriangle, Zap } from 'lucide-react';

export function ItemTimingAnalyzer() {
  const [selectedHero, setSelectedHero] = useState<number>(1); // Anti-Mage
  const [selectedItem, setSelectedItem] = useState<string>('bfury');
  const [data, setData] = useState<ItemTimingScenario[]>([]);
  const [loading, setLoading] = useState(false);

  const heroList = useMemo(() => Object.entries(HEROES).map(([id, hero]) => ({
    id: parseInt(id),
    ...hero
  })).sort((a, b) => a.localized_name.localeCompare(b.localized_name)), []);

  const itemList = useMemo(() => Object.entries(ITEM_IDS)
    .map(([id, name]) => ({ id: parseInt(id), name }))
    .filter(item => item.name && !item.name.includes('recipe'))
    .sort((a, b) => a.name.localeCompare(b.name)), []);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const scenarios = await openDotaApi.getScenariosItemTimings({
          hero_id: selectedHero,
          item: selectedItem
        });
        // Sort by time
        const sorted = scenarios.sort((a, b) => a.time - b.time);
        setData(sorted);
      } catch (error) {
        console.error('Error fetching scenarios:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [selectedHero, selectedItem]);

  const chartData = useMemo(() => {
    return data.map(d => {
      const games = parseInt(String(d.games || 0));
      const wins = parseInt(String(d.wins || 0));
      const time = parseInt(String(d.time || 0));
      
      return {
        time: Math.floor(time / 60),
        winRate: games > 0 ? parseFloat(((wins / games) * 100).toFixed(1)) : 0,
        games: games
      };
    }).filter(d => d.time > 0);
  }, [data]);

  // Insights Calculations
  const insights = useMemo(() => {
    if (chartData.length === 0) return null;

    const peakPoint = [...chartData].sort((a, b) => b.winRate - a.winRate)[0];
    const criticalPoint = chartData.find((d, i) => i > 0 && d.winRate < 50 && chartData[i-1].winRate >= 50);
    const latestPoint = chartData[chartData.length - 1];
    const earliestPoint = chartData[0];
    
    // Performance drop calculation
    const peakToLateDrop = peakPoint.winRate - latestPoint.winRate;
    
    return {
      peakPoint,
      criticalPoint,
      latestPoint,
      earliestPoint,
      peakToLateDrop,
      isHighImpact: peakToLateDrop > 10
    };
  }, [chartData]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Hero Selector */}
        <div className="glass-card p-4 space-y-2">
          <label className="text-sm font-medium text-gray-400">Select Hero</label>
          <div className="relative">
            <select
              value={selectedHero}
              onChange={(e) => setSelectedHero(parseInt(e.target.value))}
              className="w-full bg-[var(--nav-hover)] border border-[var(--card-border)] rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-gaming-accent/50 appearance-none text-foreground cursor-pointer"
            >
              {heroList.map(hero => (
                <option key={hero.id} value={hero.id} className="bg-[var(--card-bg)] text-foreground">
                  {hero.localized_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Item Selector */}
        <div className="glass-card p-4 space-y-2">
          <label className="text-sm font-medium text-gray-400">Select Item</label>
          <select
            value={selectedItem}
            onChange={(e) => setSelectedItem(e.target.value)}
            className="w-full bg-[var(--nav-hover)] border border-[var(--card-border)] rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-gaming-accent/50 appearance-none text-foreground cursor-pointer"
          >
            {itemList.map(item => (
              <option key={item.id} value={item.name} className="bg-[var(--card-bg)] text-foreground">
                {item.name.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* timing Dashboard */}
      {insights && !loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-4 border-l-4 border-green-500/50 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
              <Target size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Optimal Window</p>
              <p className="text-lg font-black text-white">Before {insights.peakPoint.time}m</p>
            </div>
          </div>

          <div className="glass-card p-4 border-l-4 border-amber-500/50 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Target Time</p>
              <p className="text-lg font-black text-white">{insights.peakPoint.time} - {insights.criticalPoint?.time || insights.latestPoint.time}m</p>
            </div>
          </div>

          <div className="glass-card p-4 border-l-4 border-red-500/50 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
              <AlertTriangle size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Danger Zone</p>
              <p className="text-lg font-black text-white">{insights.criticalPoint?.time || 'N/A'}+ min</p>
            </div>
          </div>

          <div className="glass-card p-4 border-l-4 border-gaming-accent/50 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gaming-accent/10 flex items-center justify-center text-gaming-accent">
              <Zap size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Win Rate Swing</p>
              <p className="text-lg font-black text-white">-{insights.peakToLateDrop.toFixed(0)}%</p>
            </div>
          </div>
        </div>
      )}

      <div className="glass-card p-6 min-h-[450px] flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gaming-accent/10 flex items-center justify-center border border-gaming-accent/20">
              <TrendingUp className="text-gaming-accent w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Global Timing Meta</h3>
              <p className="text-sm text-gray-400">Optimal purchase windows for {HEROES[selectedHero]?.localized_name}</p>
            </div>
          </div>
        </div>

        <div className="w-full h-[350px] relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gaming-accent"></div>
            </div>
          ) : chartData.length > 0 ? (
            <div className="w-full h-full">
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis 
                    dataKey="time" 
                    stroke="#94a3b8" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    label={{ value: 'Minutes', position: 'insideBottom', offset: -10, fill: '#94a3b8', fontSize: 10 }}
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    domain={['auto', 'auto']}
                    tickFormatter={(val) => `${val}%`}
                  />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: '#f8fafc',
                      backdropFilter: 'blur(8px)'
                    }}
                    itemStyle={{ color: 'var(--gaming-accent)' }}
                  />

                  {/* Visual Zones */}
                  {insights?.criticalPoint && (
                    <ReferenceArea 
                      x1={insights.earliestPoint.time} 
                      x2={insights.criticalPoint.time} 
                      fill="rgba(34, 197, 94, 0.05)" 
                    />
                  )}
                  {insights?.criticalPoint && (
                    <ReferenceArea 
                      x1={insights.criticalPoint.time} 
                      x2={insights.latestPoint.time} 
                      fill="rgba(239, 44, 68, 0.05)" 
                    />
                  )}

                  {/* Critical Reference Lines */}
                  <ReferenceLine y={50} stroke="#ef4444" strokeDasharray="3 3" opacity={0.5}>
                    <Label value="50% WIN RATE" position="insideBottomRight" fill="#ef4444" fontSize={10} offset={10} />
                  </ReferenceLine>
                  
                  {insights?.peakPoint && (
                    <ReferenceLine x={insights.peakPoint.time} stroke="#22c55e" strokeDasharray="5 5">
                      <Label value="PEAK SPIKE" position="top" fill="#22c55e" fontSize={10} />
                    </ReferenceLine>
                  )}

                  {insights?.criticalPoint && (
                    <ReferenceLine x={insights.criticalPoint.time} stroke="#ef4444" strokeDasharray="5 5">
                      <Label value="DANGER ZONE" position="top" fill="#ef4444" fontSize={10} />
                    </ReferenceLine>
                  )}

                  <Line
                    type="monotone"
                    dataKey="winRate"
                    stroke="var(--gaming-accent)"
                    strokeWidth={4}
                    dot={{ 
                      r: 4, 
                      fill: '#ffffff', 
                      stroke: 'var(--gaming-accent)', 
                      strokeWidth: 2,
                      fillOpacity: 1
                    }}
                    activeDot={{ 
                      r: 8, 
                      fill: 'var(--gaming-accent)', 
                      stroke: '#ffffff', 
                      strokeWidth: 2 
                    }}
                    name="Win Rate"
                    animationDuration={1000}
                    connectNulls={true}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 space-y-2">
              <Info className="w-8 h-8 opacity-20" />
              <p>No enough data for this combination</p>
            </div>
          )}
        </div>

        {/* Dynamic Recommendations */}
        {insights && !loading && (
          <div className="mt-6 p-4 rounded-xl bg-gaming-accent/5 border border-gaming-accent/10 flex items-start gap-4">
            <div className="mt-1 w-8 h-8 rounded-lg bg-gaming-accent/20 flex items-center justify-center text-gaming-accent flex-shrink-0">
              <Zap size={16} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-white">Strategic Meta Tip</p>
              <p className="text-xs text-gray-400 leading-relaxed">
                For {HEROES[selectedHero]?.localized_name}, {selectedItem.replace(/_/g, ' ')} is most effective when completed by <span className="text-green-500 font-bold">{insights.peakPoint.time} minutes</span>. 
                {insights.criticalPoint 
                  ? ` Delaying it beyond ${insights.criticalPoint.time} minutes pushes your win rate into the "Danger Zone" (below 50%).` 
                  : ` Even late purchases maintain a decent win rate, but earlier is always better for snowballing.`}
                {insights.isHighImpact && ` This item is high-impact; missing your window results in a significant ${insights.peakToLateDrop.toFixed(0)}% win rate penalty.`}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
