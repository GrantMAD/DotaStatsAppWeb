'use client';

import { GlassCard } from "./GlassCard";
import { GlobalRecord } from "@/services/opendota";
import { cn } from "@/utils/cn";
import { LucideIcon, Trophy, Skull, Activity } from "lucide-react";

interface RecordCardProps {
  title: string;
  field: string;
  record: GlobalRecord | null;
  icon: 'cash' | 'skull' | 'heart';
  color: string;
  onPress: (matchId: number) => void;
}

const ICON_MAP: Record<string, LucideIcon> = {
  cash: Trophy,
  skull: Skull,
  heart: Activity
};

export function RecordCard({ title, record, icon, color, onPress }: RecordCardProps) {
  if (!record) return null;

  const IconComponent = ICON_MAP[icon];

  return (
    <GlassCard 
      hoverable 
      onClick={() => onPress(record.match_id)}
      className="mb-4 cursor-pointer overflow-hidden group"
    >
      <div className="flex items-center gap-6">
        <div className={cn(
          "w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6",
          icon === 'cash' ? "bg-amber-500/20 text-amber-500 shadow-amber-500/10" :
          icon === 'skull' ? "bg-red-500/20 text-red-500 shadow-red-500/10" :
          "bg-blue-500/20 text-blue-500 shadow-blue-500/10"
        )}>
          <IconComponent size={32} />
        </div>

        <div className="flex-1">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-foreground leading-none">
              {record.score.toLocaleString()}
            </h3>
            <span className="text-xs font-bold text-gray-500">
              {icon === 'cash' ? 'GPM' : icon === 'skull' ? 'Kills' : 'Healing'}
            </span>
          </div>
        </div>

        <div className="text-right">
          <p className="text-xs font-bold text-gray-500 mb-2">Match ID</p>
          <p className="text-sm font-black text-foreground bg-[var(--overlay-medium)] px-3 py-1 rounded-lg border border-[var(--overlay-border)] group-hover:border-gaming-accent transition-colors">
            {record.match_id}
          </p>
        </div>
      </div>

      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[var(--overlay-light)] to-transparent -translate-y-16 translate-x-16 rotate-45 pointer-events-none" />
    </GlassCard>
  );
}
