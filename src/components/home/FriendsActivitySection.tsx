'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users } from '@/components/ui/Icons';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ActivityFeedItem } from '@/components/ui/ActivityFeedItem';
import { GlassCard } from '@/components/ui/GlassCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { useActivityFeed } from '@/hooks/useActivityFeed';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';

export function FriendsActivitySection() {
  const router = useRouter();
  const { user } = useSupabaseAuth();
  const { activities, isLoading } = useActivityFeed();
  const [oneDayAgo] = useState(() => Date.now() / 1000 - 24 * 60 * 60);

  const newHighlightsCount = useMemo(() => {
    return activities.filter(a => a.timestamp > oneDayAgo).length;
  }, [activities, oneDayAgo]);

  if (!user) return null;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <SectionHeader
        icon={Users}
        title="Friends Activity"
        description="Recent achievements and matches from your network."
        color="text-win"
      />
      <div className="px-4 mb-4">
        <p className="text-xs font-black uppercase tracking-widest text-win bg-win/10 px-3 py-1.5 rounded-lg inline-block border border-win/20 shadow-lg shadow-win/5">
          {newHighlightsCount} New Highlights in the last 24h
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
  );
}
