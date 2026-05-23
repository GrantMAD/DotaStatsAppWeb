import { OPENDOTA_BASE_URL } from './constants';
import { 
  PlayerProfile, 
  SearchResult, 
  WinLossStats, 
  PlayerTotal, 
  PlayerCounts, 
  RecentMatch, 
  Peer, 
  PlayerHero, 
  PlayerMatchFilters,
  WordCloudData,
  WardMapData,
  PlayerRating
} from '@/types';

function convertSteam64To32(steam64: string): string {
  try {
    const bigInt64 = BigInt(steam64);
    const offset = BigInt('76561197960265728');
    return (bigInt64 - offset).toString();
  } catch {
    return steam64;
  }
}

/**
 * Checks if a Steam profile is private based on its visibility state.
 * 3 = Public, 1 = Private/Friends Only.
 */
export function isProfilePrivate(profile: PlayerProfile | null): boolean {
  if (!profile || !profile.profile) return true;
  return profile.profile.communityvisibilitystate !== 3;
}

/**
 * Checks if match data is restricted (likely "Expose Public Match Data" is off).
 * Even if a profile is public, match data might be empty.
 */
export function isDataRestricted(profile: PlayerProfile | null, matchCount: number = 0): boolean {
  if (isProfilePrivate(profile)) return true;
  // If profile is public but has no recent matches and it's not a new account
  return matchCount === 0 && !!profile?.last_match_time;
}

export async function searchPlayers(query: string): Promise<SearchResult[]> {
  let processedQuery = query.trim();

  if (/^\d{17}$/.test(processedQuery)) {
    processedQuery = convertSteam64To32(processedQuery);
  }

  if (/^\d+$/.test(processedQuery) && processedQuery.length < 12) {
    const profile = await getPlayerProfile(processedQuery);
    if (profile && profile.profile) {
      return [{
        account_id: profile.profile.account_id,
        personaname: profile.profile.personaname,
        avatarfull: profile.profile.avatarfull,
        last_match_time: profile.last_match_time
      }];
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(`${OPENDOTA_BASE_URL}/search?q=${encodeURIComponent(query)}`, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) throw new Error(`Search failed with status: ${response.status}`);
    const data = await response.json();
    return data;
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    if (
      typeof error === 'object' &&
      error !== null &&
      'name' in error &&
      (error as Record<string, unknown>).name === 'AbortError'
    ) {
      throw new Error('Search timed out. Try using a Steam ID for instant results.');
    }
    throw error;
  }
}

export async function getPlayerHeroes(accountId: string | number): Promise<PlayerHero[]> {
  try {
    const response = await fetch(`${OPENDOTA_BASE_URL}/players/${accountId}/heroes`);
    if (!response.ok) return [];
    return await response.json();
  } catch {
    return [];
  }
}

export async function getPlayerProfile(accountId: string | number): Promise<PlayerProfile | null> {
  try {
    const response = await fetch(`${OPENDOTA_BASE_URL}/players/${accountId}`);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

export async function getPlayerWinLoss(accountId: string | number, params: Record<string, string> = {}): Promise<WinLossStats | null> {
  try {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${OPENDOTA_BASE_URL}/players/${accountId}/wl${query ? `?${query}` : ''}`);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

export async function getPlayerTotals(accountId: string | number, params: Record<string, string> = {}): Promise<PlayerTotal[]> {
  try {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${OPENDOTA_BASE_URL}/players/${accountId}/totals${query ? `?${query}` : ''}`);
    if (!response.ok) return [];
    return await response.json();
  } catch {
    return [];
  }
}

export async function getPlayerCounts(accountId: string | number): Promise<PlayerCounts | null> {
  try {
    const response = await fetch(`${OPENDOTA_BASE_URL}/players/${accountId}/counts`);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

export async function getPlayerMatches(accountId: string | number, filters: PlayerMatchFilters = {}): Promise<RecentMatch[]> {
  try {
    const params = new URLSearchParams();
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.offset) params.append('offset', filters.offset.toString());
    if (filters.win !== undefined) params.append('win', filters.win.toString());
    if (filters.hero_id) params.append('hero_id', filters.hero_id.toString());
    if (filters.game_mode) params.append('game_mode', filters.game_mode.toString());
    if (filters.lobby_type) params.append('lobby_type', filters.lobby_type.toString());
    if (filters.date) params.append('date', filters.date.toString());

    const queryString = params.toString();
    const url = `${OPENDOTA_BASE_URL}/players/${accountId}/matches${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url);
    if (!response.ok) return [];
    return await response.json();
  } catch {
    return [];
  }
}

export async function getRecentMatches(accountId: string | number, limit: number = 20): Promise<RecentMatch[]> {
  try {
    const response = await fetch(`${OPENDOTA_BASE_URL}/players/${accountId}/recentMatches`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.slice(0, limit);
  } catch {
    return [];
  }
}

export async function getPlayerPeers(accountId: string | number): Promise<Peer[]> {
  try {
    const response = await fetch(`${OPENDOTA_BASE_URL}/players/${accountId}/peers`);
    if (!response.ok) return [];
    return await response.json();
  } catch {
    return [];
  }
}

export async function getPlayerWordCloud(accountId: string | number): Promise<WordCloudData | null> {
  try {
    const response = await fetch(`${OPENDOTA_BASE_URL}/players/${accountId}/wordcloud`);
    if (!response.ok) throw new Error('Failed to fetch word cloud');
    return await response.json();
  } catch (error) {
    console.error('Error fetching word cloud:', error);
    return null;
  }
}

export async function getPlayerWardMap(accountId: string | number): Promise<WardMapData | null> {
  try {
    const response = await fetch(`${OPENDOTA_BASE_URL}/players/${accountId}/wardmap`);
    if (!response.ok) throw new Error('Failed to fetch ward map');
    return await response.json();
  } catch (error) {
    console.error('Error fetching ward map:', error);
    return null;
  }
}

export async function getPlayerRatings(accountId: string | number): Promise<PlayerRating[]> {
  try {
    const response = await fetch(`${OPENDOTA_BASE_URL}/players/${accountId}/ratings`);
    if (!response.ok) throw new Error('Failed to fetch ratings');
    return await response.json();
  } catch (error) {
    console.error('Error fetching ratings:', error);
    return [];
  }
}

/**
 * Fetches pinpoint accurate win/loss data between two specific players 
 * across their entire match history using the included_account_id filter.
 */
export async function getSharedStats(accountId: string | number, targetId: string | number): Promise<Peer | null> {
  try {
    const response = await fetch(`${OPENDOTA_BASE_URL}/players/${accountId}/peers?included_account_id=${targetId}`);
    if (!response.ok) throw new Error('Failed to fetch shared stats');
    const data = await response.json();
    return data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Error fetching shared stats:', error);
    return null;
  }
}
