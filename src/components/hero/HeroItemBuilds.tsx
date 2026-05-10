'use client';

import React, { useMemo } from 'react';
import { useHeroItemPopularity } from '@/hooks/useOpenDota';
import { Skeleton } from '@/components/ui/Skeleton';
import { GlassCard } from '@/components/ui/GlassCard';
import { getItemImageUrl, ITEM_IDS } from '@/services/constants';
import { motion } from 'framer-motion';
import { ShoppingCart, Zap, Sword, Trophy } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ItemIconProps {
  itemId: number;
  count: number;
  total: number;
}

function ItemIcon({ itemId, count, total }: ItemIconProps) {
  const percentage = (count / total) * 100;
  
  return (
    <div className="flex flex-col items-center gap-2 group">
      <div className="relative">
        <div className="w-12 h-9 rounded bg-[var(--nav-hover)] border border-[var(--card-border)] overflow-hidden group-hover:border-gaming-accent transition-colors shadow-lg">
          <img 
            src={getItemImageUrl(itemId)} 
            alt={ITEM_IDS[itemId] || 'item'}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform"
          />
        </div>
        <div className="absolute -bottom-1 -right-1 bg-black/80 px-1 rounded text-[7px] font-black text-white italic border border-white/10">
          {percentage.toFixed(0)}%
        </div>
      </div>
    </div>
  );
}

interface ItemSectionProps {
  title: string;
  items: [string, number][];
  icon: any;
  color: string;
}

function ItemSection({ title, items, icon: Icon, color }: ItemSectionProps) {
  const total = useMemo(() => items.reduce((sum, [_, count]) => sum + count, 0), [items]);
  
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className={cn("p-1.5 rounded-lg bg-opacity-10", color.replace('text-', 'bg-'))}>
          <Icon className={cn("w-3 h-3", color)} />
        </div>
        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 italic">{title}</h4>
      </div>
      <div className="flex flex-wrap gap-3">
        {items.slice(0, 6).map(([id, count]) => (
          <ItemIcon key={id} itemId={Number(id)} count={count} total={total} />
        ))}
      </div>
    </div>
  );
}

export function HeroItemBuilds({ heroId }: { heroId: number }) {
  const { data: popularity, isLoading } = useHeroItemPopularity(heroId);

  const sections = useMemo(() => {
    if (!popularity) return [];
    
    return [
      { 
        title: 'Starting Items', 
        items: Object.entries(popularity.start_game_items).sort((a, b) => b[1] - a[1]),
        icon: ShoppingCart,
        color: 'text-amber-500'
      },
      { 
        title: 'Early Game', 
        items: Object.entries(popularity.early_game_items).sort((a, b) => b[1] - a[1]),
        icon: Zap,
        color: 'text-win'
      },
      { 
        title: 'Mid Game', 
        items: Object.entries(popularity.mid_game_items).sort((a, b) => b[1] - a[1]),
        icon: Sword,
        color: 'text-gaming-accent'
      },
      { 
        title: 'Late Game', 
        items: Object.entries(popularity.late_game_items).sort((a, b) => b[1] - a[1]),
        icon: Trophy,
        color: 'text-purple-500'
      },
    ];
  }, [popularity]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="space-y-3">
            <Skeleton className="w-24 h-4 rounded" />
            <div className="flex gap-2">
              {[1, 2, 3].map(j => <Skeleton key={j} className="w-12 h-9 rounded" />)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!popularity) return null;

  return (
    <GlassCard className="p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
        {sections.map((section, idx) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <ItemSection {...section} />
          </motion.div>
        ))}
      </div>
      <div className="mt-8 p-4 rounded-xl bg-black/20 border border-white/5">
        <p className="text-[8px] font-bold text-gray-500 uppercase tracking-wider italic leading-relaxed">
          Item popularity is based on high-skill pub matches from the current patch. Percentages represent the purchase frequency relative to other items in the same category.
        </p>
      </div>
    </GlassCard>
  );
}
