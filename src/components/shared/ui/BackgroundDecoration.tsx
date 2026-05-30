/**
 * Decorative background layer used to overlay the pixel scanline-starfield motif
 * on certain feature panels. Server Component, no client JS.
 *
 * Today only `variant="starfield"` is implemented (renders
 * `<div className="starfield" />`, whose CSS lives in `src/app/styles/pixel.css`).
 * The component centralizes the wrapper so future variants (fog, scanline-only)
 * can land here without editing call sites.
 */
type Variant = 'starfield';

interface BackgroundDecorationProps {
  variant?: Variant;
}

export function BackgroundDecoration({
  variant = 'starfield',
}: BackgroundDecorationProps) {
  return <div className={variant} />;
}
