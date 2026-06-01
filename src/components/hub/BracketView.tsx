import Link from 'next/link';
import { BackgroundDecoration } from '@/components/shared';
import { PixelArrow, PixelCrown } from '@/components/shared/ui/pixel';
import { ROUTES } from '@/lib/constants/routes';
import type {
  BracketMatchVM,
  BracketTeamVM,
  DivisionBracketVM,
} from '@/lib/services/bracketService';
import { cn } from '@/lib/utils';
import { isFinalsUnlocked } from '@/lib/utils/phase';
import { trainerColor } from '@/lib/utils/trainerColor';

interface BracketViewProps {
  primera: DivisionBracketVM;
  segunda: DivisionBracketVM;
  currentRound: number;
}

/** Playoff bracket (FR7): per division, a TOP-4 and a BOTTOM-4 lane, each with a
 * J15 → J16 column flow, plus a projected/official badge and the Olympus junction. */
export function BracketView({
  primera,
  segunda,
  currentRound,
}: BracketViewProps) {
  const official = isFinalsUnlocked(currentRound);

  return (
    <div className="flex flex-col gap-10">
      {!official && (
        <div className="border-[3px] border-dashed border-px-gold bg-px-base p-3">
          <p className="font-pixel text-[10px] uppercase tracking-widest text-px-gold">
            ⚠ Modo proyección · basado en la clasificación · no oficial hasta
            J15
          </p>
        </div>
      )}

      <DivisionBlock
        title="División 1 · Élite"
        bracket={primera}
        official={official}
      />
      <DivisionBlock
        title="División 2 · Aspirantes"
        bracket={segunda}
        official={official}
      />

      <OlympusJunction />
    </div>
  );
}

function DivisionBlock({
  title,
  bracket,
  official,
}: {
  title: string;
  bracket: DivisionBracketVM;
  official: boolean;
}) {
  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <h2 className="font-pixel text-base uppercase text-px-ink">{title}</h2>
        <span
          className={cn(
            'border-2 px-2 py-0.5 font-pixel text-[8px] uppercase',
            official
              ? 'border-px-success text-px-success'
              : 'border-px-gold text-px-gold',
          )}
        >
          {official ? '✓ Oficial' : '▼ Proyectado'}
        </span>
      </div>

      <Lane
        label="Top 4 · Camino al título"
        accent="var(--color-px-gold)"
        round1={bracket.topSemis}
        round1Label="J15 · Semifinales"
        round2={bracket.topFinals}
        round2Label="J16 · Finales"
      />
      <Lane
        label="Bottom 4 · Supervivencia"
        accent="var(--color-px-danger)"
        round1={bracket.bottomSurvival}
        round1Label="J15 · Supervivencia"
        round2={bracket.bottomFinals}
        round2Label="J16 · Decisivas"
      />
    </section>
  );
}

function Lane({
  label,
  accent,
  round1,
  round1Label,
  round2,
  round2Label,
}: {
  label: string;
  accent: string;
  round1: BracketMatchVM[];
  round1Label: string;
  round2: BracketMatchVM[];
  round2Label: string;
}) {
  return (
    <div className="border-[3px] p-4" style={{ borderColor: accent }}>
      <p
        className="mb-3 font-pixel text-[9px] uppercase tracking-widest"
        style={{ color: accent }}
      >
        {label}
      </p>
      <div className="flex flex-col items-stretch gap-3 lg:flex-row lg:items-center">
        <Column heading={round1Label} matches={round1} accent={accent} />
        <span
          className="hidden shrink-0 self-center lg:block"
          style={{ color: accent }}
        >
          <PixelArrow size={20} color={accent} />
        </span>
        <Column heading={round2Label} matches={round2} accent={accent} />
      </div>
    </div>
  );
}

function Column({
  heading,
  matches,
  accent,
}: {
  heading: string;
  matches: BracketMatchVM[];
  accent: string;
}) {
  return (
    <div className="flex flex-1 flex-col gap-3">
      <p className="font-pixel text-[8px] uppercase tracking-wider text-px-ink-dim">
        {heading}
      </p>
      {matches.map((m) => (
        <MatchBox key={m.tag} match={m} accent={accent} />
      ))}
    </div>
  );
}

function MatchBox({
  match,
  accent,
}: {
  match: BracketMatchVM;
  accent: string;
}) {
  const homeWin =
    match.played &&
    match.home.sets !== undefined &&
    match.away.sets !== undefined &&
    match.home.sets > match.away.sets;
  const awayWin =
    match.played &&
    match.home.sets !== undefined &&
    match.away.sets !== undefined &&
    match.away.sets > match.home.sets;

  return (
    <div className="border-2 border-px-border bg-px-elev">
      <p
        className="border-b-2 border-px-border px-3 py-1.5 font-pixel text-[8px] uppercase tracking-wider"
        style={{ color: accent }}
      >
        {match.title}
      </p>
      <TeamRow team={match.home} winner={homeWin} />
      <TeamRow team={match.away} winner={awayWin} />
    </div>
  );
}

function TeamRow({ team, winner }: { team: BracketTeamVM; winner: boolean }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2">
      {team.trainerId ? (
        <span
          className="inline-block size-2.5 shrink-0"
          style={{ backgroundColor: trainerColor(team.trainerId) }}
        />
      ) : (
        <span className="inline-block size-2.5 shrink-0 bg-px-border" />
      )}
      <span
        className={cn(
          'flex-1 truncate font-retro text-base',
          winner ? 'text-px-gold' : 'text-px-ink',
        )}
      >
        {team.nickname}
      </span>
      {winner && <PixelCrown size={12} />}
      {team.sets !== undefined && (
        <span className="font-num text-sm text-px-ink">{team.sets}</span>
      )}
    </div>
  );
}

function OlympusJunction() {
  return (
    <section className="relative overflow-hidden border-[3px] border-px-gold bg-px-deep p-6 text-center">
      <BackgroundDecoration variant="starfield" />
      <div className="relative flex flex-col items-center gap-3">
        <PixelCrown size={40} />
        <h3 className="font-pixel text-lg uppercase text-px-gold">El Olimpo</h3>
        <p className="max-w-xl font-retro text-lg text-px-ink-soft">
          El cruce entre divisiones: el superviviente de Primera frente al
          campeón de Segunda. La pasarela entre ligas.
        </p>
        <Link
          href={ROUTES.hubOlimpo}
          className="pixel-btn pixel-btn--primary pixel-btn--sm"
        >
          IR AL OLIMPO ►
        </Link>
      </div>
    </section>
  );
}
