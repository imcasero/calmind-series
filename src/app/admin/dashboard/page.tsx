import Link from 'next/link';
import { Suspense } from 'react';
import { AdminBadge, AdminCard } from '@/components/admin/ui';
import { ShellSkeleton } from '@/components/shared';
import { getDashboardStats } from '@/lib/queries';

export default function DashboardPage() {
  return (
    <Suspense fallback={<ShellSkeleton />}>
      <DashboardPageInner />
    </Suspense>
  );
}

async function DashboardPageInner() {
  const stats = await getDashboardStats();

  const statCards = [
    {
      label: 'Temporadas',
      value: stats.totalSeasons.toString(),
      href: '/admin/dashboard/seasons',
    },
    {
      label: 'Divisiones',
      value: stats.totalDivisions.toString(),
      href: '/admin/dashboard/divisions',
    },
    {
      label: 'Participantes',
      value: stats.totalParticipants.toString(),
      href: '/admin/dashboard/participants',
    },
    {
      label: 'Partidos',
      value: stats.totalMatches.toString(),
      href: '/admin/dashboard/matches',
    },
  ];

  const info = [
    {
      title: 'Temporadas',
      text: 'Gestiona las temporadas del torneo y activa la actual.',
    },
    {
      title: 'Splits',
      text: 'Divide cada temporada en splits con sus propias divisiones.',
    },
    {
      title: 'Divisiones',
      text: 'Crea divisiones (ligas) dentro de cada split.',
    },
    {
      title: 'Partidos',
      text: 'Planifica enfrentamientos y registra resultados.',
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome */}
      <AdminCard>
        <h1 className="mb-2 font-pixel text-lg uppercase tracking-wider text-px-gold">
          Bienvenido al Panel
        </h1>
        <p className="font-retro text-lg text-px-ink-soft">
          Gestiona temporadas, divisiones, participantes y partidos de la
          Calmind Series.
        </p>
        {stats.activeSeasonName && (
          <div className="mt-4 flex items-center gap-2">
            <span className="font-pixel text-[9px] uppercase tracking-wider text-px-ink-dim">
              Activo:
            </span>
            <AdminBadge tone="success">
              {stats.activeSeasonName}
              {stats.activeSplitName && ` · ${stats.activeSplitName}`}
            </AdminBadge>
          </div>
        )}
      </AdminCard>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="border-[3px] border-px-border bg-px-elev p-6 shadow-[4px_4px_0_0_var(--color-px-deep)] transition-transform hover:-translate-y-1 hover:border-px-gold"
          >
            <p className="font-num text-3xl font-bold text-px-gold">
              {stat.value}
            </p>
            <p className="mt-1 font-pixel text-[9px] uppercase tracking-wider text-px-ink-dim">
              {stat.label}
            </p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <AdminCard>
        <h2 className="mb-4 font-pixel text-sm uppercase tracking-wider text-px-ink">
          Acciones Rápidas
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Link
            href="/admin/dashboard/seasons"
            className="pixel-btn pixel-btn--primary justify-center"
          >
            + Nueva Temporada
          </Link>
          <Link
            href="/admin/dashboard/participants"
            className="pixel-btn pixel-btn--cyan justify-center"
          >
            + Nuevo Participante
          </Link>
          <Link
            href="/admin/dashboard/matches"
            className="pixel-btn justify-center"
          >
            + Registrar Partido
          </Link>
        </div>
      </AdminCard>

      {/* Info */}
      <AdminCard>
        <h2 className="mb-4 font-pixel text-sm uppercase tracking-wider text-px-ink">
          Información
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {info.map((item) => (
            <div
              key={item.title}
              className="border-2 border-px-border bg-px-deep p-4"
            >
              <h3 className="mb-1 font-pixel text-[10px] uppercase tracking-wider text-px-gold">
                {item.title}
              </h3>
              <p className="font-retro text-base text-px-ink-soft">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </AdminCard>
    </div>
  );
}
