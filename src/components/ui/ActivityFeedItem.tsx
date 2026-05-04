'use client';

import { ActivityItem } from "@/hooks/useActivityFeed";
import { GlassCard } from "./GlassCard";
import { formatDistanceToNow } from "date-fns";
import { Trophy, Zap, TrendingUp, Gamepad2 } from "lucide-react";
import { cn } from "@/utils/cn";

interface ActivityFeedItemProps {
  item: ActivityItem;
  onPressPlayer: (id: number) => void;
  onPressMatch: (id: number) => void;
}

export function ActivityFeedItem({ item, onPressPlayer, onPressMatch }: ActivityFeedItemProps) {
  const getIcon = () => {
    switch (item.type) {
      case 'win_streak': return <Trophy className="w-4 h-4 text-amber-500" />;
      case 'mvp': return <Zap className="w-4 h-4 text-gaming-accent" />;
      case 'rank_up': return <TrendingUp className="w-4 h-4 text-win" />;
      default: return <Gamepad2 className="w-4 h-4 text-gray-400" />;
    }
  };

  const getMessage = () => {
    switch (item.type) {
      case 'win_streak': return `is on a ${item.details.streakCount} game win streak!`;
      case 'mvp': return `had a massive ${item.details.kda} KDA match!`;
      case 'rank_up': return `reached a new rank tier!`;
      default: return `played a ${item.details.win ? 'winning' : 'match'} game.`;
    }
  };

  return (
    <GlassCard 
      hoverable 
      className="w-[280px] shrink-0 p-4 flex items-center gap-4 cursor-pointer"
      onClick={() => item.details.matchId && onPressMatch(item.details.matchId)}
    >
      <div 
        className="w-12 h-12 rounded-full overflow-hidden border border-white/10 shrink-0"
        onClick={(e) => {
          e.stopPropagation();
          onPressPlayer(item.player.account_id);
        }}
      >
        <img src={item.player.avatar} alt={item.player.name} className="w-full h-full object-cover" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          {getIcon()}
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
            {item.type.replace('_', ' ')}
          </span>
        </div>
        <p className="text-xs text-white leading-snug line-clamp-2">
          <span className="font-bold text-gaming-accent">{item.player.name}</span> {getMessage()}
        </p>
        <p className="text-[10px] text-gray-500 mt-1">
          {formatDistanceToNow(new Date(item.timestamp * 1000), { addSuffix: true })}
        </p>
      </div>
    </GlassCard>
  );
}
