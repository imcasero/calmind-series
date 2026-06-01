/**
 * Sized placeholder used as `<Suspense fallback={…}>` content while a hub section
 * streams in. Each variant approximates the panel's real footprint so that the
 * resolved markup does not shift layout (CLS).
 *
 * Server Component, no client JS. Adopted by REQ-22's granular Suspense
 * boundaries; not consumed elsewhere yet.
 */
type Variant =
  | 'phaseBanner'
  | 'standings'
  | 'bracket'
  | 'rightColumn'
  | 'newsRail'
  | 'calendar'
  | 'roster'
  | 'olimpo'
  | 'trainerProfile';

const SIZES: Record<Variant, string> = {
  phaseBanner: 'h-32',
  standings: 'h-[420px]',
  bracket: 'h-64',
  rightColumn: 'h-[480px]',
  newsRail: 'h-36',
  calendar: 'h-[600px]',
  roster: 'h-[560px]',
  olimpo: 'h-96',
  trainerProfile: 'h-[640px]',
};

interface SectionSkeletonProps {
  variant: Variant;
}

export function SectionSkeleton({ variant }: SectionSkeletonProps) {
  return (
    <div
      className={`${SIZES[variant]} animate-pulse border-[3px] border-px-border bg-px-elev`}
      aria-hidden="true"
    />
  );
}
