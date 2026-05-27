import { ROUTES } from './routes';

/**
 * Top-bar navigation for the pixel redesign (FR2). Matches README §1 order:
 * Hub · Standings · Calendario · Bracket · Olimpo · Archivo.
 * `gated` items are locked until the finals phase (current_round >= 15).
 */
export interface HubNavItem {
  label: string;
  href: string;
  /** Active only on an exact path match (Hub). Others match by prefix. */
  exact?: boolean;
  /** Locked + tooltip until finals unlock. */
  gated?: boolean;
}

export const HUB_NAV: readonly HubNavItem[] = [
  { label: 'Hub', href: ROUTES.hub, exact: true },
  { label: 'Standings', href: ROUTES.hubStandings },
  { label: 'Calendario', href: ROUTES.hubCalendar },
  { label: 'Bracket', href: ROUTES.hubBracket, gated: true },
  { label: 'Olimpo', href: ROUTES.hubOlimpo, gated: true },
  { label: 'Archivo', href: ROUTES.archive },
];
