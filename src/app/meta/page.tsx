'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Zap, TrendingUp, Map, LayoutGrid, Award, Users } from 'lucide-react';
import { cn } from '@/utils/cn';

// Dynamic imports for tab components to fix "preloaded but not used" warnings
const ItemTimingAnalyzer = dynamic(() => import('@/components/meta/ItemTimingAnalyzer').then(mod => mod.ItemTimingAnalyzer), {
  loading: () => <div className="h-[400px] animate-pulse bg-white/5 rounded-3xl" />
});

const LaneRoleInsights = dynamic(() => import('@/components/meta/LaneRoleInsights').then(mod => mod.LaneRoleInsights), {
  loading: () => <div className="h-[400px] animate-pulse bg-white/5 rounded-3xl" />
});

const BracketLeaderboards = dynamic(() => import('@/components/meta/BracketLeaderboards').then(mod => mod.BracketLeaderboards), {
  loading: () => <div className="h-[400px] animate-pulse bg-white/5 rounded-3xl" />
});

const CommunityDistribution = dynamic(() => import('@/components/meta/CommunityDistribution').then(mod => mod.CommunityDistribution), {
  loading: () => <div className="h-[400px] animate-pulse bg-white/5 rounded-3xl" />
});

export default function MetaPage() {
  const [activeTab, setActiveTab] = useState<'items' | 'lanes' | 'ranks' | 'community'>('items');

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gaming-accent/20 to-transparent border border-gaming-accent/20 p-8">
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gaming-accent flex items-center justify-center shadow-lg shadow-gaming-accent/40">
              <Zap className="text-white w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Global Meta Insights</h1>
          </div>
          <p className="text-gray-400 max-w-xl">
            Discover powerful trends across millions of matches. Analyze item timings, lane efficiencies, 
            and hero performance to stay ahead of the current game state.
          </p>
        </div>
        
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gaming-accent/10 blur-[100px] -mr-32 -mt-32 rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/5 blur-[80px] -ml-24 -mb-24 rounded-full"></div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-4 bg-black/20 backdrop-blur-xl p-1.5 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar max-w-full w-fit">
        <button
          onClick={() => setActiveTab('items')}
          className={cn(
            "flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shrink-0",
            activeTab === 'items' 
              ? "bg-gaming-accent text-white shadow-lg shadow-gaming-accent/20" 
              : "text-gray-400 hover:text-foreground hover:bg-white/5"
          )}
        >
          <TrendingUp size={18} />
          <span>Item Timings</span>
        </button>
        <button
          onClick={() => setActiveTab('lanes')}
          className={cn(
            "flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shrink-0",
            activeTab === 'lanes' 
              ? "bg-gaming-accent text-white shadow-lg shadow-gaming-accent/20" 
              : "text-gray-400 hover:text-foreground hover:bg-white/5"
          )}
        >
          <Map size={18} />
          <span>Lane Performance</span>
        </button>
        <button
          onClick={() => setActiveTab('ranks')}
          className={cn(
            "flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shrink-0",
            activeTab === 'ranks' 
              ? "bg-gaming-accent text-white shadow-lg shadow-gaming-accent/20" 
              : "text-gray-400 hover:text-foreground hover:bg-white/5"
          )}
        >
          <Award size={18} />
          <span>Rank Performance</span>
        </button>
        <button
          onClick={() => setActiveTab('community')}
          className={cn(
            "flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shrink-0",
            activeTab === 'community' 
              ? "bg-gaming-accent text-white shadow-lg shadow-gaming-accent/20" 
              : "text-gray-400 hover:text-foreground hover:bg-white/5"
          )}
        >
          <Users size={18} />
          <span>Community</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="space-y-8">
        {activeTab === 'items' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="text-gaming-accent w-5 h-5" />
              <h2 className="text-xl font-bold">Item Purchase Scenario Analyzer</h2>
            </div>
            <ItemTimingAnalyzer />
          </div>
        )}
        
        {activeTab === 'lanes' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Map className="text-gaming-accent w-5 h-5" />
              <h2 className="text-xl font-bold">Lane Role Win Rates</h2>
            </div>
            <LaneRoleInsights />
          </div>
        )}

        {activeTab === 'ranks' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Award className="text-gaming-accent w-5 h-5" />
              <h2 className="text-xl font-bold">Bracket Performance Leaderboard</h2>
            </div>
            <BracketLeaderboards />
          </div>
        )}

        {activeTab === 'community' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Users className="text-gaming-accent w-5 h-5" />
              <h2 className="text-xl font-bold">Global Community Distribution</h2>
            </div>
            <CommunityDistribution />
          </div>
        )}
      </div>

      {/* Footer Insight */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
        <div className="glass-card p-6 space-y-3 border-l-4 border-l-gaming-accent">
          <div className="w-10 h-10 rounded-lg bg-gaming-accent/10 flex items-center justify-center text-gaming-accent">
            <TrendingUp size={20} />
          </div>
          <h4 className="font-bold">Real-time Meta</h4>
          <p className="text-xs text-gray-400 leading-relaxed">
            Data is pulled directly from the OpenDota Scenarios API, providing the most up-to-date look at hero power spikes.
          </p>
        </div>
        <div className="glass-card p-6 space-y-3 border-l-4 border-l-amber-500">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Map size={20} />
          </div>
          <h4 className="font-bold">Lane Efficiency</h4>
          <p className="text-xs text-gray-400 leading-relaxed">
            Identify which heroes are currently dominating specific lanes. Useful for picking counters and optimizing team compositions.
          </p>
        </div>
        <div className="glass-card p-6 space-y-3 border-l-4 border-l-indigo-500">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
            <LayoutGrid size={20} />
          </div>
          <h4 className="font-bold">Strategic Edge</h4>
          <p className="text-xs text-gray-400 leading-relaxed">
            Use item timing insights to know exactly when your advantage begins to slip, allowing for better mid-game decision making.
          </p>
        </div>
      </div>
    </div>
  );
}
