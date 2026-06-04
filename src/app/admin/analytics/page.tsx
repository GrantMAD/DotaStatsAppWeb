'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { BarChart2, ArrowLeft, Clock, Navigation, Monitor } from '@/components/ui/Icons';
import { AdminSkeleton } from '@/components/ui/AdminSkeleton';
import { cn } from '@/utils/cn';
import { formatDistanceToNow } from 'date-fns';

interface RawEvent {
  id: string;
  user_id: string | null;
  event_type: string;
  platform: string;
  route: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

interface EventStats {
  eventType: string;
  count: number;
  platform: string;
}

interface PlatformStats {
  platform: string;
  count: number;
}

export default function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [platformStats, setPlatformStats] = useState<PlatformStats[]>([]);
  const [topEvents, setTopEvents] = useState<EventStats[]>([]);
  const [recentEvents, setRecentEvents] = useState<RawEvent[]>([]);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const supabase = createClient();

        const timeRanges: Record<'24h' | '7d' | '30d', number> = {
          '24h': 24,
          '7d': 7 * 24,
          '30d': 30 * 24,
        };

        const hours = timeRanges[timeRange];
        const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

        // Fetch all events for stats
        const { data: events } = await supabase
          .from('analytics_events')
          .select('platform, event_type')
          .gte('created_at', since);

        // Fetch recent detailed events (limit to 20 for performance)
        const { data: detailedEvents } = await supabase
          .from('analytics_events')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20);

        if (detailedEvents) {
          setRecentEvents(detailedEvents);
        }

        if (events) {
          const platformCounts: Record<string, number> = {};
          const eventCounts: Record<string, number> = {};

          events.forEach((event) => {
            platformCounts[event.platform] = (platformCounts[event.platform] || 0) + 1;
            const key = `${event.event_type}`;
            eventCounts[key] = (eventCounts[key] || 0) + 1;
          });

          setPlatformStats(
            Object.entries(platformCounts).map(([platform, count]) => ({
              platform,
              count,
            }))
          );

          setTopEvents(
            Object.entries(eventCounts)
              .map(([eventType, count]) => ({
                eventType,
                count,
                platform: 'all',
              }))
              .sort((a, b) => b.count - a.count)
              .slice(0, 10)
          );
        }
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
        setError('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  if (loading) {
    return <AdminSkeleton />;
  }

  return (
    <div>
      <div className="flex items-center gap-4 mt-8 mb-8">
        <Link 
          href="/admin" 
          className="p-3 bg-(--nav-hover) rounded-2xl border border-(--card-border) hover:bg-gaming-accent/10 hover:border-gaming-accent/20 transition-all text-muted-foreground hover:text-gaming-accent"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div className="p-3 bg-gaming-accent/10 rounded-2xl border border-gaming-accent/20">
          <BarChart2 className="w-8 h-8 text-gaming-accent" />
        </div>
        <h1 className="text-4xl font-black text-foreground">Analytics</h1>
      </div>

      <div className="flex justify-end gap-2 mb-6">
        {(['24h', '7d', '30d'] as const).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={cn(
              "px-4 py-2 rounded-xl font-bold text-sm uppercase tracking-widest transition-all",
              timeRange === range
                ? 'bg-gaming-accent text-white shadow-lg shadow-gaming-accent/20'
                : 'bg-(--nav-hover) text-muted-foreground hover:text-foreground'
            )}
          >
            {range}
          </button>
        ))}
      </div>

      {error && <div className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-500">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="glass-card p-6">
          <h2 className="text-lg font-bold text-foreground mb-4 uppercase tracking-wider">Events by Platform</h2>
          <div className="space-y-3">
            {platformStats.length > 0 ? (
              platformStats.map((stat) => (
                <div key={stat.platform} className="flex justify-between items-center">
                  <span className="text-muted-foreground capitalize">{stat.platform}</span>
                  <span className="text-xl font-bold text-foreground">{stat.count}</span>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No data available</p>
            )}
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-lg font-bold text-foreground mb-4 uppercase tracking-wider">Total Events</h2>
          <p className="text-4xl font-black text-foreground">
            {platformStats.reduce((sum, stat) => sum + stat.count, 0)}
          </p>
          <p className="text-sm text-muted-foreground mt-2">Last {timeRange}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 h-fit">
          <h2 className="text-lg font-bold text-foreground mb-4 uppercase tracking-wider">Top Events</h2>
          <div className="space-y-2">
            {topEvents.length > 0 ? (
              topEvents.map((event, index) => (
                <div key={index} className="flex justify-between items-center pb-3 border-b border-(--card-border) last:border-0 last:pb-0">
                  <span className="text-foreground">{event.eventType}</span>
                  <span className="text-muted-foreground font-medium">{event.count}</span>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No event data available</p>
            )}
          </div>
        </div>

        <div className="glass-card p-6 lg:col-span-2">
          <h2 className="text-lg font-bold text-foreground mb-4 uppercase tracking-wider">Recent Live Events</h2>
          <div className="space-y-4">
            {recentEvents.length > 0 ? (
              recentEvents.map((event) => (
                <div key={event.id} className="p-4 bg-(--nav-hover) rounded-2xl border border-(--card-border) hover:border-gaming-accent/30 transition-all group">
                  <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                    <span className="px-3 py-1 bg-gaming-accent/10 text-gaming-accent rounded-lg font-bold text-xs uppercase tracking-wider">
                      {event.event_type}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <Monitor className="w-4 h-4 text-muted-foreground" />
                      <span className="capitalize">{event.platform}</span>
                      {event.user_id && (
                        <span className="text-xs px-1.5 py-0.5 bg-blue-500/10 text-blue-500 rounded border border-blue-500/20">
                          User ID: {event.user_id.slice(0, 8)}...
                        </span>
                      )}
                    </div>
                    {event.route && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground italic truncate">
                        <Navigation className="w-4 h-4" />
                        {event.route}
                      </div>
                    )}
                  </div>

                  {Object.keys(event.metadata || {}).length > 0 && (
                    <div className="mt-3 pt-3 border-t border-(--card-border)/50 flex flex-wrap gap-2">
                      {Object.entries(event.metadata).map(([key, value]) => (
                        <div key={key} className="text-[10px] px-2 py-0.5 bg-foreground/5 rounded-md text-muted-foreground">
                          <span className="font-bold opacity-70">{key}:</span> {String(value)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No recent events found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
