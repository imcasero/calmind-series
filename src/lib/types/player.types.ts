/**
 * Player types for classification tables
 */

export interface Player {
  id: number;
  name: string;
  avatar: string;
  pj: number; // Partidos jugados
  pg: number; // Partidos ganados
  pp: number; // Partidos perdidos
  points: number;
  isChampion?: boolean;
  isPromoted?: boolean;
}

export interface ClassificationStats {
  pj: number;
  pg: number;
  pp: number;
  points: number;
}
