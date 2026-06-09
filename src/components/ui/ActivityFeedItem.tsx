'use client';

import { ActivityItem } from "@/hooks/useActivityFeed";
import { GlassCard } from "./GlassCard";
import { formatDistanceToNow } from "date-fns";
import {
  Zap,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Flame,
  Skull,
  Swords,
  Target,
  ShieldAlert,
  Sword,
  Crown,
  Award,
  XCircle
} from "@/components/ui/Icons";
import { cn } from "@/utils/cn";
import { useHeroStats } from "@/hooks/useOpenDota";
import { IntelligenceBadge } from "./IntelligenceBadge";
import { STEAM_CDN_BASE } from "@/services/constants";
import Image from 'next/image';
import { AnimationWrapper } from "./AnimationWrapper";

interface ActivityFeedItemProps {
  item: ActivityItem;
  onPressPlayer: (id: number) => void;
  onPressMatch: (id: number) => void;
  index?: number;
  className?: string;
}

export function ActivityFeedItem({ item, onPressPlayer, onPressMatch, index = 0, className }: ActivityFeedItemProps) {
  const { data: heroes = [] } = useHeroStats();
  const hero = heroes.find(h => h.id === item.details.heroId);
  const heroImg = hero ? `${STEAM_CDN_BASE}${hero.img}` : null;

  const getTheme = () => {
    switch (item.type) {
      case 'rampage': return {
        color: "text-red-500",
        bg: "bg-red-500/10",
        border: "border-red-500/20",
        glow: "shadow-red-500/10",
        icon: <Skull className="w-3.5 h-3.5" />,
        label: "Rampage!"
      };
      case 'ultra_kill': return {
        color: "text-orange-500",
        bg: "bg-orange-500/10",
        border: "border-orange-500/20",
        glow: "shadow-orange-500/5",
        icon: <Swords className="w-3.5 h-3.5" />,
        label: "Ultra Kill"
      };
      case 'triple_kill': return {
        color: "text-yellow-500",
        bg: "bg-yellow-500/10",
        border: "border-yellow-500/20",
        glow: "shadow-yellow-500/5",
        icon: <Target className="w-3.5 h-3.5" />,
        label: "Triple Kill"
      };
      case 'aegis_snatch': return {
        color: "text-cyan-400",
        bg: "bg-cyan-400/10",
        border: "border-cyan-400/20",
        glow: "shadow-cyan-400/5",
        icon: <ShieldAlert className="w-3.5 h-3.5" />,
        label: "Aegis Snatched"
      };
      case 'rapier': return {
        color: "text-amber-400",
        bg: "bg-amber-400/10",
        border: "border-amber-400/20",
        glow: "shadow-amber-400/10",
        icon: <Sword className="w-3.5 h-3.5" />,
        label: "Divine Rapier"
      };
      case 'godlike': return {
        color: "text-purple-500",
        bg: "bg-purple-500/10",
        border: "border-purple-500/20",
        glow: "shadow-purple-500/5",
        icon: <Crown className="w-3.5 h-3.5" />,
        label: "Godlike Streak"
      };
      case 'benchmark': return {
        color: "text-blue-400",
        bg: "bg-blue-400/10",
        border: "border-blue-400/20",
        glow: "shadow-blue-400/5",
        icon: <Award className="w-3.5 h-3.5" />,
        label: "Elite Performance"
      };
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
        color: "text-muted-foreground",
        bg: "bg-muted/30",
        border: "border-muted/20",
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
    const isTurbo = item.details.gameMode === 23;
    const suffix = isTurbo ? ' (Turbo)' : '';

    switch (item.type) {
      case 'rampage': return `secured a RAMPAGE!${suffix}`;
      case 'ultra_kill': return `got an Ultra Kill!${suffix}`;
      case 'triple_kill': return `got a Triple Kill!${suffix}`;
      case 'aegis_snatch': return `SNATCHED the Aegis!${suffix}`;
      case 'rapier': return `purchased a Divine Rapier!${suffix}`;
      case 'godlike': return `is on a GODLIKE streak!${suffix}`;
      case 'benchmark': return `was in the Top 1% for ${item.details.benchmarkType}!${suffix}`;
      case 'win_streak': return `reached a ${item.details.streakCount}-win streak!${suffix}`;
      case 'mvp': return `had an MVP performance!${suffix}`;
      case 'rank_up': return `is ranked at ${getRankName(item.details.newRank || 0)}`;
      case 'recent_match': return `${item.details.win ? 'Won' : 'Played'} a match as ${hero?.localized_name || 'a hero'}${suffix}`;
      default: return `played a match.`;
    }
  };

  const getBadge = () => {
    if (item.type === 'win_streak') return `${item.details.streakCount} WINS`;
    if (item.type === 'mvp') return `${item.details.kda} KDA`;
    if (item.type === 'recent_match' && item.details.win) return 'VICTORY';
    if (item.type === 'benchmark') return 'TOP 1%';
    return null;
  };

  return (
    <AnimationWrapper animationType="slide-up" style={{ transitionDelay: `${index * 50}ms` }}>
      <GlassCard
        hoverable
        className={cn(
          "relative w-[320px] h-30 p-4 flex items-center gap-4 cursor-pointer overflow-hidden group transition-all duration-300",
          theme.glow,
          theme.border,
          className
        )}
        onClick={() => item.details.matchId ? onPressMatch(item.details.matchId) : onPressPlayer(item.player.account_id)}
      >
        {/* Ghost Background Hero Portrait */}
        {heroImg && (
          <div className="absolute -right-5 -top-5 opacity-[0.07] group-hover:opacity-[0.12] transition-opacity duration-500 blur-sm pointer-events-none grayscale group-hover:grayscale-0">
            <Image
              src={heroImg}
              alt=""
              width={160}
              height={160}
              className="w-40 h-40 object-cover rotate-[-10deg] scale-125"
            />
          </div>
        )}

        {/* Hero + Player Avatar Stack */}
        <div className="relative shrink-0">
          <div
            className="w-16 h-16 rounded-full overflow-hidden border-2 border-(--card-border) bg-(--nav-hover) group-hover:border-gaming-accent/50 transition-colors"
          >
            <Image
              src={heroImg || item.player.avatar}
              alt={hero?.localized_name || item.player.name}
              width={64}
              height={64}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          </div>
          {/* Player Avatar Overlay */}
          <div
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full overflow-hidden border-2 border-(--background) shadow-xl cursor-pointer hover:scale-110 transition-transform"
            onClick={(e) => {
              e.stopPropagation();
              onPressPlayer(item.player.account_id);
            }}
          >
            <Image
              src={item.player.avatar}
              alt={item.player.name}
              width={28}
              height={28}
              className="w-full h-full object-cover"
            />          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 z-10 h-full flex flex-col justify-between py-1">
          <div>
            <div className="flex items-center justify-between mb-2">
              <IntelligenceBadge 
                type="event" 
                label={theme.label} 
                icon={theme.icon} 
                customColors={{
                  color: theme.color,
                  bg: theme.bg,
                  border: theme.border,
                  glow: theme.glow
                }}
              />
              {getBadge() && (
                <span className="text-[9px] font-black text-muted-foreground opacity-50 tracking-tighter uppercase">
                  {getBadge()}
                </span>
              )}
            </div>

            <p className="text-xs text-foreground leading-snug line-clamp-2 pr-4">
              <span className="font-bold text-gaming-accent group-hover:text-foreground transition-colors">{item.player.name}</span> {getMessage()}
            </p>
          </div>

          <div className="flex items-center justify-between mt-auto">
            <p className="text-[10px] text-muted-foreground font-medium">
              {formatDistanceToNow(new Date(item.timestamp * 1000), { addSuffix: true })}
            </p>

            <div className="opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
              <ArrowRight className="w-4 h-4 text-gaming-accent" />
            </div>
          </div>
        </div>
      </GlassCard>
    </AnimationWrapper>
  );
}
