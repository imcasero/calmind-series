import { cn } from '@/lib/utils';
import { PixelGrid, type PixelMap } from './PixelGrid';

/**
 * Procedural pixel "trainer cap" avatar. Placeholder per the handoff README
 * (§Fidelity): swap for uploaded avatars when supported. RSC-safe.
 *
 * The signature `color` is provided by the caller. FR1 adds the deterministic
 * `trainerColor(id)` hash that feeds this; FR0 just accepts the color.
 */

const CAP: PixelMap = [
  '...AAAA...',
  '..ABBBBA..',
  '.ABCCCCBA.',
  'ABCCCCCCBA',
  'AABBBBBBAA',
  '.ADDDDDDA.',
  'ADEEFFEEDA',
  'ADEFFFFEDA',
  'ADDDDDDDA.',
  '..A....A..',
];

interface TrainerAvatarProps {
  /** Signature color (hashed from trainer id upstream). */
  color: string;
  size?: number;
  /** Highlight ring + glow in the signature color. */
  ring?: boolean;
  className?: string;
}

export function TrainerAvatar({
  color,
  size = 72,
  ring = false,
  className,
}: TrainerAvatarProps) {
  return (
    <div
      className={cn('pixel-frame', className)}
      style={{
        width: size,
        height: size,
        background: 'var(--color-px-deep)',
        border: `3px solid ${ring ? color : 'var(--color-px-border)'}`,
        display: 'grid',
        placeItems: 'center',
        boxShadow: ring
          ? `0 0 0 2px var(--color-px-deep), 0 0 16px ${color}55`
          : 'none',
        flexShrink: 0,
      }}
    >
      <PixelGrid
        size={size - 12}
        cols={10}
        map={CAP}
        palette={{
          A: 'var(--color-px-deep)',
          B: color,
          C: 'var(--color-px-ink)',
          D: 'var(--color-px-ink-soft)',
          E: 'var(--color-px-deep)',
          F: 'var(--color-px-ink)',
        }}
      />
    </div>
  );
}
