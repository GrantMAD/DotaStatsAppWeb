'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { ProPlayer, ProTeam } from '@/services/opendota';
import { useTeamRoster, useTeamMatches, useProPlayers } from '@/hooks/useOpenDota';
import { Modal } from '../ui/Modal';
import { ProPlayerItem } from '../ui/ProPlayerItem';
import { ProMatchCard } from '../ui/ProMatchCard';
import { MatchDetailModal } from '../match/MatchDetailModal';
import { Skeleton } from '../ui/Skeleton';
import { Shield, Trophy, TrendingUp } from '@/components/ui/Icons';

interface TeamDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: ProTeam | null;
}

export function TeamDetailModal({ isOpen, onClose, team }: TeamDetailModalProps) {
  const teamId = isOpen && team ? team.team_id : null;
  const { data: roster = [], isLoading: loadingRoster } = useTeamRoster(teamId);
  const { data: matches = [], isLoading: loadingMatches } = useTeamMatches(teamId);
  const { data: proPlayers = [] } = useProPlayers();

  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);

  const enrichedRoster = useMemo<ProPlayer[]>(() => {
    return roster.map(member => {
      const proInfo = proPlayers.find(p => p.account_id === member.account_id);
      return {
        ...member,
        personaname: member.name || proInfo?.personaname || 'Unknown',
        avatarfull: proInfo?.avatarfull || proInfo?.avatar || '',
        team_name: team?.name,
        team_tag: team?.tag,
        is_pro: true
      } as ProPlayer;
    });
  }, [roster, proPlayers, team]);

  const loading = loadingRoster || loadingMatches;

  if (!team) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Team Details" size="xl">
      <MatchDetailModal 
        isOpen={selectedMatchId !== null}
        onClose={() => setSelectedMatchId(null)}
        matchId={selectedMatchId}
      />
      <div className="space-y-8 max-h-[80vh] overflow-y-auto pr-2 no-scrollbar">
        {/* Team Hero Section */}
        <div className="flex flex-col items-center text-center p-6 bg-(--nav-hover) rounded-3xl border border-(--card-border)">
          <div className="relative w-24 h-24 rounded-2xl bg-(--card-bg) flex items-center justify-center border border-(--card-border) shadow-2xl mb-6 overflow-hidden">
            {team.logo_url ? (
              <Image
                src={team.logo_url}
                alt={team.name}
                fill
                sizes="96px"
                className="object-contain p-2"
              />
            ) : (
              <Shield className="w-12 h-12 text-gray-700" />
            )}
          </div>
          
          <h2 className="text-3xl font-black text-foreground italic uppercase tracking-tighter mb-2">
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
            <div className="bg-(--card-bg) border border-(--card-border) px-6 py-3 rounded-2xl text-center">
              <p className="text-win text-2xl font-black italic">{team.wins}</p>
              <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Wins</p>
            </div>
            <div className="bg-(--card-bg) border border-(--card-border) px-6 py-3 rounded-2xl text-center">
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
            {enrichedRoster.length > 0 && (
              <div>
                <h3 className="text-lg font-black text-foreground uppercase tracking-tight mb-6 flex items-center gap-2">
                  <Shield size={20} className="text-gaming-accent" /> Current Roster
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {enrichedRoster.map(player => (
                    <ProPlayerItem 
                      key={player.account_id} 
                      player={player} 
                      onClick={() => { }} 
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Recent Matches Section */}
            {matches.length > 0 && (
              <div>
                <h3 className="text-lg font-black text-foreground uppercase tracking-tight mb-6 flex items-center gap-2">
                  <Trophy size={20} className="text-amber-500" /> Recent Pro Matches
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {matches.slice(0, 10).map(item => (
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
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
