'use client';

import React, { useState, useMemo } from 'react';
import { 
  PlayerProfile, 
  WinLossStats, 
  RecentMatch, 
  PlayerMatchFilters,
  isProfilePrivate,
  isDataRestricted
} from '@/services/opendota';
import { HEROES, getHeroImageUrl, REGIONS } from '@/services/constants';
import { cn } from '@/utils/cn';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  History, 
  Users, 
  Trophy, 
  Activity, 
  MessageSquare, 
  Globe, 
  Gamepad2, 
  Map as MapIcon,
  Navigation,
  ChevronRight,
  TrendingUp,
  LayoutGrid,
  Filter,
  BarChart2,
  GitCompare,
  EyeOff,
  UserPlus,
  Skull,
  Shield,
  Clock,
  Swords,
  Heart,
  Eye
} from 'lucide-react';
import RankBadge from '../ui/RankBadge';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/Skeleton';
import MatchFilters from './MatchFilters';
import PerformanceTrends from './PerformanceTrends';
import { WordCloud } from './WordCloud';
import MMRHistoryChart from './MMRHistoryChart';
import WardMapHeatmap from './WardMapHeatmap';
import { 
  usePlayerHeroes, 
  usePlayerPeers, 
  usePlayerMatches, 
  useRecentMatches, 
  usePlayerTotals, 
  usePlayerCounts,
  useHeroStats,
  useEncounterHistory,
  usePlayerWardMap,
  usePlayerRatings
} from '@/hooks/useOpenDota';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { formatDistanceToNow, fromUnixTime } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { DataPrivacyIndicator } from '../ui/DataPrivacyIndicator';

type ProfileTab = 'Recent' | 'Heroes' | 'Network' | 'Social' | 'Lifetime';

interface PlayerOverviewContentProps {
  accountId: string;
  profile: PlayerProfile | null;
  wl: WinLossStats | null;
  isCurrentUser?: boolean;
  friendsCount?: number;
  followingCount?: number;
  isPrivate?: boolean;
}

interface CategoryStats {
  label: string;
  win: number;
  lose: number;
  total: number;
}

export function PlayerOverviewContent({
  accountId,
  profile,
  wl,
  isCurrentUser = false,
  friendsCount = 0,
  followingCount = 0,
  isPrivate = false,
}: PlayerOverviewContentProps) {
  const router = useRouter();
  const { steamAccountId: currentUserId } = useSupabaseAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>('Recent');
  const [recentView, setRecentView] = useState<'matches' | 'trends'>('matches');
  const [networkSubTab, setNetworkSubTab] = useState<'Allies' | 'Opponents'>('Allies');
  const [lifetimeSubTab, setLifetimeSubTab] = useState<'Stats' | 'Rank' | 'Vision'>('Stats');
  const [limit, setLimit] = useState(20);
  const [filters, setFilters] = useState<PlayerMatchFilters>({ limit });

  const { data: filteredMatches = [], isLoading: matchesLoading } = usePlayerMatches(accountId, filters);
  const { data: richRecentMatches = [], isLoading: richLoading } = useRecentMatches(accountId, limit);
  const { data: playerHeroes = [], isLoading: heroesLoading } = usePlayerHeroes(accountId);
  const { data: peers = [], isLoading: peersLoading } = usePlayerPeers(accountId);
  const { data: totals = [], isLoading: totalsLoading } = usePlayerTotals(accountId);
  const { data: countsData, isLoading: countsLoading } = usePlayerCounts(accountId);
  const { data: wardMap, isLoading: wardMapLoading } = usePlayerWardMap(accountId);
  const { data: ratings, isLoading: ratingsLoading } = usePlayerRatings(accountId);
  const { data: allHeroStats = [] } = useHeroStats();
  
  const isPrivateAccount = useMemo(() => isProfilePrivate(profile), [profile]);
  const isDataRestrictedAccount = useMemo(() => isDataRestricted(profile, filteredMatches.length), [profile, filteredMatches]);
  
  const peerHistory = useEncounterHistory(currentUserId, accountId);

  // Compute lifetime stats helpers
  const createStatFromCount = (label: string, countObj?: { games: number; win: number }) => ({
    label,
    win: countObj?.win || 0,
    lose: (countObj?.games || 0) - (countObj?.win || 0),
    total: countObj?.games || 0
  });

  const lobbyStats = useMemo(() => [
    createStatFromCount('Normal MM', countsData?.lobby_type?.['0']),
    createStatFromCount('Ranked MM', countsData?.lobby_type?.['7'])
  ], [countsData]);

  const modeStats = useMemo(() => [
    createStatFromCount('All Pick', countsData?.game_mode?.['1']),
    createStatFromCount('Turbo', countsData?.game_mode?.['23'])
  ], [countsData]);

  const sideStats = useMemo(() => [
    createStatFromCount('Radiant', countsData?.is_radiant?.['1']),
    createStatFromCount('Dire', countsData?.is_radiant?.['0'])
  ], [countsData]);

  const regionStats = useMemo(() => {
    if (!countsData?.region) return [];
    return Object.entries(countsData.region)
      .map(([id, data]) => ({
        label: REGIONS[Number(id)] || `Region ${id}`,
        win: data.win,
        lose: data.games - data.win,
        total: data.games
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [countsData]);

  const renderStatSection = (title: string, Icon: any, stats: CategoryStats[]) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl overflow-hidden shadow-xl"
    >
      <div className="flex items-center gap-3 bg-[var(--nav-hover)] p-4 border-b border-[var(--card-border)]">
        <div className="p-2 bg-gaming-accent/20 rounded-xl text-gaming-accent">
          <Icon size={18} />
        </div>
        <h3 className="text-foreground font-black uppercase tracking-widest text-[10px]">{title}</h3>
      </div>
      <div className="p-4 space-y-4">
        {stats.map((stat, i) => (
          <div key={i} className={cn(
            "flex items-center justify-between pb-4 border-b border-[var(--card-border)] last:border-0 last:pb-0",
            stat.total === 0 && "opacity-40 grayscale"
          )}>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black text-foreground truncate">{stat.label}</p>
              <p className="text-[10px] font-bold text-gray-500 uppercase mt-0.5">
                {stat.total} Matches <span className="mx-1 text-foreground/10">•</span> {stat.win}W - {stat.lose}L
              </p>
            </div>
            <div className="text-right">
              <p className={cn(
                "text-lg font-black italic leading-none",
                stat.win / stat.total >= 0.5 ? "text-win" : "text-loss"
              )}>
                {stat.total > 0 ? ((stat.win / stat.total) * 100).toFixed(1) : '0.0'}%
              </p>
              <p className="text-[8px] font-black text-gray-600 uppercase tracking-tighter mt-1">Win Rate</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );

  const trendMatches = (filters.win !== undefined || filters.date !== undefined || filters.game_mode !== undefined)
    ? filteredMatches 
    : richRecentMatches;

  const TABS: { id: ProfileTab; label: string; icon: any }[] = [
    { id: 'Recent', label: 'Recent Activity', icon: History },
    { id: 'Heroes', label: 'Hero Pool', icon: Trophy },
    { id: 'Network', label: 'Network', icon: Users },
    { id: 'Social', label: 'Social', icon: MessageSquare },
    { id: 'Lifetime', label: 'Record Book', icon: Activity },
  ];

  const sortedPeers = useMemo(() => {
    return [...peers]
      .filter(p => networkSubTab === 'Allies' ? p.with_games > 0 : p.against_games > 0)
      .sort((a, b) => networkSubTab === 'Allies' 
        ? b.with_games - a.with_games 
        : b.against_games - a.against_games
      ).slice(0, 50);
  }, [peers, networkSubTab]);

  const duo = useMemo(() => [...peers].sort((a, b) => b.with_games - a.with_games)[0], [peers]);
  const nemesis = useMemo(() => [...peers]
    .filter(p => p.against_games >= 3)
    .sort((a, b) => (a.against_win / a.against_games) - (b.against_win / b.against_games))[0], [peers]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      {/* Premium Header */}
      <GlassCard className="p-8 border-[var(--card-border)] relative overflow-hidden group">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,var(--color-gaming-accent)_0%,transparent_50%)]" />
        
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="relative">
            <div className="w-32 h-32 rounded-full border-4 border-gaming-accent/50 p-1 bg-[var(--nav-hover)] overflow-hidden shadow-2xl">
              {profile?.profile?.avatarfull ? (
                <img src={profile.profile.avatarfull} alt="avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                <div className="w-full h-full rounded-full bg-[var(--nav-hover)] animate-pulse" />
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 scale-125">
              <RankBadge 
                rankTier={profile?.rank_tier || null} 
                leaderboardRank={profile?.leaderboard_rank || null} 
                size={64}
                showText={false}
              />
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl font-black text-foreground mb-2 tracking-tight group-hover:text-gradient transition-all duration-500">
              {profile?.profile?.personaname || 'Loading...'}
            </h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-gray-500 font-bold uppercase text-xs tracking-widest">
              <span className="flex items-center gap-1.5"><Gamepad2 size={14} /> ID: {accountId}</span>
              {profile?.profile?.loccountrycode && (
                <span className="flex items-center gap-1.5">
                  <Globe size={14} /> {profile.profile.loccountrycode}
                </span>
              )}
              {profile?.last_match_time && (
                <span className="text-gaming-accent">
                  Active {formatDistanceToNow(new Date(profile.last_match_time), { addSuffix: true })}
                </span>
              )}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center md:justify-start gap-3">
              {isCurrentUser ? (
                <Link href="/friends" className="bg-[var(--nav-hover)] border border-[var(--card-border)] px-4 py-2 rounded-xl hover:border-gaming-accent transition-colors">
                   <p className="text-xs text-gray-500 font-black uppercase mb-0.5">Friends</p>
                   <p className="text-foreground font-black">{friendsCount}</p>
                </Link>
              ) : (
                <div className="bg-[var(--nav-hover)] border border-[var(--card-border)] px-4 py-2 rounded-xl">
                   <p className="text-xs text-gray-500 font-black uppercase mb-0.5">Friends</p>
                   <p className="text-foreground font-black">{friendsCount}</p>
                </div>
              )}
              {isCurrentUser ? (
                <Link href="/friends" className="bg-[var(--nav-hover)] border border-[var(--card-border)] px-4 py-2 rounded-xl hover:border-gaming-accent transition-colors">
                   <p className="text-xs text-gray-500 font-black uppercase mb-0.5">Following</p>
                   <p className="text-foreground font-black">{followingCount}</p>
                </Link>
              ) : (
                <div className="bg-[var(--nav-hover)] border border-[var(--card-border)] px-4 py-2 rounded-xl">
                   <p className="text-xs text-gray-500 font-black uppercase mb-0.5">Following</p>
                   <p className="text-foreground font-black">{followingCount}</p>
                </div>
              )}
              {!isCurrentUser && (
                <Button size="sm" className="h-10 px-6">
                  <UserPlus size={16} /> Follow
                </Button>
              )}
              <Button 
                variant="secondary" 
                size="sm" 
                className="h-10 px-6 border-[var(--card-border)] text-purple-400"
                onClick={() => router.push(`/compare?p1=${accountId}`)}
              >
                <GitCompare size={16} /> Compare
              </Button>
            </div>
          </div>

          {wl && (
            <div className="flex gap-4 md:flex-col md:items-end lg:flex-row lg:items-center">
              <div className="text-center md:text-right">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Win Rate</p>
                <p className={cn(
                  "text-4xl font-black italic",
                  (wl.win + wl.lose) > 0 && (wl.win / (wl.win + wl.lose)) >= 0.5 ? "text-win" : "text-loss"
                )}>
                  {(wl.win + wl.lose) > 0 ? ((wl.win / (wl.win + wl.lose)) * 100).toFixed(1) : '0.0'}%
                </p>
                <div className="flex gap-2 mt-1 justify-center md:justify-end text-[10px] font-black">
                  <span className="text-win">{wl.win}W</span>
                  <span className="text-foreground/20">/</span>
                  <span className="text-loss">{wl.lose}L</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </GlassCard>

      {!isCurrentUser && peerHistory && (
        <GlassCard className="p-6 border-gaming-accent/20 bg-gaming-accent/5">
           <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-gaming-accent/20 rounded-2xl text-gaming-accent">
                    <History size={24} />
                 </div>
                 <div>
                    <h3 className="text-foreground font-black uppercase tracking-tight">Your History</h3>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Shared Matches: {peerHistory.games}</p>
                 </div>
              </div>

              <div className="flex gap-8">
                 <div className="text-center md:text-left">
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">As Ally</p>
                    <p className="text-foreground font-black">{peerHistory.with_games} Games</p>
                    <p className="text-win text-[10px] font-black">{peerHistory.with_win} Wins</p>
                 </div>
                 <div className="w-px h-full bg-[var(--card-border)] hidden md:block" />
                 <div className="text-center md:text-left">
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">As Opponent</p>
                    <p className="text-foreground font-black">{peerHistory.against_games} Games</p>
                    <p className="text-loss text-[10px] font-black">{peerHistory.against_games - peerHistory.against_win} Losses</p>
                 </div>
                 <div className="w-px h-full bg-[var(--card-border)] hidden md:block" />
                 <div className="text-center md:text-left">
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Last Played</p>
                    <p className="text-foreground font-black text-sm mt-0.5">
                       {peerHistory.last_played ? formatDistanceToNow(fromUnixTime(peerHistory.last_played), { addSuffix: true }) : 'N/A'}
                    </p>
                 </div>
              </div>
           </div>
        </GlassCard>
      )}

      {(isPrivateAccount || isDataRestrictedAccount) && (
        <DataPrivacyIndicator 
          type={isPrivateAccount ? 'profile' : 'matches'} 
          isCurrentUser={isCurrentUser}
        />
      )}

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-[var(--card-bg)] backdrop-blur-xl border border-[var(--card-border)] sticky top-4 z-40 shadow-2xl rounded-2xl">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 min-w-[120px] flex items-center justify-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 font-black uppercase text-[10px] tracking-[0.1em]",
                isActive 
                  ? "bg-gaming-accent text-white shadow-lg shadow-gaming-accent/30 scale-[1.02]" 
                  : "text-gray-500 hover:text-foreground hover:bg-[var(--nav-hover)]"
              )}
            >
              <Icon size={14} className={cn(isActive ? "text-white" : "text-gray-600")} />
              {tab.label}
              {(tab.id !== 'Recent' && (isPrivateAccount || isDataRestrictedAccount)) && (
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in duration-500">
        {activeTab === 'Recent' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex bg-[var(--nav-hover)] p-1 rounded-xl border border-[var(--card-border)]">
                  <button 
                    onClick={() => setRecentView('matches')}
                    className={cn(
                      "px-6 py-2 rounded-lg text-[10px] font-black uppercase transition-all",
                      recentView === 'matches' ? "bg-gaming-accent text-white" : "text-gray-500 hover:text-foreground"
                    )}
                  >
                    History
                  </button>
                  <button 
                    onClick={() => setRecentView('trends')}
                    className={cn(
                      "px-6 py-2 rounded-lg text-[10px] font-black uppercase transition-all",
                      recentView === 'trends' ? "bg-gaming-accent text-white" : "text-gray-500 hover:text-foreground"
                    )}
                  >
                    Analysis
                  </button>
                </div>
              </div>

              {recentView === 'matches' ? (
                <>
                  <MatchFilters filters={filters} onFilterChange={setFilters} />
                  <div className="space-y-3 mt-8">
                    {matchesLoading ? (
                      [1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)
                    ) : filteredMatches.map((match, idx) => {
                      const isRadiant = match.player_slot < 128;
                      const isWin = (isRadiant && match.radiant_win) || (!isRadiant && !match.radiant_win);
                      const hero = HEROES[match.hero_id];
                      return (
                        <Link 
                          key={match.match_id} 
                          href={`/match/${match.match_id}`}
                          className="block group"
                        >
                          <GlassCard 
                            hoverable 
                            className={cn(
                              "p-4 border-l-4 group transition-all duration-300",
                              isWin ? "border-l-win hover:bg-win/5" : "border-l-loss hover:bg-loss/5"
                            )}
                          >
                            <div className="flex items-center gap-6">
                              <div className="w-16 h-10 rounded-lg overflow-hidden border border-[var(--card-border)] shrink-0">
                                 <img src={getHeroImageUrl(match.hero_id)} alt="hero" className="w-full h-full object-cover" />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                 <div className="flex items-center gap-2 mb-0.5">
                                    <span className={cn("text-xs font-black uppercase tracking-widest", isWin ? "text-win" : "text-loss")}>
                                      {isWin ? 'Victory' : 'Defeat'}
                                    </span>
                                    <span className="text-[10px] font-bold text-foreground/20">•</span>
                                    <span className="text-[10px] font-bold text-gray-500">
                                      {formatDistanceToNow(new Date(match.start_time * 1000), { addSuffix: true })}
                                    </span>
                                 </div>
                                 <h4 className="text-foreground font-bold truncate group-hover:text-gaming-accent transition-colors">
                                   {hero?.localized_name || 'Unknown Hero'}
                                 </h4>
                              </div>

                              <div className="text-right shrink-0">
                                 <p className="text-lg font-black text-foreground leading-none">
                                   {match.kills}<span className="text-foreground/20 text-xs mx-1">/</span>
                                   <span className="text-loss">{match.deaths}</span>
                                   <span className="text-foreground/20 text-xs mx-1">/</span>
                                   {match.assists}
                                 </p>
                                 <p className="text-[10px] font-black text-gray-500 uppercase tracking-tighter mt-1">K / D / A</p>
                              </div>

                              <div className="hidden md:flex flex-col items-end shrink-0 w-24">
                                 <p className="text-xs font-black text-foreground uppercase">{Math.floor(match.duration / 60)}:{String(match.duration % 60).padStart(2, '0')}</p>
                                 <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Duration</p>
                              </div>

                              <ChevronRight size={20} className="text-foreground/20 group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                            </div>
                          </GlassCard>
                        </Link>
                      );
                    })}

                    {filteredMatches.length >= limit && (
                       <Button 
                         variant="secondary" 
                         className="w-full mt-4" 
                         onClick={() => {
                           const newLimit = limit + 20;
                           setLimit(newLimit);
                           setFilters(prev => ({ ...prev, limit: newLimit }));
                         }}
                       >
                         Load More Matches
                       </Button>
                    )}
                  </div>
                </>
              ) : (
                <div className="mt-8">
                  <PerformanceTrends 
                    matches={trendMatches} 
                    totals={totals} 
                    rankTier={profile?.rank_tier || null}
                    loading={totalsLoading || richLoading} 
                  />
                </div>
              )}
            </div>

            <div className="space-y-8">
               {/* Quick Stats sidebar? */}
               <GlassCard className="p-6">
                 <h3 className="text-sm font-black text-foreground uppercase tracking-widest mb-6 flex items-center gap-2">
                   <LayoutGrid size={16} className="text-gaming-accent" /> Match Breakdown
                 </h3>
                 <div className="space-y-6">
                    {/* lobby breakdown */}
                    <div>
                       <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Ranked vs. Unranked</span>
                       </div>
                       <div className="h-2 w-full bg-[var(--nav-hover)] rounded-full overflow-hidden flex">
                          <div className="h-full bg-gaming-accent" style={{ width: '60%' }} />
                          <div className="h-full bg-[var(--card-border)]" style={{ width: '40%' }} />
                       </div>
                    </div>
                 </div>
               </GlassCard>
            </div>
          </div>
        )}

        {activeTab === 'Heroes' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-2 px-4">
              <h2 className="text-xl font-black text-foreground uppercase tracking-tight">Most Played Heroes</h2>
              <p className="text-xs font-bold text-gray-500">Showing top 50 by match count</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {heroesLoading ? (
                [1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)
              ) : playerHeroes.sort((a, b) => b.games - a.games).slice(0, 50).map((hero) => {
                const info = HEROES[Number(hero.hero_id)];
                const winRate = hero.games > 0 ? (hero.win / hero.games) * 100 : 0;
                return (
                  <Link key={hero.hero_id} href={`/hero/${hero.hero_id}`} className="block group">
                    <GlassCard hoverable className="p-4 flex flex-col gap-4">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-xl overflow-hidden border border-[var(--card-border)] shrink-0 shadow-lg">
                          <img src={getHeroImageUrl(Number(hero.hero_id))} alt="hero" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-black text-foreground truncate group-hover:text-gaming-accent transition-colors">
                            {info?.localized_name || 'Hero'}
                          </h4>
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{hero.games} Matches</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className={cn(
                            "text-xl font-black leading-none",
                             winRate >= 55 ? "text-win" : winRate < 45 ? "text-loss" : "text-foreground"
                          )}>
                            {hero.games > 0 ? winRate.toFixed(1) : '0.0'}%
                          </p>
                          <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-1">Win Rate</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-2 pt-4 border-t border-[var(--card-border)]">
                         <div className="text-center">
                            <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-0.5">KDA</p>
                            <p className="text-xs font-black text-foreground">{(hero.kda || 0).toFixed(2)}</p>
                         </div>
                         <div className="text-center">
                            <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-0.5">Avg Deaths</p>
                            <p className="text-xs font-black text-loss">{(hero.avg_deaths || 0).toFixed(1)}</p>
                         </div>
                         <div className="text-center">
                            <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-0.5">Avg Assists</p>
                            <p className="text-xs font-black text-foreground">{(hero.avg_assists || 0).toFixed(1)}</p>
                         </div>
                         <div className="text-center">
                            <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-0.5">Last Played</p>
                            <p className="text-xs font-black text-gray-400">
                               {hero.last_played ? formatDistanceToNow(fromUnixTime(hero.last_played), { addSuffix: true }) : 'N/A'}
                            </p>
                         </div>
                      </div>
                    </GlassCard>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'Network' && (
           <div className="space-y-8">
              {/* Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {duo && duo.with_games > 1 && (
                    <GlassCard 
                       hoverable
                       onClick={() => router.push(`/compare?p1=${accountId}&p2=${duo.account_id}`)}
                       className="p-6 border-win/20 bg-win/5 cursor-pointer group/card"
                    >
                       <div className="flex items-center gap-4">
                          <div className="p-3 bg-win/20 rounded-2xl text-win group-hover/card:scale-110 transition-transform">
                             <Heart size={24} />
                          </div>
                          <div className="flex-1 min-w-0">
                             <div className="flex items-center justify-between">
                                <h3 className="text-win font-black uppercase tracking-widest text-[10px] mb-1">Dynamic Duo</h3>
                                <ChevronRight size={14} className="text-win/40 group-hover/card:translate-x-1 transition-transform" />
                             </div>
                             <div className="flex items-center gap-3">
                                <img src={duo.avatar} className="w-10 h-10 rounded-full border border-win/30" alt="duo" />
                                <span className="text-lg font-black text-foreground truncate">{duo.personaname}</span>
                             </div>
                             <p className="text-gray-500 text-[10px] font-bold uppercase mt-1">{duo.with_games} Games Shared</p>
                          </div>
                       </div>
                    </GlassCard>
                 )}
                 {nemesis && nemesis.against_games >= 3 && (
                    <GlassCard 
                       hoverable
                       onClick={() => router.push(`/compare?p1=${accountId}&p2=${nemesis.account_id}`)}
                       className="p-6 border-loss/20 bg-loss/5 cursor-pointer group/card"
                    >
                       <div className="flex items-center gap-4 flex-row-reverse">
                          <div className="p-3 bg-loss/20 rounded-2xl text-loss group-hover/card:scale-110 transition-transform">
                             <Swords size={24} />
                          </div>
                          <div className="flex-1 min-w-0 text-right">
                             <div className="flex items-center justify-between flex-row-reverse">
                                <h3 className="text-loss font-black uppercase tracking-widest text-[10px] mb-1">Nemesis</h3>
                                <ChevronRight size={14} className="text-loss/40 rotate-180 group-hover/card:-translate-x-1 transition-transform" />
                             </div>
                             <div className="flex items-center gap-3 flex-row-reverse">
                                <img src={nemesis.avatar} className="w-10 h-10 rounded-full border border-loss/30" alt="nemesis" />
                                <span className="text-lg font-black text-foreground truncate">{nemesis.personaname}</span>
                             </div>
                             <p className="text-gray-500 text-[10px] font-bold uppercase mt-1">{nemesis.against_games} Rivalries</p>
                          </div>
                       </div>
                    </GlassCard>
                 )}
              </div>

              {/* Network Tabs */}
              <div className="flex bg-[var(--nav-hover)] p-1 rounded-2xl border border-[var(--card-border)] w-fit">
                 {(['Allies', 'Opponents'] as const).map((tab) => (
                    <button
                       key={tab}
                       onClick={() => setNetworkSubTab(tab)}
                       className={cn(
                          "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                          networkSubTab === tab ? "bg-gaming-accent text-white" : "text-gray-500 hover:text-foreground"
                       )}
                    >
                       {tab}
                    </button>
                 ))}
              </div>

              {/* Peers List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {peersLoading ? (
                    [1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)
                 ) : sortedPeers.map((peer) => {
                    const games = networkSubTab === 'Allies' ? peer.with_games : peer.against_games;
                    const wins = networkSubTab === 'Allies' ? peer.with_win : (peer.against_games - peer.against_win);
                    const winRate = (wins / games) * 100;
                    return (
                       <Link key={peer.account_id} href={`/profile/${peer.account_id}`} className="block group">
                          <GlassCard hoverable className="p-4 flex items-center gap-4 transition-all duration-300">
                             <img src={peer.avatarfull || peer.avatar} className="w-12 h-12 rounded-full border border-[var(--card-border)] bg-[var(--nav-hover)] group-hover:border-gaming-accent transition-colors" alt="avatar" />
                             <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-black text-foreground truncate group-hover:text-gaming-accent transition-colors">{peer.personaname}</h4>
                                <p className="text-[10px] font-bold text-gray-500 uppercase mt-0.5">
                                   {games} {networkSubTab === 'Allies' ? 'Matches with' : 'Matches against'}
                                </p>
                             </div>
                             <div className="text-right shrink-0">
                                <p className={cn(
                                   "text-lg font-black leading-none",
                                   winRate >= 50 ? "text-win" : "text-loss"
                                )}>
                                   {winRate.toFixed(0)}%
                                </p>
                                <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mt-1">Win Rate</p>
                             </div>
                          </GlassCard>
                       </Link>
                    );
                 })}
              </div>
           </div>
        )}

        {activeTab === 'Social' && (
           <WordCloud accountId={Number(accountId)} isPrivate={isPrivate} />
        )}

        {activeTab === 'Lifetime' && (
           <div className="space-y-12">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <h2 className="text-3xl font-black text-foreground tracking-tight uppercase">Record Book</h2>
                  <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-1">Deep analysis of your lifetime journey</p>
                </div>

                <div className="flex bg-[var(--nav-hover)] p-1 rounded-2xl border border-[var(--card-border)]">
                  {[
                    { id: 'Stats', label: 'General', icon: BarChart2 },
                    { id: 'Rank', label: 'Rank Progress', icon: TrendingUp },
                    { id: 'Vision', label: 'Vision Map', icon: Eye },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setLifetimeSubTab(tab.id as any)}
                        className={cn(
                          "flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                          lifetimeSubTab === tab.id 
                            ? "bg-gaming-accent text-white shadow-lg shadow-gaming-accent/20" 
                            : "text-gray-500 hover:text-foreground hover:bg-white/5"
                        )}
                      >
                        <Icon size={14} />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {lifetimeSubTab === 'Stats' && (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {totalsLoading ? (
                      [1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-48 w-full rounded-3xl" />)
                    ) : totals.map((total) => (
                      <GlassCard key={total.field} className="p-6 flex flex-col items-center text-center group">
                          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">{total.field.replace(/_/g, ' ')}</p>
                          <h3 className="text-4xl font-black text-foreground mb-2 group-hover:scale-110 transition-transform duration-500">
                            {total.n > 0 ? Math.round(total.sum / total.n).toLocaleString() : '0'}
                          </h3>
                          <p className="text-xs font-bold text-foreground/40 uppercase italic">Lifetime Average</p>
                      </GlassCard>
                    ))}
                  </div>

                  <div className="space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--card-border)] to-transparent" />
                        <h2 className="text-xs font-black text-gray-600 uppercase tracking-[0.4em]">Match Distribution</h2>
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--card-border)] to-transparent" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {countsLoading ? (
                          [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-64 w-full rounded-3xl" />)
                        ) : (
                          <>
                              {renderStatSection('Lobby Type', Globe, lobbyStats)}
                              {renderStatSection('Game Mode', Gamepad2, modeStats)}
                              {renderStatSection('Region', Navigation, regionStats)}
                              {renderStatSection('Side of Map', MapIcon, sideStats)}
                          </>
                        )}
                    </div>
                  </div>
                </div>
              )}

              {lifetimeSubTab === 'Rank' && (
                <MMRHistoryChart ratings={ratings || []} loading={ratingsLoading} />
              )}

              {lifetimeSubTab === 'Vision' && (
                <WardMapHeatmap data={wardMap || null} loading={wardMapLoading} />
              )}
           </div>
        )}
      </div>
    </div>
  );
}
