import LinkButton from '@/components/shared/ui/Button/LinkButton';
import CardHeader from './CardHeader';
import CardIcon from './CardIcon';
import CardStats from './CardStats';
import {
  DIVISION_CARD_CONFIGS,
  type DivisionCardVariant,
} from './DivisionCard.config';

export interface DivisionCardProps {
  title: string;
  subtitle: string;
  description: string;
  variant: DivisionCardVariant;
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
}: DivisionCardProps) {
  const config = DIVISION_CARD_CONFIGS[variant];

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
      <CardHeader title={title} config={config} />

      <div className="p-6">
        <CardIcon icon={icon} subtitle={subtitle} config={config} />

        {/* Description Box */}
        <div
          className={`
            border-2 ${config.accentBorder}
            bg-black/20
            p-4 mb-6
            min-h-24
          `}
        >
          <p className={`${config.descriptionColor} text-sm leading-relaxed`}>
            {description}
          </p>
        </div>

        <CardStats config={config} />

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
