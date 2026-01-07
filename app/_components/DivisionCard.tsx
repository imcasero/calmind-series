import LinkButton from './LinkButton';

interface Props {
  title: string;
  subtitle: string;
  description: string;
  variant: 'gold' | 'purple';
  icon: string;
  buttonText?: string;
  buttonHref?: string;
}

export default function DivisionCard({
  title,
  subtitle,
  description,
  variant = 'gold',
  icon,
  buttonText = 'Ver clasificación',
  buttonHref = '#clasificacion',
}: Props) {
  // Configuración de colores y estilos por variante - Pokédex Style
  const cardConfig = {
    gold: {
      bgMain: 'bg-jacksons-purple-900',
      headerBg: 'bg-retro-gold-500',
      headerText: 'text-jacksons-purple-950',
      borderColor: 'border-retro-gold-500',
      accentBorder: 'border-retro-gold-400',
      iconBg: 'bg-retro-gold-600',
      iconBorder: 'border-retro-gold-700',
      iconColor: 'text-retro-gold-100',
      numberBg: 'bg-retro-gold-700',
      numberText: 'text-retro-gold-50',
      titleColor: 'text-retro-gold-300',
      subtitleColor: 'text-retro-gold-200',
      descriptionColor: 'text-gray-300',
      statLabel: 'text-retro-gold-300',
      buttonVariant: 'yellow' as const,
    },
    purple: {
      bgMain: 'bg-jacksons-purple-900',
      headerBg: 'bg-retro-cyan-600',
      headerText: 'text-white',
      borderColor: 'border-retro-cyan-600',
      accentBorder: 'border-retro-cyan-500',
      iconBg: 'bg-retro-cyan-700',
      iconBorder: 'border-retro-cyan-800',
      iconColor: 'text-retro-cyan-200',
      numberBg: 'bg-retro-cyan-800',
      numberText: 'text-retro-cyan-100',
      titleColor: 'text-retro-cyan-300',
      subtitleColor: 'text-retro-cyan-200',
      descriptionColor: 'text-gray-300',
      statLabel: 'text-retro-cyan-300',
      buttonVariant: 'primary' as const,
    },
  };

  const config = cardConfig[variant];

  return (
    <div
      className={`
      retro-border
      relative overflow-hidden
      ${config.bgMain}
      border-4 ${config.borderColor}
      shadow-2xl
      transition-all duration-300 ease-in-out
      hover:shadow-2xl hover:-translate-y-2
      group
    `}
    >
      {/* Header Pokédex Style */}
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
            #{variant === 'gold' ? '001' : '002'}
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

        {/* Pokédex Icon Circle */}
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-red-700"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-400 border-2 border-yellow-600"></div>
          <div className="w-3 h-3 rounded-full bg-green-400 border-2 border-green-600"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Icon Display */}
        <div className="flex items-center gap-6 mb-6">
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
              <path d={icon}></path>
            </svg>
          </div>

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

        {/* Description Box */}
        <div
          className={`
          border-2 ${config.accentBorder}
          bg-black/20
          p-4 mb-6
          min-h-24
        `}
        >
          <p
            className={`
            ${config.descriptionColor}
            text-sm leading-relaxed
          `}
          >
            {description}
          </p>
        </div>

        {/* Stats Display */}
        <div
          className={`
          border-t-2 ${config.accentBorder}
          pt-4 mb-6
          grid grid-cols-2 gap-4
        `}
        >
          <div>
            <div
              className={`${config.statLabel} text-xs uppercase tracking-wide mb-1`}
            >
              Tipo
            </div>
            <div className="text-white font-bold">
              {variant === 'gold' ? 'Competitivo' : 'Ascenso'}
            </div>
          </div>
          <div>
            <div
              className={`${config.statLabel} text-xs uppercase tracking-wide mb-1`}
            >
              Nivel
            </div>
            <div className="text-white font-bold">
              {variant === 'gold' ? 'Elite' : 'Intermedio'}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="transform transition-transform duration-300 group-hover:scale-105">
          <LinkButton
            text={buttonText}
            href={buttonHref}
            variant={config.buttonVariant}
            newTab={false}
          />
        </div>
      </div>
    </div>
  );
}
