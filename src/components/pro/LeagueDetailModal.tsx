'use client';

import React from 'react';
import { useLeagueMatches } from '@/hooks/useOpenDota';
import { Modal } from '../ui/Modal';
import { ProMatchCard } from '../ui/ProMatchCard';
import { Skeleton } from '../ui/Skeleton';
import { Trophy, Calendar, Info, Map } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getLeagueImageUrl } from '@/services/constants';

interface LeagueDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  league: any | null;
}

export function LeagueDetailModal({ isOpen, onClose, league }: LeagueDetailModalProps) {
  const router = useRouter();
  const [imageError, setImageError] = React.useState(false);
  const { data: matches = [], isLoading: loading } = useLeagueMatches(isOpen && league ? league.leagueid : null);

  if (!league) return null;

  const bannerUrl = getLeagueImageUrl(league.banner);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tournament Details" size="xl">
      <div className="space-y-8 max-h-[80vh] overflow-y-auto pr-2 no-scrollbar">
        {/* League Hero Section */}
        <div className="relative rounded-3xl overflow-hidden border border-[var(--card-border)] group">
          {bannerUrl && !imageError ? (
            <img 
              src={bannerUrl} 
              alt={league.name} 
              onError={() => setImageError(true)}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-700" 
            />
          ) : (
            <div className="h-48 bg-[var(--nav-hover)] flex items-center justify-center">
              <Trophy className="w-20 h-20 text-foreground/5" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          
          <div className="absolute bottom-6 left-6 right-6">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-gaming-accent/20 border border-gaming-accent/50 text-gaming-accent text-[10px] font-black uppercase tracking-widest mb-3">
              {league.tier} Tier
            </div>
            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">
              {league.name}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="bg-[var(--nav-hover)] border border-[var(--card-border)] p-4 rounded-2xl flex items-center gap-4">
              <div className="p-2 rounded-lg bg-[var(--card-bg)] text-gray-500">
                 <Info size={16} />
              </div>
              <div>
                 <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">League ID</p>
                 <p className="text-foreground font-bold">{league.leagueid}</p>
              </div>
           </div>
           <div className="bg-[var(--nav-hover)] border border-[var(--card-border)] p-4 rounded-2xl flex items-center gap-4">
              <div className="p-2 rounded-lg bg-[var(--card-bg)] text-gray-500">
                 <Map size={16} />
              </div>
              <div>
                 <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Region</p>
                 <p className="text-foreground font-bold uppercase">{league.region || 'International'}</p>
              </div>
           </div>
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
              <div className="grid grid-cols-1 gap-4">
                {matches.slice(0, 20).map(item => (
                  <div 
                    key={item.match_id} 
                    onClick={() => {
                      onClose();
                      router.push(`/match/${item.match_id}`);
                    }}
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
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-[var(--nav-hover)] rounded-3xl border border-dashed border-[var(--card-border)]">
                 <Calendar className="w-12 h-12 text-gray-700 mb-4" />
                 <p className="text-gray-500 font-bold italic">No recent match data available for this tournament</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
