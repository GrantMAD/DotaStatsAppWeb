'use client';

import React from 'react';
import { User, Plus, Check, UserPlus, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

interface PlayerListItemProps {
  player: {
    account_id: number;
    personaname: string;
    avatarfull: string;
    last_match_time?: string;
  };
  appUserId?: string;
  isFollowing?: boolean;
  isFriend?: boolean;
  isCurrentUser?: boolean;
  onFollow?: () => void;
  onUnfollow?: () => void;
  onAddFriend?: () => void;
  onClick: () => void;
}

export function PlayerListItem({ 
  player, 
  appUserId, 
  isFollowing, 
  isFriend, 
  isCurrentUser,
  onFollow,
  onUnfollow,
  onAddFriend,
  onClick
}: PlayerListItemProps) {
  return (
    <div 
      onClick={onClick}
      className="glass-card p-4 flex items-center gap-4 hover:border-gaming-accent/50 transition-all cursor-pointer group"
    >
      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/5 bg-white/5">
        {player.avatarfull ? (
          <img 
            src={player.avatarfull} 
            alt={player.personaname}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <User className="w-6 h-6 text-white/10" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-white font-bold truncate group-hover:text-gaming-accent transition-colors">
          {player.personaname}
        </h3>
        <p className="text-gray-500 text-xs mt-1">
          ID: {player.account_id}
          {player.last_match_time && (
            <> • Last match: {new Date(player.last_match_time).toLocaleDateString()}</>
          )}
        </p>

        {!isCurrentUser && (
          <div className="flex items-center gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={isFollowing ? onUnfollow : onFollow}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                isFollowing 
                  ? "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white" 
                  : "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20"
              )}
            >
              {isFollowing ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Following
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  Follow
                </>
              )}
            </button>

            {appUserId && !isFriend && onAddFriend && (
              <button
                onClick={onAddFriend}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gaming-accent text-white hover:bg-gaming-accent-light shadow-lg shadow-gaming-accent/20 transition-all"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Add Friend
              </button>
            )}
          </div>
        )}
      </div>

      <ChevronRight className="w-5 h-5 text-gray-700 group-hover:text-gaming-accent transition-colors" />
    </div>
  );
}
