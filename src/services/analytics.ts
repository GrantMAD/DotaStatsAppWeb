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
  user_id?: string;
  event_type: EventType;
  metadata?: Record<string, unknown>;
  platform: 'web';
  route?: string;
  session_id: string;
  created_at?: string;
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
      route: payload.route || typeof window !== 'undefined' ? window.location.pathname : undefined,
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
