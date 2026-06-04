'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, Search, TrendingUp } from '@/components/ui/Icons';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { GlassCard } from '@/components/ui/GlassCard';
import { HeroStats } from '@/types';
import { STEAM_CDN_BASE } from '@/services/constants';
import { getCommunityTrending } from '@/services/analytics';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { HeroTrendsSkeleton } from '../ui/HomeSkeletons';

const HeroDetailModal = dynamic(() => import('@/components/hero/HeroDetailModal').then(mod => mod.HeroDetailModal), {
  ssr: false
});

interface CommunityTrendsSectionProps {
  initialHeroesData: HeroStats[];
}

export function CommunityTrendsSection({ initialHeroesData }: CommunityTrendsSectionProps) {
  const router = useRouter();
  const [selectedHeroId, setSelectedHeroId] = useState<number | null>(null);
  const [trendingData, setTrendingData] = useState<{
    heroes: Array<{ id: number, name: string, count: number }>,
    searches: string[]
  }>({ heroes: [], searches: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTrending() {
      const data = await getCommunityTrending();
      setTrendingData(data);
      setIsLoading(false);
    }
    fetchTrending();
  }, []);

  const handleSearchClick = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const getHeroInfo = (heroId: number) => {
    return initialHeroesData.find(h => h.id === heroId);
  };

  if (!isLoading && trendingData.heroes.length === 0 && trendingData.searches.length === 0) {
    return null; // Don't show if no data
  }

  return (
    <div className="space-y-8 mt-12 animate-in fade-in duration-700">
      <HeroDetailModal
        isOpen={selectedHeroId !== null}
        onClose={() => setSelectedHeroId(null)}
        heroId={selectedHeroId}
      />

      <SectionHeader
        icon={Zap}
        title="Community Trending"
        description="What's hot right now in the DotaApp community (Last 48h)."
        color="text-gaming-accent"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Trending Heroes */}
        <div className="lg:col-span-2">
          <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Most Viewed Heroes
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 no-scrollbar">
            {isLoading ? (
              <HeroTrendsSkeleton />
            ) : (
              trendingData.heroes.map((item, idx) => {
                const heroInfo = getHeroInfo(item.id);
                if (!heroInfo) return null;

                return (
                  <div key={item.id} onClick={() => setSelectedHeroId(item.id)} className="cursor-pointer group">
                    <GlassCard
                      hoverable
                      className="w-40 p-3 flex flex-col gap-2 items-center relative overflow-hidden"
                    >
                      <div className="absolute top-2 right-2 bg-gaming-accent/20 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-black text-gaming-accent z-10 border border-gaming-accent/30">
                        {item.count} views
                      </div>
                      
                      <div className="relative w-full aspect-4/3 rounded overflow-hidden border border-white/5">
                        <Image
                          src={`${STEAM_CDN_BASE}${heroInfo.img}`}
                          alt={heroInfo.localized_name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute top-1 left-1 bg-black/60 px-1.5 py-0.5 rounded text-[10px] font-black text-white">
                          #{idx + 1}
                        </div>
                      </div>
                      <span className="text-xs font-bold text-foreground truncate w-full text-center group-hover:text-gaming-accent transition-colors">
                        {heroInfo.localized_name}
                      </span>
                    </GlassCard>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Trending Searches */}
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
            <Search className="w-4 h-4" />
            Popular Searches
          </h3>
          <div className="flex flex-wrap gap-2">
            {isLoading ? (
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-8 w-24 bg-white/5 rounded-full animate-pulse" />
                ))}
              </div>
            ) : (
              trendingData.searches.map((query, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSearchClick(query)}
                  className="px-4 py-2 bg-(--nav-hover) hover:bg-gaming-accent/20 border border-(--card-border) hover:border-gaming-accent/50 rounded-full text-sm font-bold text-gray-400 hover:text-gaming-accent transition-all flex items-center gap-2"
                >
                  <Search className="w-3 h-3 opacity-50" />
                  {query}
                </button>
              ))
            )}
          </div>
          
          <p className="mt-4 text-[10px] text-gray-600 font-bold uppercase tracking-widest leading-tight">
            Based on real-time activity from users across the globe.
          </p>
        </div>
      </div>
    </div>
  );
}
