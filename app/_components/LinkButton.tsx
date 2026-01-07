import Link from 'next/link';

interface Props {
  text?: string;
  href?: string;
  variant?: "primary" | "secondary" | "blue" | "red" | "green" | "yellow";
  icon?: string;
  iconPosition?: "left" | "right" | "top" | "bottom";
  newTab?: boolean;
}

export default function LinkButton({
  text = "",
  href = "",
  variant = "primary",
  icon,
  iconPosition = "left",
  newTab = true,
}: Props) {
  const variantClasses = {
    primary: 'bg-jacksons-purple-600 text-white',
    secondary: 'bg-snuff-600 text-white',
    blue: 'bg-blue-600 text-white',
    red: 'bg-red-600 text-white',
    green: 'bg-green-600 text-white',
    yellow: 'bg-retro-gold-500 text-jacksons-purple-900',
  };

  const baseClasses = `
    inline-flex gap-2 justify-center items-center
    px-8 py-3 text-center font-bold uppercase
    tracking-[0.05em]
    border-[3px] border-black/30
    shadow-[inset_-2px_-2px_0px_rgba(0,0,0,0.2),inset_2px_2px_0px_rgba(255,255,255,0.2)]
    hover:translate-y-[-2px] hover:shadow-[0px_4px_8px_rgba(0,0,0,0.3),inset_-2px_-2px_0px_rgba(0,0,0,0.2),inset_2px_2px_0px_rgba(255,255,255,0.2)]
    active:translate-y-0 active:shadow-[inset_-2px_-2px_0px_rgba(0,0,0,0.3),inset_2px_2px_0px_rgba(255,255,255,0.1)]
    transition-all duration-200 cursor-pointer
  `;

  const className = `${baseClasses} ${variantClasses[variant]}`;

  const content = (
    <>
      {icon && iconPosition === "left" && (
        <img src={icon} alt="icon" className="h-6" />
      )}
      <span>{text}</span>
      {icon && iconPosition === "right" && (
        <img src={icon} alt="icon" className="h-6" />
      )}
    </>
  );

  if (newTab || href.startsWith('http')) {
    return (
      <a
        href={href}
        className={className}
        rel={newTab ? "noopener noreferrer" : undefined}
        target={newTab ? "_blank" : undefined}
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
