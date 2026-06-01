import type { ReactNode } from 'react';
import { PhaseProvider } from '@/components/providers/PhaseProvider';
import { MarqueeStrip } from '@/components/shared/layout/hub/MarqueeStrip';
import { ShellClientEffects } from '@/components/shared/layout/hub/ShellClientEffects';
import { TopBar } from '@/components/shared/layout/hub/TopBar';
import type { DivisionPreview, SeasonWithSplits } from '@/lib/queries';
import {
  getPhase,
  isFinalsUnlocked,
  type Phase,
  TOTAL_ROUNDS,
} from '@/lib/utils/phase';

interface PixelShellData {
  activeSeasonName: string | null;
  activeSplitName: string | null;
  seasons: SeasonWithSplits[];
  currentRound: number;
  preview: DivisionPreview;
}

interface PixelShellProps extends PixelShellData {
  children: ReactNode;
}

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
 *
 * Pure renderer — data is fetched by each layout (`HubLayout` cookie-aware for
 * live `/hub`, `ArchivoLayout` cookie-free so `/archivo/[season]/[split]` stays
 * eligible for `generateStaticParams` SSG per REQ-21). The shell itself never
 * touches `cookies()`.
 */
export function PixelShell({
  activeSeasonName,
  activeSplitName,
  seasons,
  currentRound,
  preview,
  children,
}: PixelShellProps) {
  const phase = getPhase(currentRound);
  const marqueeItems = buildMarqueeItems(phase, currentRound, preview);

  return (
    <PhaseProvider initialRound={currentRound}>
      <ShellClientEffects />
      <div className="pixel-root scanlines">
        <TopBar
          activeSeasonName={activeSeasonName}
          activeSplitName={activeSplitName}
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
