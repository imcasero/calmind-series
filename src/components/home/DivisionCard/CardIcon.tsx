import type { DivisionCardConfig } from './DivisionCard.config';

interface CardIconProps {
  icon: string;
  subtitle: string;
  config: DivisionCardConfig;
}

export default function CardIcon({ icon, subtitle, config }: CardIconProps) {
  return (
    <div className="flex items-center gap-6 mb-6">
      {/* Icon Display */}
      <div
        className={`
          w-20 h-20
          flex items-center justify-center
          ${config.iconBg}
          border-4 ${config.iconBorder}
          ${config.iconColor}
          transition-transform duration-300
          group-hover:scale-110
        `}
      >
        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
          <path d={icon} />
        </svg>
      </div>

      {/* Division Title */}
      <div className="flex-1">
        <p
          className={`
            ${config.subtitleColor}
            font-bold text-sm mb-2
            uppercase tracking-wide
          `}
        >
          {subtitle}
        </p>
        <div
          className={`
            ${config.titleColor}
            font-bold text-2xl
            tracking-tight
          `}
        >
          DIVISIÓN
        </div>
      </div>
    </div>
  );
}
