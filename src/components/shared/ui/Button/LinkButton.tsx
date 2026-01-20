import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface LinkButtonProps {
  text?: string;
  href?: string;
  variant?: 'primary' | 'secondary' | 'blue' | 'red' | 'green' | 'yellow';
  icon?: string;
  iconPosition?: 'left' | 'right' | 'top' | 'bottom';
  newTab?: boolean;
}

const variants = {
  primary: 'bg-jacksons-purple-600 text-white',
  secondary: 'bg-snuff-600 text-white',
  blue: 'bg-blue-600 text-white',
  red: 'bg-red-600 text-white',
  green: 'bg-green-600 text-white',
  yellow: 'bg-retro-gold-500 text-jacksons-purple-950',
} as const;

const pixel3dEffect = {
  base: 'shadow-[4px_4px_0px_0px_#1a1a1a,inset_2px_2px_0px_rgba(255,255,255,0.3),inset_-2px_-2px_0px_rgba(0,0,0,0.2)]',
  hover:
    'hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#1a1a1a,inset_2px_2px_0px_rgba(255,255,255,0.3),inset_-2px_-2px_0px_rgba(0,0,0,0.2)]',
  active:
    'active:translate-x-1 active:translate-y-1 active:shadow-[0px_0px_0px_0px_#1a1a1a,inset_2px_2px_0px_rgba(0,0,0,0.2),inset_-2px_-2px_0px_rgba(255,255,255,0.1)]',
};

export default function LinkButton({
  text = '',
  href = '',
  variant = 'primary',
  icon,
  iconPosition = 'left',
  newTab = true,
}: LinkButtonProps) {
  const className = cn(
    // Layout
    'relative inline-flex gap-2 justify-center items-center',
    'px-8 py-3 text-center font-bold uppercase tracking-[0.05em]',
    // Border
    'border-4 border-[#1a1a1a] cursor-pointer',
    // Pixel 3D effect
    pixel3dEffect.base,
    pixel3dEffect.hover,
    pixel3dEffect.active,
    // Transition
    'transition-all duration-100',
    // Variant
    variants[variant],
  );

  const content = (
    <>
      {icon && iconPosition === 'left' && (
        <Image
          src={icon}
          alt=""
          width={24}
          height={24}
          className="h-6 w-auto"
        />
      )}
      <span>{text}</span>
      {icon && iconPosition === 'right' && (
        <Image
          src={icon}
          alt=""
          width={24}
          height={24}
          className="h-6 w-auto"
        />
      )}
    </>
  );

  // External links always open in new tab
  if (newTab || href.startsWith('http')) {
    return (
      <a
        href={href}
        className={className}
        rel={newTab ? 'noopener noreferrer' : undefined}
        target={newTab ? '_blank' : undefined}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}
