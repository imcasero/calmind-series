import type { ReactNode } from 'react';
import { PhaseProvider } from '@/components/providers/PhaseProvider';
import { MarqueeStrip } from '@/components/shared/layout/hub/MarqueeStrip';
import { ShellClientEffects } from '@/components/shared/layout/hub/ShellClientEffects';
import { TopBar } from '@/components/shared/layout/hub/TopBar';
import {
  type DivisionPreview,
  getActiveSeasonWithSplit,
  getAllSeasonsWithSplits,
  getCurrentRound,
  getDivisionPreview,
} from '@/lib/queries';
import {
  getPhase,
  isFinalsUnlocked,
  type Phase,
  TOTAL_ROUNDS,
} from '@/lib/utils/phase';

/** Auto-generated status strip content (README §"marquee status strip"). */
function buildMarqueeItems(
  phase: Phase,
  currentRound: number,
  preview: DivisionPreview,
): string[] {
  const items: string[] = [`${phase.icon} ${phase.label}`];
  items.push(
    currentRound > 0
      ? `JORNADA ${currentRound} / ${TOTAL_ROUNDS}`
      : 'PRETEMPORADA',
  );

  const d1Leader = preview.primera[0];
  const d2Leader = preview.segunda[0];
  if (d1Leader) {
    items.push(`D1 LÍDER · ${d1Leader.nickname}`);
  }
  if (d2Leader) {
    items.push(`D2 LÍDER · ${d2Leader.nickname}`);
  }

  items.push(
    isFinalsUnlocked(currentRound)
      ? '⚔ CRUCES EN JUEGO'
      : '🔒 CRUCES SE ABREN EN J15',
  );
  items.push('CALMIND SERIES · PRIMERA Y SEGUNDA DIVISIÓN');
  return items;
}

/**
 * Shared redesign shell (FR2/FR9): `.pixel-root` + scanlines, `PhaseProvider`
 * seeded from the active split, sticky TopBar, marquee, and a centered main.
 * Used by both the `/hub` and `/archivo` layouts so the TopBar nav is consistent.
 */
export async function PixelShell({ children }: { children: ReactNode }) {
  const seasonInfo = await getActiveSeasonWithSplit();
  const activeSplitId = seasonInfo?.activeSplit?.id ?? null;

  const [currentRound, seasons, preview] = await Promise.all([
    activeSplitId ? getCurrentRound(activeSplitId) : Promise.resolve(0),
    getAllSeasonsWithSplits(),
    activeSplitId
      ? getDivisionPreview(activeSplitId)
      : Promise.resolve<DivisionPreview>({ primera: [], segunda: [] }),
  ]);

  const phase = getPhase(currentRound);
  const marqueeItems = buildMarqueeItems(phase, currentRound, preview);

  return (
    <PhaseProvider initialRound={currentRound}>
      <ShellClientEffects />
      <div className="pixel-root scanlines">
        <TopBar
          activeSeasonName={seasonInfo?.name ?? null}
          activeSplitName={seasonInfo?.activeSplit?.name ?? null}
          seasons={seasons}
        />
        <MarqueeStrip items={marqueeItems} />
        <main className="mx-auto w-full max-w-[1280px] px-6 py-12">
          {children}
        </main>
      </div>
    </PhaseProvider>
  );
}
