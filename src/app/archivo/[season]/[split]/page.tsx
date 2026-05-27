import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { HubPageHeader } from '@/components/hub';
import { PixelCrown } from '@/components/shared/ui/pixel';
import {
  getArchiveChampions,
  getDivisionPreview,
  getSplitByNames,
} from '@/lib/queries';
import type { RankingEntry } from '@/lib/types/schemas';
import { trainerColor } from '@/lib/utils/trainerColor';

interface ArchiveDetailProps {
  params: Promise<{ season: string; split: string }>;
}

export async function generateMetadata({
  params,
}: ArchiveDetailProps): Promise<Metadata> {
  const { season, split } = await params;
  return {
    title: `${season.toUpperCase()} · ${split.toUpperCase()} · Archivo`,
    description: `Resultado histórico del ${split} de ${season} en Pokemon Calmind Series.`,
  };
}

/** Archive split detail (FR9): champions + final podium for a past split. */
export default async function ArchiveDetailPage({
  params,
}: ArchiveDetailProps) {
  const { season, split } = await params;
  const info = await getSplitByNames(season, split);

  if (!info) {
    notFound();
  }

  const [champions, preview] = await Promise.all([
    getArchiveChampions(),
    getDivisionPreview(info.split.id),
  ]);
  const champ = champions.get(info.split.id);

  return (
    <div className="flex flex-col gap-8">
      <HubPageHeader
        eyebrow={`${info.season.name.toUpperCase()} · ${info.split.name.toUpperCase()}`}
        title="Archivo del split"
      />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ChampionPanel
          title="Campeón División 1"
          accent="var(--color-px-magenta)"
          name={champ?.d1Champion ?? null}
        />
        <ChampionPanel
          title="Campeón División 2"
          accent="var(--color-px-cyan)"
          name={champ?.d2Champion ?? null}
        />
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Podium
          title="Podio D1"
          accent="var(--color-px-magenta)"
          rows={preview.primera.slice(0, 3)}
        />
        <Podium
          title="Podio D2"
          accent="var(--color-px-cyan)"
          rows={preview.segunda.slice(0, 3)}
        />
      </section>
    </div>
  );
}

function ChampionPanel({
  title,
  accent,
  name,
}: {
  title: string;
  accent: string;
  name: string | null;
}) {
  return (
    <div
      className="flex flex-col items-center gap-3 border-[3px] p-6 text-center"
      style={{ borderColor: accent }}
    >
      <span
        className="font-pixel text-[9px] uppercase tracking-widest"
        style={{ color: accent }}
      >
        {title}
      </span>
      {name ? (
        <>
          <PixelCrown size={36} />
          <p className="font-pixel text-xl text-px-ink">{name}</p>
        </>
      ) : (
        <p className="font-retro text-lg text-px-ink-dim">
          Sin campeón registrado.
        </p>
      )}
    </div>
  );
}

function Podium({
  title,
  accent,
  rows,
}: {
  title: string;
  accent: string;
  rows: RankingEntry[];
}) {
  return (
    <div className="border-[3px] border-px-border bg-px-elev p-4">
      <h3
        className="mb-3 font-pixel text-xs uppercase"
        style={{ color: accent }}
      >
        {title}
      </h3>
      {rows.length === 0 ? (
        <p className="font-retro text-base text-px-ink-dim">Sin datos.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map((entry) => (
            <li key={entry.trainerId} className="flex items-center gap-3">
              <span className="w-5 font-num text-sm text-px-ink-dim">
                {entry.position}
              </span>
              <span
                className="inline-block size-2.5 shrink-0"
                style={{ backgroundColor: trainerColor(entry.trainerId) }}
              />
              <span className="flex-1 truncate font-retro text-base text-px-ink">
                {entry.nickname}
              </span>
              <span className="font-num text-sm font-bold text-px-ink">
                {entry.totalPoints}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
