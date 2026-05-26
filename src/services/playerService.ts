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
import { fetchFromOpenDota, ApiError } from './apiUtils';

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
 */
export function isProfilePrivate(profile: PlayerProfile | null): boolean {
  if (!profile || !profile.profile) return true;
  return profile.profile.communityvisibilitystate !== 3;
}

/**
 * Checks if match data is restricted.
 */
export function isDataRestricted(profile: PlayerProfile | null, matchCount: number = 0): boolean {
  if (isProfilePrivate(profile)) return true;
  return matchCount === 0 && !!profile?.last_match_time;
}

export async function searchPlayers(query: string): Promise<SearchResult[]> {
  let processedQuery = query.trim();

  if (/^\d{17}$/.test(processedQuery)) {
    processedQuery = convertSteam64To32(processedQuery);
  }

  // If it's a numeric ID, try fetching the profile directly first for speed
  if (/^\d+$/.test(processedQuery) && processedQuery.length < 12) {
    try {
      const profile = await getPlayerProfile(processedQuery);
      if (profile && profile.profile) {
        return [{
          account_id: profile.profile.account_id,
          personaname: profile.profile.personaname,
          avatarfull: profile.profile.avatarfull,
          last_match_time: profile.last_match_time
        }];
      }
    } catch {
      // If direct profile fetch fails, fall back to search
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    return await fetchFromOpenDota<SearchResult[]>(`/search?q=${encodeURIComponent(query)}`, {
      signal: controller.signal
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 408) {
      throw new ApiError('Search timed out. Try using a Steam ID for instant results.', 408);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function getPlayerHeroes(accountId: string | number): Promise<PlayerHero[]> {
  return fetchFromOpenDota<PlayerHero[]>(`/players/${accountId}/heroes`);
}

export async function getPlayerProfile(accountId: string | number): Promise<PlayerProfile> {
  return fetchFromOpenDota<PlayerProfile>(`/players/${accountId}`);
}

export async function getServerPlayerProfile(accountId: string | number): Promise<PlayerProfile> {
  return fetchFromOpenDota<PlayerProfile>(`/players/${accountId}`, {
    next: { revalidate: 600 }
  });
}

export async function getPlayerWinLoss(accountId: string | number, params: Record<string, string> = {}): Promise<WinLossStats> {
  const query = new URLSearchParams(params).toString();
  return fetchFromOpenDota<WinLossStats>(`/players/${accountId}/wl${query ? `?${query}` : ''}`);
}

export async function getServerPlayerWinLoss(accountId: string | number, params: Record<string, string> = {}): Promise<WinLossStats> {
  const query = new URLSearchParams(params).toString();
  return fetchFromOpenDota<WinLossStats>(`/players/${accountId}/wl${query ? `?${query}` : ''}`, {
    next: { revalidate: 600 }
  });
}

export async function getPlayerTotals(accountId: string | number, params: Record<string, string> = {}): Promise<PlayerTotal[]> {
  const query = new URLSearchParams(params).toString();
  return fetchFromOpenDota<PlayerTotal[]>(`/players/${accountId}/totals${query ? `?${query}` : ''}`);
}

export async function getPlayerCounts(accountId: string | number): Promise<PlayerCounts> {
  return fetchFromOpenDota<PlayerCounts>(`/players/${accountId}/counts`);
}

export async function getPlayerMatches(accountId: string | number, filters: PlayerMatchFilters = {}): Promise<RecentMatch[]> {
  const params = new URLSearchParams();
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.offset) params.append('offset', filters.offset.toString());
  if (filters.win !== undefined) params.append('win', filters.win.toString());
  if (filters.hero_id) params.append('hero_id', filters.hero_id.toString());
  if (filters.game_mode) params.append('game_mode', filters.game_mode.toString());
  if (filters.lobby_type) params.append('lobby_type', filters.lobby_type.toString());
  if (filters.date) params.append('date', filters.date.toString());

  const queryString = params.toString();
  return fetchFromOpenDota<RecentMatch[]>(`/players/${accountId}/matches${queryString ? `?${queryString}` : ''}`);
}

export async function getRecentMatches(accountId: string | number, limit: number = 20): Promise<RecentMatch[]> {
  const data = await fetchFromOpenDota<RecentMatch[]>(`/players/${accountId}/recentMatches`);
  return data.slice(0, limit);
}

export async function getPlayerPeers(accountId: string | number): Promise<Peer[]> {
  return fetchFromOpenDota<Peer[]>(`/players/${accountId}/peers`);
}

export async function getPlayerWordCloud(accountId: string | number): Promise<WordCloudData> {
  return fetchFromOpenDota<WordCloudData>(`/players/${accountId}/wordcloud`);
}

export async function getPlayerWardMap(accountId: string | number): Promise<WardMapData> {
  return fetchFromOpenDota<WardMapData>(`/players/${accountId}/wardmap`);
}

export async function getPlayerRatings(accountId: string | number): Promise<PlayerRating[]> {
  return fetchFromOpenDota<PlayerRating[]>(`/players/${accountId}/ratings`);
}

export async function getSharedStats(accountId: string | number, targetId: string | number): Promise<Peer | null> {
  const data = await fetchFromOpenDota<Peer[]>(`/players/${accountId}/peers?included_account_id=${targetId}`);
  return data.length > 0 ? data[0] : null;
}
