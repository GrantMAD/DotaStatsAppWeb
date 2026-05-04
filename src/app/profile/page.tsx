'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { Link as LinkIcon, LogIn } from 'lucide-react';
import { useSteamAuth } from '@/hooks/useSteamAuth';

export default function MyProfilePage() {
  const router = useRouter();
  const { user, steamAccountId, isLoading } = useSupabaseAuth();
  const { signInWithSteam } = useSteamAuth();

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
          <p className="text-gray-500 font-medium mb-8">
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
            <h2 className="text-3xl font-black text-white mb-4 tracking-tight uppercase">Link Your Legend</h2>
            <p className="text-gray-400 font-medium mb-10 leading-relaxed">
              Connect your Steam account to unlock advanced performance analytics, hero trends, and compare your stats with friends.
            </p>
            <Button onClick={signInWithSteam} className="w-full h-14 text-lg bg-[#171a21] hover:bg-[#2a475e] border-none shadow-xl">
               {/* Note: I'd use a real Steam icon here, for now using LogIn as placeholder */}
               <LogIn className="w-6 h-6 mr-2" />
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
