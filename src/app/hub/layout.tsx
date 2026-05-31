import { type ReactNode, Suspense } from 'react';
import { ShellSkeleton } from '@/components/shared';
import { PixelShell } from '@/components/shared/layout/hub/PixelShell';
import {
  type DivisionPreview,
  getActiveSeasonWithSplit,
  getAllSeasonsWithSplits,
  getCurrentRound,
  getDivisionPreview,
} from '@/lib/queries';

/**
 * Hub layout (FR2/FR9): fetches the shell payload with the cookie-aware
 * Supabase client so `/hub/*` routes stay request-time live. The actual chrome
 * (`PixelShell`) is a pure renderer — see
 * `components/shared/layout/hub/PixelShell.tsx`.
 *
 * Wave A REQ-44: the async fetch block lives inside `HubShell` so the
 * Suspense boundary owns the await. This is the contract under
 * `cacheComponents: true` (Wave B); the page can stream while the shell
 * resolves.
 */
async function HubShell({ children }: { children: ReactNode }) {
  const seasonInfo = await getActiveSeasonWithSplit();
  const activeSplitId = seasonInfo?.activeSplit?.id ?? null;

  const [currentRound, seasons, preview] = await Promise.all([
    activeSplitId ? getCurrentRound(activeSplitId) : Promise.resolve(0),
    getAllSeasonsWithSplits(),
    activeSplitId
      ? getDivisionPreview(activeSplitId)
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

export default function HubLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<ShellSkeleton />}>
      <HubShell>{children}</HubShell>
    </Suspense>
  );
}
