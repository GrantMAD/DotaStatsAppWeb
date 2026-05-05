'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Globe, Users, X, Info, Gamepad2, ChevronRight, AlertCircle } from 'lucide-react';
import { useSearchPlayers, usePlayerPeers, useHeroStats } from '@/hooks/useOpenDota';
import { useFriends } from '@/hooks/useFriends';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { PlayerListItem } from '@/components/ui/PlayerListItem';
import { Skeleton } from '@/components/ui/Skeleton';
import { getHeroImageUrl } from '@/services/constants';
import { createClient } from '@/utils/supabase/client';
import { cn } from '@/utils/cn';

export default function SearchPage() {
  const { user, steamAccountId } = useSupabaseAuth();
  const [query, setQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'global' | 'steam'>('global');
  const [appUsersMap, setAppUsersMap] = useState<Record<number, string>>({});
  
  const { data: globalResults = [], isLoading: searchingGlobal, error } = useSearchPlayers(activeQuery);
  const { data: peers = [], isLoading: loadingPeers } = usePlayerPeers(searchMode === 'steam' ? steamAccountId : null);
  const { data: heroesData = [] } = useHeroStats();
  const { followUser, unfollowUser, isFollowing, isFriend } = useFriends();

  const supabase = createClient();

  const matchingHeroes = useMemo(() => {
    if (!activeQuery || searchMode === 'steam') return [];
    const qLower = activeQuery.toLowerCase().trim();
    return heroesData.filter(h => h.localized_name.toLowerCase().includes(qLower)).slice(0, 5);
  }, [heroesData, activeQuery, searchMode]);

  const matchingMatchId = useMemo(() => {
    if (!activeQuery || searchMode === 'steam') return null;
    const isMatchId = /^\d+$/.test(activeQuery.trim());
    return isMatchId ? parseInt(activeQuery.trim()) : null;
  }, [activeQuery, searchMode]);

  const steamFriendsResults = useMemo(() => {
    if (searchMode !== 'steam') return [];
    const formatted = peers.map(p => ({
      account_id: p.account_id,
      personaname: p.personaname,
      avatarfull: p.avatar,
    }));
    if (!query) return formatted;
    return formatted.filter(p => p.personaname.toLowerCase().includes(query.toLowerCase()));
  }, [peers, searchMode, query]);

  const results = searchMode === 'global' ? globalResults : steamFriendsResults;
  const searching = searchMode === 'global' ? searchingGlobal : loadingPeers;

  useEffect(() => {
    async function checkAppUsers() {
      const sourceResults = searchMode === 'global' ? globalResults : peers;
      if (!sourceResults.length) return;

      const accountIds = sourceResults.map(r => r.account_id.toString());
      const { data, error } = await supabase
        .from('users')
        .select('id, steam_account_id')
        .in('steam_account_id', accountIds);

      if (data && !error) {
        const map: Record<number, string> = {};
        data.forEach(u => {
          map[Number(u.steam_account_id)] = u.id;
        });
        setAppUsersMap(map);
      }
    }
    checkAppUsers();
  }, [globalResults, peers, searchMode]);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setActiveQuery(query);
  };

  return (
    <div className="container-custom py-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gaming-accent/20 rounded-2xl border border-gaming-accent/50">
            <Search className="w-8 h-8 text-gaming-accent" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white italic uppercase tracking-wider">
              Player <span className="text-gaming-accent">Search</span>
            </h1>
            <p className="text-gray-400">Find players, heroes, or match IDs from the archives</p>
          </div>
        </div>

        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 self-start md:self-end">
          <button
            onClick={() => setSearchMode('global')}
            className={cn(
              "flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold uppercase tracking-widest transition-all",
              searchMode === 'global' 
                ? "bg-gaming-accent text-white shadow-lg shadow-gaming-accent/20" 
                : "text-gray-500 hover:text-white"
            )}
          >
            <Globe className="w-4 h-4" />
            Global
          </button>
          <button
            onClick={() => setSearchMode('steam')}
            className={cn(
              "flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold uppercase tracking-widest transition-all",
              searchMode === 'steam' 
                ? "bg-gaming-accent text-white shadow-lg shadow-gaming-accent/20" 
                : "text-gray-500 hover:text-white"
            )}
          >
            <Users className="w-4 h-4" />
            Steam Friends
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto space-y-8">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder={searchMode === 'global' ? "Search by name or Steam ID..." : "Filter teammates by name..."}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (searchMode === 'steam') setActiveQuery(e.target.value);
            }}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-32 text-white text-lg placeholder:text-gray-600 focus:outline-none focus:border-gaming-accent/50 transition-all shadow-xl"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {query && (
              <button 
                type="button"
                onClick={() => setQuery('')}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            )}
            {searchMode === 'global' && (
              <button 
                type="submit"
                className="bg-gaming-accent text-white px-6 py-2 rounded-xl font-bold hover:bg-gaming-accent-light transition-all shadow-lg shadow-gaming-accent/20"
              >
                Search
              </button>
            )}
          </div>
        </form>

        {searchMode === 'steam' && (
          <div className="bg-blue-600/10 border border-blue-600/20 p-4 rounded-2xl flex items-center gap-4">
            <Info className="w-6 h-6 text-blue-400 shrink-0" />
            <p className="text-blue-200 text-sm font-medium">
              Showing players who have played with you and are registered on the app.
            </p>
          </div>
        )}

        {searching ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="glass-card p-4 h-20 flex items-center gap-4">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Hero Results */}
            {matchingHeroes.length > 0 && searchMode === 'global' && (
              <div>
                <h2 className="text-[10px] font-black text-gaming-accent uppercase tracking-[0.2em] mb-4">Matching Heroes</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {matchingHeroes.map(hero => (
                    <div 
                      key={hero.id}
                      className="glass-card p-3 flex items-center gap-4 hover:border-gaming-accent/50 transition-all cursor-pointer group"
                      onClick={() => console.log('Hero click:', hero.id)}
                    >
                      <img 
                        src={getHeroImageUrl(hero.id)} 
                        alt={hero.localized_name}
                        className="w-12 h-7 object-cover rounded shadow-lg"
                      />
                      <span className="text-white font-bold group-hover:text-gaming-accent transition-colors">
                        {hero.localized_name}
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-700 ml-auto group-hover:text-gaming-accent" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Match ID */}
            {matchingMatchId && searchMode === 'global' && (
              <div>
                <h2 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-4">Match ID</h2>
                <div 
                  className="glass-card p-4 flex items-center gap-4 border-blue-600/30 hover:border-blue-500 transition-all cursor-pointer group"
                  onClick={() => console.log('Match click:', matchingMatchId)}
                >
                  <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center border border-blue-600/30">
                    <Gamepad2 className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">Match {matchingMatchId}</h3>
                    <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest">View Details</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-blue-600 ml-auto group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            )}

            {/* Players */}
            {results.length > 0 && (
              <div>
                <h2 className="text-[10px] font-black text-green-400 uppercase tracking-[0.2em] mb-4">Players</h2>
                <div className="space-y-3">
                  {results.map((player) => (
                    <PlayerListItem 
                      key={player.account_id}
                      player={player}
                      appUserId={appUsersMap[player.account_id]}
                      isFollowing={isFollowing(player.account_id.toString())}
                      isFriend={appUsersMap[player.account_id] ? isFriend(appUsersMap[player.account_id]) : false}
                      isCurrentUser={steamAccountId === player.account_id.toString()}
                      onFollow={() => followUser(player.account_id.toString())}
                      onUnfollow={() => unfollowUser(player.account_id.toString())}
                      onClick={() => console.log('Player click:', player.account_id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {!results.length && !searching && !matchingHeroes.length && !matchingMatchId && (
              <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                  <Search className="w-12 h-12 text-gray-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {searchMode === 'global' ? "Who are you looking for?" : "No Friends Found"}
                </h3>
                <p className="text-gray-500 max-w-xs mx-auto">
                  {searchMode === 'global' 
                    ? "Search for players by name or Steam ID, or look up heroes and matches."
                    : "Link your Steam account to find your frequent teammates here."}
                </p>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-600/10 border border-red-600/20 p-6 rounded-2xl flex flex-col items-center gap-4 text-center">
            <AlertCircle className="w-10 h-10 text-red-500" />
            <div>
              <h3 className="text-red-500 font-bold text-lg">Search Error</h3>
              <p className="text-gray-400 text-sm mt-1">{(error as any).message || 'An error occurred while searching'}</p>
            </div>
            <button 
              onClick={() => handleSearch()}
              className="bg-white/5 hover:bg-white/10 text-white px-6 py-2 rounded-xl text-sm font-bold transition-all"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
