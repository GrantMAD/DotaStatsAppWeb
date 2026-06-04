'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, ArrowRight, Clock, Zap } from '@/components/ui/Icons';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ActivityFeedItem } from '@/components/ui/ActivityFeedItem';
import { GlassCard } from '@/components/ui/GlassCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { useActivityFeed } from '@/hooks/useActivityFeed';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { Button } from '@/components/ui/Button';
import { RecentlyViewed } from '@/components/analytics/RecentlyViewed';

export function SocialHubSection() {
  const router = useRouter();
  const { user } = useSupabaseAuth();
  const { activities, isLoading } = useActivityFeed();
  const [oneDayAgo] = useState(() => Date.now() / 1000 - 24 * 60 * 60);

  const newHighlightsCount = useMemo(() => {
    return activities.filter(a => a.timestamp > oneDayAgo).length;
  }, [activities, oneDayAgo]);

  if (!user) return null;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-2">
      {/* Unified Hub Header */}
      <div className="flex items-center justify-between pr-4">
        <SectionHeader
          icon={Zap}
          title="Social & Activity Hub"
          description="Your personal history and friend highlights in one place."
          color="text-gaming-accent"
        />
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-gaming-accent hover:text-gaming-accent hover:bg-gaming-accent/10 font-bold uppercase tracking-tighter"
          onClick={() => router.push('/activity')}
        >
          Full Feed
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Friends Activity Row */}
      <div className="space-y-4 pt-2">
        <div className="px-4">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-win" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-win">Friend Highlights</h3>
            </div>
            {newHighlightsCount > 0 && (
              <p className="text-[9px] font-black uppercase tracking-wider text-win bg-win/10 px-2 py-1 rounded border border-win/20">
                {newHighlightsCount} New
              </p>
            )}
          </div>
          <p className="text-[10px] font-medium text-muted-foreground/60 italic">
            See what your network has been up to lately.
          </p>
        </div>

        <div className="relative group/feed">
          <div className="flex gap-4 overflow-x-auto pb-6 -mx-4 px-4 no-scrollbar scroll-smooth">
            {isLoading ? (
              [1, 2, 3].map(i => <Skeleton key={i} className="w-[320px] h-30 shrink-0 rounded-2xl" />)
            ) : activities.length > 0 ? (
              activities.map((item, idx) => (
                <ActivityFeedItem
                  key={item.id}
                  item={item}
                  index={idx}
                  onPressPlayer={(id) => router.push(`/profile/${id}`)}
                  onPressMatch={(id) => router.push(`/match/${id}`)}
                />
              ))
            ) : (
              <GlassCard className="w-full border-dashed flex items-center justify-center py-10 text-gray-500 font-bold italic">
                No recent activity from friends
              </GlassCard>
            )}
          </div>
        </div>
      </div>

      {/* Quick Access Row (Recently Viewed) */}
      <div className="space-y-3">
        <div className="px-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Quick Access</h3>
          </div>
          <p className="text-[10px] font-medium text-muted-foreground/60 italic">
            Jump back into your recent research.
          </p>
        </div>
        <RecentlyViewed compact />
      </div>
    </div>
  );
}
