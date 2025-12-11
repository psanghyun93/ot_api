export interface BlizzardUserInfo {
  sub: string;
  battletag: string;
  email?: string;
}

// Season related types
export enum SeasonState {
  ETERNAL = 'ETERNAL',
  WAITING = 'WAITING',
  ONGOING = 'ONGOING',
  ENDED = 'ENDED'
}

export interface SeasonName {
  ko: string;
  zh: string;
  ja: string;
  en: string;
}

export interface Season {
  id: number;
  name: SeasonName;
  start_time: Date;
  end_time?: Date;
  state: SeasonState;
  created_at: Date;
  updated_at: Date;
}

export interface CreateSeasonData {
  name: SeasonName;
  start_time: Date;
  end_time?: Date;
  state: SeasonState;
}

export interface UpdateSeasonData {
  name?: SeasonName;
  start_time?: Date;
  end_time?: Date;
  state?: SeasonState;
}
