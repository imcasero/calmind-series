export default function DashboardPage() {
  const stats = [
    { label: 'Temporadas', value: '3', icon: '🏆' },
    { label: 'Divisiones', value: '2', icon: '⚔️' },
    { label: 'Participantes', value: '16', icon: '👥' },
    { label: 'Partidos', value: '56', icon: '🎮' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-jacksons-purple-800 border-4 border-jacksons-purple-600 p-6 shadow-[4px_4px_0px_0px_#1a1a1a]">
        <h1 className="text-xl font-bold text-retro-gold-500 uppercase tracking-wider mb-2">
          Bienvenido al Panel de Administración
        </h1>
        <p className="text-jacksons-purple-200 text-sm">
          Gestiona temporadas, divisiones, participantes y partidos de la
          Calmind Series.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="
              bg-jacksons-purple-800
              border-4 border-jacksons-purple-600
              p-6
              shadow-[4px_4px_0px_0px_#1a1a1a]
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
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-jacksons-purple-800 border-4 border-jacksons-purple-600 p-6 shadow-[4px_4px_0px_0px_#1a1a1a]">
        <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-4">
          Acciones Rápidas
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            type="button"
            className="
              px-6 py-4
              bg-retro-gold-500 text-jacksons-purple-950
              border-4 border-jacksons-purple-950
              font-bold uppercase tracking-wide text-sm
              shadow-[4px_4px_0px_0px_#1a1a1a]
              hover:translate-x-0.5 hover:translate-y-0.5
              hover:shadow-[2px_2px_0px_0px_#1a1a1a]
              active:translate-x-1 active:translate-y-1
              active:shadow-none
              transition-all duration-100
            "
          >
            + Nueva Temporada
          </button>
          <button
            type="button"
            className="
              px-6 py-4
              bg-retro-cyan-500 text-white
              border-4 border-jacksons-purple-950
              font-bold uppercase tracking-wide text-sm
              shadow-[4px_4px_0px_0px_#1a1a1a]
              hover:translate-x-0.5 hover:translate-y-0.5
              hover:shadow-[2px_2px_0px_0px_#1a1a1a]
              active:translate-x-1 active:translate-y-1
              active:shadow-none
              transition-all duration-100
            "
          >
            + Nuevo Participante
          </button>
          <button
            type="button"
            className="
              px-6 py-4
              bg-snuff-600 text-white
              border-4 border-jacksons-purple-950
              font-bold uppercase tracking-wide text-sm
              shadow-[4px_4px_0px_0px_#1a1a1a]
              hover:translate-x-0.5 hover:translate-y-0.5
              hover:shadow-[2px_2px_0px_0px_#1a1a1a]
              active:translate-x-1 active:translate-y-1
              active:shadow-none
              transition-all duration-100
            "
          >
            + Registrar Partido
          </button>
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="bg-jacksons-purple-800 border-4 border-jacksons-purple-600 p-6 shadow-[4px_4px_0px_0px_#1a1a1a]">
        <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-4">
          Actividad Reciente
        </h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 bg-jacksons-purple-900 border-2 border-jacksons-purple-700"
            >
              <div className="w-2 h-2 bg-retro-gold-500" />
              <p className="text-jacksons-purple-300 text-sm">
                Placeholder para actividad reciente...
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
