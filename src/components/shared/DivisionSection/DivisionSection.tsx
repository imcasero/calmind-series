import { ReactNode } from 'react';
import { CrucesBracket } from '@/components/cross/CrucesBracket';
import type { Matchup } from '@/lib/types/matches';

interface DivisionSectionProps {
  title: string;
  subtitle: string;
  accentColor: string;
  innerAccentColor: string;
  children: ReactNode;
}

export function DivisionSection({
  title,
  subtitle,
  accentColor,
  innerAccentColor,
  children,
}: DivisionSectionProps) {
  return (
    <div className="mb-20 xs:mb-32">
      <div className="flex items-center gap-6 mb-12">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-retro-gold-500/30" />
        <h2 className="font-pokemon text-retro-gold-400 text-lg xs:text-2xl uppercase tracking-[0.3em] font-black italic drop-shadow-[0_0_10px_rgba(255,237,78,0.2)]">
          {title}
        </h2>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-retro-gold-500/30" />
      </div>
      {children}
    </div>
  );
}

interface DivisionBracketProps {
  title: string;
  subtitle: string;
  matchups: Matchup[];
  accentColor: string;
  innerAccentColor: string;
  footerNote?: string;
}

export function DivisionBracket({
  title,
  subtitle,
  matchups,
  accentColor,
  innerAccentColor,
  footerNote,
}: DivisionBracketProps) {
  return (
    <CrucesBracket
      title={title}
      subtitle={subtitle}
      matchups={matchups}
      accentColor={accentColor}
      innerAccentColor={innerAccentColor}
      footerNote={footerNote}
    />
  );
}
