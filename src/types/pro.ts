export interface ProPlayer {
  account_id: number;
  steamid: string;
  avatar: string;
  avatarmedium?: string;
  avatarfull?: string;
  personaname: string;
  full_name: string;
  name?: string;
  last_match_time?: string;
  team_id: number;
  team_name: string;
  team_tag: string;
  country_code: string;
  is_locked?: boolean;
  is_pro?: boolean;
  locked_until?: number;
}

export interface ProTeam {
  team_id: number;
  rating: number;
  wins: number;
  losses: number;
  last_match_time: number;
  name: string;
  tag: string;
  logo_url?: string;
}

export interface League {
  leagueid: number;
  ticket: string | null;
  banner: string | null;
  tier: 'premium' | 'professional' | 'amateur' | 'excluded' | null;
  name: string;
  region?: string;
}

export interface ProMatch {
  match_id: number;
  duration: number;
  start_time: number;
  radiant_team_id: number | null;
  radiant_name: string | null;
  dire_team_id: number | null;
  dire_name: string | null;
  leagueid: number;
  league_name: string;
  series_id: number;
  series_type: number;
  radiant_score: number;
  dire_score: number;
  radiant_win: boolean | null;
  radiant_logo?: string;
  dire_logo?: string;
}
