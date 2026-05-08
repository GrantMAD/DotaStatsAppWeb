'use client';

import React, { useState } from 'react';
import { Users, UserCheck, UserPlus, Search, X, GitCompare, UserMinus } from 'lucide-react';
import { useFriends } from '@/hooks/useFriends';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { UserListItem } from '@/components/ui/UserListItem';
import { Skeleton } from '@/components/ui/Skeleton';
import Link from 'next/link';
import { cn } from '@/utils/cn';

type TabType = 'Friends' | 'Following';

import { useRouter } from 'next/navigation';

export default function FriendsPage() {
  const router = useRouter();
  const { steamAccountId } = useSupabaseAuth();
  const { friends, following, loading, unfollowUser } = useFriends();
  const [activeTab, setActiveTab] = useState<TabType>('Friends');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFriends = friends.filter(friend => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const name = friend.users?.steam_name?.toLowerCase() || '';
    const id = friend.users?.steam_account_id?.toString() || '';
    return name.includes(q) || id.includes(q);
  });

  const filteredFollowing = following.filter(follow => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const id = follow.followed_steam_id.toString();
    return id.includes(q);
  });

  const handleItemClick = (accountId: string) => {
    router.push(`/profile/${accountId}`);
  };

  return (
    <div className="container-custom py-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gaming-accent/20 rounded-2xl border border-gaming-accent/50">
            <Users className="w-8 h-8 text-gaming-accent" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-foreground italic uppercase tracking-wider">
              Community <span className="text-gaming-accent">Network</span>
            </h1>
            <p className="text-gray-400">Manage your friends and followed players</p>
          </div>
        </div>

        <div className="flex bg-[var(--nav-hover)] p-1 rounded-xl border border-[var(--card-border)] self-start md:self-end">
          <button
            onClick={() => {
              setActiveTab('Friends');
              setSearchQuery('');
            }}
            className={cn(
              "flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold uppercase tracking-widest transition-all",
              activeTab === 'Friends' 
                ? "bg-gaming-accent text-white shadow-lg shadow-gaming-accent/20" 
                : "text-gray-500 hover:text-foreground hover:bg-[var(--glass-start)]"
            )}
          >
            <UserCheck className="w-4 h-4" />
            Friends
          </button>
          <button
            onClick={() => {
              setActiveTab('Following');
              setSearchQuery('');
            }}
            className={cn(
              "flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold uppercase tracking-widest transition-all",
              activeTab === 'Following' 
                ? "bg-gaming-accent text-white shadow-lg shadow-gaming-accent/20" 
                : "text-gray-500 hover:text-foreground hover:bg-[var(--glass-start)]"
            )}
          >
            <UserPlus className="w-4 h-4" />
            Following
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder={activeTab === 'Friends' ? "Search by name or ID..." : "Search by ID..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--nav-hover)] border border-[var(--card-border)] rounded-xl py-3 pl-12 pr-12 text-foreground placeholder:text-gray-600 focus:outline-none focus:border-gaming-accent/50 focus:bg-[var(--card-bg)] transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-[var(--nav-hover)] rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeTab === 'Friends' ? (
              filteredFriends.map((friend, index) => (
                <UserListItem 
                  key={friend.id}
                  user={friend.users}
                  onClick={() => handleItemClick(friend.users.steam_account_id)}
                  rightComponent={
                    steamAccountId && steamAccountId !== friend.users.steam_account_id ? (
                      <Link
                        href={`/compare?p1=${steamAccountId}&p2=${friend.users.steam_account_id}`}
                        className="p-2.5 bg-gaming-accent/10 border border-gaming-accent/20 rounded-xl text-gaming-accent hover:bg-gaming-accent hover:text-white transition-all shadow-lg shadow-gaming-accent/10 hover:shadow-gaming-accent/20 group/compare"
                        title="Compare Stats"
                      >
                        <GitCompare className="w-4 h-4 group-hover/compare:rotate-12 transition-transform" />
                      </Link>
                    ) : undefined
                  }
                />
              ))
            ) : (
              filteredFollowing.map((follow, index) => (
                <UserListItem 
                  key={follow.id}
                  user={{
                    id: follow.id,
                    steam_account_id: follow.followed_steam_id,
                    steam_name: ''
                  }}
                  onClick={() => handleItemClick(follow.followed_steam_id)}
                  rightComponent={
                    <div className="flex items-center gap-2">
                      {steamAccountId && steamAccountId !== follow.followed_steam_id && (
                        <Link
                          href={`/compare?p1=${steamAccountId}&p2=${follow.followed_steam_id}`}
                          className="p-2.5 bg-gaming-accent/10 border border-gaming-accent/20 rounded-xl text-gaming-accent hover:bg-gaming-accent hover:text-white transition-all shadow-lg shadow-gaming-accent/10 hover:shadow-gaming-accent/20 group/compare"
                          title="Compare Stats"
                        >
                          <GitCompare className="w-4 h-4 group-hover/compare:rotate-12 transition-transform" />
                        </Link>
                      )}
                      <button
                        onClick={() => unfollowUser(follow.followed_steam_id)}
                        className="px-3 py-1.5 bg-[var(--nav-hover)] border border-[var(--card-border)] rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-500 transition-all"
                      >
                        Unfollow
                      </button>
                    </div>
                  }
                />
              ))
            )}
          </div>
        )}

        {!loading && (
          (activeTab === 'Friends' && filteredFriends.length === 0) ||
          (activeTab === 'Following' && filteredFollowing.length === 0)
        ) && (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
            <div className="w-24 h-24 bg-[var(--nav-hover)] rounded-full flex items-center justify-center mb-6 border border-[var(--card-border)]">
              <Users className="w-12 h-12 text-gray-500" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">
              {searchQuery 
                ? `No matches found for "${searchQuery}"`
                : (activeTab === 'Friends' 
                    ? "No friends yet" 
                    : "You aren't following anyone yet")}
            </h3>
            <p className="text-gray-500 max-w-xs mx-auto">
              {searchQuery 
                ? "Try searching for a different name or ID."
                : (activeTab === 'Friends' 
                    ? "Search for players and add them as friends to see them here." 
                    : "Follow professional players or friends to track their performance.")}
            </p>
            {!searchQuery && (
              <Link
                href="/search"
                className="mt-6 bg-gaming-accent text-white px-8 py-3 rounded-xl font-bold hover:bg-gaming-accent-light transition-all shadow-lg shadow-gaming-accent/20"
              >
                Find Players
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
