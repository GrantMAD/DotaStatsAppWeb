'use client';

import React from 'react';
import { Zap, Gamepad2, User, LucideIcon } from './Icons';
import { cn } from '@/utils/cn';

export type BadgeType = 'hero' | 'match' | 'player' | 'event';

interface IntelligenceBadgeProps {
  type: BadgeType;
  label?: string;
  className?: string;
  showIcon?: boolean;
  icon?: React.ReactNode;
  customColors?: {
    color: string;
    bg: string;
    border: string;
    glow: string;
  };
}

const CONFIG: Record<Exclude<BadgeType, 'event'>, { 
  icon: LucideIcon; 
  label: string; 
  color: string; 
  bg: string; 
  border: string;
  glow: string;
}> = {
  hero: {
    icon: Zap,
    label: 'Hero',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    glow: 'shadow-amber-500/10'
  },
  match: {
    icon: Gamepad2,
    label: 'Match',
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    glow: 'shadow-purple-500/10'
  },
  player: {
    icon: User,
    label: 'Player',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    glow: 'shadow-emerald-500/10'
  }
};

export function IntelligenceBadge({ 
  type, 
  label, 
  className, 
  showIcon = true,
  icon: CustomIcon,
  customColors
}: IntelligenceBadgeProps) {
  const isEvent = type === 'event';
  const config = isEvent ? null : CONFIG[type as Exclude<BadgeType, 'event'>];
  
  const renderIcon = () => {
    if (!showIcon) return null;
    if (CustomIcon) return CustomIcon;
    if (config?.icon) {
      const Icon = config.icon;
      return <Icon className="w-3 h-3" />;
    }
    return null;
  };

  return (
    <div className={cn(
      "flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] font-black uppercase tracking-widest transition-all backdrop-blur-sm shadow-lg",
      isEvent ? customColors?.bg : config?.bg,
      isEvent ? customColors?.color : config?.color,
      isEvent ? customColors?.border : config?.border,
      isEvent ? customColors?.glow : config?.glow,
      className
    )}>
      {renderIcon()}
      <span>{label || config?.label}</span>
    </div>
  );
}
