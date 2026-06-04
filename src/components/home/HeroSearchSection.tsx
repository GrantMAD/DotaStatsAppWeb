'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, LogIn, Link as LinkIcon, User as UserIcon, Clock } from '@/components/ui/Icons';
import { Button } from '@/components/ui/Button';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { getRecentSearches } from '@/services/analytics';

export function HeroSearchSection() {
  const router = useRouter();
  const { user, steamAccountId } = useSupabaseAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchRecent = async () => {
    const searches = await getRecentSearches(5);
    setRecentSearches(searches);
  };

  const handleSearch = (query: string) => {
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    setIsDropdownVisible(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative z-50 mb-12 ${!user ? 'pt-8 lg:pt-12 border-t border-white/5 mt-8' : 'pt-12 lg:pt-20'}`}>
      <div className="max-w-none">
        {user ? (
          <>
            <h1 className="text-5xl lg:text-8xl font-black text-foreground mb-6 tracking-tighter uppercase italic">
              Dota <span className="text-gradient">Intelligence.</span>
            </h1>
            <p className="text-gray-400 text-lg lg:text-2xl font-medium leading-relaxed mb-10">
              Real-time hero stats, pro match analytics, and performance insights for the modern Dota 2 player.
            </p>
          </>
        ) : (
          <div className="mb-8">
            <h2 className="text-2xl font-black text-foreground mb-2 tracking-tighter uppercase italic">
              Quick <span className="text-gaming-accent">Search.</span>
            </h2>
            <p className="text-gray-500 text-sm font-medium">
              Find any player or hero instantly.
            </p>
          </div>
        )}

        <div className="space-y-6">
          {user && (
            <div className="space-y-4">
              {!steamAccountId ? (
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
          )}

          <div className="relative group z-50" ref={dropdownRef}>
            <form onSubmit={(e) => { e.preventDefault(); handleSearch(searchQuery); }} className="relative">
              <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                <Search className="w-6 h-6 text-gray-500 group-focus-within:text-gaming-accent transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search players, heroes..."
                className="w-full h-16 bg-(--nav-hover) border border-(--card-border) rounded-2xl pl-16 pr-6 text-foreground text-lg placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gaming-accent/50 focus:bg-(--glass-start) transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={async () => {
                  await fetchRecent();
                  setIsDropdownVisible(true);
                }}
              />
              <button type="submit" className="absolute right-3 top-3 bottom-3 px-6 bg-gaming-accent text-white rounded-xl font-black uppercase italic tracking-widest opacity-0 group-focus-within:opacity-100 transition-opacity">
                Search
              </button>
            </form>

            {isDropdownVisible && recentSearches.length > 0 && (
              <div className="absolute z-50 w-full mt-2 bg-[#161625] border border-(--card-border) rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-2 text-xs text-gray-500 uppercase tracking-widest font-bold bg-white/5">Recent Searches</div>
                {recentSearches.map((query, index) => (
                  <button
                    key={index}
                    className="w-full flex items-center gap-3 px-6 py-3 text-left hover:bg-white/5 transition-colors text-foreground"
                    onClick={() => {
                      setSearchQuery(query);
                      handleSearch(query);
                    }}
                  >
                    <Clock className="w-4 h-4 text-gray-500" />
                    {query}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
