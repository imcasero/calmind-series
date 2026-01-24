import Link from 'next/link';
import { getDashboardStats } from '@/lib/queries';

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  const statCards = [
    {
      label: 'Temporadas',
      value: stats.totalSeasons.toString(),
      icon: '🏆',
      href: '/admin/dashboard/seasons',
    },
    {
      label: 'Divisiones',
      value: stats.totalDivisions.toString(),
      icon: '⚔️',
      href: '/admin/dashboard/divisions',
    },
    {
      label: 'Participantes',
      value: stats.totalParticipants.toString(),
      icon: '👥',
      href: '/admin/dashboard/participants',
    },
    {
      label: 'Partidos',
      value: stats.totalMatches.toString(),
      icon: '🎮',
      href: '/admin/dashboard/matches',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-jacksons-purple-800 border-4 border-jacksons-purple-600 p-6 shadow-[4px_4px_0px_0px_#1a1a1a]">
        <h1 className="text-xl font-bold text-retro-gold-500 uppercase tracking-wider mb-2">
          Bienvenido al Panel de Administracion
        </h1>
        <p className="text-jacksons-purple-200 text-sm">
          Gestiona temporadas, divisiones, participantes y partidos de la
          Calmind Series.
        </p>
        {stats.activeSeasonName && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-jacksons-purple-300 text-xs uppercase tracking-wide">
              Activo:
            </span>
            <span className="px-3 py-1 bg-green-600 border-2 border-green-800 text-white text-xs font-bold uppercase">
              {stats.activeSeasonName}
              {stats.activeSplitName && ` - ${stats.activeSplitName}`}
            </span>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="
              bg-jacksons-purple-800
              border-4 border-jacksons-purple-600
              p-6
              shadow-[4px_4px_0px_0px_#1a1a1a]
              hover:border-retro-gold-500
              hover:-translate-y-1
              transition-all duration-150
            "
          >
            <div className="flex items-center gap-4">
              <span className="text-3xl">{stat.icon}</span>
              <div>
                <p className="text-3xl font-bold text-retro-gold-500">
                  {stat.value}
                </p>
                <p className="text-jacksons-purple-300 text-xs uppercase tracking-wide">
                  {stat.label}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-jacksons-purple-800 border-4 border-jacksons-purple-600 p-6 shadow-[4px_4px_0px_0px_#1a1a1a]">
        <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-4">
          Acciones Rapidas
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/admin/dashboard/seasons"
            className="
              px-6 py-4
              bg-retro-gold-500 text-jacksons-purple-950
              border-4 border-jacksons-purple-950
              font-bold uppercase tracking-wide text-sm text-center
              shadow-[4px_4px_0px_0px_#1a1a1a]
              hover:translate-x-0.5 hover:translate-y-0.5
              hover:shadow-[2px_2px_0px_0px_#1a1a1a]
              active:translate-x-1 active:translate-y-1
              active:shadow-none
              transition-all duration-100
            "
          >
            + Nueva Temporada
          </Link>
          <Link
            href="/admin/dashboard/participants"
            className="
              px-6 py-4
              bg-retro-cyan-500 text-white
              border-4 border-jacksons-purple-950
              font-bold uppercase tracking-wide text-sm text-center
              shadow-[4px_4px_0px_0px_#1a1a1a]
              hover:translate-x-0.5 hover:translate-y-0.5
              hover:shadow-[2px_2px_0px_0px_#1a1a1a]
              active:translate-x-1 active:translate-y-1
              active:shadow-none
              transition-all duration-100
            "
          >
            + Nuevo Participante
          </Link>
          <Link
            href="/admin/dashboard/matches"
            className="
              px-6 py-4
              bg-snuff-600 text-white
              border-4 border-jacksons-purple-950
              font-bold uppercase tracking-wide text-sm text-center
              shadow-[4px_4px_0px_0px_#1a1a1a]
              hover:translate-x-0.5 hover:translate-y-0.5
              hover:shadow-[2px_2px_0px_0px_#1a1a1a]
              active:translate-x-1 active:translate-y-1
              active:shadow-none
              transition-all duration-100
            "
          >
            + Registrar Partido
          </Link>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-jacksons-purple-800 border-4 border-jacksons-purple-600 p-6 shadow-[4px_4px_0px_0px_#1a1a1a]">
        <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-4">
          Informacion
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-4 p-4 bg-jacksons-purple-900 border-2 border-jacksons-purple-700">
            <span className="text-xl">📊</span>
            <div>
              <h3 className="text-retro-gold-400 font-bold text-sm uppercase mb-1">
                Temporadas
              </h3>
              <p className="text-jacksons-purple-300 text-xs">
                Gestiona las temporadas del torneo y activa la actual.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 bg-jacksons-purple-900 border-2 border-jacksons-purple-700">
            <span className="text-xl">📅</span>
            <div>
              <h3 className="text-retro-gold-400 font-bold text-sm uppercase mb-1">
                Splits
              </h3>
              <p className="text-jacksons-purple-300 text-xs">
                Divide cada temporada en splits con sus propias divisiones.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 bg-jacksons-purple-900 border-2 border-jacksons-purple-700">
            <span className="text-xl">⚔️</span>
            <div>
              <h3 className="text-retro-gold-400 font-bold text-sm uppercase mb-1">
                Divisiones
              </h3>
              <p className="text-jacksons-purple-300 text-xs">
                Crea divisiones (ligas) dentro de cada split.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 bg-jacksons-purple-900 border-2 border-jacksons-purple-700">
            <span className="text-xl">🎮</span>
            <div>
              <h3 className="text-retro-gold-400 font-bold text-sm uppercase mb-1">
                Partidos
              </h3>
              <p className="text-jacksons-purple-300 text-xs">
                Planifica enfrentamientos y registra resultados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
