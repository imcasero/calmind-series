import { type ReactNode, Suspense } from 'react';
import { ShellSkeleton } from '@/components/shared';
import { PixelShell } from '@/components/shared/layout/hub/PixelShell';
import {
  type DivisionPreview,
  getArchiveDivisionPreview,
  getPublicActiveSeasonWithSplit,
  getPublicAllSeasonsWithSplits,
  getPublicCurrentRound,
} from '@/lib/queries';

/**
 * Archive layout (FR9 / REQ-21): fetches the shell payload with the
 * **cookie-free** Supabase client so `/archivo/[season]/[split]` stays
 * eligible for `generateStaticParams` SSG. The chrome itself (`PixelShell`)
 * is a pure renderer shared with the hub.
 *
 * Wave A REQ-44: the async fetch block lives inside `ArchivoShell` under a
 * Suspense boundary so `cacheComponents: true` (Wave B) can land without
 * aborting prerender.
 */
async function ArchivoShell({ children }: { children: ReactNode }) {
  const seasonInfo = await getPublicActiveSeasonWithSplit();
  const activeSplitId = seasonInfo?.activeSplit?.id ?? null;

  const [currentRound, seasons, preview] = await Promise.all([
    activeSplitId ? getPublicCurrentRound(activeSplitId) : Promise.resolve(0),
    getPublicAllSeasonsWithSplits(),
    activeSplitId
      ? getArchiveDivisionPreview(activeSplitId)
      : Promise.resolve<DivisionPreview>({ primera: [], segunda: [] }),
  ]);

  return (
    <PixelShell
      activeSeasonName={seasonInfo?.name ?? null}
      activeSplitName={seasonInfo?.activeSplit?.name ?? null}
      seasons={seasons}
      currentRound={currentRound}
      preview={preview}
    >
      {children}
    </PixelShell>
  );
}

export default function ArchivoLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<ShellSkeleton />}>
      <ArchivoShell>{children}</ArchivoShell>
    </Suspense>
  );
}
