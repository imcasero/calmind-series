import Link from 'next/link';
import { ROUTES } from '@/lib/constants/routes';

interface PageHeaderProps {
  season: string;
  split?: string;
  title: string;
  subtitle?: string;
  backText?: string;
  backHref?: string;
  showDecorativeLines?: boolean;
}

export function PageHeader({
  season,
  split,
  title,
  subtitle,
  backText,
  backHref,
  showDecorativeLines = true,
}: PageHeaderProps) {
  const defaultBackText = split
    ? `${split.toUpperCase()} Standings`
    : season.toUpperCase();
  const defaultBackHref = split ? ROUTES.season(season, split) : `/${season}`;

  return (
    <section className="text-center mb-10 xs:mb-14 sm:mb-20">
      {/* Back Link */}
      <Link
        href={backHref || defaultBackHref}
        className="inline-flex items-center gap-2 text-retro-cyan-300/40 text-[10px] uppercase tracking-[0.3em] hover:text-retro-cyan-300 transition-colors font-pokemon border border-white/5 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full mb-8"
      >
        ← {backText || defaultBackText}
      </Link>

      {/* Main Title */}
      {showDecorativeLines ? (
        <div className="flex items-center gap-6 justify-center mb-4">
          <div className="h-px flex-1 max-w-[200px] bg-gradient-to-r from-transparent to-retro-gold-500/30" />
          <h1 className="pokemon-title text-retro-gold-400 text-2xl xs:text-3xl sm:text-4xl md:text-5xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] uppercase tracking-[0.15em]">
            {title}
          </h1>
          <div className="h-px flex-1 max-w-[200px] bg-gradient-to-l from-transparent to-retro-gold-500/30" />
        </div>
      ) : (
        <h1 className="pokemon-title text-retro-gold-400 text-2xl xs:text-3xl sm:text-4xl md:text-5xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] uppercase tracking-[0.15em] mb-4">
          {title}
        </h1>
      )}

      {/* Subtitle */}
      {subtitle && (
        <div className="flex items-center justify-center gap-4 opacity-50">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-white/20" />
          <p className="text-white/60 text-xs xs:text-sm font-pokemon uppercase tracking-[0.4em]">
            {subtitle}
          </p>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-white/20" />
        </div>
      )}
    </section>
  );
}
