/**
 * Tab configurations
 */

export interface Tab {
  id: string;
  label: string;
  emoji: string;
}

export const DIVISION_TABS: Tab[] = [
  { id: 'clasificacion', label: 'Clasificación', emoji: '🏆' },
  { id: 'participantes', label: 'Participantes', emoji: '👥' },
  { id: 'calendario', label: 'Calendario', emoji: '📅' },
] as const;

export type TabId = (typeof DIVISION_TABS)[number]['id'];
