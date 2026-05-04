'use client';

import React, { useState, useMemo } from 'react';
import { 
  PlayerProfile, 
  WinLossStats, 
  RecentMatch, 
  PlayerMatchFilters
} from '@/services/opendota';
import { HEROES, getHeroImageUrl, REGIONS } from '@/services/constants';
import { cn } from '@/utils/cn';
import { 
  History, 
  Users, 
  Trophy, 
  Activity, 
  MessageSquare, 
  Globe, 
  Gamepad2, 
  Map as MapIcon,
  ChevronRight,
  TrendingUp,
  LayoutGrid,
  Filter,
  BarChart2,
  GitCompare,
  EyeOff,
  UserPlus
} from 'lucide-react';
import RankBadge from '../ui/RankBadge';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/Skeleton';
import MatchFilters from './MatchFilters';
import PerformanceTrends from './PerformanceTrends';
import { WordCloud } from './WordCloud';
import { 
  usePlayerHeroes, 
  usePlayerPeers, 
  usePlayerMatches, 
  useRecentMatches, 
  usePlayerTotals, 
  usePlayerCounts,
  useHeroStats,
  useEncounterHistory
} from '@/hooks/useOpenDota';
import { formatDistanceToNow } from 'date-fns';

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

export function PlayerOverviewContent({
  accountId,
  profile,
  wl,
  isCurrentUser = false,
  friendsCount = 0,
  followingCount = 0,
  isPrivate = false,
}: PlayerOverviewContentProps) {
  const [activeTab, setActiveTab] = useState<ProfileTab>('Recent');
  const [recentView, setRecentView] = useState<'matches' | 'trends'>('matches');
  const [limit, setLimit] = useState(20);
  const [filters, setFilters] = useState<PlayerMatchFilters>({ limit });

  const { data: filteredMatches = [], isLoading: matchesLoading } = usePlayerMatches(accountId, filters);
  const { data: richRecentMatches = [], isLoading: richLoading } = useRecentMatches(accountId, limit);
  const { data: playerHeroes = [], isLoading: heroesLoading } = usePlayerHeroes(accountId);
  const { data: peers = [], isLoading: peersLoading } = usePlayerPeers(accountId);
  const { data: totals = [], isLoading: totalsLoading } = usePlayerTotals(accountId);
  const { data: countsData, isLoading: countsLoading } = usePlayerCounts(accountId);
  const { data: allHeroStats = [] } = useHeroStats();

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

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      {/* Premium Header */}
      <GlassCard className="p-8 border-white/20 relative overflow-hidden group">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,var(--color-gaming-accent)_0%,transparent_50%)]" />
        
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="relative">
            <div className="w-32 h-32 rounded-full border-4 border-gaming-accent/50 p-1 bg-black/40 overflow-hidden shadow-2xl">
              {profile?.profile?.avatarfull ? (
                <img src={profile.profile.avatarfull} alt="avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                <div className="w-full h-full rounded-full bg-zinc-800 animate-pulse" />
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
            <h1 className="text-4xl font-black text-white mb-2 tracking-tight group-hover:text-gradient transition-all duration-500">
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
              <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
                 <p className="text-xs text-gray-500 font-black uppercase mb-0.5">Friends</p>
                 <p className="text-white font-black">{friendsCount}</p>
              </div>
              <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
                 <p className="text-xs text-gray-500 font-black uppercase mb-0.5">Following</p>
                 <p className="text-white font-black">{followingCount}</p>
              </div>
              {!isCurrentUser && (
                <Button size="sm" className="h-10 px-6">
                  <UserPlus size={16} /> Follow
                </Button>
              )}
              <Button variant="secondary" size="sm" className="h-10 px-6 border-purple-500/20 text-purple-400">
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
                  (wl.win / (wl.win + wl.lose)) >= 0.5 ? "text-win" : "text-loss"
                )}>
                  {((wl.win / (wl.win + wl.lose)) * 100).toFixed(1)}%
                </p>
                <div className="flex gap-2 mt-1 justify-center md:justify-end text-[10px] font-black">
                  <span className="text-win">{wl.win}W</span>
                  <span className="text-gray-700">/</span>
                  <span className="text-loss">{wl.lose}L</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </GlassCard>

      {isPrivate && (
        <div className="bg-amber-500/10 border border-amber-500/30 p-6 rounded-3xl flex items-center gap-6 group">
          <div className="p-3 rounded-2xl bg-amber-500 text-black">
            <EyeOff size={24} />
          </div>
          <div>
            <h3 className="text-amber-500 font-black uppercase tracking-widest text-sm mb-1">Private Profile</h3>
            <p className="text-gray-400 font-medium text-sm leading-relaxed">
              This user has not enabled "Expose Public Match Data" in their Dota 2 settings. Statistics may be incomplete or missing.
            </p>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl sticky top-4 z-40 shadow-2xl">
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
                  : "text-gray-500 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon size={14} className={cn(isActive ? "text-white" : "text-gray-600")} />
              {tab.label}
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
                <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
                  <button 
                    onClick={() => setRecentView('matches')}
                    className={cn(
                      "px-6 py-2 rounded-lg text-[10px] font-black uppercase transition-all",
                      recentView === 'matches' ? "bg-gaming-accent text-white" : "text-gray-500 hover:text-white"
                    )}
                  >
                    History
                  </button>
                  <button 
                    onClick={() => setRecentView('trends')}
                    className={cn(
                      "px-6 py-2 rounded-lg text-[10px] font-black uppercase transition-all",
                      recentView === 'trends' ? "bg-gaming-accent text-white" : "text-gray-500 hover:text-white"
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
                        <GlassCard 
                          key={match.match_id} 
                          hoverable 
                          className={cn(
                            "p-4 border-l-4 group transition-all duration-300",
                            isWin ? "border-l-win hover:bg-win/5" : "border-l-loss hover:bg-loss/5"
                          )}
                        >
                          <div className="flex items-center gap-6">
                            <div className="w-16 h-10 rounded-lg overflow-hidden border border-white/10 shrink-0">
                               <img src={getHeroImageUrl(match.hero_id)} alt="hero" className="w-full h-full object-cover" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                               <div className="flex items-center gap-2 mb-0.5">
                                  <span className={cn("text-xs font-black uppercase tracking-widest", isWin ? "text-win" : "text-loss")}>
                                    {isWin ? 'Victory' : 'Defeat'}
                                  </span>
                                  <span className="text-[10px] font-bold text-gray-700">•</span>
                                  <span className="text-[10px] font-bold text-gray-500">
                                    {formatDistanceToNow(new Date(match.start_time * 1000), { addSuffix: true })}
                                  </span>
                               </div>
                               <h4 className="text-white font-bold truncate group-hover:text-gaming-accent transition-colors">
                                 {hero?.localized_name || 'Unknown Hero'}
                               </h4>
                            </div>

                            <div className="text-right shrink-0">
                               <p className="text-lg font-black text-white leading-none">
                                 {match.kills}<span className="text-gray-700 text-xs mx-1">/</span>
                                 <span className="text-loss">{match.deaths}</span>
                                 <span className="text-gray-700 text-xs mx-1">/</span>
                                 {match.assists}
                               </p>
                               <p className="text-[10px] font-black text-gray-500 uppercase tracking-tighter mt-1">K / D / A</p>
                            </div>

                            <div className="hidden md:flex flex-col items-end shrink-0 w-24">
                               <p className="text-xs font-black text-white uppercase">{Math.floor(match.duration / 60)}:{String(match.duration % 60).padStart(2, '0')}</p>
                               <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Duration</p>
                            </div>

                            <ChevronRight size={20} className="text-gray-800 group-hover:text-white transition-colors" />
                          </div>
                        </GlassCard>
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
                  <PerformanceTrends matches={trendMatches} totals={totals} loading={totalsLoading || richLoading} />
                </div>
              )}
            </div>

            <div className="space-y-8">
               {/* Quick Stats sidebar? */}
               <GlassCard className="p-6">
                 <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                   <LayoutGrid size={16} className="text-gaming-accent" /> Match Breakdown
                 </h3>
                 <div className="space-y-6">
                    {/* lobby breakdown */}
                    <div>
                       <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Ranked vs. Unranked</span>
                       </div>
                       <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden flex">
                          <div className="h-full bg-gaming-accent" style={{ width: '60%' }} />
                          <div className="h-full bg-white/10" style={{ width: '40%' }} />
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
              <h2 className="text-xl font-black text-white uppercase tracking-tight">Most Played Heroes</h2>
              <p className="text-xs font-bold text-gray-500">Showing top 50 by match count</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {heroesLoading ? (
                [1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)
              ) : playerHeroes.sort((a, b) => b.games - a.games).slice(0, 50).map((hero) => {
                const info = HEROES[Number(hero.hero_id)];
                const winRate = (hero.win / hero.games) * 100;
                return (
                  <GlassCard key={hero.hero_id} hoverable className="p-4 flex items-center gap-6 group">
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10 shrink-0 shadow-lg">
                      <img src={getHeroImageUrl(Number(hero.hero_id))} alt="hero" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-black text-white truncate group-hover:text-gaming-accent transition-colors">
                        {info?.localized_name || 'Hero'}
                      </h4>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{hero.games} Matches</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={cn(
                        "text-xl font-black leading-none",
                        winRate >= 55 ? "text-win" : winRate < 45 ? "text-loss" : "text-white"
                      )}>
                        {winRate.toFixed(1)}%
                      </p>
                      <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-1">Win Rate</p>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'Social' && (
           <WordCloud accountId={Number(accountId)} />
        )}

        {activeTab === 'Lifetime' && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {totalsLoading ? (
                [1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-48 w-full rounded-3xl" />)
              ) : totals.map((total) => (
                <GlassCard key={total.field} className="p-6 flex flex-col items-center text-center group">
                   <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">{total.field.replace(/_/g, ' ')}</p>
                   <h3 className="text-4xl font-black text-white mb-2 group-hover:scale-110 transition-transform duration-500">
                     {Math.round(total.sum / total.n).toLocaleString()}
                   </h3>
                   <p className="text-xs font-bold text-gray-600 uppercase italic">Lifetime Average</p>
                </GlassCard>
              ))}
           </div>
        )}
      </div>
    </div>
  );
}
