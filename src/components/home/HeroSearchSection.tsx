'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, LogIn, Link as LinkIcon, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';

export function HeroSearchSection() {
  const router = useRouter();
  const { user, steamAccountId } = useSupabaseAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <div className="relative mb-12 pt-12 lg:pt-20">
      <div className="max-w-none">
        <h1 className="text-5xl lg:text-8xl font-black text-foreground mb-6 tracking-tighter uppercase italic">
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
              placeholder="Search players, heroes..."
              className="w-full h-16 bg-(--nav-hover) border border-(--card-border) rounded-2xl pl-16 pr-6 text-foreground text-lg placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gaming-accent/50 focus:bg-(--glass-start) transition-all"
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
  );
}
