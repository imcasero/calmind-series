/**
 * Application routes constants
 * Centralized route definitions for type-safe navigation
 */
export const ROUTES = {
  HOME: '/',
  seasonOverview: (season: string) => `/${season}`,
  season: (season: string, split: string) => `/${season}/${split}`,
  cruces: (season: string, split: string) => `/${season}/${split}/cruces`,
  finals: (season: string, split: string) => `/${season}/${split}/final`,
  division: (season: string, split: string, division: 'primera' | 'segunda') =>
    `/${season}/${split}/${division}`,
} as const;

/**
 * External routes
 */
export const EXTERNAL_ROUTES = {
  INSCRIPTION_FORM: 'https://forms.gle/Ai7mZvu38nj85NiZ8',
  NORMATIVA_PDF: '/normativa_pokemon_calmind_series.pdf',
  TWITTER: 'https://x.com/calmind_team',
} as const;

/**
 * Type helper for route keys
 */
export type RouteKey = keyof typeof ROUTES;
export type ExternalRouteKey = keyof typeof EXTERNAL_ROUTES;
