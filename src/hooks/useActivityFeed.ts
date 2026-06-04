'use client';

import { useQuery } from '@tanstack/react-query';
import { useFriends } from './useFriends';
import { openDotaApi } from '../services/opendota';
import { useMemo, useEffect, useRef } from 'react';
import { useSupabaseAuth } from '../context/SupabaseAuthContext';
import { createClient } from '@/utils/supabase/client';

export interface ActivityItem {
  id: string;
  type: 'win_streak' | 'mvp' | 'rank_up' | 'recent_match' | 'rampage' | 'ultra_kill' | 'triple_kill' | 'aegis_snatch' | 'rapier' | 'godlike' | 'benchmark';
  timestamp: number;
  player: {
    account_id: number;
    name: string;
    avatar: string;
  };
  details: {
    streakCount?: number;
    heroId?: number;
    kda?: string;
    gpm?: number;
    matchId?: number;
    newRank?: number;
    win?: boolean;
    gameMode?: number;
    benchmarkType?: string;
    benchmarkPct?: number;
  };
}

const EMPTY_ARRAY: ActivityItem[] = [];

export const useActivityFeed = () => {
  const { following, friends, loading: friendsLoading } = useFriends();
  const { user } = useSupabaseAuth();
  const userId = user?.id;
  const instanceIdRef = useRef<string | null>(null);

  const playerIds = useMemo(() => {
    if (following.length === 0 && friends.length === 0) return EMPTY_ARRAY;
    const ids = new Set<string>();
    
    following.forEach(f => ids.add(f.followed_steam_id.toString()));
    
    friends.forEach(f => {
      if (f.users?.steam_account_id) {
        ids.add(f.users.steam_account_id.toString());
      }
    });

    return Array.from(ids).slice(0, 15);
  }, [following, friends]);

  const { data: activities = EMPTY_ARRAY, isLoading, refetch } = useQuery({
    queryKey: ['activityFeed', playerIds],
    queryFn: async () => {
      if (playerIds.length === 0) return EMPTY_ARRAY;

      const activityList: ActivityItem[] = [];

      const results = await Promise.allSettled(
        playerIds.map(async (id) => {
          try {
            const [profile, matches] = await Promise.all([
              openDotaApi.getPlayerProfile(id),
              openDotaApi.getRecentMatches(id, 10)
            ]);
            
            // If there's a very recent match (last 24h), fetch its full details for rich highlights
            let latestMatchDetails = null;
            if (matches && matches.length > 0) {
              const latestMatch = matches[0];
              const oneDayAgo = (Date.now() / 1000) - (24 * 60 * 60);
              if (latestMatch.start_time > oneDayAgo) {
                latestMatchDetails = await openDotaApi.getMatchDetails(latestMatch.match_id);
              }
            }

            return { id, profile, matches, latestMatchDetails };
          } catch {
            return { id, profile: null, matches: [], latestMatchDetails: null };
          }
        })
      );

      results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value.profile && result.value.matches) {
          const { profile, matches, latestMatchDetails } = result.value;
          const playerName = profile.profile.personaname;
          const playerAvatar = profile.profile.avatarfull;
          const accountId = profile.profile.account_id;
          const rankTier = profile.rank_tier;

          if (!matches || matches.length === 0) return;

          let playerHasActivity = false;
          const latestMatch = matches[0];

          // 0. Detect Rich Highlights (requires parsed match details)
          if (latestMatchDetails) {
            const p = latestMatchDetails.players.find(p => p.account_id === accountId);
            if (p) {
              // Rampage
              if (p.multi_kills && p.multi_kills["5"]) {
                activityList.push({
                  id: `rampage-${accountId}-${latestMatch.match_id}`,
                  type: 'rampage',
                  timestamp: latestMatch.start_time,
                  player: { account_id: accountId, name: playerName, avatar: playerAvatar },
                  details: { heroId: latestMatch.hero_id, matchId: latestMatch.match_id, gameMode: latestMatch.game_mode }
                });
                playerHasActivity = true;
              }
              // Ultra Kill
              else if (p.multi_kills && p.multi_kills["4"]) {
                activityList.push({
                  id: `ultra-${accountId}-${latestMatch.match_id}`,
                  type: 'ultra_kill',
                  timestamp: latestMatch.start_time,
                  player: { account_id: accountId, name: playerName, avatar: playerAvatar },
                  details: { heroId: latestMatch.hero_id, matchId: latestMatch.match_id, gameMode: latestMatch.game_mode }
                });
                playerHasActivity = true;
              }
              // Aegis Snatch
              if (p.aegis_snatched) {
                activityList.push({
                  id: `aegis-${accountId}-${latestMatch.match_id}`,
                  type: 'aegis_snatch',
                  timestamp: latestMatch.start_time,
                  player: { account_id: accountId, name: playerName, avatar: playerAvatar },
                  details: { heroId: latestMatch.hero_id, matchId: latestMatch.match_id, gameMode: latestMatch.game_mode }
                });
                playerHasActivity = true;
              }
              // Godlike
              if (p.kill_streaks && (p.kill_streaks["9"] || p.kill_streaks["10"])) {
                activityList.push({
                  id: `godlike-${accountId}-${latestMatch.match_id}`,
                  type: 'godlike',
                  timestamp: latestMatch.start_time,
                  player: { account_id: accountId, name: playerName, avatar: playerAvatar },
                  details: { heroId: latestMatch.hero_id, matchId: latestMatch.match_id, gameMode: latestMatch.game_mode }
                });
                playerHasActivity = true;
              }
              // Divine Rapier
              const hasRapier = p.purchase_log?.some(item => item.key === 'rapier') || 
                                [p.item_0, p.item_1, p.item_2, p.item_3, p.item_4, p.item_5].includes(133);
              if (hasRapier) {
                activityList.push({
                  id: `rapier-${accountId}-${latestMatch.match_id}`,
                  type: 'rapier',
                  timestamp: latestMatch.start_time,
                  player: { account_id: accountId, name: playerName, avatar: playerAvatar },
                  details: { heroId: latestMatch.hero_id, matchId: latestMatch.match_id, gameMode: latestMatch.game_mode }
                });
                playerHasActivity = true;
              }
              // Top 1% Benchmark
              if (p.benchmarks) {
                const topMetric = Object.entries(p.benchmarks).find(([, val]) => val.pct >= 0.99);
                if (topMetric) {
                  activityList.push({
                    id: `benchmark-${accountId}-${latestMatch.match_id}`,
                    type: 'benchmark',
                    timestamp: latestMatch.start_time,
                    player: { account_id: accountId, name: playerName, avatar: playerAvatar },
                    details: { 
                      heroId: latestMatch.hero_id, 
                      matchId: latestMatch.match_id, 
                      gameMode: latestMatch.game_mode,
                      benchmarkType: topMetric[0].replace(/_/g, ' '),
                      benchmarkPct: 99
                    }
                  });
                  playerHasActivity = true;
                }
              }
            }
          }

          // 1. Detect Win Streaks
          let currentStreak = 0;
          for (const match of matches) {
            const isWin = (match.player_slot < 128) === match.radiant_win;
            if (isWin) {
              currentStreak++;
            } else {
              break;
            }
          }

          if (currentStreak >= 3) {
            activityList.push({
              id: `streak-${accountId}-${matches[0].match_id}`,
              type: 'win_streak',
              timestamp: matches[0].start_time,
              player: { account_id: accountId, name: playerName, avatar: playerAvatar },
              details: { 
                streakCount: currentStreak,
                matchId: matches[0].match_id,
                heroId: matches[0].hero_id,
                gameMode: matches[0].game_mode
              }
            });
            playerHasActivity = true;
          }

          // 2. Detect MVP Performances
          const kdaValue = (latestMatch.kills + latestMatch.assists) / Math.max(1, latestMatch.deaths);
          const isTurbo = latestMatch.game_mode === 23;
          const kdaThreshold = isTurbo ? 10 : 6;
          const gpmThreshold = isTurbo ? 950 : 650;
          const isHighKda = kdaValue >= kdaThreshold;
          const isHighGpm = latestMatch.gold_per_min >= gpmThreshold;

          if (!playerHasActivity && (isHighKda || isHighGpm)) {
            activityList.push({
              id: `mvp-${accountId}-${latestMatch.match_id}`,
              type: 'mvp',
              timestamp: latestMatch.start_time,
              player: { account_id: accountId, name: playerName, avatar: playerAvatar },
              details: {
                heroId: latestMatch.hero_id,
                kda: kdaValue.toFixed(1),
                gpm: latestMatch.gold_per_min,
                matchId: latestMatch.match_id,
                gameMode: latestMatch.game_mode
              }
            });
            playerHasActivity = true;
          }

          // 3. High Rank Milestone
          if (rankTier && rankTier >= 61) {
             const milestoneId = `rank-${accountId}-${Math.floor(rankTier/10)}`;
             // Only add if not already in list (prevent duplicates for same tier)
             if (!activityList.some(a => a.id === milestoneId)) {
               activityList.push({
                 id: milestoneId,
                 type: 'rank_up',
                 timestamp: profile.last_match_time ? new Date(profile.last_match_time).getTime() / 1000 : latestMatch.start_time,
                 player: { account_id: accountId, name: playerName, avatar: playerAvatar },
                 details: {
                   newRank: rankTier
                 }
               });
               playerHasActivity = true;
             }
          }

          // 4. Fallback: Recent Match
          const oneDayAgoFallback = (Date.now() / 1000) - (24 * 60 * 60);
          if (!playerHasActivity && latestMatch && latestMatch.start_time > oneDayAgoFallback) {
            activityList.push({
              id: `recent-${accountId}-${latestMatch.match_id}`,
              type: 'recent_match',
              timestamp: latestMatch.start_time,
              player: { account_id: accountId, name: playerName, avatar: playerAvatar },
              details: {
                heroId: latestMatch.hero_id,
                matchId: latestMatch.match_id,
                win: (latestMatch.player_slot < 128) === latestMatch.radiant_win,
                gameMode: latestMatch.game_mode
              }
            });
          }
        }
      });

      return activityList.sort((a, b) => b.timestamp - a.timestamp);
    },
    enabled: playerIds.length > 0 && !friendsLoading,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (!userId) return;
    if (!instanceIdRef.current) {
      instanceIdRef.current = Math.random().toString(36).substring(7);
    }

    const supabase = createClient();
    const channelName = `activity_feed_sync_${userId}_${instanceIdRef.current}`;
    const channel = supabase.channel(channelName);
    
    channel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          // New notification might mean a friend's match was parsed or milestone hit
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, refetch]);

  return {
    activities,
    isLoading: isLoading || friendsLoading,
    refetch
  };
};
