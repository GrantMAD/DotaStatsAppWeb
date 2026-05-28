'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { Link as LinkIcon, LogIn, BarChart2, Zap, Trophy, Users } from '@/components/ui/Icons';
import { useSteamAuth } from '@/hooks/useSteamAuth';

export default function MyProfilePage() {
  const router = useRouter();
  const { user, steamAccountId, isLoading } = useSupabaseAuth();
  const { login: signInWithSteam } = useSteamAuth();

  useEffect(() => {
    if (!isLoading && steamAccountId) {
      router.replace(`/profile/${steamAccountId}`);
    }
  }, [steamAccountId, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gaming-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <GlassCard className="p-10 max-w-md border-white/20">
          <LogIn className="w-16 h-16 text-gaming-accent mx-auto mb-6" />
          <h2 className="text-3xl font-black text-white mb-4 tracking-tight uppercase">Authentication Required</h2>
          <p className="text-muted-foreground font-medium mb-8">
            Sign in to access your personalized Dota 2 statistics, match history, and social features.
          </p>
          <Button onClick={() => router.push('/sign-in')} className="w-full h-14 text-lg">
            Sign In Now
          </Button>
        </GlassCard>
      </div>
    );
  }

  if (!steamAccountId) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <GlassCard className="p-10 max-w-lg border-white/20 relative overflow-hidden group">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,var(--color-gaming-accent)_0%,transparent_70%)] group-hover:scale-150 transition-transform duration-1000" />
          
          <div className="relative z-10">
            <div className="w-20 h-20 bg-amber-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-amber-500/30">
               <LinkIcon className="w-10 h-10 text-amber-500" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight uppercase italic">Link Your Legend</h2>
            <p className="text-muted-foreground font-medium mb-10 leading-relaxed max-w-md mx-auto">
              Connect your Steam account to unlock advanced performance analytics, hero trends, and global leaderboards.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-10 text-left max-w-sm mx-auto">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-win/20 flex items-center justify-center border border-win/30">
                     <BarChart2 className="w-4 h-4 text-win" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-win/80">Match Depth</span>
               </div>
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                     <Zap className="w-4 h-4 text-indigo-400" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400/80">Hero Peaks</span>
               </div>
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                     <Trophy className="w-4 h-4 text-amber-500" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-500/80">Pro Tiers</span>
               </div>
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center border border-rose-500/30">
                     <Users className="w-4 h-4 text-rose-500" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-rose-500/80">Social Hub</span>
               </div>
            </div>

            <Button onClick={signInWithSteam} className="w-full h-16 text-lg bg-[#171a21] hover:bg-[#2a475e] border-none shadow-2xl flex items-center justify-center gap-4 group/btn">
               <svg className="w-8 h-8 group-hover/btn:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-4.48 0-8.23 3.03-9.33 7.15l1.98.81c.82-3.08 3.63-5.36 6.96-5.36 3.65 0 6.64 2.72 7.07 6.25l2.1-.2C20.25 4.01 16.54 0 12 0zm0 2.2c3.21 0 5.89 2.19 6.69 5.17l-1.63.16C16.42 5.12 14.41 3.4 12 3.4c-2.82 0-5.18 2.05-5.69 4.77l-1.55-.63C5.39 4.5 8.44 2.2 12 2.2zm-2.3 8.16l2.3 5.4 2.3-5.4h-4.6zm-1.87.67l-2.02-.82c-.33 1.25-.51 2.56-.51 3.91 0 7.82 6.34 14.16 14.16 14.16 1.35 0 2.66-.18 3.91-.51l-.82-2.02c-1.02.24-2.08.37-3.09.37-6.63 0-12-5.37-12-12 0-1.01.13-2.07.37-3.09z"/>
               </svg>
               Connect via Steam
            </Button>
            <p className="mt-6 text-[10px] font-black text-gray-600 uppercase tracking-widest">
               Secure integration via Steam OpenID
            </p>
          </div>
        </GlassCard>
      </div>
    );
  }

  return null; // Redirecting...
}
