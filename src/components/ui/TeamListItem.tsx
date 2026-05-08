'use client';

import React from 'react';
import { Shield } from 'lucide-react';

import { ProTeam } from '@/services/opendota';

interface TeamListItemProps {
  team: ProTeam;
  rank: number;
  onClick: (id: number) => void;
}

export function TeamListItem({ team, rank, onClick }: TeamListItemProps) {
  const winRate = team.wins + team.losses > 0
    ? (team.wins / (team.wins + team.losses) * 100).toFixed(1)
    : '0.0';

  return (
    <div 
      onClick={() => onClick(team.team_id)}
      className="glass-card p-4 flex items-center gap-4 hover:border-gaming-accent/50 transition-all cursor-pointer group"
    >
      <div className="w-8 flex justify-center">
        <span className={cn(
          "font-black text-xl",
          rank <= 3 ? "text-gaming-accent italic" : "text-gray-600"
        )}>
          {rank}
        </span>
      </div>

      <div className="w-14 h-14 bg-[var(--nav-hover)] rounded-xl border border-[var(--card-border)] p-2 flex items-center justify-center overflow-hidden">
        {team.logo_url ? (
          <img 
            src={team.logo_url} 
            alt={team.name}
            className="w-full h-full object-contain"
          />
        ) : (
          <Shield className="w-6 h-6 text-foreground/10" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-foreground font-bold truncate group-hover:text-gaming-accent transition-colors">
            {team.name}
          </h3>
          {team.tag && (
            <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">
              [{team.tag}]
            </span>
          )}
        </div>
        <p className="text-gray-500 text-xs mt-1">
          {winRate}% Win Rate • {team.wins + team.losses} Games
        </p>
      </div>

      <div className="text-right">
        <div className="text-xl font-black text-gaming-accent tracking-tighter italic">
          {Math.round(team.rating)}
        </div>
        <div className="text-[10px] text-gray-600 font-black uppercase tracking-widest leading-none">
          Rating
        </div>
      </div>
    </div>
  );
}

import { cn } from '@/utils/cn';
