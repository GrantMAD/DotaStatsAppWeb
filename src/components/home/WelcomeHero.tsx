'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { LogIn, UserPlus, ArrowRight } from '@/components/ui/Icons';

export function WelcomeHero() {
  const router = useRouter();

  const handleGuestScroll = () => {
    const searchSection = document.getElementById('main-content');
    if (searchSection) {
      searchSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-[70vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden mb-12">
      {/* Immersive Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-win/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gaming-accent/10 blur-[120px] rounded-full animate-pulse delay-700" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-4xl"
      >
        <div className="inline-block px-4 py-1.5 mb-8 bg-gaming-accent/10 border border-gaming-accent/20 rounded-full backdrop-blur-sm">
          <span className="text-[10px] font-black text-gaming-accent uppercase tracking-[0.3em]">
            Precision Analytics. Professional Insights.
          </span>
        </div>

        <h1 className="text-6xl md:text-8xl font-black text-foreground mb-8 tracking-tighter uppercase italic leading-[0.9]">
          Dota <span className="text-gradient">App.</span>
        </h1>
        
        <p className="text-gray-400 text-lg md:text-2xl font-medium leading-relaxed mb-12 max-w-2xl mx-auto">
          Your ultimate companion for Dota 2 stats and pro scene insights. Elevate your game with deep-dive performance tracking.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            onClick={() => router.push('/sign-up')} 
            className="h-14 px-8 text-lg font-black uppercase italic tracking-wider min-w-[200px]"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Create Account
          </Button>

          <Button 
            variant="secondary"
            onClick={() => router.push('/sign-in')} 
            className="h-14 px-8 text-lg font-black uppercase italic tracking-wider min-w-[200px] bg-(--overlay-light) border-(--overlay-border)"
          >
            <LogIn className="w-5 h-5 mr-2" />
            Sign In
          </Button>
        </div>

        <motion.button
          onClick={handleGuestScroll}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 flex items-center gap-2 text-gray-500 hover:text-foreground transition-colors group mx-auto"
        >
          <span className="text-xs font-black uppercase tracking-widest">Explore as Guest</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </motion.div>
    </div>
  );
}
