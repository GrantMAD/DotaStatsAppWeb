import { 
  HeroStats, 
  HeroMatchup, 
  HeroDuration, 
  HeroItemPopularity, 
  ItemTimingScenario, 
  LaneRoleScenario, 
  DistributionData, 
  MiscScenario 
} from '@/types';
import { fetchFromOpenDota } from './apiUtils';

export async function getHeroStats(): Promise<HeroStats[]> {
  return fetchFromOpenDota<HeroStats[]>('/heroStats');
}

export async function getServerHeroStats(): Promise<HeroStats[]> {
  return fetchFromOpenDota<HeroStats[]>('/heroStats', {
    next: { revalidate: 3600 } // Cache for 1 hour
  });
}

export async function getHeroMatchups(heroId: number): Promise<HeroMatchup[]> {
  return fetchFromOpenDota<HeroMatchup[]>(`/heroes/${heroId}/matchups`);
}

export async function getHeroDurations(heroId: number): Promise<HeroDuration[]> {
  return fetchFromOpenDota<HeroDuration[]>(`/heroes/${heroId}/durations`);
}

export async function getHeroItemPopularity(heroId: number): Promise<HeroItemPopularity> {
  return fetchFromOpenDota<HeroItemPopularity>(`/heroes/${heroId}/itemPopularity`);
}

export async function getScenariosItemTimings(params: { item?: string; hero_id?: number }): Promise<ItemTimingScenario[]> {
  const query = new URLSearchParams();
  if (params.item) query.append('item', params.item);
  if (params.hero_id) query.append('hero_id', params.hero_id.toString());
  const data = await fetchFromOpenDota<any>(`/scenarios/itemTimings?${query.toString()}`);
  return Array.isArray(data) ? data : (data.value || []);
}

export async function getScenariosLaneRoles(params: { lane_role?: number; hero_id?: number }): Promise<LaneRoleScenario[]> {
  const query = new URLSearchParams();
  if (params.lane_role) query.append('lane_role', params.lane_role.toString());
  if (params.hero_id) query.append('hero_id', params.hero_id.toString());
  const data = await fetchFromOpenDota<any>(`/scenarios/laneRoles?${query.toString()}`);
  return Array.isArray(data) ? data : (data.value || []);
}

export async function getDistributions(): Promise<DistributionData> {
  return fetchFromOpenDota<DistributionData>('/distributions');
}

export async function getScenariosMisc(params: { scenario?: string }): Promise<MiscScenario[]> {
  const query = new URLSearchParams();
  if (params.scenario) query.append('scenario', params.scenario);
  const data = await fetchFromOpenDota<any>(`/scenarios/misc?${query.toString()}`);
  return Array.isArray(data) ? data : [];
}
