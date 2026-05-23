import { HeroStats } from '@/types';

// Minimum picks threshold to avoid heroes with tiny sample sizes
const MIN_PICKS = 5000;

export function processHeroStats(heroes: HeroStats[]) {
  if (!heroes || heroes.length === 0) return { topWinRate: [], mostPicked: [], proPicks: [], proBans: [] };

  const eligible = heroes.filter(h => h.pub_pick >= MIN_PICKS);

  const withWinRate = eligible.map(h => ({
    id: h.id,
    name: h.localized_name,
    img: h.img,
    winRate: (h.pub_win / h.pub_pick) * 100,
    picks: h.pub_pick,
  }));

  const topWinRate = [...withWinRate]
    .sort((a, b) => b.winRate - a.winRate)
    .slice(0, 10);

  const mostPicked = [...withWinRate]
    .sort((a, b) => b.picks - a.picks)
    .slice(0, 10);

  const proPicks = [...heroes]
    .filter(h => h.pro_pick > 0)
    .sort((a, b) => b.pro_pick - a.pro_pick)
    .slice(0, 10)
    .map(h => ({
      id: h.id,
      name: h.localized_name,
      img: h.img,
      winRate: h.pro_pick > 0 ? (h.pro_win / h.pro_pick) * 100 : 0,
      picks: h.pro_pick,
    }));

  const proBans = [...heroes]
    .filter(h => h.pro_ban > 0)
    .sort((a, b) => b.pro_ban - a.pro_ban)
    .slice(0, 10)
    .map(h => ({
      id: h.id,
      name: h.localized_name,
      img: h.img,
      picks: h.pro_ban,
    }));

  return { topWinRate, mostPicked, proPicks, proBans };
}
