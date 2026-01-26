'use client';

import { AnimatePresence, motion } from 'motion/react';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import type { MatchEntry, MatchesByRound } from '@/lib/types/queries.types';

interface MatchesSectionProps {
  matches: MatchesByRound;
}

function MatchCard({ match, index }: { match: MatchEntry; index: number }) {
  const homeInitials =
    match.homeTrainer?.nickname.slice(0, 2).toUpperCase() ?? '??';
  const awayInitials =
    match.awayTrainer?.nickname.slice(0, 2).toUpperCase() ?? '??';

  const homeWon = match.played && match.homeSets > match.awaySets;
  const awayWon = match.played && match.awaySets > match.homeSets;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="border-2 border-white/10 bg-jacksons-purple-950/30"
    >
        {/* Home Trainer Row */}
        <div className={`flex items-center justify-between px-4 py-3 border-b border-white/10 ${homeWon ? 'bg-retro-gold-500/10' : ''}`}>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {match.homeTrainer?.avatarUrl ? (
            <Image
              src={match.homeTrainer.avatarUrl}
              alt={match.homeTrainer.nickname}
              width={32}
              height={32}
              className="w-8 h-8 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs bg-gradient-to-br from-jacksons-purple-500 to-snuff-500 shrink-0 border border-white/20">
              {homeInitials}
            </div>
          )}
          <span className={`font-bold text-sm truncate ${homeWon ? 'text-retro-gold-400' : 'text-white/90'}`}>
            {match.homeTrainer?.nickname ?? 'TBD'}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {match.played ? (
            <span className={`font-black text-lg w-6 text-center ${homeWon ? 'text-retro-gold-400' : 'text-white/50'}`}>
              {match.homeSets}
            </span>
          ) : (
            <span className="text-white/30 text-xs font-mono w-6 text-center">-</span>
          )}
        </div>
      </div>

      {/* VS Divider */}
      <div className="flex items-center justify-center py-1.5 bg-white/5">
        <span className="text-white/30 text-[10px] font-mono uppercase tracking-widest">vs</span>
      </div>

      {/* Away Trainer Row */}
      <div className={`flex items-center justify-between px-4 py-3 border-t border-white/10 ${awayWon ? 'bg-retro-gold-500/10' : ''}`}>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {match.awayTrainer?.avatarUrl ? (
            <Image
              src={match.awayTrainer.avatarUrl}
              alt={match.awayTrainer.nickname}
              width={32}
              height={32}
              className="w-8 h-8 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs bg-gradient-to-br from-jacksons-purple-500 to-snuff-500 shrink-0 border border-white/20">
              {awayInitials}
            </div>
          )}
          <span className={`font-bold text-sm truncate ${awayWon ? 'text-retro-gold-400' : 'text-white/90'}`}>
            {match.awayTrainer?.nickname ?? 'TBD'}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {match.played ? (
            <span className={`font-black text-lg w-6 text-center ${awayWon ? 'text-retro-gold-400' : 'text-white/50'}`}>
              {match.awaySets}
            </span>
          ) : (
            <span className="text-white/30 text-xs font-mono w-6 text-center">-</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function LeagueMatchesList({
  leagueName,
  matches,
  accentColor,
  roundKey,
}: {
  leagueName: string;
  matches: MatchEntry[];
  accentColor: 'gold' | 'cyan';
  roundKey: number;
}) {
  const colorClasses = {
    gold: {
      title: 'text-retro-gold-400',
      border: 'border-retro-gold-500',
      bg: 'bg-retro-gold-500/10',
    },
    cyan: {
      title: 'text-retro-cyan-300',
      border: 'border-retro-cyan-500',
      bg: 'bg-retro-cyan-500/10',
    },
  };

  const colors = colorClasses[accentColor];

  return (
    <section className="w-full">
      {/* League Header with Pokéball */}
      <div className="flex items-center gap-4 mb-6 xs:mb-8 justify-center">
        <div className={`w-5 h-5 rounded-full border-2 ${colors.border} bg-gradient-to-b from-white to-gray-300 relative overflow-hidden shadow-lg`}>
          <div className={`absolute bottom-0 left-0 right-0 h-1/2 ${accentColor === 'gold' ? 'bg-retro-gold-500' : 'bg-jacksons-purple-500'}`} />
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-jacksons-purple-900 -translate-y-1/2" />
          <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full bg-white border border-jacksons-purple-900 -translate-x-1/2 -translate-y-1/2" />
        </div>

        <h3
          className={`${colors.title} font-pokemon font-black text-base xs:text-lg sm:text-xl uppercase tracking-[0.2em] drop-shadow-[0_2px_0_rgba(0,0,0,1)]`}
        >
          {leagueName}
        </h3>

        <div className={`w-5 h-5 rounded-full border-2 ${colors.border} bg-gradient-to-b from-white to-gray-300 relative overflow-hidden shadow-lg`}>
          <div className={`absolute bottom-0 left-0 right-0 h-1/2 ${accentColor === 'gold' ? 'bg-retro-gold-500' : 'bg-jacksons-purple-500'}`} />
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-jacksons-purple-900 -translate-y-1/2" />
          <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full bg-white border border-jacksons-purple-900 -translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>

      <div
        className={`retro-border border-[3px] ${colors.border} p-4 xs:p-5 ${colors.bg}`}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={roundKey}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            {matches.length > 0 ? (
              <div className="space-y-4">
                {matches.map((match, index) => (
                  <MatchCard key={match.id} match={match} index={index} />
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8 text-white/40 text-sm">
                Sin partidos
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="retro-border border-[3px] border-retro-gold-500 bg-retro-gold-500/10 p-8 xs:p-10 text-center"
    >
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        className="text-4xl mb-6"
      >
        <span role="img" aria-label="calendar">
          📅
        </span>
      </motion.div>
      <h3 className="text-retro-gold-400 font-pokemon font-black text-base xs:text-lg uppercase tracking-[0.2em] mb-3 drop-shadow-[0_2px_0_rgba(0,0,0,1)]">
        Próximamente
      </h3>
      <p className="text-white/60 text-xs xs:text-sm font-mono uppercase tracking-wide">
        Los enfrentamientos de este split aún no han sido programados.
      </p>
    </motion.div>
  );
}

export default function MatchesSection({ matches }: MatchesSectionProps) {
  // Find the first round with unplayed matches (default to first round)
  const defaultRoundIndex = useMemo(() => {
    if (matches.length === 0) return 0;
    const firstUnplayedIndex = matches.findIndex(({ matches: roundMatches }) =>
      roundMatches.some((m) => !m.played),
    );
    return firstUnplayedIndex >= 0 ? firstUnplayedIndex : 0;
  }, [matches]);

  const [currentRoundIndex, setCurrentRoundIndex] = useState(defaultRoundIndex);

  // Group matches by league for current round
  const matchesByLeague = useMemo(() => {
    if (matches.length === 0) return {};
    const currentRound = matches[currentRoundIndex];
    if (!currentRound) return {};

    const grouped = currentRound.matches.reduce(
      (acc, match) => {
        const leagueName = match.leagueTierName ?? 'Sin División';
        if (!acc[leagueName]) {
          acc[leagueName] = [];
        }
        acc[leagueName].push(match);
        return acc;
      },
      {} as Record<string, MatchEntry[]>,
    );
    return grouped;
  }, [matches, currentRoundIndex]);

  if (matches.length === 0) {
    return <EmptyState />;
  }

  const currentRound = matches[currentRoundIndex];
  const canGoPrev = currentRoundIndex > 0;
  const canGoNext = currentRoundIndex < matches.length - 1;

  const handlePrev = () => {
    if (canGoPrev) {
      setCurrentRoundIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      setCurrentRoundIndex((prev) => prev + 1);
    }
  };

  // Get primera and segunda matches
  const primeraMatches = matchesByLeague.Primera ?? [];
  const segundaMatches = matchesByLeague.Segunda ?? [];

  return (
    <div className="w-full">
      {/* Round Navigation */}
      <div className="flex items-center justify-center gap-6 xs:gap-8 mb-8 xs:mb-10">
        <motion.button
          type="button"
          onClick={handlePrev}
          disabled={!canGoPrev}
          whileTap={canGoPrev ? { scale: 0.9 } : {}}
          className={`retro-border border-2 w-10 h-10 flex items-center justify-center font-pokemon text-xl transition-all ${
            canGoPrev
              ? 'border-retro-gold-500 text-retro-gold-400 cursor-pointer hover:-translate-y-0.5'
              : 'border-white/10 text-white/20 cursor-not-allowed'
          }`}
          aria-label="Jornada anterior"
        >
          ◀
        </motion.button>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentRound.round}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-4"
          >
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-retro-gold-500/30" />
            <h3 className="text-retro-gold-400 font-pokemon font-black text-base xs:text-lg sm:text-xl uppercase tracking-[0.2em] drop-shadow-[0_2px_0_rgba(0,0,0,1)] min-w-[140px] xs:min-w-[180px] text-center">
              Jornada {currentRound.round}
            </h3>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-retro-gold-500/30" />
          </motion.div>
        </AnimatePresence>

        <motion.button
          type="button"
          onClick={handleNext}
          disabled={!canGoNext}
          whileTap={canGoNext ? { scale: 0.9 } : {}}
          className={`retro-border border-2 w-10 h-10 flex items-center justify-center font-pokemon text-xl transition-all ${
            canGoNext
              ? 'border-retro-gold-500 text-retro-gold-400 cursor-pointer hover:-translate-y-0.5'
              : 'border-white/10 text-white/20 cursor-not-allowed'
          }`}
          aria-label="Jornada siguiente"
        >
          ▶
        </motion.button>
      </div>

      {/* Round indicator dots */}
      <div className="flex justify-center gap-2 mb-8 xs:mb-10">
        {matches.map((_, idx) => (
          <motion.button
            key={matches[idx].round}
            type="button"
            onClick={() => setCurrentRoundIndex(idx)}
            whileTap={{ scale: 0.9 }}
            animate={
              idx === currentRoundIndex
                ? { width: '32px', backgroundColor: 'var(--color-retro-gold-400)' }
                : { width: '8px', backgroundColor: 'rgba(255,255,255,0.2)' }
            }
            transition={{ duration: 0.2 }}
            className="h-2 rounded-full cursor-pointer"
            aria-label={`Ir a jornada ${matches[idx].round}`}
          />
        ))}
      </div>

      {/* Two-column layout for leagues */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 xs:gap-8 md:gap-10 lg:gap-16 xl:gap-24 w-full">
        <LeagueMatchesList
          leagueName="Primera División"
          matches={primeraMatches}
          accentColor="gold"
          roundKey={currentRound.round}
        />

        <LeagueMatchesList
          leagueName="Segunda División"
          matches={segundaMatches}
          accentColor="cyan"
          roundKey={currentRound.round}
        />
      </div>
    </div>
  );
}
