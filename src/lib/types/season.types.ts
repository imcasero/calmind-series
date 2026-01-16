/**
 * Season and Split types for tournament structure
 */

export type JornadaStatus = 'upcoming' | 'in_progress' | 'completed';

export interface Jornada {
  number: number;
  status: JornadaStatus;
  startDate?: string;
  endDate?: string;
}

export interface Split {
  id: string;
  name: string;
  season: string;
  currentJornada: number;
  totalJornadas: number;
  jornadas: Jornada[];
  isActive: boolean;
}

export interface Season {
  id: string;
  name: string;
  splits: Split[];
  isActive: boolean;
}

export interface LeagueTablePreview {
  division: 'primera' | 'segunda';
  topPlayers: {
    position: number;
    name: string;
    points: number;
  }[];
}
