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

/**
 * Normalizes a draft advantage score into a percentage for Radiant.
 * @param matchups Array of matchup winrate differences
 * @param radiantPicks Array of Radiant hero IDs
 * @param direPicks Array of Dire hero IDs
 */
export function calculateDraftAdvantage(matchups: unknown[], radiantPicks: number[], direPicks: number[]) {
  if (!matchups || matchups.length === 0 || radiantPicks.length === 0 || direPicks.length === 0) {
    return 50;
  }

  // Placeholder for the logic that will be used inside the component
  // where the data is actually available.
  return 50; 
}
