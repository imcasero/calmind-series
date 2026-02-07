'use client';

import { motion } from 'motion/react';
import { MatchupCard } from './MatchupCard';

interface Team {
  nickname: string;
  position: number;
  sets?: number;
  avatar_url?: string | null;
}

interface BracketProps {
  title: string;
  subtitle: string;
  matchups: {
    title: string;
    home: Team;
    away: Team;
    played?: boolean;
  }[];
  accentColor: string; // e.g., 'var(--color-retro-gold-500)'
  innerAccentColor: string; // e.g., 'var(--color-retro-gold-400)'
  footerNote?: string;
}

export const CrucesBracket = ({
  title,
  subtitle,
  matchups,
  accentColor,
  innerAccentColor,
  footerNote,
}: BracketProps) => {
  const isTop4 = subtitle.includes('Top 4');
  const titleColor = isTop4
    ? 'var(--color-retro-gold-400)'
    : 'var(--color-snuff-400)';

  return (
    <motion.section
      initial={{ opacity: 0, filter: 'blur(10px)' }}
      whileInView={{ opacity: 1, filter: 'blur(0px)' }}
      viewport={{ once: true }}
      className="mb-10 xs:mb-14 relative"
    >
      {/* Header with Pokéball Icons */}
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center gap-6 mb-2">
          {/* Pokéball Icon Left */}
          <div
            className="w-6 h-6 rounded-full border-2 bg-linear-to-b from-white to-gray-300 relative overflow-hidden shadow-[0_0_15px_rgba(255,255,255,0.1)]"
            style={{ borderColor: accentColor }}
          >
            <div
              className={`absolute bottom-0 left-0 right-0 h-1/2 ${isTop4 ? 'bg-retro-gold-500' : 'bg-snuff-500'}`}
            />
            <div className="absolute top-1/2 left-0 right-0 h-[1.5px] bg-jacksons-purple-950 -translate-y-1/2" />
            <div className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-white border border-jacksons-purple-950 -translate-x-1/2 -translate-y-1/2" />
          </div>

          <h3
            className="font-black text-2xl sm:text-4xl uppercase tracking-[0.2em] font-pokemon text-center drop-shadow-[0_2px_0_rgba(0,0,0,1)]"
            style={{ color: titleColor }}
          >
            {title}
          </h3>

          {/* Pokéball Icon Right */}
          <div
            className="w-6 h-6 rounded-full border-2 bg-linear-to-b from-white to-gray-300 relative overflow-hidden shadow-[0_0_15px_rgba(255,255,255,0.1)]"
            style={{ borderColor: accentColor }}
          >
            <div
              className={`absolute bottom-0 left-0 right-0 h-1/2 ${isTop4 ? 'bg-retro-gold-500' : 'bg-snuff-500'}`}
            />
            <div className="absolute top-1/2 left-0 right-0 h-[1.5px] bg-jacksons-purple-950 -translate-y-1/2" />
            <div className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-white border border-jacksons-purple-950 -translate-x-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="flex items-center gap-4 opacity-40">
          <div className="h-px w-8 bg-white" />
          <span className="text-[10px] font-pokemon tracking-[0.3em] uppercase">
            {subtitle}
          </span>
          <div className="h-px w-8 bg-white" />
        </div>
      </div>

      {/* Main Bracket Content */}
      <div
        className="retro-border border-[3px] xs:border-4 bg-jacksons-purple-950/40 backdrop-blur-md p-6 xs:p-8 sm:p-10 shadow-2xl relative"
        style={{ borderColor: accentColor }}
      >
        {/* Background Decorative Detail */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-size-[40px_40px]" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 xs:gap-8 relative z-10">
          {matchups.map((match) => (
            <MatchupCard
              key={match.title}
              matchTitle={match.title}
              home={match.home}
              away={match.away}
              accentColor={innerAccentColor}
              played={match.played}
            />
          ))}
        </div>

        {footerNote && (
          <div className="mt-8 pt-6 border-t border-white/5 text-center relative z-10">
            <span
              className="text-[10px] xs:text-xs uppercase tracking-[0.2em] font-pokemon opacity-80"
              style={{ color: innerAccentColor }}
            >
              {footerNote}
            </span>
          </div>
        )}
      </div>

      {/* Floor Glow */}
      <div
        className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[80%] h-8 blur-3xl opacity-20 pointer-events-none"
        style={{ backgroundColor: accentColor }}
      />
    </motion.section>
  );
};
