export interface HeroStats {
  id: number;
  name: string;
  localized_name: string;
  primary_attr: string;
  attack_type: string;
  roles: string[];
  img: string;
  icon: string;
  pub_pick: number;
  pub_win: number;
  '1_pick': number; '1_win': number;
  '2_pick': number; '2_win': number;
  '3_pick': number; '3_win': number;
  '4_pick': number; '4_win': number;
  '5_pick': number; '5_win': number;
  '6_pick': number; '6_win': number;
  '7_pick': number; '7_win': number;
  '8_pick': number; '8_win': number;
  pro_pick: number;
  pro_win: number;
  pro_ban: number;
  turbo_picks: number;
  turbo_wins: number;
}

export interface HeroMatchup {
  hero_id: number;
  games_played: number;
  wins: number;
}

export interface HeroDuration {
  duration_bin: number;
  games_played: number;
  wins: number;
}

export interface HeroItemPopularity {
  start_game_items: Record<string, number>;
  early_game_items: Record<string, number>;
  mid_game_items: Record<string, number>;
  late_game_items: Record<string, number>;
}

export interface ItemTimingScenario {
  hero_id: number;
  item: string;
  time: number;
  games: number;
  wins: number;
}

export interface LaneRoleScenario {
  hero_id: number;
  lane_role: number;
  time: number;
  games: number;
  wins: number;
}

export interface MiscScenario {
  scenario: string;
  is_radiant: boolean;
  region: number;
  rank: number;
  wins: number;
  games: number;
}

export interface DistributionData {
  ranks: {
    rows: {
      bin: number;
      bin_name: number;
      count: number;
      cumulative_sum: number;
    }[];
    sum: {
      count: number;
    };
  };
}
