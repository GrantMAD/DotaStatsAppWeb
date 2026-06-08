'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { useLeagueMatches } from '@/hooks/useOpenDota';
import { League } from '@/services/opendota';
import { Modal } from '../ui/Modal';
import { ProMatchCard } from '../ui/ProMatchCard';
import { MatchDetailModal } from '../match/MatchDetailModal';
import { Skeleton } from '../ui/Skeleton';
import { Trophy, Calendar, Info, Map, Timer, AlertCircle } from '@/components/ui/Icons';
import { getLeagueImageUrl } from '@/services/constants';
import { trackOpenDotaMetaInteraction } from '@/services/analytics';

interface LeagueDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  league: League | null;
  isActive?: boolean;
}

export function LeagueDetailModal({ isOpen, onClose, league, isActive }: LeagueDetailModalProps) {
  const [imageError, setImageError] = useState(false);
  const [recentThreshold] = useState(() => Date.now() - 7 * 24 * 60 * 60 * 1000);
  const { data: matches = [], isLoading: loading } = useLeagueMatches(isOpen && league ? league.leagueid : null);
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);

  const stats = useMemo(() => {
    if (!matches || matches.length === 0) return null;
    
    const times = matches.map(m => m.start_time);
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    
    return {
      startDate: new Date(minTime * 1000),
      endDate: new Date(maxTime * 1000),
      totalMatches: matches.length,
      avgDuration: matches.reduce((acc, m) => acc + m.duration, 0) / matches.length
    };
  }, [matches]);

  React.useEffect(() => {
    if (isOpen && league) {
      trackOpenDotaMetaInteraction('pro_league_view', league.leagueid.toString());
    }
  }, [isOpen, league]);

  if (!league) return null;

  const bannerUrl = getLeagueImageUrl(league.banner);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tournament Details" size="xl">
      <MatchDetailModal 
        isOpen={selectedMatchId !== null}
        onClose={() => setSelectedMatchId(null)}
        matchId={selectedMatchId}
      />
      <div className="space-y-8 max-h-[80vh] overflow-y-auto pr-2 no-scrollbar">
        {/* League Hero Section */}
        <div className="relative rounded-3xl overflow-hidden border border-(--card-border) group">
          {bannerUrl && !imageError ? (
            <div className="relative w-full h-64">
              <Image
                src={bannerUrl}
                alt={league.name}
                fill
                sizes="100vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                onError={() => setImageError(true)}
              />
            </div>
          ) : (
            <div className="h-64 bg-(--nav-hover) flex items-center justify-center">
              <Trophy className="w-20 h-20 text-foreground/5" />
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent" />
          
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-gaming-accent/20 border border-gaming-accent/50 text-gaming-accent text-[10px] font-black uppercase tracking-widest">
                {league.tier} Tier
              </div>
              {isActive && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-win/20 border border-win/50 text-win text-[10px] font-black uppercase tracking-widest animate-pulse">
                   <div className="w-2 h-2 rounded-full bg-win" />
                   Live Now
                </div>
              )}
              {stats && (
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-black uppercase tracking-widest">
                   {stats.totalMatches} Matches
                </div>
              )}
            </div>
            <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none">
              {league.name}
            </h2>
            {stats && (
              <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                <Calendar size={14} className="text-gaming-accent" />
                {stats.startDate.toLocaleDateString()} — {stats.endDate.toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
           <div className="bg-(--nav-hover) border border-(--card-border) p-4 rounded-2xl flex items-center gap-4">
              <div className="p-2 rounded-lg bg-(--card-bg) text-muted-foreground">
                 <Info size={16} />
              </div>
              <div>
                 <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">League ID</p>
                 <p className="text-foreground font-bold">{league.leagueid}</p>
              </div>
           </div>
           <div className="bg-(--nav-hover) border border-(--card-border) p-4 rounded-2xl flex items-center gap-4">
              <div className="p-2 rounded-lg bg-(--card-bg) text-muted-foreground">
                 <Map size={16} />
              </div>
              <div>
                 <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Region</p>
                 <p className="text-foreground font-bold uppercase">{league.region || 'International'}</p>
              </div>
           </div>
           {stats && (
             <>
               <div className="bg-(--nav-hover) border border-(--card-border) p-4 rounded-2xl flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-(--card-bg) text-muted-foreground">
                     <Timer size={16} />
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Avg Game</p>
                     <p className="text-foreground font-bold">{Math.floor(stats.avgDuration / 60)}m</p>
                  </div>
               </div>
               <div className="bg-(--nav-hover) border border-(--card-border) p-4 rounded-2xl flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-(--card-bg) text-muted-foreground">
                     <Trophy size={16} />
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Status</p>
                     <p className="text-foreground font-bold uppercase">
                        {stats.endDate.getTime() > recentThreshold ? 'Recent' : 'Archived'}
                     </p>
                  </div>
               </div>
             </>
           )}
        </div>

        {loading ? (
          <div className="space-y-6">
            <Skeleton className="h-8 w-48 rounded-lg" />
            <div className="grid grid-cols-1 gap-4">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <h3 className="text-lg font-black text-foreground uppercase tracking-tight mb-6 flex items-center gap-2">
              <Calendar size={20} className="text-gaming-accent" /> Recent Match Results
            </h3>
            
            {matches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matches.slice(0, 20).map(item => (
                  <div 
                    key={item.match_id} 
                    onClick={() => setSelectedMatchId(item.match_id)}
                    className="cursor-pointer"
                  >
                    <ProMatchCard
                      radiantName={item.radiant_name}
                      direName={item.dire_name}
                      radiantScore={item.radiant_score}
                      direScore={item.dire_score}
                      radiantWin={item.radiant_win}
                      duration={item.duration}
                      leagueName={item.league_name}
                      startTime={item.start_time}
                      radiantLogo={item.radiant_logo}
                      direLogo={item.dire_logo}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-(--nav-hover) rounded-3xl border border-dashed border-(--card-border) p-8">
                 <AlertCircle className="w-16 h-16 text-amber-500 mb-4 opacity-50" />
                 <h4 className="text-foreground font-bold uppercase tracking-tight text-xl">Limited Data Coverage</h4>
                 <p className="text-muted-foreground text-sm max-w-sm mx-auto mt-2 italic leading-relaxed">
                    Historical or lower-tier tournament data may be incomplete or restricted in the public archives. 
                    Detailed match records are primarily maintained for Premium and Professional tier events.
                 </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
