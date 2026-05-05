'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Trophy, 
  Flame, 
  Star, 
  Ban, 
  Radio, 
  Medal, 
  Search,
  Users,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  LogIn,
  Link as LinkIcon,
  User as UserIcon,
  ArrowRight
} from 'lucide-react';
import { 
  useHeroStats, 
  useProMatches, 
  useLiveGames, 
  useGlobalRecordsMulti, 
  usePlayerProfile 
} from '@/hooks/useOpenDota';
import { useActivityFeed } from '@/hooks/useActivityFeed';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { calculateTierList, getBracketFromRankTier, BRACKET_NAMES } from '@/services/tierList';
import { HeroStatsCard } from '@/components/ui/HeroStatsCard';
import { ProMatchCard } from '@/components/ui/ProMatchCard';
import { LiveGameCard } from '@/components/ui/LiveGameCard';
import { RecordCard } from '@/components/ui/RecordCard';
import { ActivityFeedItem } from '@/components/ui/ActivityFeedItem';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/utils/cn';
import { STEAM_CDN_BASE } from '@/services/constants';

// Minimum picks threshold to avoid heroes with tiny sample sizes
const MIN_PICKS = 5000;

function processHeroStats(heroes: any[]) {
  if (!heroes || heroes.length === 0) return { topWinRate: [], mostPicked: [], proPicks: [], proBans: [] };

  const eligible = heroes.filter(h => h.pub_pick >= MIN_PICKS);

  const withWinRate = eligible.map(h => ({
    id: h.id,
    name: h.localized_name,
    img: h.img,
    winRate: (h.pub_win / h.pub_pick) * 100,
    picks: h.pub_pick,
  }));

  const topWinRate = [...withWinRate]
    .sort((a, b) => b.winRate - a.winRate)
    .slice(0, 10);

  const mostPicked = [...withWinRate]
    .sort((a, b) => b.picks - a.picks)
    .slice(0, 10);

  const proPicks = [...heroes]
    .filter(h => h.pro_pick > 0)
    .sort((a, b) => b.pro_pick - a.pro_pick)
    .slice(0, 10)
    .map(h => ({
      id: h.id,
      name: h.localized_name,
      img: h.img,
      winRate: h.pro_pick > 0 ? (h.pro_win / h.pro_pick) * 100 : 0,
      picks: h.pro_pick,
    }));

  const proBans = [...heroes]
    .filter(h => h.pro_ban > 0)
    .sort((a, b) => b.pro_ban - a.pro_ban)
    .slice(0, 10)
    .map(h => ({
      id: h.id,
      name: h.localized_name,
      img: h.img,
      picks: h.pro_ban,
    }));

  return { topWinRate, mostPicked, proPicks, proBans };
}

function SectionHeader({ icon: Icon, title, description, color }: { icon: any; title: string; description?: string; color: string }) {
  return (
    <div className="mb-6 mt-12 px-2">
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-lg bg-white/5", color)}>
          <Icon className="w-5 h-5" />
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">{title}</h2>
      </div>
      {description && (
        <p className="mt-2 text-gray-500 text-sm font-medium max-w-2xl">{description}</p>
      )}
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const { user, steamAccountId } = useSupabaseAuth();

  // Queries
  const { data: heroesData = [], isLoading: loadingHeroes } = useHeroStats();
  const { data: proMatchesData = [], isLoading: loadingMatches } = useProMatches(10);
  const { data: liveGames = [] } = useLiveGames();
  const { data: multiRecords = {} } = useGlobalRecordsMulti(['gold_per_min', 'kills', 'hero_healing']);
  const { activities, isLoading: loadingActivity } = useActivityFeed();

  const { data: userProfile } = usePlayerProfile(steamAccountId || null);
  const userBracket = useMemo(() => getBracketFromRankTier(userProfile?.rank_tier), [userProfile?.rank_tier]);
  const [selectedBracket, setSelectedBracket] = useState<number | null>(null);
  
  const activeBracket = selectedBracket || userBracket;

  const [searchQuery, setSearchQuery] = useState('');
  const [isBansExpanded, setIsBansExpanded] = useState(false);

  const processedStats = useMemo(() => processHeroStats(heroesData), [heroesData]);
  const { topWinRate, mostPicked, proPicks, proBans } = processedStats;

  const tierList = useMemo(() => {
    if (!heroesData.length) return [];
    return calculateTierList(heroesData, activeBracket);
  }, [heroesData, activeBracket]);

  const topTier = useMemo(() => tierList.slice(0, 15), [tierList]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const records = {
    gpm: multiRecords.gold_per_min?.[0] || null,
    kills: multiRecords.kills?.[0] || null,
    healing: multiRecords.hero_healing?.[0] || null
  };

  return (
    <div className="pb-20">
      {/* Hero Section */}
      <div className="relative mb-12 pt-12 lg:pt-20">
        <div className="max-w-none">
          <h1 className="text-5xl lg:text-8xl font-black text-white mb-6 tracking-tighter uppercase italic">
            Dota <span className="text-gradient">Intelligence.</span>
          </h1>
          <p className="text-gray-400 text-lg lg:text-2xl font-medium leading-relaxed mb-10">
            Real-time hero stats, pro match analytics, and performance insights for the modern Dota 2 player.
          </p>

          <div className="space-y-6">
            <div className="space-y-4">
              {!user ? (
                <Button onClick={() => router.push('/sign-in')} className="w-full h-16 text-xl font-black uppercase italic tracking-wider">
                  <LogIn className="w-6 h-6" />
                  Get Started
                </Button>
              ) : !steamAccountId ? (
                <Button variant="secondary" onClick={() => router.push('/profile')} className="w-full h-16 border-dashed border-amber-500/50 text-amber-500 text-xl font-black uppercase italic tracking-wider">
                  <LinkIcon className="w-6 h-6" />
                  Link Steam Account
                </Button>
              ) : (
                <Button variant="secondary" onClick={() => router.push(`/profile/${steamAccountId}`)} className="w-full h-16 border-dashed border-win/50 text-win text-xl font-black uppercase italic tracking-wider">
                  <UserIcon className="w-6 h-6" />
                  View My Profile
                </Button>
              )}
            </div>

            <form onSubmit={handleSearch} className="relative group">
              <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                <Search className="w-6 h-6 text-gray-500 group-focus-within:text-gaming-accent transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search players, heroes, matches..."
                className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl pl-16 pr-6 text-white text-lg placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gaming-accent/50 focus:bg-white/10 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="absolute right-3 top-3 bottom-3 px-6 bg-gaming-accent text-white rounded-xl font-black uppercase italic tracking-widest opacity-0 group-focus-within:opacity-100 transition-opacity">
                Search
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Friends Activity */}
      {user && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <SectionHeader 
            icon={Users} 
            title="Friends Activity" 
            description="Recent achievements and matches from your network."
            color="text-win" 
          />
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 no-scrollbar">
            {loadingActivity ? (
              [1, 2, 3].map(i => <Skeleton key={i} className="w-[280px] h-24 shrink-0 rounded-2xl" />)
            ) : activities.length > 0 ? (
              activities.map((item) => (
                <ActivityFeedItem 
                  key={item.id}
                  item={item} 
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
      )}

      {/* Meta Tier List */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
        <SectionHeader 
          icon={Star} 
          title="Hero Meta Tier List" 
          description="Calculated based on win rates and pick frequency in your rank."
          color="text-gaming-accent" 
        />
        
        <div className="flex gap-2 overflow-x-auto pb-6 no-scrollbar">
          {Object.entries(BRACKET_NAMES).map(([b, name]) => (
            <button
              key={b}
              onClick={() => setSelectedBracket(Number(b))}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all",
                activeBracket === Number(b) 
                  ? "bg-gaming-accent text-white shadow-lg shadow-gaming-accent/20" 
                  : "bg-white/5 text-gray-500 hover:bg-white/10 hover:text-white"
              )}
            >
              {name}
            </button>
          ))}
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 no-scrollbar">
          {loadingHeroes ? (
            [1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="w-[180px] h-[220px] shrink-0 rounded-2xl" />)
          ) : (
            topTier.map((item) => (
              <div key={item.id} onClick={() => router.push(`/hero/${item.id}`)} className="cursor-pointer">
                <HeroStatsCard
                  heroName={item.name}
                  heroImg={item.img}
                  winRate={item.winRate}
                  pickCount={item.picks}
                  tier={item.tier}
                />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Trends Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
        {/* Highest Win Rate */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          <SectionHeader 
            icon={Trophy} 
            title="Highest Win Rate" 
            description="Heroes with the highest win probability today."
            color="text-amber-500" 
          />
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
            {loadingHeroes ? (
              [1, 2, 3].map(i => <Skeleton key={i} className="w-[180px] h-[220px] shrink-0 rounded-2xl" />)
            ) : (
              topWinRate.map((item, idx) => (
                <div key={item.id} onClick={() => router.push(`/hero/${item.id}`)} className="cursor-pointer">
                  <HeroStatsCard
                    heroName={item.name}
                    heroImg={item.img}
                    winRate={item.winRate}
                    pickCount={item.picks}
                    rank={idx + 1}
                  />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Most Picked */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <SectionHeader 
            icon={Flame} 
            title="Most Picked" 
            description="The most popular heroes in pub matches."
            color="text-loss" 
          />
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
            {loadingHeroes ? (
              [1, 2, 3].map(i => <Skeleton key={i} className="w-[180px] h-[220px] shrink-0 rounded-2xl" />)
            ) : (
              mostPicked.map((item, idx) => (
                <div key={item.id} onClick={() => router.push(`/hero/${item.id}`)} className="cursor-pointer">
                  <HeroStatsCard
                    heroName={item.name}
                    heroImg={item.img}
                    winRate={item.winRate}
                    pickCount={item.picks}
                    rank={idx + 1}
                    mode="picks"
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Pro Scene Header */}
      <SectionHeader 
        icon={Star} 
        title="Pro Scene Hub" 
        description="Follow the latest tournament results and pro meta trends."
        color="text-gaming-accent" 
      />

      {/* Recent Pro Matches */}
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 no-scrollbar">
        {loadingMatches ? (
          [1, 2, 3].map(i => <Skeleton key={i} className="w-[300px] h-48 shrink-0 rounded-2xl" />)
        ) : (
          proMatchesData.map((item) => (
            <div key={item.match_id} onClick={() => router.push(`/match/${item.match_id}`)} className="cursor-pointer">
              <ProMatchCard
                radiantName={item.radiant_name}
                direName={item.dire_name}
                radiantScore={item.radiant_score}
                direScore={item.dire_score}
                radiantWin={item.radiant_win}
                duration={item.duration}
                leagueName={item.league_name}
                startTime={item.start_time}
              />
            </div>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
        {/* Pro Bans List */}
        <div className="lg:col-span-1">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/5 text-loss">
                <Ban className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-black text-white">Top Pro Bans</h3>
            </div>
          </div>
          <div className="space-y-2">
            {(isBansExpanded ? proBans : proBans.slice(0, 5)).map((hero, idx) => (
              <GlassCard 
                key={hero.id} 
                hoverable 
                className="p-3 flex items-center gap-4 cursor-pointer"
                onClick={() => router.push(`/hero/${hero.id}`)}
              >
                <span className="w-6 text-sm font-black text-loss italic">{idx + 1}</span>
                <div className="w-12 h-7 rounded overflow-hidden bg-white/5">
                  <img src={`${STEAM_CDN_BASE}${hero.img}`} alt={hero.name} className="w-full h-full object-cover" />
                </div>
                <span className="flex-1 text-sm font-bold text-white truncate">{hero.name}</span>
                <span className="text-xs font-black text-loss bg-loss/10 px-2 py-1 rounded-lg">
                  {hero.picks}
                </span>
              </GlassCard>
            ))}
            <button 
              onClick={() => setIsBansExpanded(!isBansExpanded)}
              className="w-full py-3 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
            >
              {isBansExpanded ? <><ChevronUp className="inline w-4 h-4 mr-1" /> Show Less</> : <><ChevronDown className="inline w-4 h-4 mr-1" /> Show All Bans</>}
            </button>
          </div>
        </div>

        {/* Live Games & Records */}
        <div className="lg:col-span-2 space-y-8">
           {/* Live Games */}
           {liveGames.length > 0 && (
             <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-white/5 text-loss">
                    <Radio className="w-5 h-5 animate-pulse" />
                  </div>
                  <h3 className="text-xl font-black text-white">Live High-MMR</h3>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                  {liveGames.map((game) => (
                    <LiveGameCard 
                      key={game.match_id} 
                      game={game} 
                      onPress={(id) => router.push(`/match/${id}`)} 
                    />
                  ))}
                </div>
             </div>
           )}

           {/* Global Records */}
           <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-white/5 text-amber-500">
                  <Medal className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black text-white">All-Time Records</h3>
              </div>
              <div className="space-y-4">
                <RecordCard 
                  title="Highest GPM Ever" 
                  field="gold_per_min" 
                  record={records.gpm} 
                  icon="cash" 
                  color="#eab308" 
                  onPress={(id) => router.push(`/match/${id}`)} 
                />
                <RecordCard 
                  title="Most Kills in a Match" 
                  field="kills" 
                  record={records.kills} 
                  icon="skull" 
                  color="#ef4444" 
                  onPress={(id) => router.push(`/match/${id}`)} 
                />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
