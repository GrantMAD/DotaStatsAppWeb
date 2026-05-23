import { OPENDOTA_BASE_URL } from './constants';
import { 
  MatchDetails, 
  LiveGame, 
  GlobalRecord 
} from '@/types';

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

export async function getMatchDetails(matchId: number): Promise<MatchDetails | null> {
  try {
    const response = await fetch(`${OPENDOTA_BASE_URL}/matches/${matchId}`);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

export async function getServerMatchDetails(matchId: number): Promise<MatchDetails | null> {
  try {
    const response = await fetch(`${OPENDOTA_BASE_URL}/matches/${matchId}`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

export async function requestMatchParse(matchId: number): Promise<{ job: { jobId: string } } | null> {
  try {
    const response = await fetch(`${OPENDOTA_BASE_URL}/request/${matchId}`, {
      method: 'POST'
    });
    if (!response.ok) throw new Error('Failed to request match parse');
    return await response.json();
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function getLiveGames(): Promise<LiveGame[]> {
  try {
    const response = await fetch(`${OPENDOTA_BASE_URL}/live`);
    if (!response.ok) throw new Error('Failed to fetch live games');
    const data = (await response.json()) as LiveGame[];
    return data
      .filter((g) => g.average_mmr > 0)
      .sort((a, b) => b.average_mmr - a.average_mmr)
      .slice(0, 10);
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function getGlobalRecords(field: string): Promise<GlobalRecord[]> {
  try {
    const response = await fetch(`${OPENDOTA_BASE_URL}/records/${field}`);
    if (!response.ok) throw new Error('Failed to fetch global records');
    const data = await response.json();
    return data.slice(0, 5);
  } catch (e) {
    console.error(e);
    return [];
  }
}
