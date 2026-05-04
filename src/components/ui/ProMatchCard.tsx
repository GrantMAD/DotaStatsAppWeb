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
        <div className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-gray-400 font-bold uppercase tracking-wider truncate max-w-[180px]">
          {leagueName}
        </div>
        <div className="text-[10px] text-gray-500 font-medium">
          {formatDistanceToNow(new Date(startTime * 1000), { addSuffix: true })}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-lg text-radiant">
            {radiantName?.[0] || 'R'}
          </div>
          <p className={cn(
            "text-sm font-bold truncate w-full text-center",
            radiantWin ? "text-win" : "text-white"
          )}>
            {radiantName || "Radiant"}
          </p>
          <p className="text-2xl font-black text-white">{radiantScore}</p>
        </div>

        <div className="flex flex-col items-center gap-1">
          <div className="px-2 py-1 rounded-full bg-white/5 text-[10px] font-black text-gray-500 uppercase">VS</div>
          <div className="h-10 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
          <p className="text-[10px] font-bold text-gray-500">{formatDuration(duration)}</p>
        </div>

        <div className="flex-1 flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-lg text-dire">
            {direName?.[0] || 'D'}
          </div>
          <p className={cn(
            "text-sm font-bold truncate w-full text-center",
            radiantWin === false ? "text-win" : "text-white"
          )}>
            {direName || "Dire"}
          </p>
          <p className="text-2xl font-black text-white">{direScore}</p>
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
         <div className={cn(
           "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
           radiantWin ? "bg-win/20 text-win" : "bg-win/5 text-gray-600"
         )}>
           {radiantWin ? "Winner" : "Radiant"}
         </div>
         <div className={cn(
           "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
           radiantWin === false ? "bg-win/20 text-win" : "bg-win/5 text-gray-600"
         )}>
           {radiantWin === false ? "Winner" : "Dire"}
         </div>
      </div>
    </GlassCard>
  );
}
