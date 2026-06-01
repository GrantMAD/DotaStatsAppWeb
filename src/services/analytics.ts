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
  | 'comparison_view';

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
 * Track error
 */
export async function trackError(errorType: string, message: string): Promise<void> {
  await trackEvent({
    eventType: 'error',
    metadata: { errorType, message },
  });
}
