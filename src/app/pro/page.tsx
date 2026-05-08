'use client';

import React, { useState, useMemo } from 'react';
import { Trophy, Users, Shield, Search, X } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { useLeagues, useProTeams, useProPlayers } from '@/hooks/useOpenDota';
import { LeagueCard } from '@/components/ui/LeagueCard';
import { TeamListItem } from '@/components/ui/TeamListItem';
import { ProPlayerItem } from '@/components/ui/ProPlayerItem';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/utils/cn';

type TabType = 'Tournaments' | 'Teams' | 'Players';
type SubTabType = 'Premium' | 'Professional' | 'Amateur';

import { useRouter } from 'next/navigation';
import { TeamDetailModal } from '@/components/pro/TeamDetailModal';
import { LeagueDetailModal } from '@/components/pro/LeagueDetailModal';
import { ProTeam, ProPlayer } from '@/services/opendota';

export default function ProPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('Tournaments');
  const [subTab, setSubTab] = useState<SubTabType>('Premium');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedTeam, setSelectedTeam] = useState<ProTeam | null>(null);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState<any | null>(null);
  const [isLeagueModalOpen, setIsLeagueModalOpen] = useState(false);

  const { data: leagues = [], isLoading: loadingLeagues } = useLeagues();
  const { data: teams = [], isLoading: loadingTeams } = useProTeams();
  const { data: players = [], isLoading: loadingPlayers } = useProPlayers();

  const isLoading = loadingLeagues || loadingTeams || loadingPlayers;

  const filteredLeagues = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    let baseLeagues = leagues;
    if (subTab === 'Premium') {
      baseLeagues = leagues.filter((l) => l.tier === 'premium');
    } else if (subTab === 'Professional') {
      baseLeagues = leagues.filter((l) => l.tier === 'professional');
    } else {
      baseLeagues = leagues.filter((l) => l.tier !== 'premium' && l.tier !== 'professional');
    }
    if (!query) return baseLeagues;
    return baseLeagues.filter((l) => l.name.toLowerCase().includes(query));
  }, [leagues, searchQuery, subTab]);

  const filteredTeams = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    let baseTeams = teams;
    if (subTab === 'Premium') {
      baseTeams = teams.filter((t) => t.rating >= 1400);
    } else if (subTab === 'Professional') {
      baseTeams = teams.filter((t) => t.rating >= 1150 && t.rating < 1400);
    } else {
      baseTeams = teams.filter((t) => t.rating < 1150);
    }
    if (!query) return baseTeams;
    return baseTeams.filter(
      (t) =>
        t.name.toLowerCase().includes(query) || (t.tag && t.tag.toLowerCase().includes(query))
    );
  }, [teams, searchQuery, subTab]);

  const filteredPlayers = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    let basePlayers = players;
    if (subTab === 'Premium') {
      const premiumTeamNames = teams.filter((t) => t.rating >= 1400).map((t) => t.name);
      basePlayers = players.filter((p) => p.team_name && premiumTeamNames.includes(p.team_name));
    } else if (subTab === 'Professional') {
      const premiumTeamNames = teams.filter((t) => t.rating >= 1400).map((t) => t.name);
      basePlayers = players.filter(
        (p) => p.team_name && !premiumTeamNames.includes(p.team_name)
      );
    } else {
      basePlayers = players.filter((p) => !p.team_name);
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
  }, [players, teams, searchQuery, subTab]);

  const handleItemClick = (id: number) => {
    if (activeTab === 'Players') {
      router.push(`/profile/${id}`);
    } else if (activeTab === 'Teams') {
      const team = teams.find(t => t.team_id === id);
      if (team) {
        setSelectedTeam(team);
        setIsTeamModalOpen(true);
      }
    } else if (activeTab === 'Tournaments') {
      const league = leagues.find(l => l.leagueid === id);
      if (league) {
        setSelectedLeague(league);
        setIsLeagueModalOpen(true);
      }
    }
  };

  return (
    <div className="container-custom py-8">
      {/* ... rest of existing return ... */}
      <TeamDetailModal 
        isOpen={isTeamModalOpen} 
        onClose={() => setIsTeamModalOpen(false)} 
        team={selectedTeam} 
      />
      <LeagueDetailModal 
        isOpen={isLeagueModalOpen} 
        onClose={() => setIsLeagueModalOpen(false)} 
        league={selectedLeague} 
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
            <p className="text-gray-400">Track professional matches and player performances</p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {/* Main Tabs */}
          <div className="flex bg-[var(--nav-hover)] p-1 rounded-xl border border-[var(--card-border)] self-start md:self-end">
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
                    : "text-gray-500 hover:text-foreground hover:bg-[var(--glass-start)]"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        {/* Sub Tabs */}
        <div className="flex gap-2 bg-[var(--nav-hover)] p-1 rounded-full border border-[var(--card-border)] self-start">
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
                  : "text-gray-500 hover:text-foreground hover:bg-[var(--glass-start)]"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder={`Search ${subTab} ${activeTab.toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--nav-hover)] border border-[var(--card-border)] rounded-xl py-3 pl-12 pr-12 text-foreground placeholder:text-gray-600 focus:outline-none focus:border-gaming-accent/50 focus:bg-[var(--card-bg)] transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-[var(--nav-hover)] rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="glass-card p-4 h-24 flex items-center gap-4">
              <Skeleton className="w-14 h-14 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
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
      )}

      {!isLoading && (
        (activeTab === 'Tournaments' && filteredLeagues.length === 0) ||
        (activeTab === 'Teams' && filteredTeams.length === 0) ||
        (activeTab === 'Players' && filteredPlayers.length === 0)
      ) && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-[var(--nav-hover)] rounded-full flex items-center justify-center mb-6 border border-[var(--card-border)]">
            <Search className="w-10 h-10 text-gray-700" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">No results found</h3>
          <p className="text-gray-500 max-w-xs">
            We couldn't find any {activeTab.toLowerCase()} matching "{searchQuery}" in the {subTab} tier.
          </p>
        </div>
      )}
    </div>
  );
}
