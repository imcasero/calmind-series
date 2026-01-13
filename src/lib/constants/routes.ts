/**
 * Application routes constants
 * Centralized route definitions for type-safe navigation
 */
export const ROUTES = {
  HOME: '/',
  PRIMERA_DIVISION: '/primera-division',
  SEGUNDA_DIVISION: '/segunda-division',
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
