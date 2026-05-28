'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { useSteamAuth } from '@/hooks/useSteamAuth';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { Link as LinkIcon, LogIn, ChevronRight, Zap, Trophy, BarChart2 } from '@/components/ui/Icons';

export function SteamLinkCTA() {
  const { user, steamAccountId, isLoading } = useSupabaseAuth();
  const { login: signInWithSteam, isLoading: steamLoading } = useSteamAuth();
  const router = useRouter();

  if (isLoading || !user || steamAccountId) return null;

  return (
    <div className="px-4 mb-12 animate-in fade-in slide-in-from-top-4 duration-1000">
      <GlassCard className="relative overflow-hidden group border-amber-500/30 bg-amber-500/5">
        {/* Animated Background Element */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
        
        <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row items-center gap-8">
          <div className="w-20 h-20 bg-amber-500/20 rounded-3xl flex items-center justify-center border border-amber-500/30 shrink-0 shadow-lg shadow-amber-500/10">
            <LinkIcon className="w-10 h-10 text-amber-500" />
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl md:text-3xl font-black text-white mb-2 tracking-tight uppercase italic">
              Unleash Your Stats
            </h3>
            <p className="text-muted-foreground font-medium text-sm md:text-base max-w-xl">
              Connect your Steam account to unlock personal match analytics, hero performance benchmarks, and compare yourself with the pros.
            </p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-6">
               <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-500/80">
                  <BarChart2 className="w-3 h-3" /> Personal Benchmarks
               </div>
               <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-500/80">
                  <Trophy className="w-3 h-3" /> Achievement Tracking
               </div>
               <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-500/80">
                  <Zap className="w-3 h-3" /> Real-time Analytics
               </div>
            </div>
          </div>
          
          <div className="shrink-0 w-full md:w-auto">
            <Button 
              onClick={signInWithSteam}
              disabled={steamLoading}
              className="w-full md:w-auto h-14 px-8 text-lg bg-[#171a21] hover:bg-[#2a475e] border-none shadow-2xl flex items-center justify-center gap-3 group/btn"
            >
              {steamLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-6 h-6 group-hover/btn:scale-110 transition-transform" />
                  Connect Steam
                  <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
            <p className="text-center mt-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest opacity-60">
              Secure OpenID Integration
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
