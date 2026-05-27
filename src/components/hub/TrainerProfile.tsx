import { MonsterSprite, PixelCrown } from '@/components/shared/ui/pixel';
import { cn } from '@/lib/utils';
import type { RecentMatchVM, StreakResult } from '@/lib/utils/standings';

export interface TrainerProfileVM {
  nickname: string;
  bio: string | null;
  color: string;
  variant: number;
  division: 1 | 2 | null;
  position: number | null;
  isLeader: boolean;
  pg: number;
  pp: number;
  pt: number;
  winrate: number;
  lives: number;
  streak: StreakResult[];
  recent: RecentMatchVM[];
}

const LOCKED_TEAM_SLOTS = [0, 1, 2, 3, 4, 5];

/** Single trainer profile (FR6). ELO/region/real-name omitted; team locked. */
export function TrainerProfile({ vm }: { vm: TrainerProfileVM }) {
  const divisionLabel =
    vm.division === 1
      ? 'División 1'
      : vm.division === 2
        ? 'División 2'
        : 'Sin división activa';
  const divisionColor =
    vm.division === 2 ? 'var(--color-px-cyan)' : 'var(--color-px-magenta)';

  return (
    <div className="flex flex-col gap-6">
      {/* Hero */}
      <section
        className="flex flex-col items-center gap-5 border-[3px] p-6 sm:flex-row"
        style={{
          borderColor: vm.color,
          background: `color-mix(in srgb, ${vm.color} 12%, var(--color-px-elev))`,
        }}
      >
        <div className="grid size-40 shrink-0 place-items-center border-[3px] border-px-border bg-px-deep">
          <MonsterSprite size={130} variant={vm.variant} color={vm.color} />
        </div>

        <div className="flex flex-1 flex-col items-center gap-2 sm:items-start">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="border-2 px-2 py-0.5 font-pixel text-[8px] uppercase"
              style={{ borderColor: divisionColor, color: divisionColor }}
            >
              {divisionLabel}
            </span>
            {vm.position !== null && (
              <span className="border-2 border-px-border px-2 py-0.5 font-pixel text-[8px] uppercase text-px-ink-soft">
                #{vm.position}
              </span>
            )}
            {vm.isLeader && (
              <span className="flex items-center gap-1 border-2 border-px-gold px-2 py-0.5 font-pixel text-[8px] uppercase text-px-gold">
                <PixelCrown size={12} /> Líder
              </span>
            )}
          </div>
          <h1
            className="font-pixel text-3xl"
            style={{
              color: vm.color,
              textShadow: '3px 3px 0 var(--color-px-deep)',
            }}
          >
            {vm.nickname}
          </h1>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatTile label="PG" value={String(vm.pg)} tone="success" />
        <StatTile label="PP" value={String(vm.pp)} tone="danger" />
        <StatTile label="PT" value={String(vm.pt)} tone="ink" />
        <StatTile label="Winrate" value={`${vm.winrate}%`} tone="gold" />
        <StatTile label="Vidas" value={String(vm.lives)} tone="gold" />
      </section>

      {/* Body */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="border-[3px] border-px-border bg-px-elev p-5">
          <h3 className="mb-3 font-pixel text-xs uppercase tracking-wider text-px-ink-soft">
            Equipo actual
          </h3>
          <div className="flex flex-wrap gap-2">
            {LOCKED_TEAM_SLOTS.map((slot) => (
              <div
                key={slot}
                className="grid size-16 place-items-center border-[3px] border-px-border bg-px-deep font-pixel text-2xl text-px-border-hi"
              >
                ?
              </div>
            ))}
          </div>
          <p className="mt-3 font-retro text-base text-px-ink-dim">
            El equipo se revela en J16.
          </p>
        </div>

        <div className="border-[3px] border-px-border bg-px-elev p-5">
          <h3 className="mb-3 font-pixel text-xs uppercase tracking-wider text-px-ink-soft">
            Histórico reciente
          </h3>
          {vm.recent.length === 0 ? (
            <p className="font-retro text-base text-px-ink-dim">
              Sin partidos jugados todavía.
            </p>
          ) : (
            <ul className="flex flex-col">
              {vm.recent.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center gap-3 border-l-4 border-b border-px-border/40 py-2 pl-3 last:border-b-0"
                  style={{
                    borderLeftColor: m.won
                      ? 'var(--color-px-success)'
                      : 'var(--color-px-danger)',
                  }}
                >
                  <span className="w-10 font-pixel text-[9px] uppercase text-px-ink-dim">
                    J{m.round}
                  </span>
                  <span className="flex-1 truncate font-retro text-base text-px-ink">
                    {m.opponent}
                  </span>
                  <span className="font-num text-sm text-px-ink">
                    {m.scoreFor}-{m.scoreAgainst}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Bio */}
      {vm.bio && (
        <section className="border-[3px] border-px-border bg-px-elev p-5">
          <h3 className="mb-2 font-pixel text-xs uppercase tracking-wider text-px-ink-soft">
            Bio
          </h3>
          <p className="font-retro text-lg leading-relaxed text-px-ink-soft">
            {vm.bio}
          </p>
        </section>
      )}
    </div>
  );
}

function StatTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'success' | 'danger' | 'gold' | 'ink';
}) {
  const toneClass = {
    success: 'text-px-success',
    danger: 'text-px-danger',
    gold: 'text-px-gold',
    ink: 'text-px-ink',
  }[tone];

  return (
    <div className="flex flex-col items-center gap-1 border-[3px] border-px-border bg-px-elev p-3">
      <span className={cn('font-num text-2xl font-bold', toneClass)}>
        {value}
      </span>
      <span className="font-pixel text-[8px] uppercase tracking-wider text-px-ink-dim">
        {label}
      </span>
    </div>
  );
}
