import type { DivisionCardConfig } from './DivisionCard.config';

interface CardStatsProps {
  config: DivisionCardConfig;
}

export default function CardStats({ config }: CardStatsProps) {
  return (
    <div
      className={`
        border-t-2 ${config.accentBorder}
        pt-4 mb-6
        grid grid-cols-2 gap-4
      `}
    >
      <div>
        <div
          className={`${config.statLabel} text-sm uppercase tracking-wide mb-1`}
        >
          Tipo
        </div>
        <div className="text-white font-bold">{config.typeLabel}</div>
      </div>
      <div>
        <div
          className={`${config.statLabel} text-sm uppercase tracking-wide mb-1`}
        >
          Nivel
        </div>
        <div className="text-white font-bold">{config.levelLabel}</div>
      </div>
    </div>
  );
}
