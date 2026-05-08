'use client';

import { GlassCard } from "./GlassCard";
import { cn } from "@/utils/cn";
import { formatDistanceToNow } from "date-fns";

interface ProMatchCardProps {
  radiantName: string | null;
  direName: string | null;
  radiantScore: number;
  direScore: number;
  radiantWin: boolean | null;
  duration: number;
  leagueName: string;
  startTime: number;
}

export function ProMatchCard({
  radiantName,
  direName,
  radiantScore,
  direScore,
  radiantWin,
  duration,
  leagueName,
  startTime
}: ProMatchCardProps) {
  const formatDuration = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <GlassCard hoverable className="w-[300px] shrink-0 p-5 flex flex-col gap-4 group">
      <div className="flex items-center justify-between mb-1">
        <div className="px-2 py-0.5 rounded bg-[var(--nav-hover)] border border-[var(--card-border)] text-[10px] text-muted-foreground font-bold uppercase tracking-wider truncate max-w-[180px]">
          {leagueName}
        </div>
        <div className="text-[10px] text-gray-500 font-medium">
          {formatDistanceToNow(new Date(startTime * 1000), { addSuffix: true })}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-[var(--nav-hover)] border border-[var(--card-border)] flex items-center justify-center font-bold text-lg text-radiant">
            {radiantName?.[0] || 'R'}
          </div>
          <p className={cn(
            "text-sm font-bold truncate w-full text-center",
            radiantWin ? "text-win" : "text-foreground"
          )}>
            {radiantName || "Radiant"}
          </p>
          <p className="text-2xl font-black text-foreground">{radiantScore}</p>
        </div>

        <div className="flex flex-col items-center gap-1">
          <div className="px-2 py-1 rounded-full bg-[var(--nav-hover)] text-[10px] font-black text-muted-foreground uppercase">VS</div>
          <div className="h-10 w-px bg-gradient-to-b from-transparent via-[var(--card-border)] to-transparent" />
          <p className="text-[10px] font-bold text-gray-500">{formatDuration(duration)}</p>
        </div>

        <div className="flex-1 flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-[var(--nav-hover)] border border-[var(--card-border)] flex items-center justify-center font-bold text-lg text-dire">
            {direName?.[0] || 'D'}
          </div>
          <p className={cn(
            "text-sm font-bold truncate w-full text-center",
            radiantWin === false ? "text-win" : "text-foreground"
          )}>
            {direName || "Dire"}
          </p>
          <p className="text-2xl font-black text-foreground">{direScore}</p>
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-[var(--card-border)] flex items-center justify-between">
         <div className={cn(
           "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
           radiantWin ? "bg-win/20 text-win" : "bg-[var(--nav-hover)] text-foreground/40"
         )}>
           {radiantWin ? "Winner" : "Radiant"}
         </div>
         <div className={cn(
           "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
           radiantWin === false ? "bg-win/20 text-win" : "bg-[var(--nav-hover)] text-foreground/40"
         )}>
           {radiantWin === false ? "Winner" : "Dire"}
         </div>
      </div>
    </GlassCard>
  );
}
