import Link from 'next/link';
import { PixelCrown } from '@/components/shared/ui/pixel';
import { ROUTES } from '@/lib/constants/routes';

export interface ArchiveSplitVM {
  id: string;
  name: string;
  seasonName: string;
  isActive: boolean;
  d1Champion: string | null;
  d2Champion: string | null;
}

export interface ArchiveSeasonVM {
  id: string;
  name: string;
  year: number;
  splits: ArchiveSplitVM[];
}

/** Time-machine archive (FR9): seasons stacked newest-first, each with split cards. */
export function ArchiveView({ seasons }: { seasons: ArchiveSeasonVM[] }) {
  if (seasons.length === 0) {
    return (
      <p className="font-retro text-lg text-px-ink-dim">
        No hay temporadas archivadas todavía.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {seasons.map((season) => (
        <section
          key={season.id}
          className="border-[3px] border-px-border-hi bg-px-elev p-5"
        >
          <h2 className="mb-4 font-pixel text-base uppercase text-px-ink">
            {season.name} · {season.year}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {season.splits.map((split) => (
              <SplitCard key={split.id} split={split} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function SplitCard({ split }: { split: ArchiveSplitVM }) {
  if (split.isActive) {
    return (
      <div className="flex flex-col gap-3 border-[3px] border-px-magenta bg-px-base p-4">
        <span className="blink font-pixel text-[9px] uppercase tracking-widest text-px-success">
          ● En curso
        </span>
        <h3 className="font-pixel text-sm text-px-ink">
          {split.name.toUpperCase()}
        </h3>
        <Link
          href={ROUTES.hub}
          className="pixel-btn pixel-btn--primary pixel-btn--sm self-start"
        >
          ENTRAR AL HUB ►
        </Link>
      </div>
    );
  }

  return (
    <Link
      href={ROUTES.archiveDetail(split.seasonName, split.name)}
      className="flex flex-col gap-3 border-[3px] border-dashed border-px-border bg-px-deep p-4 transition-transform hover:-translate-y-0.5"
    >
      <h3 className="font-pixel text-sm text-px-ink-soft">
        {split.name.toUpperCase()}
      </h3>
      <div className="flex flex-col gap-1.5">
        <ChampionLine label="D1" name={split.d1Champion} />
        <ChampionLine label="D2" name={split.d2Champion} />
      </div>
      <span className="font-pixel text-[9px] uppercase tracking-wider text-px-gold">
        Ver split ✓
      </span>
    </Link>
  );
}

function ChampionLine({ label, name }: { label: string; name: string | null }) {
  return (
    <span className="flex items-center gap-2">
      <span className="font-pixel text-[8px] uppercase text-px-ink-dim">
        {label}
      </span>
      {name ? <PixelCrown size={12} /> : null}
      <span className="font-retro text-base text-px-ink">{name ?? '—'}</span>
    </span>
  );
}
