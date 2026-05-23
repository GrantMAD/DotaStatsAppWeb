import { OPENDOTA_BASE_URL } from './constants';
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

export async function getHeroStats(): Promise<HeroStats[]> {
  try {
    const response = await fetch(`${OPENDOTA_BASE_URL}/heroStats`);
    if (!response.ok) throw new Error('Failed to fetch hero stats');
    return await response.json();
  } catch (error) {
    console.error('Error fetching hero stats:', error);
    return [];
  }
}

export async function getServerHeroStats(): Promise<HeroStats[]> {
  try {
    const response = await fetch(`${OPENDOTA_BASE_URL}/heroStats`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    if (!response.ok) throw new Error('Failed to fetch hero stats');
    return await response.json();
  } catch (error) {
    console.error('Error fetching server hero stats:', error);
    return [];
  }
}

export async function getHeroMatchups(heroId: number): Promise<HeroMatchup[]> {
  try {
    const response = await fetch(`${OPENDOTA_BASE_URL}/heroes/${heroId}/matchups`);
    if (!response.ok) throw new Error('Failed to fetch hero matchups');
    return await response.json();
  } catch (error) {
    console.error('Error fetching hero matchups:', error);
    return [];
  }
}

export async function getHeroDurations(heroId: number): Promise<HeroDuration[]> {
  try {
    const response = await fetch(`${OPENDOTA_BASE_URL}/heroes/${heroId}/durations`);
    if (!response.ok) throw new Error('Failed to fetch hero durations');
    return await response.json();
  } catch (error) {
    console.error('Error fetching hero durations:', error);
    return [];
  }
}

export async function getHeroItemPopularity(heroId: number): Promise<HeroItemPopularity | null> {
  try {
    const response = await fetch(`${OPENDOTA_BASE_URL}/heroes/${heroId}/itemPopularity`);
    if (!response.ok) throw new Error('Failed to fetch hero item popularity');
    return await response.json();
  } catch (error) {
    console.error('Error fetching hero item popularity:', error);
    return null;
  }
}

export async function getScenariosItemTimings(params: { item?: string; hero_id?: number }): Promise<ItemTimingScenario[]> {
  try {
    const query = new URLSearchParams();
    if (params.item) query.append('item', params.item);
    if (params.hero_id) query.append('hero_id', params.hero_id.toString());
    const response = await fetch(`${OPENDOTA_BASE_URL}/scenarios/itemTimings?${query.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch item timing scenarios');
    const data = await response.json();
    return Array.isArray(data) ? data : (data.value || []);
  } catch (error) {
    console.error('Error fetching item timing scenarios:', error);
    return [];
  }
}

export async function getScenariosLaneRoles(params: { lane_role?: number; hero_id?: number }): Promise<LaneRoleScenario[]> {
  try {
    const query = new URLSearchParams();
    if (params.lane_role) query.append('lane_role', params.lane_role.toString());
    if (params.hero_id) query.append('hero_id', params.hero_id.toString());
    const response = await fetch(`${OPENDOTA_BASE_URL}/scenarios/laneRoles?${query.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch lane role scenarios');
    const data = await response.json();
    return Array.isArray(data) ? data : (data.value || []);
  } catch (error) {
    console.error('Error fetching lane role scenarios:', error);
    return [];
  }
}

export async function getDistributions(): Promise<DistributionData | null> {
  try {
    const response = await fetch(`${OPENDOTA_BASE_URL}/distributions`);
    if (!response.ok) throw new Error('Failed to fetch distributions');
    return await response.json();
  } catch (error) {
    console.error('Error fetching distributions:', error);
    return null;
  }
}

export async function getScenariosMisc(params: { scenario?: string }): Promise<MiscScenario[]> {
  try {
    const query = new URLSearchParams();
    if (params.scenario) query.append('scenario', params.scenario);
    const response = await fetch(`${OPENDOTA_BASE_URL}/scenarios/misc?${query.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch misc scenarios');
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching misc scenarios:', error);
    return [];
  }
}
