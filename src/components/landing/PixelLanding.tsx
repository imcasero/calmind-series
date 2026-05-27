import Link from 'next/link';
import { BattleScreen } from '@/components/landing/BattleScreen';
import {
  MonsterSprite,
  PixelArrow,
  PixelCrown,
  PixelGem,
  PixelSword,
} from '@/components/shared/ui/pixel';
import { EXTERNAL_ROUTES, ROUTES } from '@/lib/constants/routes';
import { TOTAL_ROUNDS } from '@/lib/utils/phase';

export interface LandingSnapVM {
  trainerId: string;
  nickname: string;
  color: string;
  variant: number;
  pt: number;
  pg: number;
  pp: number;
}

export interface LandingVM {
  seasonName: string;
  splitName: string;
  currentRound: number;
  phaseLabel: string;
  phaseColor: string;
  splitsCount: number;
  d1Leader: LandingSnapVM | null;
  d2Leader: LandingSnapVM | null;
  d1Exile: LandingSnapVM | null;
}

/** Pixel brand landing (FR11): slim entry to the Hub. */
export function PixelLanding({ vm }: { vm: LandingVM }) {
  return (
    <main>
      <HeroSection vm={vm} />
      <SnapshotSection vm={vm} />
      <FormatBrief />
      <OlimpoTeaser />
      <JoinCTA />
    </main>
  );
}

function HeroSection({ vm }: { vm: LandingVM }) {
  const stats: Array<[string, string, string]> = [
    ['16', 'ENTRENADORES', 'var(--color-px-magenta)'],
    ['2', 'DIVISIONES', 'var(--color-px-cyan)'],
    [`${vm.splitsCount}`, 'SPLITS', 'var(--color-px-gold)'],
    ['BO3', 'FORMATO', 'var(--color-px-success)'],
  ];

  return (
    <section className="relative overflow-hidden px-6 py-16">
      <div className="starfield" />
      <div className="mx-auto grid w-full max-w-[1280px] grid-cols-1 items-center gap-12 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="pixel-badge pixel-badge--magenta blink">
              ● {vm.seasonName.toUpperCase()} · {vm.splitName.toUpperCase()}
            </span>
            {vm.currentRound > 0 && (
              <span className="pixel-badge pixel-badge--cyan">
                J{String(vm.currentRound).padStart(2, '0')}/{TOTAL_ROUNDS}
              </span>
            )}
            <span className="pixel-badge pixel-badge--gold">
              {vm.phaseLabel.toUpperCase()}
            </span>
          </div>

          <h1
            className="font-pixel text-5xl leading-none text-px-ink sm:text-7xl"
            style={{
              textShadow:
                '6px 0 0 var(--color-px-magenta-2), 6px 6px 0 var(--color-px-deep), 12px 12px 0 var(--color-px-cyan-2)',
            }}
          >
            CALMIND
            <br />
            SERIES
          </h1>

          <p className="mt-8 max-w-xl font-retro text-2xl leading-relaxed text-px-ink-soft">
            Liga amateur competitiva.{' '}
            <span className="text-px-magenta">16 entrenadores</span>,{' '}
            <span className="text-px-cyan">2 divisiones</span>, una lucha por el{' '}
            <span className="text-px-gold">Olimpo</span>.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link href={ROUTES.hub} className="pixel-btn pixel-btn--primary">
              ► ENTRAR AL HUB
            </Link>
            <a
              href={EXTERNAL_ROUTES.INSCRIPTION_FORM}
              target="_blank"
              rel="noopener noreferrer"
              className="pixel-btn pixel-btn--ghost"
            >
              INSCRIBIRME <PixelArrow direction="right" size={12} />
            </a>
          </div>

          <div className="mt-12 flex flex-wrap gap-6">
            {stats.map(([n, l, c]) => (
              <div
                key={l}
                className="flex flex-col pl-3"
                style={{ borderLeft: `3px solid ${c}` }}
              >
                <span
                  className="font-pixel text-2xl leading-none"
                  style={{ color: c }}
                >
                  {n}
                </span>
                <span className="mt-1.5 font-pixel text-[9px] tracking-widest text-px-ink-dim">
                  {l}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid place-items-center">
          <GameBoyDevice vm={vm} />
        </div>
      </div>
    </section>
  );
}

function GameBoyDevice({ vm }: { vm: LandingVM }) {
  const attacker = vm.d1Leader?.nickname ?? 'RyuSora';
  const defender = vm.d1Exile?.nickname ?? vm.d2Leader?.nickname ?? 'VoidKai';

  return (
    <div
      className="w-[320px] border-4 border-px-border-hi p-4"
      style={{
        background: 'linear-gradient(180deg, #4b2c89 0%, #2d1654 100%)',
        boxShadow:
          '8px 8px 0 var(--color-px-deep), 16px 16px 0 var(--color-px-border)',
      }}
    >
      <div className="flex items-center justify-between pb-2">
        <span className="font-pixel text-[8px] text-px-ink-soft">
          CALMIND-COLOR
        </span>
        <span className="font-pixel text-[8px] text-px-cyan">● PWR</span>
      </div>
      <div
        className="relative min-h-[280px] border-[6px] border-px-deep p-3"
        style={{
          background: '#0d2818',
          boxShadow: 'inset 0 0 16px rgba(0,0,0,0.5)',
        }}
      >
        <BattleScreen attacker={attacker} defender={defender} />
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="relative size-16">
          <div className="absolute left-5 top-0 h-16 w-6 bg-px-deep" />
          <div className="absolute left-0 top-5 h-6 w-16 bg-px-deep" />
        </div>
        <div className="flex gap-2">
          <span className="grid size-8 place-items-center rounded-full border-[3px] border-px-deep bg-px-magenta font-pixel text-[10px] text-px-deep">
            B
          </span>
          <span className="grid size-8 place-items-center rounded-full border-[3px] border-px-deep bg-px-gold font-pixel text-[10px] text-px-deep">
            A
          </span>
        </div>
      </div>
    </div>
  );
}

function SnapshotSection({ vm }: { vm: LandingVM }) {
  return (
    <section className="border-y-[3px] border-px-border bg-px-base px-6 py-12">
      <div className="mx-auto w-full max-w-[1280px]">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="eyebrow">
              SNAPSHOT · J{String(vm.currentRound).padStart(2, '0')}
            </span>
            <h2 className="mt-2 font-pixel text-xl text-px-ink">
              EL SPLIT EN UN VISTAZO
            </h2>
          </div>
          <Link
            href={ROUTES.hub}
            className="pixel-btn pixel-btn--ghost pixel-btn--sm"
          >
            VER EL HUB <PixelArrow direction="right" size={10} />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <SnapPanel
            label="Líder D1"
            accent="var(--color-px-magenta)"
            snap={vm.d1Leader}
          />
          <SnapPanel
            label="Líder D2"
            accent="var(--color-px-cyan)"
            snap={vm.d2Leader}
          />
          <SnapPanel
            label="Zona Exilio D1"
            accent="var(--color-px-danger)"
            snap={vm.d1Exile}
          />
        </div>
      </div>
    </section>
  );
}

function SnapPanel({
  label,
  accent,
  snap,
}: {
  label: string;
  accent: string;
  snap: LandingSnapVM | null;
}) {
  if (!snap) {
    return (
      <div className="border-[3px] border-px-border bg-px-elev p-5">
        <span
          className="font-pixel text-[10px] tracking-widest"
          style={{ color: accent }}
        >
          ► {label}
        </span>
        <p className="mt-4 font-retro text-lg text-px-ink-dim">Por decidir.</p>
      </div>
    );
  }

  return (
    <Link
      href={ROUTES.hubTrainer(snap.trainerId)}
      className="block border-[3px] bg-px-elev p-5 transition-transform hover:-translate-y-0.5"
      style={{ borderColor: accent }}
    >
      <span
        className="font-pixel text-[10px] tracking-widest"
        style={{ color: accent }}
      >
        ► {label}
      </span>
      <div className="mt-4 flex items-center gap-3">
        <MonsterSprite size={56} variant={snap.variant} color={snap.color} />
        <span className="font-pixel text-sm text-px-ink">{snap.nickname}</span>
      </div>
      <div className="mt-4 border-t-2 border-dashed border-px-border pt-3">
        <span className="font-num text-lg text-px-ink">
          {snap.pt}pt · {snap.pg}-{snap.pp}
        </span>
      </div>
    </Link>
  );
}

const PHASE_CARDS = [
  {
    n: '01',
    range: 'J01 — J14',
    label: 'Fase Regular',
    color: 'var(--color-px-cyan)',
    text: 'Doble round-robin Bo3. 16 entrenadores escalan por puntos. Bracket proyectado.',
  },
  {
    n: '02',
    range: 'J15',
    label: 'Los Cruces',
    color: 'var(--color-px-magenta)',
    text: 'Top 4 → semifinales por el título. Bottom 4 → supervivencia por la permanencia.',
  },
  {
    n: '03',
    range: 'J16',
    label: 'Las Finales',
    color: 'var(--color-px-gold)',
    text: 'Gran Final, 3.º puesto y los combates decisivos por la permanencia.',
  },
  {
    n: '04',
    range: 'POST-J16',
    label: 'El Olimpo',
    color: 'var(--color-px-danger)',
    text: 'Cross-league: superviviente de D1 contra campeón de D2. El veredicto final.',
  },
];

const SCORING = [
  { p: 3, l: 'Victoria 2-0', c: 'var(--color-px-success)' },
  { p: 2, l: 'Victoria 2-1', c: 'var(--color-px-lime)' },
  { p: 1, l: 'Derrota 1-2', c: 'var(--color-px-gold)' },
  { p: 0, l: 'Derrota 0-2', c: 'var(--color-px-danger)' },
];

function FormatBrief() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto w-full max-w-[1280px]">
        <span className="eyebrow">CÓMO FUNCIONA</span>
        <h2 className="mt-2 font-pixel text-xl text-px-ink">
          EL CICLO DE UN SPLIT
        </h2>
        <p className="mt-4 max-w-2xl font-retro text-xl text-px-ink-soft">
          Cada split tiene 16 jornadas. La interfaz se reescribe según la fase
          activa para que solo veas lo que importa ahora.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PHASE_CARDS.map((card) => (
            <div
              key={card.n}
              className="relative border-[3px] bg-px-elev p-5"
              style={{ borderColor: card.color }}
            >
              <span
                className="absolute -top-3 left-4 border-2 px-2 py-1 font-pixel text-[10px] tracking-widest"
                style={{
                  borderColor: card.color,
                  color: card.color,
                  background: 'var(--color-px-void)',
                }}
              >
                FASE {card.n}
              </span>
              <h3 className="mb-1 mt-2 font-pixel text-lg text-px-ink">
                {card.label}
              </h3>
              <span
                className="font-pixel text-[9px] tracking-widest"
                style={{ color: card.color }}
              >
                {card.range}
              </span>
              <p className="mt-3 font-retro text-base text-px-ink-soft">
                {card.text}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 border-[3px] border-px-border bg-px-deep p-7">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <span
                className="eyebrow"
                style={{ color: 'var(--color-px-cyan)' }}
              >
                SCORING ENGINE
              </span>
              <h3 className="mt-2 font-pixel text-lg text-px-ink">
                CADA SET CUENTA
              </h3>
              <p className="mt-2 font-retro text-base text-px-ink-dim">
                Puntos por resultado. Desempate: set balance → sets ganados.
              </p>
            </div>
            <div className="flex flex-wrap gap-6">
              {SCORING.map((s) => (
                <div key={s.l} className="flex min-w-20 flex-col items-center">
                  <span
                    className="font-pixel text-4xl"
                    style={{
                      color: s.c,
                      textShadow: '3px 3px 0 var(--color-px-base)',
                    }}
                  >
                    +{s.p}
                  </span>
                  <span className="mt-2 font-pixel text-[9px] tracking-wider text-px-ink-dim">
                    {s.l}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function OlimpoTeaser() {
  return (
    <section
      className="relative overflow-hidden border-y-4 border-px-gold px-6 py-20 text-center"
      style={{
        background:
          'linear-gradient(180deg, var(--color-px-void) 0%, #2d0a4a 50%, var(--color-px-void) 100%)',
      }}
    >
      <div className="starfield" />
      <div className="relative mx-auto w-full max-w-[1280px]">
        <div className="mb-4 flex items-center justify-center gap-3">
          <PixelCrown size={32} />
          <span
            className="eyebrow"
            style={{ color: 'var(--color-px-gold)', letterSpacing: '0.3em' }}
          >
            EL CLÍMAX DEL SPLIT
          </span>
          <PixelCrown size={32} />
        </div>
        <h2
          className="font-pixel text-5xl text-px-gold sm:text-7xl"
          style={{
            textShadow:
              '4px 0 0 var(--color-px-magenta), 4px 4px 0 var(--color-px-deep), 8px 8px 0 var(--color-px-cyan-2)',
          }}
        >
          EL OLIMPO
        </h2>
        <p className="mx-auto mt-6 max-w-2xl font-retro text-xl text-px-ink-soft">
          El <span className="text-px-magenta">superviviente de D1</span> contra
          el <span className="text-px-cyan">campeón de D2</span>. Una plaza, un
          veredicto.
        </p>
        <Link
          href={ROUTES.hubOlimpo}
          className="pixel-btn pixel-btn--primary mt-8"
        >
          ► EXPLORAR EL OLIMPO
        </Link>
      </div>
    </section>
  );
}

function JoinCTA() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto w-full max-w-[1280px]">
        <div
          className="border-4 border-px-magenta bg-px-deep p-12 text-center"
          style={{
            boxShadow:
              '8px 8px 0 var(--color-px-border-hi), 16px 16px 0 var(--color-px-elev2)',
          }}
        >
          <div className="flex items-center justify-center gap-4">
            <PixelGem
              size={48}
              color="var(--color-px-magenta)"
              color2="var(--color-px-cyan)"
            />
            <PixelSword size={48} />
            <PixelGem
              size={48}
              color="var(--color-px-cyan)"
              color2="var(--color-px-gold)"
            />
          </div>
          <h2 className="mt-6 font-pixel text-xl text-px-ink">
            ¿LISTO PARA RETAR AL OLIMPO?
          </h2>
          <p className="mx-auto mt-4 max-w-lg font-retro text-xl text-px-ink-soft">
            Inscripciones abiertas para la siguiente temporada. Plazas
            limitadas.
          </p>
          <a
            href={EXTERNAL_ROUTES.INSCRIPTION_FORM}
            target="_blank"
            rel="noopener noreferrer"
            className="pixel-btn pixel-btn--primary mt-6"
          >
            ► PRESS START
          </a>
        </div>
      </div>
    </section>
  );
}
