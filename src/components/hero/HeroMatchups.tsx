'use client';

import React, { useMemo } from 'react';
import { useHeroMatchups } from '@/hooks/useOpenDota';
import { GlassCard } from '@/components/ui/GlassCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { getHeroImageUrl, HEROES } from '@/services/constants';
import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';
import { Swords, ShieldAlert } from 'lucide-react';

interface MatchupItemProps {
  heroId: number;
  winRate: number;
  isStrong: boolean;
}

function MatchupItem({ heroId, winRate, isStrong }: MatchupItemProps) {
  const hero = HEROES[heroId];
  if (!hero) return null;

  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--nav-hover)] border border-[var(--card-border)] group hover:border-gaming-accent/30 transition-all">
      <div className="flex items-center gap-3">
        <div className="relative">
          <img 
            src={getHeroImageUrl(heroId)} 
            alt={hero.localized_name} 
            className="w-10 h-10 rounded-lg object-cover shadow-lg"
          />
          <div className={cn(
            "absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-[var(--card-bg)] shadow-sm",
            isStrong ? "bg-win" : "bg-loss"
          )} />
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-tight text-foreground group-hover:text-gaming-accent transition-colors">
            {hero.localized_name}
          </p>
          <div className="flex gap-1 mt-0.5">
            {hero.roles.slice(0, 2).map(role => (
              <span key={role} className="text-[8px] font-bold text-gray-500 uppercase tracking-tighter">
                {role}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="text-right">
        <p className={cn(
          "text-sm font-black italic tracking-tighter",
          isStrong ? "text-win" : "text-loss"
        )}>
          {winRate.toFixed(1)}%
        </p>
        <p className="text-[8px] font-bold text-gray-600 uppercase">Win Rate</p>
      </div>
    </div>
  );
}

export function HeroMatchups({ heroId }: { heroId: number }) {
  const { data: matchups = [], isLoading } = useHeroMatchups(heroId);

  const { strongAgainst, weakAgainst } = useMemo(() => {
    // Sort by win rate: higher is better (strong against), lower is worse (weak against)
    const sorted = [...matchups].sort((a, b) => (b.wins / b.games_played) - (a.wins / a.games_played));
    return {
      strongAgainst: sorted.slice(0, 5).map(m => ({ id: m.hero_id, wr: (m.wins / m.games_played) * 100 })),
      weakAgainst: sorted.slice(-5).reverse().map(m => ({ id: m.hero_id, wr: (m.wins / m.games_played) * 100 })),
    };
  }, [matchups]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map(i => (
          <div key={i} className="space-y-4">
            <Skeleton className="w-32 h-6 rounded-lg" />
            {[1, 2, 3, 4, 5].map(j => <Skeleton key={j} className="w-full h-14 rounded-xl" />)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Strong Against */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 rounded-lg bg-win/10 text-win">
            <Swords className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-black uppercase tracking-widest text-win italic">Strong Against</h3>
        </div>
        <div className="space-y-2">
          {strongAgainst.map(item => (
            <MatchupItem key={item.id} heroId={item.id} winRate={item.wr} isStrong={true} />
          ))}
        </div>
      </motion.div>

      {/* Weak Against */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 rounded-lg bg-loss/10 text-loss">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-black uppercase tracking-widest text-loss italic">Weak Against</h3>
        </div>
        <div className="space-y-2">
          {weakAgainst.map(item => (
            <MatchupItem key={item.id} heroId={item.id} winRate={item.wr} isStrong={false} />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
