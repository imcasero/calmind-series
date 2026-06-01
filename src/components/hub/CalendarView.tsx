import Link from 'next/link';
import { PixelCrown } from '@/components/shared/ui/pixel';
import { ROUTES } from '@/lib/constants/routes';
import type { MatchEntry, MatchesByRound } from '@/lib/types/schemas';
import { getPhase, isFinalsUnlocked, TOTAL_ROUNDS } from '@/lib/utils/phase';
import { trainerColor } from '@/lib/utils/trainerColor';
import { RoundSelectorShell } from './clients/RoundSelectorShell';

const ROUNDS = Array.from({ length: TOTAL_ROUNDS }, (_, i) => i + 1);

interface CalendarViewProps {
  matchesByRound: MatchesByRound;
  currentRound: number;
}

function roundMatches(byRound: MatchesByRound, round: number): MatchEntry[] {
  return byRound.find((r) => r.round === round)?.matches ?? [];
}

/**
 * Calendar (FR5 / REQ-23.3): pre-renders all 16 round detail blocks Server-side
 * and hands them to the tiny `<RoundSelectorShell>` client as named slots. The
 * shell owns the selected-round state and toggles slot visibility via CSS
 * `hidden`, so the per-round match listings (and their pixel icons) never enter
 * the client bundle.
 *
 * Real per-round dates are not in the DB, so the known weekly cadence
 * ("Domingo · 18:00 CEST") is shown instead of fabricating dates.
 */
export function CalendarView({
  matchesByRound,
  currentRound,
}: CalendarViewProps) {
  const initial = currentRound > 0 ? Math.min(currentRound, TOTAL_ROUNDS) : 1;
  const roundSlots = ROUNDS.map((round) => ({
    round,
    node: (
      <RoundDetail
        round={round}
        matches={roundMatches(matchesByRound, round)}
      />
    ),
  }));

  return (
    <div className="flex flex-col gap-6">
      <RoundSelectorShell
        currentRound={currentRound}
        initialRound={initial}
        roundSlots={roundSlots}
      />
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4">
        <LegendItem color="var(--color-px-cyan)" label="Fase Regular" />
        <LegendItem color="var(--color-px-magenta)" label="Cruces · J15" />
        <LegendItem color="var(--color-px-gold)" label="Finales · J16" />
      </div>
    </div>
  );
}

function RoundDetail({
  round,
  matches,
}: {
  round: number;
  matches: MatchEntry[];
}) {
  const phase = getPhase(round);
  const primera = matches.filter((m) => m.leagueTierName === 'Primera');
  const segunda = matches.filter((m) => m.leagueTierName === 'Segunda');

  return (
    <section className="border-[3px] border-px-border bg-px-elev p-5">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b-[3px] border-px-border pb-3">
        <div className="flex items-center gap-3">
          <h3 className="font-pixel text-lg" style={{ color: phase.color }}>
            Jornada {round}
          </h3>
          <span
            className="border-2 px-2 py-1 font-pixel text-[8px] uppercase"
            style={{ borderColor: phase.color, color: phase.color }}
          >
            {phase.label}
          </span>
        </div>
        <span className="font-pixel text-[9px] uppercase tracking-wider text-px-ink-dim">
          Domingo · 18:00 CEST
        </span>
      </header>

      {matches.length === 0 ? (
        <FinalsOrEmpty round={round} />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <MatchColumn title="División 1" accent="magenta" matches={primera} />
          <MatchColumn title="División 2" accent="cyan" matches={segunda} />
        </div>
      )}
    </section>
  );
}

function MatchColumn({
  title,
  accent,
  matches,
}: {
  title: string;
  accent: 'magenta' | 'cyan';
  matches: MatchEntry[];
}) {
  const color =
    accent === 'magenta' ? 'var(--color-px-magenta)' : 'var(--color-px-cyan)';
  return (
    <div>
      <h4
        className="mb-2 font-pixel text-[10px] uppercase tracking-wider"
        style={{ color }}
      >
        {title}
      </h4>
      {matches.length === 0 ? (
        <p className="font-retro text-base text-px-ink-dim">
          Sin enfrentamientos.
        </p>
      ) : (
        <ul className="flex flex-col">
          {matches.map((m) => (
            <CalendarMatchRow key={m.id} match={m} />
          ))}
        </ul>
      )}
    </div>
  );
}

function CalendarMatchRow({ match }: { match: MatchEntry }) {
  const homeWon = match.played && match.homeSets > match.awaySets;
  const awayWon = match.played && match.awaySets > match.homeSets;
  return (
    <li className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-b border-px-border/40 py-2 last:border-b-0">
      <span className="flex items-center gap-1.5">
        {match.homeTrainer && (
          <span
            className="inline-block size-2.5 shrink-0"
            style={{ backgroundColor: trainerColor(match.homeTrainer.id) }}
          />
        )}
        <span className="truncate font-retro text-base text-px-ink">
          {match.homeTrainer?.nickname ?? '—'}
        </span>
        {homeWon && <PixelCrown size={12} />}
      </span>
      <span className="px-2 font-num text-sm text-px-ink">
        {match.played ? `${match.homeSets}-${match.awaySets}` : 'vs'}
      </span>
      <span className="flex flex-row-reverse items-center gap-1.5 text-right">
        {match.awayTrainer && (
          <span
            className="inline-block size-2.5 shrink-0"
            style={{ backgroundColor: trainerColor(match.awayTrainer.id) }}
          />
        )}
        <span className="truncate font-retro text-base text-px-ink">
          {match.awayTrainer?.nickname ?? '—'}
        </span>
        {awayWon && <PixelCrown size={12} />}
      </span>
    </li>
  );
}

function FinalsOrEmpty({ round }: { round: number }) {
  if (isFinalsUnlocked(round)) {
    return (
      <p className="font-retro text-lg text-px-ink-soft">
        Fases finales —{' '}
        <Link href={ROUTES.hubBracket} className="text-px-magenta underline">
          ver el bracket
        </Link>
        .
      </p>
    );
  }
  return (
    <p className="font-retro text-lg text-px-ink-dim">
      Aún no hay enfrentamientos para esta jornada.
    </p>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-2">
      <span
        className="inline-block size-3"
        style={{ backgroundColor: color }}
      />
      <span className="font-pixel text-[8px] uppercase tracking-wider text-px-ink-dim">
        {label}
      </span>
    </span>
  );
}
