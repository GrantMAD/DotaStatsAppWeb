'use client';

import React from 'react';
import { User } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ProPlayer {
  account_id: number;
  steamid: string;
  avatar: string;
  avatarmedium: string;
  avatarfull: string;
  personaname: string;
  last_match_time: string;
  full_name: string;
  name: string;
  country_code: string;
  team_id: number;
  team_name: string;
  team_tag: string;
  is_locked: boolean;
  is_pro: boolean;
  locked_until: number;
}

interface ProPlayerItemProps {
  player: ProPlayer;
  onClick: (id: number) => void;
}

export function ProPlayerItem({ player, onClick }: ProPlayerItemProps) {
  const getFlagEmoji = (countryCode: string) => {
    if (!countryCode || countryCode.length !== 2) return null;
    return countryCode
      .toUpperCase()
      .split('')
      .map(char => String.fromCodePoint(char.charCodeAt(0) + 127397))
      .join('');
  };

  return (
    <div 
      onClick={() => onClick(player.account_id)}
      className="glass-card p-4 flex items-center gap-4 hover:border-gaming-accent/50 transition-all cursor-pointer group"
    >
      <div className="relative">
        <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-gaming-accent/50 p-0.5 bg-gaming-accent/10">
          {player.avatar ? (
            <img 
              src={player.avatarfull} 
              alt={player.personaname}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User className="w-6 h-6 text-white/10" />
            </div>
          )}
        </div>
        {player.country_code && (
          <div className="absolute -bottom-1 -right-1 bg-black/80 rounded px-1 text-xs border border-white/10 leading-none py-0.5">
            {getFlagEmoji(player.country_code)}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-white font-bold truncate group-hover:text-gaming-accent transition-colors">
            {player.personaname}
          </h3>
        </div>
        <p className="text-gray-500 text-xs mt-1 truncate">
          {player.full_name || 'Professional Player'}
        </p>
      </div>

      <div className="text-right">
        <div className="bg-gaming-accent/10 border border-gaming-accent/20 px-2 py-1 rounded text-[10px] font-black uppercase text-gaming-accent tracking-widest inline-block mb-1">
          {player.team_tag || 'Free Agent'}
        </div>
        <div className="text-[10px] text-gray-500 font-bold uppercase truncate max-w-[100px]">
          {player.team_name || 'NO TEAM'}
        </div>
      </div>
    </div>
  );
}
