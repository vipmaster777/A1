export type RiskCategory =
  | 'sound'
  | 'light'
  | 'video'
  | 'led'
  | 'stream'
  | 'registration'
  | 'venue'
  | 'staff';

export interface RiskCard {
  id: string;
  title: string;
  type: RiskCategory;
  weight: 1 | 2 | 3 | 4 | 5;
}

export interface Zone {
  key: RiskCategory;
  label: string;
  hint: string;
}

export interface ScoreState {
  score: number;
  chaos: number;
  stability: number;
  combo: number;
  correct: number;
  wrong: number;
}

export type GameLevel = 'A' | 'B' | 'C';

export interface GameResult {
  score: number;
  level: GameLevel;
  recommendation: string;
  checklist: string[];
}

export interface LeadData {
  eventType: string;
  attendees: string;
}
