import Link from 'next/link';
import { ROUTES } from '@/lib/constants/routes';
import type {
  DivisionPreview,
  MatchEntry,
  RankingEntry,
} from '@/lib/types/schemas';
import { cn } from '@/lib/utils';
import {
  recentStreak,
  type StreakResult,
  ZONES,
  zoneForPosition,
} from '@/lib/utils/standings';
import { trainerColor } from '@/lib/utils/trainerColor';

interface StandingsLiveProps {
  preview: DivisionPreview;
  matches: MatchEntry[];
}

type Accent = 'magenta' | 'cyan';

/** Dual division standings panels with position zones, streak pips and lives. */
export function StandingsLive({ preview, matches }: StandingsLiveProps) {
  return (
    <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <DivisionPanel
        title="División 1 · Élite"
        accent="magenta"
        rows={preview.primera}
        matches={matches}
      />
      <DivisionPanel
        title="División 2 · Aspirantes"
        accent="cyan"
        rows={preview.segunda}
        matches={matches}
      />
    </section>
  );
}

function DivisionPanel({
  title,
  accent,
  rows,
  matches,
}: {
  title: string;
  accent: Accent;
  rows: RankingEntry[];
  matches: MatchEntry[];
}) {
  const accentColor =
    accent === 'magenta' ? 'var(--color-px-magenta)' : 'var(--color-px-cyan)';

  return (
    <div
      className="border-[3px] bg-px-elev"
      style={{ borderColor: accentColor }}
    >
      <h3
        className="border-b-[3px] px-4 py-3 font-pixel text-xs uppercase tracking-wider"
        style={{ borderColor: accentColor, color: accentColor }}
      >
        {title}
      </h3>

      <ul>
        {rows.length === 0 && (
          <li className="px-4 py-4 font-retro text-base text-px-ink-dim">
            Sin clasificación todavía.
          </li>
        )}
        {rows.map((entry) => (
          <StandingRow key={entry.trainerId} entry={entry} matches={matches} />
        ))}
      </ul>

      <div className="flex items-center gap-4 border-t-[3px] border-px-border px-4 py-2">
        {ZONES.map((zone) => (
          <span key={zone.id} className="flex items-center gap-1.5">
            <span
              className="inline-block size-2.5"
              style={{ backgroundColor: zone.color }}
            />
            <span className="font-pixel text-[8px] uppercase tracking-wider text-px-ink-dim">
              {zone.label}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

function StandingRow({
  entry,
  matches,
}: {
  entry: RankingEntry;
  matches: MatchEntry[];
}) {
  const zone = zoneForPosition(entry.position);
  const color = trainerColor(entry.trainerId);
  const streak = recentStreak(entry.trainerId, matches, 3).map((result, i) => ({
    id: `${entry.trainerId}-s${i}`,
    result,
  }));

  return (
    <li>
      <Link
        href={ROUTES.hubTrainer(entry.trainerId)}
        className="flex items-center gap-3 border-l-4 px-4 py-2.5 transition-colors hover:bg-px-base"
        style={{ borderLeftColor: zone.color }}
      >
        <span className="w-5 text-center font-num text-sm text-px-ink-dim">
          {entry.position}
        </span>
        <span
          className="inline-block size-2.5 shrink-0"
          style={{ backgroundColor: color }}
        />
        <span className="flex-1 truncate font-retro text-lg text-px-ink">
          {entry.nickname}
        </span>

        <span className="flex items-center gap-1">
          {streak.map((pip) => (
            <StreakPip key={pip.id} result={pip.result} />
          ))}
        </span>

        <span
          className="flex items-center gap-1 font-num text-xs"
          style={{ color: 'var(--color-px-gold)' }}
          title={`${entry.lives} vidas`}
        >
          <span aria-hidden="true">♥</span>
          {entry.lives}
        </span>

        <span className="w-8 text-right font-num text-base font-bold text-px-ink">
          {entry.totalPoints}
        </span>
      </Link>
    </li>
  );
}

function StreakPip({ result }: { result: StreakResult }) {
  return (
    <span
      className={cn(
        'grid size-4 place-items-center font-pixel text-[8px] text-px-deep',
        result === 'W' ? 'bg-px-success' : 'bg-px-danger',
      )}
    >
      {result}
    </span>
  );
}
