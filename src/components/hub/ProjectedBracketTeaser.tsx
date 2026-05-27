import Link from 'next/link';
import { PixelCrown } from '@/components/shared/ui/pixel';
import { ROUTES } from '@/lib/constants/routes';
import type { DivisionPreview, RankingEntry } from '@/lib/types/schemas';
import { isFinalsUnlocked } from '@/lib/utils/phase';
import { trainerColor } from '@/lib/utils/trainerColor';

interface ProjectedBracketTeaserProps {
  preview: DivisionPreview;
  currentRound: number;
}

function handle(entry: RankingEntry | undefined): string {
  return entry?.nickname ?? 'Por decidir';
}

/**
 * Hub teaser of the playoff bracket, projected from current standings until J15.
 * The full bracket (projected vs official) is FR7; this is a forward link.
 */
export function ProjectedBracketTeaser({
  preview,
  currentRound,
}: ProjectedBracketTeaserProps) {
  const official = isFinalsUnlocked(currentRound);
  const d1SurvivorProjection = preview.primera[6];
  const d2ChampionProjection = preview.segunda[0];

  return (
    <section
      className="flex flex-col gap-4 border-[3px] border-dashed border-px-gold bg-px-base p-5"
      style={{ borderStyle: 'dashed' }}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="font-pixel text-[9px] uppercase leading-relaxed tracking-widest text-px-gold">
          {official
            ? 'Bracket oficial · fases finales en juego'
            : 'Bracket proyectado · basado en la clasificación actual · no oficial hasta J15'}
        </p>
        <Link
          href={ROUTES.hubBracket}
          className="pixel-btn pixel-btn--ghost pixel-btn--sm shrink-0"
        >
          EXPANDIR ►
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ProjectedSlot
          label="D1 · Gran Final"
          a={handle(preview.primera[0])}
          b={handle(preview.primera[1])}
          aId={preview.primera[0]?.trainerId}
          bId={preview.primera[1]?.trainerId}
        />
        <ProjectedSlot
          label="D2 · Gran Final"
          a={handle(preview.segunda[0])}
          b={handle(preview.segunda[1])}
          aId={preview.segunda[0]?.trainerId}
          bId={preview.segunda[1]?.trainerId}
        />
      </div>

      <div className="flex items-center justify-center gap-4 border-t-[3px] border-px-border pt-4">
        <PixelCrown size={28} />
        <span className="font-pixel text-[9px] uppercase tracking-widest text-px-ink-dim">
          Olimpo proyectado
        </span>
        <span className="font-retro text-lg text-px-ink">
          {handle(d1SurvivorProjection)}
        </span>
        <span className="font-pixel text-xs text-px-gold">VS</span>
        <span className="font-retro text-lg text-px-ink">
          {handle(d2ChampionProjection)}
        </span>
      </div>
    </section>
  );
}

function ProjectedSlot({
  label,
  a,
  b,
  aId,
  bId,
}: {
  label: string;
  a: string;
  b: string;
  aId?: string;
  bId?: string;
}) {
  return (
    <div className="border-2 border-px-border bg-px-elev p-3">
      <p className="mb-2 font-pixel text-[8px] uppercase tracking-widest text-px-gold">
        {label}
      </p>
      <SlotTrainer seed="#1" name={a} id={aId} />
      <SlotTrainer seed="#2" name={b} id={bId} />
    </div>
  );
}

function SlotTrainer({
  seed,
  name,
  id,
}: {
  seed: string;
  name: string;
  id?: string;
}) {
  return (
    <div className="flex items-center gap-2 py-1">
      <span className="font-num text-xs text-px-ink-dim">{seed}</span>
      {id && (
        <span
          className="inline-block size-2.5"
          style={{ backgroundColor: trainerColor(id) }}
        />
      )}
      <span className="font-retro text-base text-px-ink">{name}</span>
    </div>
  );
}
