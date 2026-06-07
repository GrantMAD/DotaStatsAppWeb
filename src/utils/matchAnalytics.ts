/**
 * Calculates a letter grade based on laning efficiency and benchmarks.
 * @param efficiency Laning efficiency percentage (0-100)
 * @param percentile LHTEN percentile (0-1)
 */
export function calculateLaningGrade(efficiency: number | null, percentile: number | null) {
  if (efficiency === null && percentile === null) return null;

  // Weighted score: 60% efficiency, 40% percentile (converted to 0-100)
  const effScore = efficiency || 0;
  const percScore = (percentile || 0) * 100;
  
  let score = 0;
  if (efficiency !== null && percentile !== undefined && percentile !== null) {
    score = (effScore * 0.6) + (percScore * 0.4);
  } else {
    score = effScore || percScore;
  }

  if (score >= 95) return { grade: 'A+', color: 'text-emerald-400', label: 'Immortal' };
  if (score >= 85) return { grade: 'A', color: 'text-emerald-500', label: 'Divine' };
  if (score >= 75) return { grade: 'B+', color: 'text-blue-400', label: 'Ancient' };
  if (score >= 65) return { grade: 'B', color: 'text-blue-500', label: 'Legend' };
  if (score >= 50) return { grade: 'C+', color: 'text-yellow-500', label: 'Archon' };
  if (score >= 40) return { grade: 'C', color: 'text-orange-500', label: 'Crusader' };
  if (score >= 25) return { grade: 'D', color: 'text-red-500', label: 'Guardian' };
  return { grade: 'F', color: 'text-red-700', label: 'Herald' };
}

export interface HeroMatchup {
  hero_id: number;
  wins: number;
  games_played: number;
}

export interface MatchupResult {
  hero_id: number;
  matchups: HeroMatchup[];
}

/**
 * Normalizes a draft advantage score into a percentage for Radiant.
 * @param matchups Array of matchup objects for all Radiant heroes against Dire heroes
 * @param radiantPicks Array of Radiant hero IDs
 * @param direPicks Array of Dire hero IDs
 */
export function calculateDraftAdvantage(matchups: MatchupResult[], radiantPicks: number[], direPicks: number[]) {
  if (!matchups || matchups.length === 0 || radiantPicks.length === 0 || direPicks.length === 0) {
    return 50;
  }

  let totalWinRateDiff = 0;
  let count = 0;

  // Each Radiant hero vs every Dire hero
  radiantPicks.forEach(rId => {
    direPicks.forEach(dId => {
      // Find the winrate of Radiant hero (rId) against Dire hero (dId)
      const heroMatchups = matchups.find(m => m.hero_id === rId)?.matchups;
      if (heroMatchups) {
        const vsDire = heroMatchups.find((m: HeroMatchup) => m.hero_id === dId);
        if (vsDire && vsDire.games_played > 0) {
          const winRate = vsDire.wins / vsDire.games_played;
          totalWinRateDiff += (winRate - 0.5);
          count++;
        }
      }
    });
  });

  if (count === 0) return 50;

  const avgDiff = totalWinRateDiff / count;
  const advantage = 50 + (avgDiff * 200);

  return Math.min(Math.max(advantage, 20), 80);
}

