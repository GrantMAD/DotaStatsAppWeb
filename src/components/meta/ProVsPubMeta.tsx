'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { openDotaApi, HeroStats } from '@/services/opendota';
import { getHeroImageUrl } from '@/services/constants';
import { GitCompare, Trophy, Users, Info, TrendingUp, ArrowUpRight } from 'lucide-react';
import { cn } from '@/utils/cn';

interface MetaGapData {
  id: number;
  name: string;
  proContestRate: number; // Pick + Ban rate in Pro
  pubPickRate: number;
  proWinRate: number;
  pubWinRate: number;
  gap: number;
  type: 'pro-favorite' | 'pub-stomper' | 'skill-cap';
}

interface ProVsPubMetaProps {
  onHeroClick?: (id: number) => void;
}

export function ProVsPubMeta({ onHeroClick }: ProVsPubMetaProps) {
  const [stats, setStats] = useState<HeroStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const data = await openDotaApi.getHeroStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching hero stats for pro vs pub:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const analyzedData = useMemo(() => {
    if (stats.length === 0) return { proFavorites: [], pubStompers: [], skillCap: [] };

    // Normalize BOTH metrics as a "share of all picks/contests" on the same 0–100 scale.
    // Each hero's share = (hero appearances / total appearances across all heroes) * 100.
    // This keeps both axes comparable so the gap metric is meaningful.
    const totalPubPicks = stats.reduce((acc, h) => acc + h.pub_pick, 0);
    const totalProContest = stats.reduce((acc, h) => acc + h.pro_pick + h.pro_ban, 0);

    const processed = stats.map(hero => {
      const proContest = hero.pro_pick + hero.pro_ban;
      // Share of all pub picks (avg hero ≈ 0.8% with ~125 heroes)
      const pubPickRate = totalPubPicks > 0 ? (hero.pub_pick / totalPubPicks) * 100 : 0;
      // Share of all pro contest slots — same denominator style
      const proContestRate = totalProContest > 0 ? (proContest / totalProContest) * 100 : 0;
      const proWinRate = hero.pro_pick > 0 ? (hero.pro_win / hero.pro_pick) * 100 : 0;
      const pubWinRate = hero.pub_pick > 0 ? (hero.pub_win / hero.pub_pick) * 100 : 0;

      return {
        id: hero.id,
        name: hero.localized_name,
        proContestRate,
        pubPickRate,
        proWinRate,
        pubWinRate,
        gap: proContestRate - pubPickRate,
        winGap: proWinRate - pubWinRate
      };
    });

    // Thresholds are relative to the normalized share scale (avg ~0.8% per hero)
    return {
      // Heroes that pros contest FAR more than the public picks them
      proFavorites: [...processed]
        .sort((a, b) => b.gap - a.gap)
        .slice(0, 5),
      // High pub win rate but very low pro presence
      pubStompers: [...processed]
        .filter(h => h.pubWinRate > 52 && h.proContestRate < 0.5)
        .sort((a, b) => b.pubWinRate - a.pubWinRate)
        .slice(0, 5),
      // Heroes that pros contest meaningfully AND perform better than in pubs
      skillCap: [...processed]
        .filter(h => h.proContestRate > 0.8)
        .sort((a, b) => b.winGap - a.winGap)
        .slice(0, 5)
    };
  }, [stats]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="glass-card p-6 space-y-4 animate-pulse">
            <div className="h-6 bg-white/5 rounded w-3/4" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(j => (
                <div key={j} className="h-12 bg-white/5 rounded" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Intro Header */}
      <div className="glass-card p-6 border-l-4 border-l-gaming-accent bg-gaming-accent/5">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-xl bg-gaming-accent/20 flex items-center justify-center shrink-0">
            <GitCompare className="text-gaming-accent" size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold uppercase tracking-wider">The Professional Gap</h3>
            <p className="text-sm text-gray-400 max-w-2xl">
              Professional meta often predicts upcoming public trends. We compare each hero's share of pro contest slots (Pick + Ban) 
              vs. their share of public picks, identifying which heroes pros value that pubs undervalue — and vice versa.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pro Favorites */}
        <section className="glass-card overflow-hidden flex flex-col">
          <div className="p-4 border-b border-white/5 bg-white/5 flex items-center gap-2">
            <Trophy className="text-amber-500" size={18} />
            <h4 className="font-bold">Pro Favorites</h4>
            <div className="ml-auto group relative">
              <Info size={14} className="text-gray-500 cursor-help" />
              <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-black/90 text-[10px] rounded border border-white/10 hidden group-hover:block z-20">
                Heroes with high Pro presence but low Public popularity. Usually indicates complex heroes.
              </div>
            </div>
          </div>
          <div className="p-2 space-y-1">
            {analyzedData.proFavorites.map(hero => (
              <div 
                key={hero.id} 
                onClick={() => onHeroClick?.(hero.id)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
              >
                <img src={getHeroImageUrl(hero.id)} className="w-10 h-10 rounded-lg object-cover" alt={hero.name} />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm truncate group-hover:text-gaming-accent transition-colors">{hero.name}</div>
                  <div className="text-[10px] text-gray-400 flex items-center gap-2">
                    <span>Pro share: {hero.proContestRate.toFixed(2)}%</span>
                    <span className="w-1 h-1 rounded-full bg-white/10" />
                    <span>Pub share: {hero.pubPickRate.toFixed(2)}%</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-gaming-accent">+{hero.gap.toFixed(1)}%</div>
                  <div className="text-[9px] text-gray-500 uppercase">Gap</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pub Stompers */}
        <section className="glass-card overflow-hidden flex flex-col">
          <div className="p-4 border-b border-white/5 bg-white/5 flex items-center gap-2">
            <Users className="text-indigo-400" size={18} />
            <h4 className="font-bold">Pub Stompers</h4>
            <div className="ml-auto group relative">
              <Info size={14} className="text-gray-500 cursor-help" />
              <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-black/90 text-[10px] rounded border border-white/10 hidden group-hover:block z-20">
                High win-rate heroes in Pubs that Pros currently ignore. Often heroes that punish lack of coordination.
              </div>
            </div>
          </div>
          <div className="p-2 space-y-1">
            {analyzedData.pubStompers.map(hero => (
              <div 
                key={hero.id} 
                onClick={() => onHeroClick?.(hero.id)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
              >
                <img src={getHeroImageUrl(hero.id)} className="w-10 h-10 rounded-lg object-cover" alt={hero.name} />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm truncate group-hover:text-gaming-accent transition-colors">{hero.name}</div>
                  <div className="text-[10px] text-gray-400 flex items-center gap-2">
                    <span>Win Rate: {hero.pubWinRate.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-emerald-500">IGNR</div>
                  <div className="text-[9px] text-gray-500 uppercase">By Pros</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Skill Cap */}
        <section className="glass-card overflow-hidden flex flex-col">
          <div className="p-4 border-b border-white/5 bg-white/5 flex items-center gap-2">
            <TrendingUp className="text-emerald-400" size={18} />
            <h4 className="font-bold">The Efficiency Gap</h4>
            <div className="ml-auto group relative">
              <Info size={14} className="text-gray-500 cursor-help" />
              <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-black/90 text-[10px] rounded border border-white/10 hidden group-hover:block z-20">
                Heroes that perform significantly better in Pro games than Pub games. Indicates a high "Skill Ceiling".
              </div>
            </div>
          </div>
          <div className="p-2 space-y-1">
            {analyzedData.skillCap.map(hero => (
              <div 
                key={hero.id} 
                onClick={() => onHeroClick?.(hero.id)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
              >
                <img src={getHeroImageUrl(hero.id)} className="w-10 h-10 rounded-lg object-cover" alt={hero.name} />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm truncate group-hover:text-gaming-accent transition-colors">{hero.name}</div>
                  <div className="text-[10px] text-gray-400 flex items-center gap-2">
                    <span>Pro Win: {hero.proWinRate.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <div className="flex items-center gap-1 text-emerald-500">
                    <ArrowUpRight size={12} />
                    <span className="text-xs font-mono font-bold">{Math.abs(hero.winGap).toFixed(1)}%</span>
                  </div>
                  <div className="text-[9px] text-gray-500 uppercase">Advantage</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>


      {/* Footer Insight */}
      <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10">
        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
          <TrendingUp className="text-gray-400" size={16} />
        </div>
        <p className="text-xs text-gray-400 leading-relaxed italic">
          Tip: Heroes in the "Efficiency Gap" list often require high levels of farm priority and team protection. 
          In pubs, they may struggle if the team is not coordinated around them.
        </p>
      </div>
    </div>
  );
}
