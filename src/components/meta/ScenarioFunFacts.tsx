'use client';

import React, { useState, useEffect } from 'react';
import { openDotaApi, MiscScenario } from '@/services/opendota';
import { 
  Skull, 
  Package, 
  Zap, 
  Castle, 
  TrendingUp, 
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface FunFact {
  id: string;
  title: string;
  description: string;
  scenario: string;
  icon: React.ReactNode;
  color: string;
}

const FUN_FACTS: FunFact[] = [
  {
    id: 'first_blood',
    title: 'First Blood Impact',
    description: 'Teams that secure the first kill often dictate the early game tempo.',
    scenario: 'first_blood',
    icon: <Skull size={24} />,
    color: 'text-red-500'
  },
  {
    id: 'courier_kill',
    title: 'Courier Kill Value',
    description: 'Interrupting enemy logistics by killing their courier has massive hidden value.',
    scenario: 'courier_kill',
    icon: <Package size={24} />,
    color: 'text-amber-500'
  },
  {
    id: 'roshan_kill',
    title: 'The Roshan Factor',
    description: 'Securing the first Roshan kill provides a significant strategic advantage.',
    scenario: 'roshan_kill',
    icon: <Zap size={24} />,
    color: 'text-indigo-500'
  },
  {
    id: 'tower_kill',
    title: 'Early Tower Pressure',
    description: 'Destroying the first tower opens up the map and boosts win probability.',
    scenario: 'tower_kill',
    icon: <Castle size={24} />,
    color: 'text-emerald-500'
  }
];

export function ScenarioFunFacts() {
  const [data, setData] = useState<Record<string, { winRate: number; games: number }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAllScenarios() {
      setLoading(true);
      try {
        const results = await Promise.all(
          FUN_FACTS.map(fact => openDotaApi.getScenariosMisc({ scenario: fact.scenario }))
        );

        const processedData: Record<string, { winRate: number; games: number }> = {};
        
        results.forEach((scenarios, index) => {
          const factId = FUN_FACTS[index].id;
          
          let totalWins = 0;
          let totalGames = 0;
          
          scenarios.forEach(s => {
            // Convert wins and games from string to number before aggregation
            totalWins += Number(s.wins || 0);
            totalGames += Number(s.games || 0);
          });
          
          // Ensure totalGames is treated as a number for comparison
          if (Number(totalGames) > 0) {
            processedData[factId] = {
              winRate: (totalWins / totalGames) * 100,
              games: totalGames
            };
          }
        });

        setData(processedData);
      } catch (error) {
        console.error('Error fetching fun facts:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAllScenarios();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Lightbulb className="text-amber-500" />
            Meta Fun Facts
          </h2>
          <p className="text-gray-400 text-sm">Mathematical impact of early-game events on match outcomes.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
          <TrendingUp size={14} />
          Aggregated from millions of matches
        </div>
      </div>

      {/* Facts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {FUN_FACTS.map((fact) => {
          const stats = data[fact.id];
          const isLoading = loading || !stats;

          return (
            <div 
              key={fact.id}
              className="glass-card group overflow-hidden relative border-l-4"
              style={{ borderLeftColor: stats?.winRate > 50 ? (fact.id === 'first_blood' ? '#ef4444' : fact.id === 'courier_kill' ? '#f59e0b' : fact.id === 'roshan_kill' ? '#6366f1' : '#10b981') : '#666' }}
            >
              <div className="p-6 flex gap-6 relative z-10">
                {/* Icon Column */}
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-300",
                  fact.color.replace('text', 'bg') + '/10',
                  fact.color
                )}>
                  {fact.icon}
                </div>

                {/* Content Column */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg">{fact.title}</h3>
                    {isLoading ? (
                      <div className="h-4 w-12 bg-white/10 animate-pulse rounded" />
                    ) : (
                      <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                        Win Prob. Increase
                      </div>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {fact.description}
                  </p>

                  <div className="pt-4 flex items-end justify-between">
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500 font-medium">Global Win Rate</div>
                      {isLoading ? (
                        <div className="h-8 w-24 bg-white/10 animate-pulse rounded-lg" />
                      ) : (
                        <div className="text-3xl font-black tracking-tight text-foreground">
                          {stats.winRate.toFixed(1)}%
                        </div>
                      )}
                    </div>

                    {!isLoading && (
                      <div className="flex flex-col items-end gap-1">
                        <div className={cn(
                          "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold",
                          stats.winRate > 50 ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                        )}>
                          <TrendingUp size={10} className={stats.winRate < 50 ? "rotate-180" : ""} />
                          +{ (stats.winRate - 50).toFixed(1) }% Edge
                        </div>
                        <div className="text-[10px] text-gray-500">
                          {stats.games.toLocaleString()} games
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Background Glow */}
              <div className={cn(
                "absolute top-0 right-0 w-32 h-32 blur-[60px] -mr-16 -mt-16 rounded-full opacity-20",
                fact.color.replace('text', 'bg')
              )} />
            </div>
          );
        })}
      </div>

      {/* Detailed Insight Box */}
      <div className="glass-card p-6 bg-indigo-500/5 border-indigo-500/10 flex flex-col md:flex-row gap-6 items-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0 border border-indigo-500/20">
          <Zap size={32} />
        </div>
        <div className="space-y-2 flex-1 text-center md:text-left">
          <h4 className="font-bold text-indigo-100 italic">"The Power of Momentum"</h4>
          <p className="text-sm text-indigo-300/80 leading-relaxed">
            These statistics highlight the importance of "Winning the Laning Phase". While a 6-10% advantage might seem small, in a game as complex as Dota 2, it significantly tilts the scales. Teams that focus on these early objectives consistently outperform those who play passively.
          </p>
        </div>
        <div className="shrink-0">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm cursor-pointer hover:underline group">
            Analyze your games
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </div>
  );
}
