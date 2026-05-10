'use client';

import React, { useState, useEffect } from 'react';
import { openDotaApi, ItemTimingScenario } from '@/services/opendota';
import { HEROES, ITEM_IDS, getHeroImageUrl } from '@/services/constants';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { Info, TrendingDown, TrendingUp } from 'lucide-react';
import Image from 'next/image';

export function ItemTimingAnalyzer() {
  const [selectedHero, setSelectedHero] = useState<number>(1); // Anti-Mage
  const [selectedItem, setSelectedItem] = useState<string>('bfury');
  const [data, setData] = useState<ItemTimingScenario[]>([]);
  const [loading, setLoading] = useState(false);

  const heroList = Object.entries(HEROES).map(([id, hero]) => ({
    id: parseInt(id),
    ...hero
  })).sort((a, b) => a.localized_name.localeCompare(b.localized_name));

  const itemList = Object.entries(ITEM_IDS)
    .map(([id, name]) => ({ id: parseInt(id), name }))
    .filter(item => item.name && !item.name.includes('recipe'))
    .sort((a, b) => a.name.localeCompare(b.name));

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

  const chartData = data.map(d => {
    // API might return numbers or strings, be extremely aggressive in parsing
    const games = parseInt(String(d.games || 0));
    const wins = parseInt(String(d.wins || 0));
    const time = parseInt(String(d.time || 0));
    
    return {
      time: Math.floor(time / 60),
      winRate: games > 0 ? parseFloat(((wins / games) * 100).toFixed(1)) : 0,
      games: games
    };
  }).filter(d => d.time > 0); // Only show valid times

  // Find critical drop-off (first time winrate drops below 50% after being above it, or just lowest point)
  const criticalPoint = chartData.find((d, i) => i > 0 && d.winRate < 50 && chartData[i-1].winRate >= 50);

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

      <div className="glass-card p-6 min-h-[400px] flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gaming-accent/10 flex items-center justify-center border border-gaming-accent/20">
              <TrendingUp className="text-gaming-accent w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Win Rate by Purchase Time</h3>
              <p className="text-sm text-gray-400">Global meta analysis for {HEROES[selectedHero]?.localized_name}</p>
            </div>
          </div>
          {criticalPoint && (
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20">
              <TrendingDown className="text-red-500 w-4 h-4" />
              <span className="text-sm font-medium text-red-500 underline decoration-dotted offset-2">
                Critical drop-off: {criticalPoint.time} mins
              </span>
            </div>
          )}
        </div>

        <div className="w-full h-[300px] relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gaming-accent"></div>
            </div>
          ) : chartData.length > 0 ? (
            <div className="w-full h-full">
              <ResponsiveContainer width="100%" height={300} minWidth={1}>
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 10, bottom: 20 }}>
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
                  <ReferenceLine y={50} stroke="#ef4444" strokeDasharray="3 3" label={{ value: '50%', fill: '#ef4444', fontSize: 10, position: 'right' }} />
                  <Line
                    type="monotone"
                    dataKey="winRate"
                    stroke="var(--gaming-accent)"
                    strokeWidth={4}
                    dot={{ 
                      r: 6, 
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
              <p className="text-[10px] opacity-30">Debug: Hero={selectedHero}, Item={selectedItem}, Raw={data.length}</p>
            </div>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 space-y-2">
            <div className="flex items-center gap-2 text-indigo-400">
              <Info className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">How to Read</span>
            </div>
            <ul className="text-xs text-indigo-400/80 space-y-1.5 list-disc list-inside leading-relaxed">
              <li>Each <span className="font-bold text-white">White Dot</span> represents a specific purchase time bucket.</li>
              <li>The <span className="font-bold text-white">Vertical Axis</span> shows the average win rate (%) for players who finished the item at that time.</li>
              <li>A <span className="font-bold text-red-400">Downward Slope</span> indicates that delaying the item significantly reduces your chances of winning.</li>
              <li>The <span className="font-bold text-red-500">Red Dashed Line</span> marks the 50% "coin-flip" win rate threshold.</li>
            </ul>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 space-y-2">
            <div className="flex items-center gap-2 text-amber-500">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Strategic Insight</span>
            </div>
            <p className="text-xs text-amber-500/80 leading-relaxed">
              Win rates typically plummet as key items are delayed beyond their &quot;power spike&quot; window. Use this to set target timings: if your win rate drops below 50% after 16 minutes, you should aim to complete the item before that mark or consider an alternative build.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
