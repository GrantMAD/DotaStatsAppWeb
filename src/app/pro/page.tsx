import React from 'react';
import { getLeagues, getProTeams, getProPlayers, getLiveGames, getProMatches } from '@/services/opendota';
import { ProPageClient } from '@/components/pro/ProPageClient';

export const revalidate = 600; // Update pro data every 10 minutes

export default async function ProPage() {
  const [leagues, teams, players, liveGames, recentProMatches] = await Promise.all([
    getLeagues(),
    getProTeams(),
    getProPlayers(),
    getLiveGames(),
    getProMatches(100)
  ]);

  return (
    <ProPageClient 
      initialLeagues={leagues}
      initialTeams={teams}
      initialPlayers={players}
      initialLiveGames={liveGames}
      initialRecentProMatches={recentProMatches}
    />
  );
}
