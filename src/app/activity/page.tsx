'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, Users } from '@/components/ui/Icons';
import { ActivityFeedItem } from '@/components/ui/ActivityFeedItem';
import { GlassCard } from '@/components/ui/GlassCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { useActivityFeed } from '@/hooks/useActivityFeed';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { Button } from '@/components/ui/Button';

export default function ActivityPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useSupabaseAuth();
  const { activities, isLoading } = useActivityFeed();
  const [oneDayAgo] = useState(() => Date.now() / 1000 - 24 * 60 * 60);

  const newHighlightsCount = useMemo(() => {
    return activities.filter(a => a.timestamp > oneDayAgo).length;
  }, [activities, oneDayAgo]);

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gaming-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <GlassCard className="p-10 max-w-md border-white/20">
          <Activity className="w-16 h-16 text-gaming-accent mx-auto mb-6" />
          <h2 className="text-3xl font-black text-white mb-4 tracking-tight uppercase">Activity Feed</h2>
          <p className="text-muted-foreground font-medium mb-8">
            Sign in to follow your friends&apos; achievements, rank ups, and match highlights.
          </p>
          <Button onClick={() => router.push('/sign-in')} className="w-full h-14 text-lg">
            Sign In to View Feed
          </Button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tighter uppercase italic flex items-center gap-4">
            <Activity className="w-12 h-12 text-win shadow-lg shadow-win/20" />
            Social Hub
          </h1>
          <p className="text-muted-foreground font-medium text-lg">
            Stay updated with your network&apos;s latest Dota 2 triumphs.
          </p>
        </div>
        
        {activities.length > 0 && (
          <div className="bg-win/10 border border-win/20 px-6 py-3 rounded-2xl shadow-xl shadow-win/5">
            <p className="text-xs font-black uppercase tracking-widest text-win">
              {newHighlightsCount} New Highlights
            </p>
            <p className="text-[10px] font-bold text-win/60 uppercase mt-0.5">Last 24 Hours</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {isLoading ? (
          [1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="w-full h-32 rounded-3xl" />
          ))
        ) : activities.length > 0 ? (
          activities.map((item, idx) => (
            <ActivityFeedItem
              key={item.id}
              item={item}
              index={idx}
              onPressPlayer={(id) => router.push(`/profile/${id}`)}
              onPressMatch={(id) => router.push(`/match/${id}`)}
              className="w-full"
            />
          ))
        ) : (
          <GlassCard className="p-20 border-dashed flex flex-col items-center justify-center text-center">
            <Users className="w-16 h-16 text-gray-700 mb-6" />
            <h3 className="text-2xl font-bold text-white mb-2">No Activity Yet</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Follow some players to see their matches and achievements here!
            </p>
            <Button 
              variant="secondary" 
              className="mt-8"
              onClick={() => router.push('/search')}
            >
              Search for Players
            </Button>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
