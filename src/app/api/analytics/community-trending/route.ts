import { NextResponse } from 'next/server';

interface AnalyticsEventRow {
  event_type: string;
  metadata: {
    heroId?: number;
    hero_id?: number;
    heroName?: string;
    name?: string;
    query?: string;
  };
}

export async function GET() {
  try {
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

    // Fetch relevant events from the last 48 hours
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/analytics_events?event_type=in.(hero_view,opendota_hero_view,search,opendota_player_search)&created_at=gte.${fortyEightHoursAgo}&select=event_type,metadata`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': `${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Supabase REST error:', response.status, errorText);
      return NextResponse.json({ success: false }, { status: 500 });
    }

    const events: AnalyticsEventRow[] = await response.json();

    // Aggregate Hero Views
    const heroCounts: Record<number, { id: number, name: string, count: number }> = {};
    // Aggregate Searches
    const searchCounts: Record<string, number> = {};

    events.forEach((event) => {
      const metadata = event.metadata || {};
      
      if (event.event_type.includes('hero')) {
        const heroId = metadata.heroId || metadata.hero_id;
        const heroName = metadata.heroName || metadata.name;
        
        if (heroId) {
          if (!heroCounts[heroId]) {
            heroCounts[heroId] = { id: heroId, name: heroName || `Hero ${heroId}`, count: 0 };
          }
          heroCounts[heroId].count++;
        }
      } else if (event.event_type.includes('search')) {
        const query = metadata.query;
        if (query && typeof query === 'string' && query.trim().length > 1) {
          const normalizedQuery = query.trim().toLowerCase();
          searchCounts[normalizedQuery] = (searchCounts[normalizedQuery] || 0) + 1;
        }
      }
    });

    // Sort and limit
    const trendingHeroes = Object.values(heroCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const trendingSearches = Object.entries(searchCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([query]) => query);

    return NextResponse.json({
      success: true,
      data: {
        heroes: trendingHeroes,
        searches: trendingSearches,
      }
    });
  } catch (err) {
    console.error('Community trending API error:', err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
