import { PixelGrid, type PixelMap } from './PixelGrid';

/**
 * Generic pixel "monster" sprite — abstract creature, NOT a Pokémon.
 * Placeholder per the handoff README (§Fidelity): swap for real sprites or
 * commissioned pixel art in production. Pure SVG, RSC-safe.
 */

const VARIANTS: PixelMap[] = [
  // 0 — slime
  [
    '............',
    '....AAAA....',
    '...ABBBBA...',
    '..ABCCCCBA..',
    '.ABCDDDDCBA.',
    'ABCDEDDEDCBA',
    'ABCDDDDDDCBA',
    'ABCDDDDDDCBA',
    'ABCDDDDDDCBA',
    '.ABCDDDDCBA.',
    '..AAABBAAA..',
    '.A........A.',
  ],
  // 1 — bird
  [
    '....AA......',
    '...ABBA.....',
    '..ABCCBA....',
    '.ABCDCBA....',
    '.ABCDDCBA...',
    'ABCDDDDCBAA.',
    'ABCDDDDDCBA.',
    '.ABCDDDDCBA.',
    '..ABCCCCBA..',
    '...A....A...',
    '...A....A...',
    '..AAA..AAA..',
  ],
  // 2 — beast
  [
    '.A........A.',
    'AABA....ABAA',
    'ABCBA..ABCBA',
    'ABCCBAABCCBA',
    '.ABCBBBBCBA.',
    '.ABCDDDDCBA.',
    'ABCDEDDEDCBA',
    'ABCDDDDDDCBA',
    '.ABCDDDDCBA.',
    '..ABCCCCBA..',
    '..A.A..A.A..',
    '..A.A..A.A..',
  ],
  // 3 — mystic
  [
    '.....AA.....',
    '....ABBA....',
    '...ABCCBA...',
    '..ABCDDCBA..',
    '.ABCDEEDCBA.',
    'ABCDEFFEDCBA',
    'ABCDEFFEDCBA',
    '.ABCDEEDCBA.',
    '..ABCDDCBA..',
    '...ABCCBA...',
    '....ABBA....',
    '.....AA.....',
  ],
];

interface MonsterSpriteProps {
  size?: number;
  variant?: number;
  color?: string;
  className?: string;
}

export function MonsterSprite({
  size = 64,
  variant = 0,
  color = 'var(--color-px-magenta)',
  className,
}: MonsterSpriteProps) {
  const map = VARIANTS[variant % VARIANTS.length] ?? VARIANTS[0];

  return (
    <PixelGrid
      size={size}
      cols={12}
      map={map}
      className={className}
      palette={{
        A: 'var(--color-px-deep)',
        B: 'var(--color-px-border)',
        C: color,
        D: 'var(--color-px-ink-soft)',
        E: 'var(--color-px-ink)',
        F: 'var(--color-px-gold)',
      }}
    />
  );
}
