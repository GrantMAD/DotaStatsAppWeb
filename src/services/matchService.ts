import { 
  MatchDetails, 
  LiveGame, 
  GlobalRecord 
} from '@/types';
import { fetchFromOpenDota } from './apiUtils';

export const GAME_MODES: Record<number, string> = {
  0: "Unknown",
  1: "All Pick",
  2: "Captains Mode",
  3: "Random Draft",
  4: "Single Draft",
  5: "All Random",
  22: "Ranked All Pick",
  23: "Turbo",
};

export async function getMatchDetails(matchId: number): Promise<MatchDetails> {
  return fetchFromOpenDota<MatchDetails>(`/matches/${matchId}`);
}

export async function getServerMatchDetails(matchId: number): Promise<MatchDetails> {
  return fetchFromOpenDota<MatchDetails>(`/matches/${matchId}`, {
    next: { revalidate: 3600 } // Cache for 1 hour
  });
}

export async function requestMatchParse(matchId: number): Promise<{ job: { jobId: string } }> {
  return fetchFromOpenDota<{ job: { jobId: string } }>(`/request/${matchId}`, {
    method: 'POST'
  });
}

export async function getLiveGames(): Promise<LiveGame[]> {
  const data = await fetchFromOpenDota<LiveGame[]>('/live');
  return data
    .filter((g) => g.average_mmr > 0)
    .sort((a, b) => b.average_mmr - a.average_mmr)
    .slice(0, 10);
}

export async function getGlobalRecords(field: string): Promise<GlobalRecord[]> {
  const data = await fetchFromOpenDota<GlobalRecord[]>(`/records/${field}`);
  return data.slice(0, 5);
}
