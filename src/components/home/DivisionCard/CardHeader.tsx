import type { DivisionCardConfig } from './DivisionCard.config';

interface CardHeaderProps {
  title: string;
  config: DivisionCardConfig;
}

export default function CardHeader({ title, config }: CardHeaderProps) {
  return (
    <div
      className={`
        ${config.headerBg}
        p-4
        border-b-4 ${config.accentBorder}
        flex items-center justify-between
      `}
    >
      <div className="flex items-center gap-3">
        {/* Pokédex Number */}
        <div
          className={`
            ${config.numberBg}
            ${config.numberText}
            px-3 py-1
            font-bold text-sm
            border-2 border-black/30
          `}
        >
          #{config.pokedexNumber}
        </div>

        {/* Title */}
        <h3
          className={`
            pokemon-title
            ${config.headerText}
            text-lg md:text-xl
            drop-shadow-md
          `}
        >
          {title}
        </h3>
      </div>

      {/* Pokédex Indicator Lights */}
      <div className="flex gap-1">
        <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-red-700" />
        <div className="w-3 h-3 rounded-full bg-yellow-400 border-2 border-yellow-600" />
        <div className="w-3 h-3 rounded-full bg-green-400 border-2 border-green-600" />
      </div>
    </div>
  );
}
