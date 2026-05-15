'use client';

import React from 'react';
import { EyeOff, AlertTriangle, ShieldAlert, ExternalLink, Info } from 'lucide-react';
import { cn } from '@/utils/cn';
import { GlassCard } from './GlassCard';
import { Button } from './Button';

interface DataPrivacyIndicatorProps {
  type: 'profile' | 'matches' | 'mixed';
  isCurrentUser?: boolean;
  className?: string;
  compact?: boolean;
}

export function DataPrivacyIndicator({ 
  type, 
  isCurrentUser = false, 
  className,
  compact = false
}: DataPrivacyIndicatorProps) {
  const isPrivate = type === 'profile';
  const isRestricted = type === 'matches';
  
  const title = isPrivate 
    ? "Steam Profile Private" 
    : isRestricted 
      ? "Match Data Restricted" 
      : "Privacy Restrictions Detected";

  const description = isCurrentUser
    ? isPrivate
      ? "Your Steam profile visibility is not set to Public. To see your full statistics, please update your Steam Profile Privacy Settings."
      : "You haven't enabled 'Expose Public Match Data' in your Dota 2 client settings. This prevents us from fetching your match history."
    : isPrivate
      ? "This user's Steam profile is private. Detailed community data and identity information are unavailable."
      : "This user has disabled 'Expose Public Match Data' in Dota 2. Advanced statistics and recent match history are hidden.";

  if (compact) {
    return (
      <div className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all",
        isPrivate 
          ? "bg-red-500/10 border-red-500/20 text-red-500" 
          : "bg-amber-500/10 border-amber-500/20 text-amber-500",
        className
      )}>
        <EyeOff size={12} />
        {isPrivate ? 'Private' : 'Restricted'}
      </div>
    );
  }

  return (
    <GlassCard className={cn(
      "p-6 relative overflow-hidden group border-l-4",
      isPrivate ? "border-l-red-500 bg-red-500/5" : "border-l-amber-500 bg-amber-500/5",
      className
    )}>
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
        {isPrivate ? <ShieldAlert size={120} /> : <AlertTriangle size={120} />}
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
        <div className={cn(
          "p-4 rounded-2xl shadow-xl",
          isPrivate ? "bg-red-500 text-white" : "bg-amber-500 text-black"
        )}>
          {isPrivate ? <EyeOff size={24} /> : <Info size={24} />}
        </div>

        <div className="flex-1">
          <h3 className={cn(
            "text-sm font-black uppercase tracking-[0.2em] mb-1",
            isPrivate ? "text-red-500" : "text-amber-500"
          )}>
            {title}
          </h3>
          <p className="text-foreground/70 text-sm font-medium leading-relaxed max-w-2xl">
            {description}
          </p>
        </div>

        {isCurrentUser && (
          <div className="shrink-0 w-full md:w-auto mt-4 md:mt-0">
            <Button 
              variant="secondary"
              className={cn(
                "w-full md:w-auto gap-2 border-[var(--card-border)]",
                isPrivate ? "hover:border-red-500/50" : "hover:border-amber-500/50"
              )}
              onClick={() => {
                const url = isPrivate 
                  ? "https://steamcommunity.com/my/edit/settings" 
                  : "https://stratz.com/help/expose-public-match-data"; // Or a local help page
                window.open(url, '_blank');
              }}
            >
              <ExternalLink size={14} />
              How to fix this
            </Button>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
