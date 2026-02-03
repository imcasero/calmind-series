interface StatsLegendProps {
  tierColor: 'gold' | 'cyan';
}

export default function StatsLegend({ tierColor }: StatsLegendProps) {
  const borderColor =
    tierColor === 'gold' ? 'border-retro-gold-500' : 'border-retro-cyan-500';
  const bgColor =
    tierColor === 'gold' ? 'bg-retro-gold-500/10' : 'bg-retro-cyan-500/10';

  return (
    <div
      className={`${bgColor} p-3 xs:p-4 text-[10px] xs:text-xs text-white/70 border-t-[3px] ${borderColor}`}
    >
      {/* Stats abbreviations */}
      <div className="hidden xs:flex flex-wrap gap-3 xs:gap-4 justify-center font-mono uppercase tracking-wide">
        <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] font-semibold">
          <strong className="text-white/90">J:</strong> Jornadas Jugadas
        </span>
        <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] font-semibold hidden sm:inline">
          <strong className="text-white/90">Sets:</strong> Sets ganados
        </span>
        <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] font-semibold hidden sm:inline">
          <strong className="text-white/90">Diff:</strong> Balance
        </span>
      </div>
    </div>
  );
}
