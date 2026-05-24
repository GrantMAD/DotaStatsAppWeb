'use client';

import React, { useState, useMemo } from 'react';
import { Trophy, Search, X } from '@/components/ui/Icons';
import { LeagueCard } from '@/components/ui/LeagueCard';
import { TeamListItem } from '@/components/ui/TeamListItem';
import { ProPlayerItem } from '@/components/ui/ProPlayerItem';
import { cn } from '@/utils/cn';
import { ProTeam, LiveGame, ProMatch, League, ProPlayer } from '@/types';
import dynamic from 'next/dynamic';

const TeamDetailModal = dynamic(() => import('@/components/pro/TeamDetailModal').then(mod => mod.TeamDetailModal), { ssr: false });
const LeagueDetailModal = dynamic(() => import('@/components/pro/LeagueDetailModal').then(mod => mod.LeagueDetailModal), { ssr: false });
const PlayerDetailModal = dynamic(() => import('@/components/profile/PlayerDetailModal').then(mod => mod.PlayerDetailModal), { ssr: false });
const MatchDetailModal = dynamic(() => import('@/components/match/MatchDetailModal').then(mod => mod.MatchDetailModal), { ssr: false });

type TabType = 'Tournaments' | 'Teams' | 'Players';
type SubTabType = 'Premium' | 'Professional' | 'Amateur';

interface ProPageClientProps {
  initialLeagues: League[];
  initialTeams: ProTeam[];
  initialPlayers: ProPlayer[];
  initialLiveGames: LiveGame[];
  initialRecentProMatches: ProMatch[];
}

export function ProPageClient({ 
  initialLeagues, 
  initialTeams, 
  initialPlayers, 
  initialLiveGames, 
  initialRecentProMatches 
}: ProPageClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>('Tournaments');
  const [subTab, setSubTab] = useState<SubTabType>('Premium');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Archived'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedTeam, setSelectedTeam] = useState<ProTeam | null>(null);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  const [isLeagueModalOpen, setIsLeagueModalOpen] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const selectedMatchId = null;
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);

  const [fortyEightHoursAgo] = useState<number>(() => Math.floor(Date.now() / 1000) - (48 * 60 * 60));

  const activeLeagueIds = useMemo(() => {
    const ids = new Set<number>();
    
    initialLiveGames.forEach((game) => {
      const enrichedGame = game as LiveGame & { league_id?: number };
      if (typeof enrichedGame.league_id === 'number') ids.add(enrichedGame.league_id);
    });

    initialRecentProMatches.forEach(match => {
      if (match.start_time > fortyEightHoursAgo) {
        ids.add(match.leagueid);
      }
    });

    return ids;
  }, [initialLiveGames, initialRecentProMatches, fortyEightHoursAgo]);

  const filteredLeagues = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    let baseLeagues = initialLeagues;
    
    if (subTab === 'Premium') {
      baseLeagues = initialLeagues.filter((l) => l.tier === 'premium');
    } else if (subTab === 'Professional') {
      baseLeagues = initialLeagues.filter((l) => l.tier === 'professional');
    } else {
      baseLeagues = initialLeagues.filter((l) => l.tier !== 'premium' && l.tier !== 'professional');
    }

    if (statusFilter === 'Active') {
      baseLeagues = baseLeagues.filter(l => activeLeagueIds.has(l.leagueid));
    } else if (statusFilter === 'Archived') {
      baseLeagues = baseLeagues.filter(l => !activeLeagueIds.has(l.leagueid));
    }

    if (!query) return baseLeagues;
    return baseLeagues.filter((l) => l.name.toLowerCase().includes(query));
  }, [initialLeagues, searchQuery, subTab, statusFilter, activeLeagueIds]);

  const filteredTeams = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    let baseTeams = initialTeams;
    if (subTab === 'Premium') {
      baseTeams = initialTeams.filter((t) => t.rating >= 1400);
    } else if (subTab === 'Professional') {
      baseTeams = initialTeams.filter((t) => t.rating >= 1150 && t.rating < 1400);
    } else {
      baseTeams = initialTeams.filter((t) => t.rating < 1150);
    }
    if (!query) return baseTeams;
    return baseTeams.filter(
      (t) =>
        t.name.toLowerCase().includes(query) || (t.tag && t.tag.toLowerCase().includes(query))
    );
  }, [initialTeams, searchQuery, subTab]);

  const filteredPlayers = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    let basePlayers = initialPlayers;
    if (subTab === 'Premium') {
      const premiumTeamNames = initialTeams.filter((t) => t.rating >= 1400).map((t) => t.name);
      basePlayers = initialPlayers.filter((p) => p.team_name && premiumTeamNames.includes(p.team_name));
    } else if (subTab === 'Professional') {
      const premiumTeamNames = initialTeams.filter((t) => t.rating >= 1400).map((t) => t.name);
      basePlayers = initialPlayers.filter(
        (p) => p.team_name && !premiumTeamNames.includes(p.team_name)
      );
    } else {
      basePlayers = initialPlayers.filter((p) => !p.team_name);
    }
    if (!query) return basePlayers.slice(0, 50);
    return basePlayers
      .filter(
        (p) =>
          p.personaname.toLowerCase().includes(query) ||
          (p.full_name && p.full_name.toLowerCase().includes(query)) ||
          (p.team_name && p.team_name.toLowerCase().includes(query))
      )
      .slice(0, 100);
  }, [initialPlayers, initialTeams, searchQuery, subTab]);

  const handleItemClick = (id: number) => {
    if (activeTab === 'Players') {
      setSelectedPlayerId(id);
      setIsPlayerModalOpen(true);
    } else if (activeTab === 'Teams') {
      const team = initialTeams.find(t => t.team_id === id);
      if (team) {
        setSelectedTeam(team);
        setIsTeamModalOpen(true);
      }
    } else if (activeTab === 'Tournaments') {
      const league = initialLeagues.find(l => l.leagueid === id);
      if (league) {
        setSelectedLeague(league);
        setIsLeagueModalOpen(true);
      }
    }
  };

  return (
    <div className="container-custom py-8">
      <TeamDetailModal 
        isOpen={isTeamModalOpen} 
        onClose={() => setIsTeamModalOpen(false)} 
        team={selectedTeam} 
      />
      <LeagueDetailModal 
        isOpen={isLeagueModalOpen} 
        onClose={() => setIsLeagueModalOpen(false)} 
        league={selectedLeague} 
        isActive={selectedLeague ? activeLeagueIds.has(selectedLeague.leagueid) : false}
      />
      <PlayerDetailModal
        isOpen={isPlayerModalOpen}
        onClose={() => setIsPlayerModalOpen(false)}
        accountId={selectedPlayerId?.toString() || null}
      />
      <MatchDetailModal
        isOpen={isMatchModalOpen}
        onClose={() => setIsMatchModalOpen(false)}
        matchId={selectedMatchId}
      />
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gaming-accent/20 rounded-2xl border border-gaming-accent/50">
            <Trophy className="w-8 h-8 text-gaming-accent" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-foreground italic uppercase tracking-wider">
              Pro <span className="text-gaming-accent">Scene</span>
            </h1>
            <p className="text-muted-foreground">Track professional matches and player performances</p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex bg-(--nav-hover) p-1 rounded-xl border border-(--card-border) self-start md:self-end">
            {(['Tournaments', 'Teams', 'Players'] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setSearchQuery('');
                }}
                className={cn(
                  "px-6 py-2 rounded-lg text-sm font-bold uppercase tracking-widest transition-all",
                  activeTab === tab 
                    ? "bg-gaming-accent text-white shadow-lg shadow-gaming-accent/20" 
                    : "text-muted-foreground hover:text-foreground hover:bg-(--glass-start)"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 mb-8">
        <div className="flex gap-2 bg-(--nav-hover) p-1 rounded-full border border-(--card-border) self-start">
          {(['Premium', 'Professional', 'Amateur'] as SubTabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setSubTab(tab);
                setSearchQuery('');
              }}
              className={cn(
                "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                subTab === tab 
                  ? "bg-gaming-accent text-white" 
                  : "text-muted-foreground hover:text-foreground hover:bg-(--glass-start)"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'Tournaments' && (
          <div className="flex gap-2 bg-(--nav-hover) p-1 rounded-full border border-(--card-border) self-start">
            {(['All', 'Active', 'Archived'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                  statusFilter === status 
                    ? "bg-win text-white shadow-lg shadow-win/20" 
                    : "text-muted-foreground hover:text-foreground hover:bg-(--glass-start)"
                )}
              >
                {status}
              </button>
            ))}
          </div>
        )}

        <div className="relative w-full max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={`Search ${subTab} ${activeTab.toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-(--nav-hover) border border-(--card-border) rounded-xl py-3 pl-12 pr-12 text-foreground placeholder:text-gray-600 focus:outline-none focus:border-gaming-accent/50 focus:bg-(--card-bg) transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-(--nav-hover) rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      <div className={cn(
        "grid gap-6",
        activeTab === 'Tournaments' 
          ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
          : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
      )}>
        {activeTab === 'Tournaments' && filteredLeagues.map((league) => (
          <LeagueCard 
            key={league.leagueid} 
            league={league} 
            isActive={activeLeagueIds.has(league.leagueid)}
            onClick={handleItemClick} 
          />
        ))}

        {activeTab === 'Teams' && filteredTeams.map((team, index) => (
          <TeamListItem 
            key={team.team_id} 
            team={team} 
            rank={index + 1}
            onClick={handleItemClick} 
          />
        ))}

        {activeTab === 'Players' && filteredPlayers.map((player) => (
          <ProPlayerItem 
            key={player.account_id} 
            player={player} 
            onClick={handleItemClick} 
          />
        ))}
      </div>

      {(
        (activeTab === 'Tournaments' && filteredLeagues.length === 0) ||
        (activeTab === 'Teams' && filteredTeams.length === 0) ||
        (activeTab === 'Players' && filteredPlayers.length === 0)
      ) && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-(--nav-hover) rounded-full flex items-center justify-center mb-6 border border-(--card-border)">
            <Search className="w-10 h-10 text-gray-700" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">No results found</h3>
          <p className="text-muted-foreground max-w-xs">
            We couldn&apos;t find any {activeTab.toLowerCase()} matching &quot;{searchQuery}&quot; in the {subTab} tier.
          </p>
        </div>
      )}
    </div>
  );
}
