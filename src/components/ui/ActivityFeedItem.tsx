'use client';

import { ActivityItem } from "@/hooks/useActivityFeed";
import { GlassCard } from "./GlassCard";
import { formatDistanceToNow } from "date-fns";
import { 
  Trophy, 
  Zap, 
  TrendingUp, 
  Gamepad2, 
  CheckCircle2, 
  XCircle,
  ArrowRight,
  Flame
} from "lucide-react";
import { cn } from "@/utils/cn";
import { useHeroStats } from "@/hooks/useOpenDota";
import { STEAM_CDN_BASE } from "@/services/constants";
import { motion, AnimatePresence } from "framer-motion";

interface ActivityFeedItemProps {
  item: ActivityItem;
  onPressPlayer: (id: number) => void;
  onPressMatch: (id: number) => void;
  index?: number;
}

export function ActivityFeedItem({ item, onPressPlayer, onPressMatch, index = 0 }: ActivityFeedItemProps) {
  const { data: heroes = [] } = useHeroStats();
  const hero = heroes.find(h => h.id === item.details.heroId);
  const heroImg = hero ? `${STEAM_CDN_BASE}${hero.img}` : null;

  const getTheme = () => {
    switch (item.type) {
      case 'win_streak': return {
        color: "text-amber-500",
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
        glow: "shadow-amber-500/5",
        icon: <Flame className="w-3.5 h-3.5" />,
        label: "Win Streak"
      };
      case 'mvp': return {
        color: "text-gaming-accent",
        bg: "bg-gaming-accent/10",
        border: "border-gaming-accent/20",
        glow: "shadow-gaming-accent/5",
        icon: <Zap className="w-3.5 h-3.5" />,
        label: "MVP Performance"
      };
      case 'rank_up': return {
        color: "text-win",
        bg: "bg-win/10",
        border: "border-win/20",
        glow: "shadow-win/5",
        icon: <TrendingUp className="w-3.5 h-3.5" />,
        label: "Rank Milestone"
      };
      default: return {
        color: "text-gray-400",
        bg: "bg-gray-400/10",
        border: "border-gray-400/20",
        glow: "shadow-transparent",
        icon: item.details.win ? <CheckCircle2 className="w-3.5 h-3.5 text-win" /> : <XCircle className="w-3.5 h-3.5 text-loss" />,
        label: "Recent Match"
      };
    }
  };

  const theme = getTheme();

  const getRankName = (tier: number) => {
    const brackets = ["Herald", "Guardian", "Crusader", "Archon", "Legend", "Ancient", "Divine", "Immortal"];
    const bracketIndex = Math.floor(Math.max(10, Math.min(80, tier)) / 10) - 1;
    const stars = tier % 10;
    return `${brackets[bracketIndex]} ${stars > 0 ? stars : ''}`;
  };

  const getMessage = () => {
    switch (item.type) {
      case 'win_streak': return `reached a ${item.details.streakCount}-win streak!`;
      case 'mvp': return `had an MVP performance!`;
      case 'rank_up': return `is ranked at ${getRankName(item.details.newRank || 0)}`;
      case 'recent_match': return `${item.details.win ? 'Won' : 'Played'} a match as ${hero?.localized_name || 'a hero'}`;
      default: return `played a match.`;
    }
  };

  const getBadge = () => {
    if (item.type === 'win_streak') return `${item.details.streakCount} WINS`;
    if (item.type === 'mvp') return `${item.details.kda} KDA`;
    if (item.type === 'recent_match' && item.details.win) return 'VICTORY';
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ y: -4 }}
      className="shrink-0"
    >
      <GlassCard 
        hoverable 
        className={cn(
          "relative w-[320px] h-[120px] p-4 flex items-center gap-4 cursor-pointer overflow-hidden group transition-all duration-300",
          theme.glow,
          theme.border
        )}
        onClick={() => item.details.matchId ? onPressMatch(item.details.matchId) : onPressPlayer(item.player.account_id)}
      >
        {/* Ghost Background Hero Portrait */}
        {heroImg && (
          <div className="absolute right-[-20px] top-[-20px] opacity-[0.07] group-hover:opacity-[0.12] transition-opacity duration-500 blur-sm pointer-events-none grayscale group-hover:grayscale-0">
            <img 
              src={heroImg} 
              alt="" 
              className="w-40 h-40 object-cover rotate-[-10deg] scale-125" 
            />
          </div>
        )}

        {/* Hero + Player Avatar Stack */}
        <div className="relative shrink-0">
          <div 
            className="w-16 h-16 rounded-full overflow-hidden border-2 border-[var(--card-border)] bg-[var(--nav-hover)] group-hover:border-gaming-accent/50 transition-colors"
          >
            <img 
              src={heroImg || item.player.avatar} 
              alt={hero?.localized_name || item.player.name} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
            />
          </div>
          {/* Player Avatar Overlay */}
          <div 
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full overflow-hidden border-2 border-[var(--background)] shadow-xl cursor-pointer hover:scale-110 transition-transform"
            onClick={(e) => {
              e.stopPropagation();
              onPressPlayer(item.player.account_id);
            }}
          >
            <img src={item.player.avatar} alt={item.player.name} className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 z-10">
          <div className="flex items-center justify-between mb-1">
            <div className={cn("flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider", theme.bg, theme.color)}>
              {theme.icon}
              {theme.label}
            </div>
            {getBadge() && (
              <span className="text-[9px] font-black text-gray-500 opacity-50 tracking-tighter uppercase">
                {getBadge()}
              </span>
            )}
          </div>
          
          <p className="text-xs text-foreground leading-snug line-clamp-2 pr-4">
            <span className="font-bold text-gaming-accent group-hover:text-foreground transition-colors">{item.player.name}</span> {getMessage()}
          </p>
          
          <div className="flex items-center justify-between mt-2">
            <p className="text-[10px] text-gray-500 font-medium">
              {formatDistanceToNow(new Date(item.timestamp * 1000), { addSuffix: true })}
            </p>
            
            <div className="opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
              <ArrowRight className="w-4 h-4 text-gaming-accent" />
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}


