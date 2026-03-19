/**
 * Match-related constants
 */
export const ROUNDS = {
  J15: 15,
  J16: 16,
} as const;

export const TIER_PRIORITIES = {
  PRIMERA: 1,
  SEGUNDA: 2,
} as const;

export const TIER_NAMES = {
  PRIMERA: 'primera',
  SEGUNDA: 'segunda',
} as const;

export const MATCH_TAGS = {
  SEMI_1: 'semi_1',
  SEMI_2: 'semi_2',
  SURVIVAL_1: 'survival_1',
  SURVIVAL_2: 'survival_2',
  GRAND_FINAL: 'grand_final',
  THIRD_PLACE: '3rd_place',
  RELEGATION_BATTLE: 'relegation_battle',
  HONOR_BATTLE: 'honor_battle',
  SEGUNDA_FINAL: 'segunda_final',
  OPPORTUNITY: 'opportunity',
  LAST_CHANCE: 'last_chance',
  HONOR_SEGUNDA: 'honor_segunda',
} as const;

export type MatchTag = (typeof MATCH_TAGS)[keyof typeof MATCH_TAGS];
