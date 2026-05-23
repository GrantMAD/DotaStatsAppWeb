export interface PlayerProfile {
  profile: {
    account_id: number;
    personaname: string;
    avatarfull: string;
    profileurl: string;
    loccountrycode: string | null;
    communityvisibilitystate?: number;
  };
  rank_tier: number | null;
  leaderboard_rank: number | null;
  last_match_time?: string;
}

export interface SearchResult {
  account_id: number;
  personaname: string;
  avatarfull: string;
  last_match_time?: string;
  similarity?: number;
  isPro?: boolean;
  isAppUser?: boolean;
  appUserId?: string;
  team_tag?: string;
}

export interface WinLossStats {
  win: number;
  lose: number;
}

export interface PlayerTotal {
  field: string;
  n: number;
  sum: number;
}

export interface PlayerCounts {
  leaver_status: Record<string, { games: number; win: number }>;
  game_mode: Record<string, { games: number; win: number }>;
  lobby_type: Record<string, { games: number; win: number }>;
  lane_role: Record<string, { games: number; win: number }>;
  region: Record<string, { games: number; win: number }>;
  patch: Record<string, { games: number; win: number }>;
  is_radiant?: Record<string, { games: number; win: number }>;
}

export interface Peer {
  account_id: number;
  last_played: number;
  win: number;
  games: number;
  with_win: number;
  with_games: number;
  against_win: number;
  against_games: number;
  personaname: string;
  avatar: string;
  avatarfull?: string;
}

export interface PlayerHero {
  hero_id: string;
  last_played: number;
  games: number;
  win: number;
  with_games: number;
  with_win: number;
  against_games: number;
  against_win: number;
}

export interface PlayerMatchFilters {
  win?: number;
  hero_id?: number;
  game_mode?: number;
  lobby_type?: number;
  date?: number;
  limit?: number;
  offset?: number;
}

export interface WordCloudData {
  my_word_counts: Record<string, number>;
  all_word_counts: Record<string, number>;
}

export interface WardMapData {
  obs: Record<string, Record<string, number>>;
  sen: Record<string, Record<string, number>>;
}

export interface PlayerRating {
  account_id: number;
  match_id: number | null;
  solo_competitive_rank: number | null;
  competitive_rank: number | null;
  time: number;
}
