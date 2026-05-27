import type { CSSProperties } from 'react';

export type PixelMap = readonly string[];
export type PixelPalette = Record<string, string>;

interface PixelGridProps {
  /** Rendered width/height in px (square). */
  size: number;
  /** Number of columns in the ASCII map (drives the pixel scale). */
  cols: number;
  /** Row strings; each char is a palette key, "." is transparent. */
  map: PixelMap;
  palette: PixelPalette;
  className?: string;
  style?: CSSProperties;
}

/**
 * Renders a pixel-art sprite from an ASCII grid map: every non-"." char maps to
 * a palette color and becomes a <rect>. Keys are coordinate-derived (stable for
 * a static grid that never reorders).
 *
 * Pure/presentational — safe in a Server Component.
 */
export function PixelGrid({
  size,
  cols,
  map,
  palette,
  className,
  style,
}: PixelGridProps) {
  const px = size / cols;
  const cells: { id: string; x: number; y: number; fill: string }[] = [];

  map.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      if (ch !== '.') {
        cells.push({
          id: `${x}-${y}`,
          x,
          y,
          fill: palette[ch] ?? 'transparent',
        });
      }
    });
  });

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
      className={className}
      style={{ imageRendering: 'pixelated', display: 'block', ...style }}
    >
      {cells.map((c) => (
        <rect
          key={c.id}
          x={c.x * px}
          y={c.y * px}
          width={px}
          height={px}
          fill={c.fill}
        />
      ))}
    </svg>
  );
}
