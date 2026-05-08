'use client';

import { PlayerMatchFilters } from "@/services/opendota";
import { HEROES } from "@/services/constants";
import { cn } from "@/utils/cn";
import { Filter, Calendar, Award, Gamepad2 } from "lucide-react";

interface MatchFiltersProps {
  filters: PlayerMatchFilters;
  onFilterChange: (filters: PlayerMatchFilters) => void;
}

export default function MatchFilters({ filters, onFilterChange }: MatchFiltersProps) {
  const handleUpdate = (updates: Partial<PlayerMatchFilters>) => {
    onFilterChange({ ...filters, ...updates });
  };

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Filter className="w-4 h-4 text-gray-500" />
        <span className="text-xs font-black uppercase tracking-widest text-gray-500">Filter Matches</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {/* Outcome Filter */}
        <div className="flex bg-[var(--nav-hover)] rounded-xl p-1 border border-[var(--card-border)]">
          {[
            { label: 'All', value: undefined },
            { label: 'Wins', value: 1 },
            { label: 'Losses', value: 0 }
          ].map((opt) => (
            <button
              key={opt.label}
              onClick={() => handleUpdate({ win: opt.value })}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                filters.win === opt.value 
                  ? "bg-gaming-accent text-white shadow-lg shadow-gaming-accent/20" 
                  : "text-gray-500 hover:text-foreground"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Game Mode Filter */}
        <select 
          onChange={(e) => handleUpdate({ game_mode: e.target.value ? Number(e.target.value) : undefined })}
          className="bg-[var(--nav-hover)] border border-[var(--card-border)] rounded-xl px-4 py-1.5 text-xs font-bold text-gray-400 focus:outline-none focus:ring-2 focus:ring-gaming-accent/50 appearance-none"
          value={filters.game_mode || ""}
        >
          <option value="" className="bg-[var(--card-bg)]">All Game Modes</option>
          <option value="22" className="bg-[var(--card-bg)]">Ranked All Pick</option>
          <option value="23" className="bg-[var(--card-bg)]">Turbo</option>
          <option value="1" className="bg-[var(--card-bg)]">All Pick</option>
        </select>

        {/* Date Filter */}
        <select 
          onChange={(e) => handleUpdate({ date: e.target.value ? Number(e.target.value) : undefined })}
          className="bg-[var(--nav-hover)] border border-[var(--card-border)] rounded-xl px-4 py-1.5 text-xs font-bold text-gray-400 focus:outline-none focus:ring-2 focus:ring-gaming-accent/50 appearance-none"
          value={filters.date || ""}
        >
          <option value="" className="bg-[var(--card-bg)]">Any Time</option>
          <option value="7" className="bg-[var(--card-bg)]">Last 7 Days</option>
          <option value="30" className="bg-[var(--card-bg)]">Last 30 Days</option>
          <option value="90" className="bg-[var(--card-bg)]">Last 90 Days</option>
        </select>
      </div>
    </div>
  );
}
