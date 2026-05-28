import { PixelGrid, type PixelMap } from './PixelGrid';

/**
 * Brand pixel icons (ported from the design handoff `ui.jsx`). Pure SVG, RSC-safe.
 * Colors default to the `--color-px-*` brand tokens and accept overrides.
 */

interface IconProps {
  size?: number;
  color?: string;
}

const CROWN: PixelMap = [
  'A........A',
  'AB......BA',
  'AB..AA..BA',
  'ABBBBBBBBA',
  'ACCBBBBCCA',
  'ACDCCCCDCA',
  'AAAAAAAAAA',
  '.A......A.',
  '..AAAAAA..',
  '...AAAA...',
];

export function PixelCrown({
  size = 48,
  color = 'var(--color-px-gold)',
}: IconProps) {
  return (
    <PixelGrid
      size={size}
      cols={10}
      map={CROWN}
      palette={{
        A: color,
        B: 'var(--color-px-ink)',
        C: 'var(--color-px-deep)',
        D: 'var(--color-px-magenta)',
      }}
    />
  );
}

const SKULL: PixelMap = [
  '..AAAAAA..',
  '.ABBBBBBA.',
  'ABCBBBBCBA',
  'ABBBBBBBBA',
  'ABDDBBDDBA',
  'ABDDBBDDBA',
  'ABBBABBBBA',
  'ABABABABBA',
  '.AAAAAAAA.',
  '..A.AA.A..',
];

export function PixelSkull({ size = 48 }: IconProps) {
  return (
    <PixelGrid
      size={size}
      cols={10}
      map={SKULL}
      palette={{
        A: 'var(--color-px-deep)',
        B: 'var(--color-px-ink)',
        C: 'var(--color-px-danger)',
        D: 'var(--color-px-deep)',
      }}
    />
  );
}

const SWORD: PixelMap = [
  '...........A',
  '..........AB',
  '.........ABA',
  '........ABA.',
  '.......ABA..',
  '......ABA...',
  '.....ABA....',
  '..C.ABA.....',
  '.CCCBA......',
  '..CDA.......',
  '...DA.......',
  '....A.......',
];

export function PixelSword({ size = 48 }: IconProps) {
  return (
    <PixelGrid
      size={size}
      cols={12}
      map={SWORD}
      palette={{
        A: 'var(--color-px-ink)',
        B: 'var(--color-px-ink-soft)',
        C: 'var(--color-px-gold)',
        D: 'var(--color-px-deep)',
      }}
    />
  );
}

const LIGHTNING: PixelMap = [
  '......AA....',
  '.....AAA....',
  '....AAA.....',
  '...AAA......',
  '..AAAAAA....',
  '...AAAAA....',
  '.....AAA....',
  '....AAA.....',
  '...AAA......',
  '..AAA.......',
  '.AA.........',
  'AA..........',
];

export function PixelLightning({
  size = 48,
  color = 'var(--color-px-gold)',
}: IconProps) {
  return (
    <PixelGrid size={size} cols={12} map={LIGHTNING} palette={{ A: color }} />
  );
}

const GEM: PixelMap = [
  '....AAAA....',
  '...ABBBBA...',
  '..ABCCCCBA..',
  '.ABCDDDDCBA.',
  'ABCDEEEEDCBA',
  'ABCDEFFFEDCB',
  'ABCDEEEEDCBA',
  '.ABCDDDDCBA.',
  '..ABCCCCBA..',
  '...ABBBBA...',
  '....AAAA....',
  '.....AA.....',
];

interface GemProps extends IconProps {
  color2?: string;
}

export function PixelGem({
  size = 64,
  color = 'var(--color-px-magenta)',
  color2 = 'var(--color-px-gold)',
}: GemProps) {
  return (
    <PixelGrid
      size={size}
      cols={12}
      map={GEM}
      palette={{
        A: 'var(--color-px-deep)',
        B: 'var(--color-px-border)',
        C: color,
        D: 'var(--color-px-ink)',
        E: color2,
        F: 'var(--color-px-ink)',
      }}
    />
  );
}

const ORB: PixelMap = [
  '...AAAA...',
  '.AABBBBAA.',
  '.ABCCCCBA.',
  'ABCDDDDCBA',
  'ABCDEEDDCB',
  'ABCDDDDCBA',
  'ABCCCCCCBA',
  '.ABBBBBBA.',
  '.AABBBBAA.',
  '...AAAA...',
];

export function PixelOrb({
  size = 64,
  color = 'var(--color-px-cyan)',
}: IconProps) {
  return (
    <PixelGrid
      size={size}
      cols={10}
      map={ORB}
      palette={{
        A: 'var(--color-px-deep)',
        B: 'var(--color-px-border)',
        C: color,
        D: 'var(--color-px-ink-soft)',
        E: 'var(--color-px-ink)',
      }}
    />
  );
}

const LOGO: PixelMap = [
  '..AAAA..',
  '.ABBBBA.',
  'ABCDDCBA',
  'ABDEEDBA',
  'ABDEEDBA',
  'ABCDDCBA',
  '.ABBBBA.',
  '..AAAA..',
];

export function PixelLogo({
  size = 28,
  color = 'var(--color-px-magenta)',
}: IconProps) {
  return (
    <PixelGrid
      size={size}
      cols={8}
      map={LOGO}
      palette={{
        A: 'var(--color-px-deep)',
        B: 'var(--color-px-magenta-2)',
        C: color,
        D: 'var(--color-px-ink)',
        E: 'var(--color-px-gold)',
      }}
    />
  );
}

type ArrowDirection = 'right' | 'left' | 'up' | 'down';

const ARROW_ROTATION: Record<ArrowDirection, number> = {
  right: 0,
  left: 180,
  up: -90,
  down: 90,
};

const ARROW_CELLS = [
  { id: 'a', x: 2, y: 1 },
  { id: 'b', x: 3, y: 2 },
  { id: 'c', x: 4, y: 3 },
  { id: 'd', x: 5, y: 4 },
  { id: 'e', x: 4, y: 5 },
  { id: 'f', x: 3, y: 6 },
  { id: 'g', x: 2, y: 7 },
];

interface ArrowProps {
  direction?: ArrowDirection;
  size?: number;
  color?: string;
}

export function PixelArrow({
  direction = 'right',
  size = 16,
  color = 'currentColor',
}: ArrowProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 8 8"
      aria-hidden="true"
      style={{
        transform: `rotate(${ARROW_ROTATION[direction]}deg)`,
        imageRendering: 'pixelated',
      }}
    >
      {ARROW_CELLS.map((c) => (
        <rect key={c.id} x={c.x} y={c.y} width={1} height={1} fill={color} />
      ))}
    </svg>
  );
}

const USERS: PixelMap = [
  '...AAAA...',
  '..ABBBBA..',
  '..ABBBBA..',
  '...ABBA...',
  '.AABBBBAA.',
  'ABBBBBBBBA',
  'ABBBBBBBBA',
  'ABBBBBBBBA',
  '.A......A.',
  '..........',
];

export function PixelUsers({
  size = 24,
  color = 'var(--color-px-cyan)',
}: IconProps) {
  return (
    <PixelGrid
      size={size}
      cols={10}
      map={USERS}
      palette={{ A: 'var(--color-px-deep)', B: color }}
    />
  );
}

const DOC: PixelMap = [
  '.AAAAAAAA.',
  '.ABBBBBBA.',
  '.ABCCCBBA.',
  '.ABBBBBBA.',
  '.ABCCCBBA.',
  '.ABBBBBBA.',
  '.ABCCCBBA.',
  '.ABBBBBBA.',
  '.ABBBBBBA.',
  '.AAAAAAAA.',
];

export function PixelDoc({
  size = 24,
  color = 'var(--color-px-ink-soft)',
}: IconProps) {
  return (
    <PixelGrid
      size={size}
      cols={10}
      map={DOC}
      palette={{
        A: color,
        B: 'var(--color-px-ink)',
        C: 'var(--color-px-ink-dim)',
      }}
    />
  );
}

const GEAR: PixelMap = [
  '...A..A...',
  '.A.AAAA.A.',
  '.AAABBAAA.',
  'AABBBBBBAA',
  'AABBCCBBAA',
  'AABBCCBBAA',
  'AABBBBBBAA',
  '.AAABBAAA.',
  '.A.AAAA.A.',
  '...A..A...',
];

export function PixelGear({
  size = 24,
  color = 'var(--color-px-ink-dim)',
}: IconProps) {
  return (
    <PixelGrid
      size={size}
      cols={10}
      map={GEAR}
      palette={{
        A: color,
        B: 'var(--color-px-elev)',
        C: 'var(--color-px-deep)',
      }}
    />
  );
}
