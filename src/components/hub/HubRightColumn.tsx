import { BackgroundDecoration } from '@/components/shared';
import { MonsterSprite, PixelCrown } from '@/components/shared/ui/pixel';
import type {
  DivisionPreview,
  MatchEntry,
  MatchesByRound,
  MatchTrainer,
} from '@/lib/types/schemas';
import { trainerColor } from '@/lib/utils/trainerColor';

interface HubRightColumnProps {
  matchesByRound: MatchesByRound;
  preview: DivisionPreview;
  currentRound: number;
}

function matchesForRound(byRound: MatchesByRound, round: number): MatchEntry[] {
  return byRound.find((r) => r.round === round)?.matches ?? [];
}

/** Right-hand stack: live feed, last results, and the Olympus projection. */
export function HubRightColumn({
  matchesByRound,
  preview,
  currentRound,
}: HubRightColumnProps) {
  const liveMatches = matchesForRound(matchesByRound, currentRound).slice(0, 4);
  const lastMatches = matchesForRound(matchesByRound, currentRound - 1)
    .filter((m) => m.played)
    .slice(0, 4);

  return (
    <aside className="flex flex-col gap-5">
      <article className="border-[3px] border-px-magenta bg-px-elev p-4">
        <header className="mb-3 flex items-center justify-between">
          <h3 className="font-pixel text-[10px] uppercase tracking-wider text-px-magenta">
            En juego
          </h3>
          <span className="blink font-pixel text-[8px] text-px-success">
            ● LIVE
          </span>
        </header>
        {liveMatches.length === 0 ? (
          <EmptyNote />
        ) : (
          liveMatches.map((m) => <MatchRow key={m.id} match={m} />)
        )}
      </article>

      <article className="border-[3px] border-px-border bg-px-elev p-4">
        <h3 className="mb-3 font-pixel text-[10px] uppercase tracking-wider text-px-ink-soft">
          Últimos resultados
        </h3>
        {lastMatches.length === 0 ? (
          <EmptyNote />
        ) : (
          lastMatches.map((m) => <MatchRow key={m.id} match={m} />)
        )}
      </article>

      <OlympusProjectionCard preview={preview} />
    </aside>
  );
}

function MatchRow({ match }: { match: MatchEntry }) {
  const homeWon = match.played && (match.homeSets ?? 0) > (match.awaySets ?? 0);
  const awayWon = match.played && (match.awaySets ?? 0) > (match.homeSets ?? 0);

  return (
    <div className="flex items-center justify-between gap-2 border-t border-px-border/40 py-1.5 first:border-t-0">
      <TrainerMini trainer={match.homeTrainer} winner={homeWon} />
      {match.played ? (
        <span className="font-num text-sm text-px-ink">
          {match.homeSets}-{match.awaySets}
        </span>
      ) : (
        <span className="font-pixel text-[9px] text-px-ink-dim">VS</span>
      )}
      <TrainerMini trainer={match.awayTrainer} winner={awayWon} alignEnd />
    </div>
  );
}

function TrainerMini({
  trainer,
  winner,
  alignEnd = false,
}: {
  trainer: MatchTrainer | null;
  winner: boolean;
  alignEnd?: boolean;
}) {
  if (!trainer) {
    return <span className="flex-1 font-retro text-sm text-px-ink-dim">—</span>;
  }
  return (
    <span
      className={`flex flex-1 items-center gap-1.5 ${alignEnd ? 'flex-row-reverse text-right' : ''}`}
    >
      <span
        className="inline-block size-2.5 shrink-0"
        style={{ backgroundColor: trainerColor(trainer.id) }}
      />
      <span className="truncate font-retro text-base text-px-ink">
        {trainer.nickname}
      </span>
      {winner && <PixelCrown size={12} />}
    </span>
  );
}

function OlympusProjectionCard({ preview }: { preview: DivisionPreview }) {
  const d1Survivor = preview.primera[6]?.nickname ?? 'Por decidir';
  const d2Champion = preview.segunda[0]?.nickname ?? 'Por decidir';

  return (
    <article className="relative overflow-hidden border-[3px] border-px-gold bg-px-deep p-4">
      <BackgroundDecoration variant="starfield" />
      <div className="relative flex items-center justify-between gap-2">
        <div className="flex flex-col items-center gap-1">
          <MonsterSprite
            size={48}
            variant={0}
            color="var(--color-px-magenta)"
          />
          <span className="font-pixel text-[7px] uppercase tracking-wider text-px-magenta">
            D1 · Survivor
          </span>
          <span className="font-retro text-sm text-px-ink">{d1Survivor}</span>
        </div>
        <span className="font-pixel text-sm text-px-gold">VS</span>
        <div className="flex flex-col items-center gap-1">
          <MonsterSprite size={48} variant={1} color="var(--color-px-cyan)" />
          <span className="font-pixel text-[7px] uppercase tracking-wider text-px-cyan">
            D2 · Champion
          </span>
          <span className="font-retro text-sm text-px-ink">{d2Champion}</span>
        </div>
      </div>
    </article>
  );
}

function EmptyNote() {
  return (
    <p className="font-retro text-base text-px-ink-dim">Nada por ahora.</p>
  );
}
