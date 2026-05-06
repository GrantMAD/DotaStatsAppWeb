'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Search, X, Users, Globe, ChevronRight, User } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { useSearchPlayers } from '@/hooks/useOpenDota';
import { useFriends } from '@/hooks/useFriends';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/utils/cn';
import { createClient } from '@/utils/supabase/client';

interface PlayerSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (accountId: string) => void;
  title?: string;
}

export function PlayerSelectModal({ isOpen, onClose, onSelect, title = "Select Player" }: PlayerSelectModalProps) {
  const { user } = useSupabaseAuth();
  const [query, setQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'search' | 'friends'>('search');
  const [appUsersMap, setAppUsersMap] = useState<Record<number, string>>({});

  const { data: searchResults = [], isLoading: searching } = useSearchPlayers(activeQuery);
  const { friends, following, loading: loadingFriends } = useFriends();
  const supabase = createClient();

  useEffect(() => {
    async function checkAppUsers() {
      if (!searchResults.length) return;

      const accountIds = searchResults.map(r => r.account_id.toString());
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
  }, [searchResults, supabase]);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setActiveQuery(query);
  };

  const friendsList = useMemo(() => {
    const list: any[] = [];
    
    // Add following
    following.forEach(f => {
      list.push({
        account_id: parseInt(f.followed_steam_id),
        personaname: `Followed Player ${f.followed_steam_id}`, // We might not have name here
        isFollowing: true
      });
    });

    // Add friends
    friends.forEach(f => {
      const friendUser = f.users;
      if (friendUser) {
        list.push({
          account_id: parseInt(friendUser.steam_account_id),
          personaname: friendUser.steam_name || 'Friend',
          isFriend: true
        });
      }
    });

    // Remove duplicates
    const unique = Array.from(new Map(list.map(item => [item.account_id, item])).values());
    
    if (!query) return unique;
    return unique.filter(p => p.personaname.toLowerCase().includes(query.toLowerCase()));
  }, [friends, following, query]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} className="max-w-xl">
      <div className="space-y-6">
        {/* Search Mode Toggle */}
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setSearchMode('search')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-widest transition-all",
              searchMode === 'search' 
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20" 
                : "text-gray-500 hover:text-white"
            )}
          >
            <Globe className="w-4 h-4" />
            Global Search
          </button>
          <button
            onClick={() => setSearchMode('friends')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-widest transition-all",
              searchMode === 'friends' 
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20" 
                : "text-gray-500 hover:text-white"
            )}
          >
            <Users className="w-4 h-4" />
            Friends & Following
          </button>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder={searchMode === 'search' ? "Search by name or Steam ID..." : "Filter friends..."}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (searchMode === 'friends') setActiveQuery(e.target.value);
            }}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 transition-all"
          />
          {searchMode === 'search' && (
            <button 
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-purple-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-purple-500 transition-all"
            >
              Search
            </button>
          )}
        </form>

        {/* Results */}
        <div className="space-y-2 min-h-[300px]">
          {searchMode === 'search' ? (
            searching ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="p-3 flex items-center gap-4 bg-white/5 rounded-xl border border-transparent">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              ))
            ) : searchResults.length > 0 ? (
              searchResults.map((player) => (
                <div 
                  key={player.account_id}
                  onClick={() => onSelect(player.account_id.toString())}
                  className="p-3 flex items-center gap-4 bg-white/5 rounded-xl border border-transparent hover:border-purple-500/50 hover:bg-white/10 transition-all cursor-pointer group"
                >
                  <img 
                    src={player.avatarfull} 
                    alt={player.personaname}
                    className="w-10 h-10 rounded-full border border-white/10"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-bold truncate group-hover:text-purple-400 transition-colors">
                      {player.personaname}
                    </h4>
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">
                      ID: {player.account_id}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-purple-400 transition-all" />
                </div>
              ))
            ) : activeQuery && (
              <div className="flex flex-col items-center justify-center py-10 text-center opacity-40">
                <Search className="w-10 h-10 mb-2" />
                <p className="font-bold">No players found</p>
              </div>
            )
          ) : (
            friendsList.length > 0 ? (
              friendsList.map((player) => (
                <div 
                  key={player.account_id}
                  onClick={() => onSelect(player.account_id.toString())}
                  className="p-3 flex items-center gap-4 bg-white/5 rounded-xl border border-transparent hover:border-purple-500/50 hover:bg-white/10 transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                    <User className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-bold truncate group-hover:text-purple-400 transition-colors">
                      {player.personaname}
                    </h4>
                    <div className="flex items-center gap-2">
                       <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">
                        ID: {player.account_id}
                      </p>
                      {player.isFriend && (
                        <span className="text-[8px] bg-green-500/10 text-green-500 px-1.5 py-0.5 rounded border border-green-500/20 font-black uppercase">Friend</span>
                      )}
                      {player.isFollowing && (
                        <span className="text-[8px] bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded border border-blue-500/20 font-black uppercase">Following</span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-purple-400 transition-all" />
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center opacity-40">
                <Users className="w-10 h-10 mb-2" />
                <p className="font-bold">No friends or followed players yet</p>
              </div>
            )
          )}
          
          {!activeQuery && searchMode === 'search' && (
            <div className="flex flex-col items-center justify-center py-10 text-center opacity-40">
              <Search className="w-10 h-10 mb-2" />
              <p className="font-bold">Type a name to search global archives</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
