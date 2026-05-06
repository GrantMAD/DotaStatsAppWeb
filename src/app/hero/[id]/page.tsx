'use client';

import React, { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Trophy, 
  Target, 
  Zap, 
  Shield, 
  Sword, 
  Users, 
  ArrowLeft,
  Ban,
  Activity,
  User as UserIcon,
  TrendingUp,
  BarChart2
} from 'lucide-react';
import { useHeroStats, usePlayerHeroes } from '@/hooks/useOpenDota';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { STEAM_CDN_BASE } from '@/services/constants';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/utils/cn';
import { BRACKET_NAMES } from '@/services/tierList';
import { motion } from 'framer-motion';

const RANK_COLORS: Record<string, string> = {
  '1': 'text-[#8d8d8d]',
  '2': 'text-[#b4c7dc]',
  '3': 'text-[#daa520]',
  '4': 'text-[#3cb371]',
  '5': 'text-[#4682b4]',
  '6': 'text-[#9370db]',
  '7': 'text-[#cd5c5c]',
  '8': 'text-[#ffd700]',
};

function WinRateBar({ picks, wins, label, colorClass }: { picks: number; wins: number; label: string; colorClass: string }) {
  const wr = picks > 0 ? (wins / picks) * 100 : 0;
  const barWidth = Math.max(wr, 2);

  return (
    <div className="mb-6">
      <div className="flex justify-between items-end mb-2">
        <span className={cn("text-xs font-black uppercase tracking-widest", colorClass)}>{label}</span>
        <span className="text-[10px] font-bold text-gray-500 uppercase italic">
          {wr.toFixed(1)}% <span className="mx-1">·</span> {(picks / 1000).toFixed(1)}k matches
        </span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${barWidth}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={cn(
            "h-full rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]",
            wr >= 52 ? "bg-win" : wr >= 48 ? "bg-amber-500" : "bg-loss"
          )}
        />
      </div>
    </div>
  );
}

function StatBox({ label, value, subValue, icon: Icon, color }: { label: string; value: string | number; subValue?: string; icon?: any; color?: string }) {
  return (
    <GlassCard className="p-6 flex flex-col justify-between group overflow-hidden relative">
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic">{label}</p>
          {Icon && <Icon className={cn("w-4 h-4", color || "text-gray-600")} />}
        </div>
        <div className="flex items-baseline gap-2">
          <p className={cn("text-3xl font-black italic tracking-tighter", color || "text-white")}>{value}</p>
          {subValue && <p className="text-xs font-bold text-gray-500 uppercase">{subValue}</p>}
        </div>
      </div>
      <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110">
        {Icon && <Icon className="w-24 h-24" />}
      </div>
    </GlassCard>
  );
}

export default function HeroDetailPage() {
  const params = useParams();
  const router = useRouter();
  const heroId = Number(params.id);
  const { steamAccountId } = useSupabaseAuth();

  const { data: heroes = [], isLoading: loadingHeroes } = useHeroStats();
  const { data: playerHeroes = [], isLoading: loadingPlayerStats } = usePlayerHeroes(steamAccountId);

  const hero = useMemo(() => heroes.find(h => h.id === heroId), [heroes, heroId]);
  const playerHeroStats = useMemo(() => 
    playerHeroes.find(h => Number(h.hero_id) === heroId), 
  [playerHeroes, heroId]);

  if (loadingHeroes) {
    return (
      <div className="p-8 space-y-8">
        <Skeleton className="w-48 h-10 rounded-xl" />
        <Skeleton className="w-full h-96 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (!hero) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h1 className="text-4xl font-black text-white mb-4">Hero Not Found</h1>
        <button onClick={() => router.back()} className="text-gaming-accent font-bold hover:underline">
          Go Back
        </button>
      </div>
    );
  }

  const pubWinRate = hero.pub_pick > 0 ? (hero.pub_win / hero.pub_pick) * 100 : 0;
  const proWinRate = hero.pro_pick > 0 ? (hero.pro_win / hero.pro_pick) * 100 : 0;
  const turboWinRate = hero.turbo_picks > 0 ? (hero.turbo_wins / hero.turbo_picks) * 100 : 0;

  const attrColors: Record<string, string> = {
    str: 'bg-loss text-white',
    agi: 'bg-win text-white',
    int: 'bg-blue-500 text-white',
    all: 'bg-gray-400 text-black',
  };

  const attrNames: Record<string, string> = {
    str: 'Strength',
    agi: 'Agility',
    int: 'Intelligence',
    all: 'Universal',
  };

  return (
    <div className="pb-20">
      {/* Back Button */}
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-8 group"
      >
        <div className="p-2 rounded-lg bg-white/5 group-hover:bg-gaming-accent group-hover:text-white transition-all">
          <ArrowLeft className="w-4 h-4" />
        </div>
        <span className="text-xs font-black uppercase tracking-widest">Back to Meta</span>
      </button>

      {/* Hero Header */}
      <div className="relative rounded-[2rem] overflow-hidden border border-white/10 mb-12 shadow-2xl shadow-black/50">
        <div className="aspect-[21/9] md:aspect-[3/1] relative">
          <img 
            src={`${STEAM_CDN_BASE}${hero.img}`} 
            alt={hero.localized_name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d1a] via-[#0d0d1a]/40 to-transparent" />
          
          <div className="absolute bottom-8 left-8 right-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className={cn("px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest", attrColors[hero.primary_attr])}>
                  {attrNames[hero.primary_attr]}
                </div>
                <div className="px-4 py-1 rounded-full bg-white/10 text-white text-[10px] font-black uppercase tracking-widest border border-white/10">
                  {hero.attack_type}
                </div>
              </div>
              <h1 className="text-6xl md:text-8xl font-black text-white italic tracking-tighter uppercase">
                {hero.localized_name}
              </h1>
              <div className="flex flex-wrap gap-2 mt-6">
                {hero.roles.map(role => (
                  <span key={role} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    {role}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 min-w-[200px]">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 italic">Global Pub Win Rate</p>
              <div className="flex items-baseline gap-2">
                <span className={cn("text-5xl font-black italic tracking-tighter", pubWinRate >= 50 ? "text-win" : "text-loss")}>
                  {pubWinRate.toFixed(1)}
                </span>
                <span className="text-xl font-bold text-gray-600 uppercase">%</span>
              </div>
              <p className="text-[10px] font-bold text-gray-500 mt-2">{(hero.pub_pick / 1000).toFixed(0)}k MATCHES</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Stats Cards */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Personal Stats Section */}
          {steamAccountId && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <SectionHeader 
                icon={UserIcon} 
                title="Your Performance" 
                description="Your personal record with this hero across all matched games."
                color="text-win" 
              />
              
              {loadingPlayerStats ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
                </div>
              ) : playerHeroStats ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatBox 
                    label="Win Rate" 
                    value={`${((playerHeroStats.win / playerHeroStats.games) * 100).toFixed(1)}`}
                    subValue="%"
                    icon={TrendingUp}
                    color={(playerHeroStats.win / playerHeroStats.games) * 100 >= 50 ? "text-win" : "text-loss"}
                  />
                  <StatBox 
                    label="Games" 
                    value={playerHeroStats.games}
                    icon={Users}
                  />
                  <StatBox 
                    label="KDA Ratio" 
                    value={playerHeroStats.kda.toFixed(2)}
                    icon={Target}
                    color="text-win"
                  />
                  <StatBox 
                    label="Avg Kills" 
                    value={playerHeroStats.avg_kills.toFixed(1)}
                    icon={Sword}
                  />
                </div>
              ) : (
                <GlassCard className="p-8 text-center border-dashed">
                  <p className="text-gray-500 font-bold italic">No personal data found for this hero</p>
                </GlassCard>
              )}
            </motion.div>
          )}

          {/* Detailed Meta Section */}
          <div className="space-y-6">
            <SectionHeader 
              icon={BarChart2} 
              title="Meta Insights" 
              description="Breakdown of performance across different game modes and skill brackets."
              color="text-gaming-accent" 
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <StatBox 
                label="Pro Win Rate" 
                value={proWinRate > 0 ? proWinRate.toFixed(1) : 'N/A'}
                subValue={proWinRate > 0 ? "%" : ""}
                icon={Trophy}
                color={proWinRate >= 50 ? "text-win" : "text-loss"}
              />
              <StatBox 
                label="Pro Picks/Bans" 
                value={hero.pro_pick + hero.pro_ban}
                subValue="CONTESTED"
                icon={Ban}
                color="text-loss"
              />
              <StatBox 
                label="Turbo Win Rate" 
                value={turboWinRate.toFixed(1)}
                subValue="%"
                icon={Zap}
                color={turboWinRate >= 50 ? "text-win" : "text-loss"}
              />
              <StatBox 
                label="Pub Popularity" 
                value={((hero.pub_pick / 1000)).toFixed(1)}
                subValue="K GAMES"
                icon={Activity}
                color="text-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Rank Breakdown */}
        <div className="lg:col-span-1">
          <SectionHeader 
            icon={Shield} 
            title="Rank Breakdown" 
            description="Win rates by MMR bracket."
            color="text-amber-500" 
          />
          
          <GlassCard className="p-8">
            <div className="space-y-2">
              {['1', '2', '3', '4', '5', '6', '7', '8'].map(rank => {
                const picks = (hero as any)[`${rank}_pick`];
                const wins = (hero as any)[`${rank}_win`];
                if (!picks) return null;
                
                return (
                  <WinRateBar 
                    key={rank}
                    label={BRACKET_NAMES[Number(rank)]}
                    picks={picks}
                    wins={wins}
                    colorClass={RANK_COLORS[rank]}
                  />
                );
              })}
            </div>
            
            <div className="mt-8 p-4 rounded-2xl bg-white/5 border border-white/5">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider leading-relaxed">
                Win rates are calculated using data from the last 30 days of public matchmaking. Brackets with fewer than 1,000 games may show higher variance.
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
