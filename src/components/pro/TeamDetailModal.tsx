'use client';

import React from 'react';
import { ProTeam } from '@/services/opendota';
import { useTeamRoster, useTeamMatches } from '@/hooks/useOpenDota';
import { Modal } from '../ui/Modal';
import { ProPlayerItem } from '../ui/ProPlayerItem';
import { ProMatchCard } from '../ui/ProMatchCard';
import { Skeleton } from '../ui/Skeleton';
import { Shield, Trophy, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TeamDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: ProTeam | null;
}

export function TeamDetailModal({ isOpen, onClose, team }: TeamDetailModalProps) {
  const router = useRouter();
  const teamId = isOpen && team ? team.team_id : null;
  const { data: roster = [], isLoading: loadingRoster } = useTeamRoster(teamId);
  const { data: matches = [], isLoading: loadingMatches } = useTeamMatches(teamId);

  const loading = loadingRoster || loadingMatches;

  if (!team) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Team Details" size="xl">
      <div className="space-y-8 max-h-[80vh] overflow-y-auto pr-2 no-scrollbar">
        {/* Team Hero Section */}
        <div className="flex flex-col items-center text-center p-6 bg-white/5 rounded-3xl border border-white/10">
          <div className="w-24 h-24 rounded-2xl bg-black/40 flex items-center justify-center border border-white/10 shadow-2xl mb-6">
            {team.logo_url ? (
              <img src={team.logo_url} alt={team.name} className="w-16 h-16 object-contain" />
            ) : (
              <Shield className="w-12 h-12 text-gray-700" />
            )}
          </div>
          
          <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2">
            {team.name}
          </h2>
          <div className="flex items-center gap-3 text-gaming-accent font-black uppercase text-xs tracking-widest">
            {team.tag && <span>[{team.tag}]</span>}
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span className="flex items-center gap-1">
               <TrendingUp size={14} /> Rating: {Math.round(team.rating)}
            </span>
          </div>
          
          <div className="flex gap-4 mt-8">
            <div className="bg-black/40 border border-white/5 px-6 py-3 rounded-2xl text-center">
              <p className="text-win text-2xl font-black italic">{team.wins}</p>
              <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Wins</p>
            </div>
            <div className="bg-black/40 border border-white/5 px-6 py-3 rounded-2xl text-center">
              <p className="text-loss text-2xl font-black italic">{team.losses}</p>
              <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Losses</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-6">
            <Skeleton className="h-8 w-48 rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-20 rounded-2xl" />)}
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Roster Section */}
            {roster.length > 0 && (
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-tight mb-6 flex items-center gap-2">
                  <Shield size={20} className="text-gaming-accent" /> Current Roster
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {roster.map(player => (
                    <ProPlayerItem 
                      key={player.account_id} 
                      player={player} 
                      onClick={(id) => {
                        onClose();
                        router.push(`/profile/${id}`);
                      }} 
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Recent Matches Section */}
            {matches.length > 0 && (
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-tight mb-6 flex items-center gap-2">
                  <Trophy size={20} className="text-amber-500" /> Recent Pro Matches
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {matches.slice(0, 10).map(item => (
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
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
