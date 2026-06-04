import { createClient } from '@/utils/supabase/client';

export type EventType =
  | 'page_view'
  | 'sign_in'
  | 'sign_up'
  | 'sign_out'
  | 'search'
  | 'hero_view'
  | 'match_view'
  | 'profile_view'
  | 'friend_action'
  | 'notification_click'
  | 'setting_change'
  | 'error'
  | 'comparison_view'
  | 'opendota_player_search'
  | 'opendota_match_view'
  | 'opendota_player_view'
  | 'opendota_hero_view'
  | 'opendota_meta_interaction';

interface AnalyticsEventPayload {
  eventType: EventType;
  metadata?: Record<string, unknown>;
  route?: string;
}

interface AnalyticsEvent {
  id?: string;
  user_id?: string;
  event_type: EventType;
  metadata?: Record<string, unknown>;
  platform: 'web';
  route?: string;
  session_id: string;
  created_at?: string;
}

export interface RecentlyViewedItem {
  id: string;
  type: 'hero' | 'match' | 'player';
  entityId: string | number;
  title: string;
  subtitle?: string;
  timestamp: string;
}

let sessionId = '';

/**
 * Initialize analytics session
 */
export function initializeAnalytics(): void {
  if (!sessionId) {
    sessionId = `web_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Get current session ID
 */
export function getSessionId(): string {
  if (!sessionId) {
    initializeAnalytics();
  }
  return sessionId;
}

/**
 * Track an analytics event via API endpoint
 */
export async function trackEvent(payload: AnalyticsEventPayload): Promise<void> {
  try {
    const supabase = createClient();

    // Get current user if available
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const event: AnalyticsEvent = {
      user_id: user?.id,
      event_type: payload.eventType,
      metadata: payload.metadata || {},
      platform: 'web',
      route: payload.route || (typeof window !== 'undefined' ? window.location.pathname : undefined),
      session_id: getSessionId(),
    };

    // Send event to API endpoint (bypasses RLS)
    const response = await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      console.error('Failed to track analytics event: HTTP', response.status);
    }
  } catch (err) {
    // Silently fail to not disrupt user experience
    console.warn('Analytics tracking error:', err);
  }
}

/**
 * Fetch recently viewed items for the current user or session
 */
export async function getRecentlyViewed(limit: number = 10): Promise<RecentlyViewedItem[]> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let query = supabase
      .from('analytics_events')
      .select('*')
      .in('event_type', [
        'hero_view', 
        'match_view', 
        'profile_view', 
        'opendota_match_view', 
        'opendota_player_view', 
        'opendota_hero_view'
      ])
      .order('created_at', { ascending: false });

    if (user) {
      query = query.eq('user_id', user.id);
    } else {
      query = query.eq('session_id', getSessionId());
    }

    const { data, error } = await query.limit(limit * 3);

    if (error) throw error;
    if (!data) return [];

    const seen = new Set<string>();
    const items: RecentlyViewedItem[] = [];

    for (const event of data) {
      if (items.length >= limit) break;

      let type: 'hero' | 'match' | 'player' = 'hero';
      let entityId: string | number = '';
      let title = '';
      let subtitle = '';

      const metadata = (event.metadata as Record<string, any>) || {};

      if (event.event_type.includes('hero')) {
        type = 'hero';
        entityId = metadata.heroId || metadata.hero_id;
        title = metadata.heroName || metadata.name || 'Unknown Hero';
        subtitle = 'Hero Profile';
      } else if (event.event_type.includes('match')) {
        type = 'match';
        entityId = metadata.matchId || metadata.match_id;
        title = `Match ${entityId}`;
        subtitle = metadata.isLive ? 'Live Match' : 'Match Details';
      } else if (event.event_type.includes('player') || event.event_type === 'profile_view') {
        type = 'player';
        entityId = metadata.accountId || metadata.account_id || metadata.profileId;
        title = metadata.name || metadata.personaname || `Player ${entityId}`;
        subtitle = metadata.section ? `Player ${metadata.section}` : 'Player Profile';
      }

      const key = `${type}_${entityId}`;
      if (entityId && !seen.has(key)) {
        seen.add(key);
        items.push({
          id: event.id!,
          type,
          entityId,
          title,
          subtitle,
          timestamp: event.created_at!,
        });
      }
    }

    return items;
  } catch (err) {
    console.warn('Error fetching recently viewed:', err);
    return [];
  }
}

/**
 * Fetch recent searches for the current user or session
 */
export async function getRecentSearches(limit: number = 5): Promise<string[]> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let query = supabase
      .from('analytics_events')
      .select('metadata')
      .in('event_type', ['search', 'opendota_player_search'])
      .order('created_at', { ascending: false });

    if (user) {
      query = query.eq('user_id', user.id);
    } else {
      query = query.eq('session_id', getSessionId());
    }

    const { data, error } = await query.limit(limit * 5); // Fetch extra to filter uniques

    if (error) throw error;
    if (!data) return [];

    const uniqueSearches = new Set<string>();
    const results: string[] = [];

    for (const event of data) {
      if (results.length >= limit) break;

      const metadata = (event.metadata as Record<string, any>) || {};
      const queryStr = metadata.query;

      if (queryStr && typeof queryStr === 'string' && !uniqueSearches.has(queryStr)) {
        uniqueSearches.add(queryStr);
        results.push(queryStr);
      }
    }

    return results;
  } catch (err) {
    console.warn('Error fetching recent searches:', err);
    return [];
  }
}

/**
 * Fetch community trending data (heroes and searches)
 */
export async function getCommunityTrending(): Promise<{ 
  heroes: Array<{ id: number, name: string, count: number }>, 
  searches: string[] 
}> {
  try {
    const response = await fetch('/api/analytics/community-trending');
    if (!response.ok) throw new Error('Failed to fetch community trending');
    
    const result = await response.json();
    return result.data || { heroes: [], searches: [] };
  } catch (err) {
    console.warn('Error fetching community trending:', err);
    return { heroes: [], searches: [] };
  }
}

/**
 * Track page view
 */
export async function trackPageView(pathname: string): Promise<void> {
  await trackEvent({
    eventType: 'page_view',
    route: pathname,
    metadata: { pathname },
  });
}

/**
 * Track authentication events
 */
export async function trackSignIn(): Promise<void> {
  await trackEvent({
    eventType: 'sign_in',
  });
}

export async function trackSignUp(): Promise<void> {
  await trackEvent({
    eventType: 'sign_up',
  });
}

export async function trackSignOut(): Promise<void> {
  await trackEvent({
    eventType: 'sign_out',
  });
}

/**
 * Track hero-related events
 */
export async function trackHeroView(heroId: number, heroName: string): Promise<void> {
  await trackEvent({
    eventType: 'hero_view',
    metadata: { heroId, heroName },
  });
}

/**
 * Track match-related events
 */
export async function trackMatchView(matchId: string): Promise<void> {
  await trackEvent({
    eventType: 'match_view',
    metadata: { matchId },
  });
}

/**
 * Track profile view
 */
export async function trackProfileView(profileId: string): Promise<void> {
  await trackEvent({
    eventType: 'profile_view',
    metadata: { profileId },
  });
}

/**
 * Track search
 */
export async function trackSearch(query: string, resultsCount: number): Promise<void> {
  await trackEvent({
    eventType: 'search',
    metadata: { query, resultsCount },
  });
}

/**
 * Track friend actions
 */
export async function trackFriendAction(action: 'add' | 'remove', userId: string): Promise<void> {
  await trackEvent({
    eventType: 'friend_action',
    metadata: { action, userId },
  });
}

/**
 * Track comparison view
 */
export async function trackComparisonView(
  comparisonType: string,
  itemsCount: number
): Promise<void> {
  await trackEvent({
    eventType: 'comparison_view',
    metadata: { comparisonType, itemsCount },
  });
}

/**
 * Track OpenDota specific interactions
 */
export async function trackOpenDotaPlayerSearch(query: string, resultsCount: number): Promise<void> {
  await trackEvent({
    eventType: 'opendota_player_search',
    metadata: { query, resultsCount },
  });
}

export async function trackOpenDotaMatchView(matchId: string, isLive: boolean = false): Promise<void> {
  await trackEvent({
    eventType: 'opendota_match_view',
    metadata: { matchId, isLive },
  });
}

export async function trackOpenDotaPlayerView(accountId: string, section: string = 'overview'): Promise<void> {
  await trackEvent({
    eventType: 'opendota_player_view',
    metadata: { accountId, section },
  });
}

export async function trackOpenDotaHeroView(heroId: number, heroName: string, section: string = 'overview'): Promise<void> {
  await trackEvent({
    eventType: 'opendota_hero_view',
    metadata: { heroId, heroName, section },
  });
}

export async function trackOpenDotaMetaInteraction(tool: string, action?: string): Promise<void> {
  await trackEvent({
    eventType: 'opendota_meta_interaction',
    metadata: { tool, action },
  });
}

/**
 * Track OpenDota Data Snapshots (Rich Metadata)
 */
export async function trackHeroSnapshot(heroData: any): Promise<void> {
  await trackEvent({
    eventType: 'opendota_hero_snapshot',
    metadata: {
      hero_id: heroData.id,
      name: heroData.localized_name || heroData.name,
      win_rate_pub: heroData.pub_win_rate,
      win_rate_pro: heroData.pro_win_rate,
      pick_rate: heroData.pick_rate,
      ban_rate: heroData.ban_rate,
      primary_attribute: heroData.primary_attr,
      roles: heroData.roles,
    },
  });
}

export async function trackMatchSnapshot(matchData: any): Promise<void> {
  await trackEvent({
    eventType: 'opendota_match_snapshot',
    metadata: {
      match_id: matchData.match_id,
      duration: matchData.duration,
      outcome: matchData.radiant_win ? 'radiant_win' : 'dire_win',
      final_score: {
        radiant: matchData.radiant_score,
        dire: matchData.dire_score,
      },
      game_mode: matchData.game_mode,
      lobby_type: matchData.lobby_type,
    },
  });
}

export async function trackPlayerSnapshot(playerData: any): Promise<void> {
  await trackEvent({
    eventType: 'opendota_player_snapshot',
    metadata: {
      account_id: playerData.profile?.account_id,
      rank_tier: playerData.rank_tier,
      is_pro: !!playerData.profile?.name,
      plus_subscriber: playerData.profile?.plus,
    },
  });
}

/**
 * Track error
 */
export async function trackError(errorType: string, message: string): Promise<void> {
  await trackEvent({
    eventType: 'error',
    metadata: { errorType, message },
  });
}
