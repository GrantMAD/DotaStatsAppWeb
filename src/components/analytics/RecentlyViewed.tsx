'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Clock, Zap as HeroIcon, Swords, User, Sword, ChevronRight } from '@/components/ui/Icons';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { getRecentlyViewed, RecentlyViewedItem } from '@/services/analytics';
import { getHeroImageUrl } from '@/services/constants';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import dynamic from 'next/dynamic';

const HeroDetailModal = dynamic(() => import('@/components/hero/HeroDetailModal').then(mod => mod.HeroDetailModal), {
  ssr: false
});
const MatchDetailModal = dynamic(() => import('@/components/match/MatchDetailModal').then(mod => mod.MatchDetailModal), {
  ssr: false
});
const PlayerDetailModal = dynamic(() => import('@/components/profile/PlayerDetailModal').then(mod => mod.PlayerDetailModal), {
  ssr: false
});

// Recently Viewed component - updated
export function RecentlyViewed({ compact = false }: { compact?: boolean }) {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'hero' | 'match' | 'player'>('all');
  
  const [selectedHeroId, setSelectedHeroId] = useState<number | null>(null);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  useEffect(() => {
    async function loadHistory() {
      const history = await getRecentlyViewed(10);
      setItems(history);
      setLoading(false);
    }
    loadHistory();
  }, []);

  const filteredItems = useMemo(() => {
    if (filter === 'all') return items;
    return items.filter(item => item.type === filter);
  }, [items, filter]);

  const counts = useMemo(() => ({
    all: items.length,
    hero: items.filter(i => i.type === 'hero').length,
    match: items.filter(i => i.type === 'match').length,
    player: items.filter(i => i.type === 'player').length,
  }), [items]);

  if (!loading && items.length === 0) return null;

  const handlePressItem = (item: RecentlyViewedItem) => {
    if (item.type === 'hero') {
      setSelectedHeroId(Number(item.entityId));
    } else if (item.type === 'match') {
      setSelectedMatchId(String(item.entityId));
    } else if (item.type === 'player') {
      setSelectedPlayerId(String(item.entityId));
    }
  };

  const TabButton = ({ type, label }: { type: 'all' | 'hero' | 'match' | 'player', label: string }) => (
    <button
      onClick={() => setFilter(type)}
      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
        filter === type 
          ? 'bg-gaming-accent text-white' 
          : 'bg-white/5 text-muted-foreground hover:bg-white/10'
      }`}
    >
      {label} ({counts[type]})
    </button>
  );

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="px-4 flex gap-2">
          <TabButton type="all" label="All" />
          <TabButton type="hero" label="Heroes" />
          <TabButton type="match" label="Matches" />
          <TabButton type="player" label="Players" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-4 -mx-4 px-4 no-scrollbar">
          <HeroDetailModal
            isOpen={selectedHeroId !== null}
            onClose={() => setSelectedHeroId(null)}
            heroId={selectedHeroId}
          />
          <MatchDetailModal
            isOpen={selectedMatchId !== null}
            onClose={() => setSelectedMatchId(null)}
            matchId={selectedMatchId ? Number(selectedMatchId) : null}
          />
          <PlayerDetailModal
            isOpen={selectedPlayerId !== null}
            onClose={() => setSelectedPlayerId(null)}
            accountId={selectedPlayerId}
          />
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="min-w-[160px] h-12 bg-foreground/5 rounded-xl animate-pulse" />
            ))
          ) : filteredItems.length === 0 ? (
            <p className="px-4 text-[11px] text-muted-foreground italic">No items found.</p>
          ) : (
            filteredItems.map((item) => {
              const getBorderColor = () => {
                if (item.type === 'hero') return 'border-amber-500/30 hover:border-amber-500/50';
                if (item.type === 'match') return 'border-indigo-500/30 hover:border-indigo-500/50';
                return 'border-emerald-500/30 hover:border-emerald-500/50';
              };

              return (
                <div 
                  key={item.id} 
                  onClick={() => handlePressItem(item)}
                  className="cursor-pointer shrink-0"
                >
                  <GlassCard
                    hoverable
                    className={`w-[180px] p-2 flex items-center gap-2.5 bg-white/5 backdrop-blur-sm border ${getBorderColor()}`}
                  >
                    <div className="relative shrink-0 w-8 h-8 rounded-lg overflow-hidden bg-background/50 border border-white/5 flex items-center justify-center">
                      {item.type === 'hero' ? (
                        <Image
                          src={getHeroImageUrl(Number(item.entityId))}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      ) : item.type === 'match' ? (
                        <Swords className="text-indigo-400 w-3.5 h-3.5" />
                      ) : (
                        <User className="text-emerald-400 w-3.5 h-3.5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-foreground truncate leading-tight">
                        {item.title}
                      </p>
                      <p className="text-[8px] font-medium text-muted-foreground uppercase tracking-wider">
                        {formatDistanceToNow(new Date(item.timestamp), { addSuffix: false })}
                      </p>
                    </div>
                  </GlassCard>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <HeroDetailModal
        isOpen={selectedHeroId !== null}
        onClose={() => setSelectedHeroId(null)}
        heroId={selectedHeroId}
      />
      <MatchDetailModal
        isOpen={selectedMatchId !== null}
        onClose={() => setSelectedMatchId(null)}
        matchId={selectedMatchId ? Number(selectedMatchId) : null}
      />
      <PlayerDetailModal
        isOpen={selectedPlayerId !== null}
        onClose={() => setSelectedPlayerId(null)}
        accountId={selectedPlayerId}
      />

      <SectionHeader
        icon={Clock}
        title="Recently Viewed"
        description="Pick up where you left off."
        color="text-gaming-accent"
      />

      <div className="flex gap-3 overflow-x-auto pb-6 -mx-4 px-4 no-scrollbar">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="min-w-[220px] h-16 bg-foreground/5 rounded-2xl animate-pulse" />
          ))
        ) : (
          items.map((item) => (
            <div 
              key={item.id} 
              onClick={() => handlePressItem(item)}
              className="cursor-pointer shrink-0"
            >
              <GlassCard
                hoverable
                className="w-[240px] p-2.5 flex items-center gap-3 border-(--card-border) bg-[#0f172a]/40 backdrop-blur-md"
              >
                {/* Visual Section */}
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-background/50 border border-white/5 flex items-center justify-center">
                    {item.type === 'hero' ? (
                      <Image
                        src={getHeroImageUrl(Number(item.entityId))}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    ) : item.type === 'match' ? (
                      <Swords className="text-gaming-accent w-5 h-5" />
                    ) : (
                      <User className="text-emerald-500 w-5 h-5" />
                    )}
                  </div>
                  
                  <div className="absolute -bottom-1 -right-1 p-0.5 bg-[#0f172a] rounded-md border border-white/10 shadow-lg">
                    {item.type === 'hero' ? (
                       <HeroIcon className="w-2.5 h-2.5 text-amber-400" />
                    ) : item.type === 'match' ? (
                       <Sword className="w-2.5 h-2.5 text-gaming-accent" />
                    ) : (
                       <User className="w-2.5 h-2.5 text-emerald-400" />
                    )}
                  </div>
                </div>

                {/* Info Section */}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-black text-foreground truncate leading-tight">
                    {item.title}
                  </p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight mt-0.5">
                    {formatDistanceToNow(new Date(item.timestamp), { addSuffix: false })} ago
                  </p>
                </div>

                <ChevronRight className="w-4 h-4 text-white/10" />
              </GlassCard>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
