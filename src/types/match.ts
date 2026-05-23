export interface RecentMatch {
  match_id: number;
  player_slot: number;
  radiant_win: boolean;
  duration: number;
  game_mode: number;
  hero_id: number;
  start_time: number;
  kills: number;
  deaths: number;
  assists: number;
  gold_per_min: number;
  xp_per_min: number;
  hero_damage?: number;
  tower_damage?: number;
  last_hits?: number;
  hero_healing?: number;
  lane?: number | null;
  lane_role?: number | null;
}

export interface ChatMessage {
  time: number;
  type: string;
  unit?: string;
  key: string;
  slot?: number;
  player_slot?: number;
}

export interface PickBan {
  is_pick: boolean;
  hero_id: number;
  team: number;
  order: number;
}

export interface PermanentBuff {
  permanent_buff: string;
  stack_count: number;
}

export interface MatchObjective {
  time: number;
  type: string;
  unit?: string;
  key?: string;
  slot?: number;
  player_slot?: number;
  team?: number;
}

export interface MatchDetails {
  match_id: number;
  radiant_win: boolean;
  duration: number;
  start_time: number;
  radiant_score: number;
  dire_score: number;
  game_mode: number;
  lobby_type: number;
  region: number;
  patch: number;
  first_blood_time: number;
  radiant_gold_adv: number[];
  radiant_xp_adv: number[];
  chat?: ChatMessage[];
  picks_bans?: PickBan[];
  objectives?: MatchObjective[];
  players: {
    account_id: number;
    personaname: string;
    hero_id: number;
    kills: number;
    deaths: number;
    assists: number;
    last_hits: number;
    denies: number;
    gold_per_min: number;
    xp_per_min: number;
    level: number;
    net_worth: number;
    hero_damage: number;
    tower_damage: number;
    hero_healing: number;
    item_0: number;
    item_1: number;
    item_2: number;
    item_3: number;
    item_4: number;
    item_5: number;
    item_neutral: number;
    player_slot: number;
    permanent_buffs?: PermanentBuff[];
    benchmarks?: {
      gold_per_min: { raw: number; pct: number };
      xp_per_min: { raw: number; pct: number };
      hero_damage_per_min: { raw: number; pct: number };
      hero_healing_per_min: { raw: number; pct: number };
      tower_damage: { raw: number; pct: number };
      last_hits_per_min: { raw: number; pct: number };
      lhten: { raw: number; pct: number };
    };
    stuns?: number;
    multi_kills?: Record<string, number>;
    kill_streaks?: Record<string, number>;
    hero_damage_targets?: Record<string, number>;
    hero_damage_taken?: number;
    kill_log?: { time: number; key: string }[];
    camps_stacked?: number;
    obs_placed?: number;
    sen_placed?: number;
    actions_per_min?: number;
    lane_efficiency_pct?: number;
    buyback_count?: number;
    lane?: number;
    lane_role?: number;
    is_roaming?: boolean;
    aegis_snatched?: number;
    first_blood?: number;
    purchase_log?: { time: number; key: string }[];
    buyback_log?: { time: number; slot: number; type: string; player_slot: number }[];
    avatar?: string;
    avatarfull?: string;
  }[];
  version?: number;
}

export interface LiveGame {
  match_id: number;
  server_id: string;
  lobby_id: string;
  game_time: number;
  average_mmr: number;
  players: {
    account_id: number;
    hero_id: number;
    name?: string;
  }[];
}

export interface GlobalRecord {
  match_id: number;
  score: number;
  start_time: number;
}
