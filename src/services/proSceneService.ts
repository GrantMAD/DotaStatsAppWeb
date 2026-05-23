import { OPENDOTA_BASE_URL } from './constants';
import { 
  ProPlayer, 
  ProTeam, 
  League, 
  ProMatch 
} from '@/types';

export async function getProPlayers(): Promise<ProPlayer[]> {
  try {
    const response = await fetch(`${OPENDOTA_BASE_URL}/proPlayers`);
    if (!response.ok) throw new Error('Failed to fetch pro players');
    const data = (await response.json()) as ProPlayer[];
    return Array.from(new Map(data.map((p) => [p.account_id, p])).values());
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function getProTeams(): Promise<ProTeam[]> {
  try {
    const response = await fetch(`${OPENDOTA_BASE_URL}/teams`);
    if (!response.ok) throw new Error('Failed to fetch pro teams');
    const data = (await response.json()) as ProTeam[];
    const uniqueTeams = Array.from(new Map(data.map((t) => [t.team_id, t])).values());
    return uniqueTeams.sort((a, b) => b.rating - a.rating).slice(0, 500);
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function getLeagues(): Promise<League[]> {
  try {
    const response = await fetch(`${OPENDOTA_BASE_URL}/leagues`);
    if (!response.ok) throw new Error('Failed to fetch leagues');
    const data = (await response.json()) as League[];
    return Array.from(new Map(data.map((l) => [l.leagueid, l])).values());
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function getTeamRoster(teamId: number): Promise<ProPlayer[]> {
  try {
    const response = await fetch(`${OPENDOTA_BASE_URL}/teams/${teamId}/players`);
    if (!response.ok) throw new Error('Failed to fetch team players');
    const data = (await response.json()) as Array<ProPlayer & { is_current_team_member?: boolean }>;
    return data.filter((p) => p.is_current_team_member) as ProPlayer[];
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function getTeamMatches(teamId: number): Promise<ProMatch[]> {
  try {
    const response = await fetch(`${OPENDOTA_BASE_URL}/teams/${teamId}/matches`);
    if (!response.ok) throw new Error('Failed to fetch team matches');
    return await response.json();
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function getLeagueMatches(leagueId: number): Promise<ProMatch[]> {
  try {
    const response = await fetch(`${OPENDOTA_BASE_URL}/leagues/${leagueId}/matches`);
    if (!response.ok) throw new Error('Failed to fetch league matches');
    return await response.json();
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function getProMatches(limit: number = 10): Promise<ProMatch[]> {
  try {
    const response = await fetch(`${OPENDOTA_BASE_URL}/proMatches`);
    if (!response.ok) throw new Error('Failed to fetch pro matches');
    const data = await response.json();
    return data.slice(0, limit);
  } catch (error) {
    console.error('Error fetching pro matches:', error);
    return [];
  }
}

export async function getServerProMatches(limit: number = 10): Promise<ProMatch[]> {
  try {
    const response = await fetch(`${OPENDOTA_BASE_URL}/proMatches`, {
      next: { revalidate: 300 } // Cache for 5 minutes
    });
    if (!response.ok) throw new Error('Failed to fetch pro matches');
    const data = await response.json();
    return data.slice(0, limit);
  } catch (error) {
    console.error('Error fetching server pro matches:', error);
    return [];
  }
}
