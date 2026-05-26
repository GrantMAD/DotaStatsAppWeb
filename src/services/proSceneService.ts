import { 
  ProPlayer, 
  ProTeam, 
  League, 
  ProMatch 
} from '@/types';
import { fetchFromOpenDota } from './apiUtils';

export async function getProPlayers(): Promise<ProPlayer[]> {
  const data = await fetchFromOpenDota<ProPlayer[]>('/proPlayers');
  return Array.from(new Map(data.map((p) => [p.account_id, p])).values());
}

export async function getProTeams(): Promise<ProTeam[]> {
  const data = await fetchFromOpenDota<ProTeam[]>('/teams');
  const uniqueTeams = Array.from(new Map(data.map((t) => [t.team_id, t])).values());
  return uniqueTeams.sort((a, b) => b.rating - a.rating).slice(0, 500);
}

export async function getLeagues(): Promise<League[]> {
  const data = await fetchFromOpenDota<League[]>('/leagues');
  return Array.from(new Map(data.map((l) => [l.leagueid, l])).values());
}

export async function getTeamRoster(teamId: number): Promise<ProPlayer[]> {
  const data = await fetchFromOpenDota<Array<ProPlayer & { is_current_team_member?: boolean }>>(`/teams/${teamId}/players`);
  return data.filter((p) => p.is_current_team_member) as ProPlayer[];
}

export async function getTeamMatches(teamId: number): Promise<ProMatch[]> {
  return fetchFromOpenDota<ProMatch[]>(`/teams/${teamId}/matches`);
}

export async function getLeagueMatches(leagueId: number): Promise<ProMatch[]> {
  return fetchFromOpenDota<ProMatch[]>(`/leagues/${leagueId}/matches`);
}

export async function getProMatches(limit: number = 10): Promise<ProMatch[]> {
  const data = await fetchFromOpenDota<ProMatch[]>('/proMatches');
  return data.slice(0, limit);
}

export async function getServerProMatches(limit: number = 10): Promise<ProMatch[]> {
  const data = await fetchFromOpenDota<ProMatch[]>('/proMatches', {
    next: { revalidate: 300 } // Cache for 5 minutes
  });
  return data.slice(0, limit);
}
