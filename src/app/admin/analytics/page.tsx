'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

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

        // Fetch events by platform
        const { data: events } = await supabase
          .from('analytics_events')
          .select('platform, event_type')
          .gte('created_at', since);

        if (events) {
          // Count by platform
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
    return <div className="text-center py-12">Loading analytics...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <div className="flex gap-2">
          {(['24h', '7d', '30d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg font-medium ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Events by Platform</h2>
          <div className="space-y-3">
            {platformStats.length > 0 ? (
              platformStats.map((stat) => (
                <div key={stat.platform} className="flex justify-between items-center">
                  <span className="text-gray-700 capitalize">{stat.platform}</span>
                  <span className="text-2xl font-bold text-gray-900">{stat.count}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No data available</p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Total Events</h2>
          <p className="text-4xl font-bold text-gray-900">
            {platformStats.reduce((sum, stat) => sum + stat.count, 0)}
          </p>
          <p className="text-sm text-gray-600 mt-2">Last {timeRange}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Top Events</h2>
        <div className="space-y-2">
          {topEvents.length > 0 ? (
            topEvents.map((event, index) => (
              <div key={index} className="flex justify-between items-center pb-3 border-b last:border-b-0">
                <span className="text-gray-700">{event.eventType}</span>
                <span className="text-gray-900 font-medium">{event.count} events</span>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No event data available</p>
          )}
        </div>
      </div>
    </div>
  );
}
