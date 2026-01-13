/**
 * Division card variant configurations
 * Defines colors and styles for each division type
 */

export type DivisionCardVariant = 'gold' | 'purple';

export interface DivisionCardConfig {
  bgMain: string;
  headerBg: string;
  headerText: string;
  borderColor: string;
  accentBorder: string;
  iconBg: string;
  iconBorder: string;
  iconColor: string;
  numberBg: string;
  numberText: string;
  titleColor: string;
  subtitleColor: string;
  descriptionColor: string;
  statLabel: string;
  buttonVariant: 'yellow' | 'primary';
  pokedexNumber: string;
  typeLabel: string;
  levelLabel: string;
}

export const DIVISION_CARD_CONFIGS: Record<
  DivisionCardVariant,
  DivisionCardConfig
> = {
  gold: {
    bgMain: 'bg-jacksons-purple-900',
    headerBg: 'bg-retro-gold-500',
    headerText: 'text-jacksons-purple-950',
    borderColor: 'border-retro-gold-500',
    accentBorder: 'border-retro-gold-400',
    iconBg: 'bg-retro-gold-600',
    iconBorder: 'border-retro-gold-700',
    iconColor: 'text-retro-gold-100',
    numberBg: 'bg-retro-gold-700',
    numberText: 'text-retro-gold-50',
    titleColor: 'text-retro-gold-300',
    subtitleColor: 'text-retro-gold-200',
    descriptionColor: 'text-gray-300',
    statLabel: 'text-retro-gold-300',
    buttonVariant: 'yellow',
    pokedexNumber: '001',
    typeLabel: 'Competitivo',
    levelLabel: 'Elite',
  },
  purple: {
    bgMain: 'bg-jacksons-purple-900',
    headerBg: 'bg-retro-cyan-600',
    headerText: 'text-white',
    borderColor: 'border-retro-cyan-600',
    accentBorder: 'border-retro-cyan-500',
    iconBg: 'bg-retro-cyan-700',
    iconBorder: 'border-retro-cyan-800',
    iconColor: 'text-retro-cyan-200',
    numberBg: 'bg-retro-cyan-800',
    numberText: 'text-retro-cyan-100',
    titleColor: 'text-retro-cyan-300',
    subtitleColor: 'text-retro-cyan-200',
    descriptionColor: 'text-gray-300',
    statLabel: 'text-retro-cyan-300',
    buttonVariant: 'primary',
    pokedexNumber: '002',
    typeLabel: 'Ascenso',
    levelLabel: 'Intermedio',
  },
};
