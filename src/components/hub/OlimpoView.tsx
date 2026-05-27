import {
  MonsterSprite,
  PixelCrown,
  PixelLightning,
} from '@/components/shared/ui/pixel';

export interface OlimpoChampionVM {
  role: string;
  accent: string;
  nickname: string;
  color: string;
  variant: number;
  position: number | null;
  pt: number;
  winrate: number;
  lives: number;
}

interface OlimpoViewProps {
  seasonName: string;
  splitName: string;
  official: boolean;
  d1: OlimpoChampionVM | null;
  d2: OlimpoChampionVM | null;
}

/**
 * El Olimpo (FR8): the cross-league playoff page. Competitors are projected from
 * standings (D1 survivor ≈ pos-7, D2 champion ≈ #1) — the exact official-winner
 * derivation depends on an unresolved narrative + olympus match data (deferred).
 * Countdown is hidden: there is no event date in the DB.
 */
export function OlimpoView({
  seasonName,
  splitName,
  official,
  d1,
  d2,
}: OlimpoViewProps) {
  return (
    <div className="flex flex-col gap-10">
      {/* Hero */}
      <section className="relative overflow-hidden border-[3px] border-px-gold bg-px-deep px-6 py-12 text-center">
        <div className="starfield" />
        <div className="relative flex flex-col items-center gap-4">
          <span className="font-pixel text-[10px] uppercase tracking-[0.3em] text-px-ink-dim">
            {seasonName.toUpperCase()} · {splitName.toUpperCase()}
          </span>
          <h1 className="title-chunk font-pixel text-5xl uppercase text-px-gold sm:text-7xl">
            Olimpo
          </h1>
          <span
            className={`border-2 px-3 py-1 font-pixel text-[9px] uppercase tracking-widest ${
              official
                ? 'border-px-success text-px-success'
                : 'border-px-gold text-px-gold'
            }`}
          >
            {official ? '✓ Competidores oficiales' : '▼ Proyección'}
          </span>
        </div>
      </section>

      {/* Face-off */}
      <section className="grid grid-cols-1 items-center gap-4 lg:grid-cols-[1fr_auto_1fr]">
        <ChampionCard champion={d1} fallbackRole="D1 · Survivor" />
        <div className="flex items-center justify-center">
          <span className="flex items-center gap-2 font-pixel text-2xl text-px-gold">
            <PixelLightning size={28} /> VS <PixelLightning size={28} />
          </span>
        </div>
        <ChampionCard champion={d2} fallbackRole="D2 · Champion" />
      </section>

      {/* El Camino */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RoadCard
          title={d1?.nickname ?? 'Survivor D1'}
          accent="var(--color-px-magenta)"
        />
        <RoadCard
          title={d2?.nickname ?? 'Champion D2'}
          accent="var(--color-px-cyan)"
        />
      </section>

      {/* Stakes */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <StakeCard
          title="Si gana Segunda · Ascenso"
          accent="var(--color-px-success)"
          bullets={[
            'El campeón de Segunda asciende a Primera División.',
            'El superviviente de Primera desciende a Segunda.',
          ]}
        />
        <StakeCard
          title="Si gana Primera · Defensa"
          accent="var(--color-px-gold)"
          bullets={[
            'El superviviente de Primera defiende su plaza.',
            'El campeón de Segunda permanece una temporada más.',
          ]}
        />
      </section>
    </div>
  );
}

function ChampionCard({
  champion,
  fallbackRole,
}: {
  champion: OlimpoChampionVM | null;
  fallbackRole: string;
}) {
  if (!champion) {
    return (
      <div className="border-[3px] border-px-border bg-px-elev p-6 text-center">
        <span className="font-pixel text-[9px] uppercase tracking-widest text-px-ink-dim">
          {fallbackRole}
        </span>
        <p className="mt-4 font-retro text-xl text-px-ink-dim">Por decidir</p>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col items-center gap-4 border-[3px] p-6"
      style={{
        borderColor: champion.color,
        background: `color-mix(in srgb, ${champion.color} 10%, var(--color-px-elev))`,
      }}
    >
      <span
        className="border-2 px-2 py-0.5 font-pixel text-[8px] uppercase tracking-widest"
        style={{ borderColor: champion.accent, color: champion.accent }}
      >
        {champion.role}
      </span>
      <MonsterSprite
        size={96}
        variant={champion.variant}
        color={champion.color}
      />
      <h2
        className="font-pixel text-2xl"
        style={{
          color: champion.color,
          textShadow: '3px 3px 0 var(--color-px-deep)',
        }}
      >
        {champion.nickname}
      </h2>
      <div className="grid w-full grid-cols-4 gap-1 border-t-[3px] border-px-border pt-3 text-center">
        <Stat
          label="Pos"
          value={champion.position ? `#${champion.position}` : '—'}
        />
        <Stat label="PT" value={String(champion.pt)} />
        <Stat label="WR" value={`${champion.winrate}%`} />
        <Stat label="Vidas" value={String(champion.lives)} />
      </div>
    </div>
  );
}

const ROAD_STEPS = [
  { chip: 'J1–J14', text: 'Fase regular: forjó su posición.' },
  { chip: 'J15', text: 'Cruces: superó su llave.' },
  { chip: 'J16', text: 'Finales: selló su billete.' },
  { chip: 'POST', text: 'El Olimpo: el cruce entre divisiones.' },
];

function RoadCard({ title, accent }: { title: string; accent: string }) {
  return (
    <div className="border-[3px] border-px-border bg-px-elev p-5">
      <h3
        className="mb-4 font-pixel text-sm uppercase"
        style={{ color: accent }}
      >
        {title} · El Camino
      </h3>
      <ul className="flex flex-col gap-3">
        {ROAD_STEPS.map((step) => (
          <li key={step.chip} className="flex items-center gap-3">
            <span
              className="shrink-0 border-2 px-2 py-1 font-pixel text-[8px] uppercase"
              style={{ borderColor: accent, color: accent }}
            >
              {step.chip}
            </span>
            <span className="font-retro text-base text-px-ink-soft">
              {step.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StakeCard({
  title,
  accent,
  bullets,
}: {
  title: string;
  accent: string;
  bullets: string[];
}) {
  return (
    <div className="border-[3px] p-5" style={{ borderColor: accent }}>
      <h3
        className="mb-3 flex items-center gap-2 font-pixel text-sm uppercase"
        style={{ color: accent }}
      >
        <PixelCrown size={18} /> {title}
      </h3>
      <ul className="flex flex-col gap-2">
        {bullets.map((bullet) => (
          <li key={bullet} className="font-retro text-base text-px-ink-soft">
            ▸ {bullet}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-num text-base font-bold text-px-ink">{value}</span>
      <span className="font-pixel text-[7px] uppercase tracking-wider text-px-ink-dim">
        {label}
      </span>
    </div>
  );
}
