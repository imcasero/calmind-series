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
  const isDraw = match.played && match.homeSets === match.awaySets;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.08 }}
      className="relative w-full"
    >
      {/* Battle Arena Container */}
      <div className="relative retro-border border-[3px] border-jacksons-purple-700 bg-jacksons-purple-900 overflow-hidden">
        {/* Pixelated top border accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-jacksons-purple-700 via-retro-gold-500 to-jacksons-purple-700" />

        {/* Main Battle Grid */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-0 relative">
          {/* HOME TRAINER - Left Side */}
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: index * 0.08 + 0.1 }}
            className={`relative p-4 sm:p-5 lg:p-6 ${
              homeWon
                ? 'bg-gradient-to-r from-retro-gold-900/40 to-retro-gold-800/20'
                : 'bg-gradient-to-r from-jacksons-purple-800/60 to-jacksons-purple-800/20'
            }`}
          >
            {/* Winner crown indicator */}
            {homeWon && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.5, delay: index * 0.08 + 0.3 }}
                className="absolute -top-1 -left-1 w-6 h-6 flex items-center justify-center text-retro-gold-400 text-lg"
              >
                👑
              </motion.div>
            )}

            <div className="flex items-center gap-3 sm:gap-4">
              {/* Avatar with pixelated border */}
              <div className="relative shrink-0">
                {match.homeTrainer?.avatarUrl ? (
                  <div className="relative">
                    <div className={`absolute inset-0 border-[3px] ${homeWon ? 'border-retro-gold-500' : 'border-jacksons-purple-600'}`} />
                    <Image
                      src={match.homeTrainer.avatarUrl}
                      alt={match.homeTrainer.nickname}
                      width={56}
                      height={56}
                      className="w-12 h-12 sm:w-14 sm:h-14 object-cover image-pixelated"
                    />
                  </div>
                ) : (
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center text-white font-black text-sm border-[3px] ${homeWon ? 'border-retro-gold-500 bg-retro-gold-900' : 'border-jacksons-purple-600 bg-gradient-to-br from-jacksons-purple-600 to-snuff-600'}`}>
                    {homeInitials}
                  </div>
                )}
              </div>

              {/* Trainer Info */}
              <div className="flex-1 min-w-0">
                <div className={`font-pokemon text-xs sm:text-sm uppercase tracking-wider truncate ${homeWon ? 'text-retro-gold-300' : 'text-white'} drop-shadow-[2px_2px_0_rgba(0,0,0,0.8)]`}>
                  {match.homeTrainer?.nickname ?? 'TBD'}
                </div>
                {match.played && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 0.6, delay: index * 0.08 + 0.2 }}
                    className="mt-2 h-2 bg-jacksons-purple-950 border border-jacksons-purple-700 overflow-hidden"
                  >
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: homeWon ? 1 : (match.homeSets / (match.homeSets + match.awaySets)) }}
                      transition={{ duration: 0.8, delay: index * 0.08 + 0.4 }}
                      className={`h-full origin-left ${homeWon ? 'bg-retro-gold-500' : 'bg-jacksons-purple-500'}`}
                      style={{ transformOrigin: 'left' }}
                    />
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>

          {/* VS DIVIDER - Center Battle Badge */}
          <div className="relative flex flex-col items-center justify-center px-2 sm:px-4 py-4 sm:py-5 lg:py-6 bg-jacksons-purple-950 border-x-[3px] border-jacksons-purple-700">
            {/* Battle Badge */}
            <motion.div
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, delay: index * 0.08 + 0.15, type: 'spring' }}
              className="relative"
            >
              {/* Pokéball-style VS badge */}
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full border-[3px] border-retro-gold-500 bg-gradient-to-b from-white via-gray-100 to-gray-200 shadow-lg overflow-hidden">
                <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-retro-gold-600 to-retro-gold-500" />
                <div className="absolute top-1/2 left-0 right-0 h-[3px] bg-jacksons-purple-950 -translate-y-1/2 shadow-inner" />
                <div className="absolute top-1/2 left-1/2 w-4 h-4 rounded-full bg-white border-[2px] border-jacksons-purple-950 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center shadow-inner">
                  <div className="w-2 h-2 rounded-full bg-jacksons-purple-900" />
                </div>
              </div>
            </motion.div>

            {/* VS Text */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.08 + 0.3 }}
              className="mt-2 font-pokemon text-[10px] sm:text-xs text-retro-gold-400 tracking-[0.3em] drop-shadow-[2px_2px_0_rgba(0,0,0,1)]"
            >
              VS
            </motion.div>

            {/* Score Display */}
            {match.played ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.08 + 0.5 }}
                className="mt-2 flex items-center gap-1 px-2 py-1 bg-jacksons-purple-900 border-[2px] border-jacksons-purple-700 rounded"
              >
                <span className={`font-black text-lg sm:text-xl ${homeWon ? 'text-retro-gold-400' : isDraw ? 'text-retro-cyan-400' : 'text-white/50'}`}>
                  {match.homeSets}
                </span>
                <span className="text-white/30 text-xs font-mono">-</span>
                <span className={`font-black text-lg sm:text-xl ${awayWon ? 'text-retro-gold-400' : isDraw ? 'text-retro-cyan-400' : 'text-white/50'}`}>
                  {match.awaySets}
                </span>
              </motion.div>
            ) : (
              <motion.div
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                className="mt-2 px-3 py-1 bg-jacksons-purple-900/50 border border-jacksons-purple-700 rounded"
              >
                <span className="text-white/40 text-xs font-mono uppercase tracking-widest">
                  Pending
                </span>
              </motion.div>
            )}
          </div>

          {/* AWAY TRAINER - Right Side */}
          <motion.div
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: index * 0.08 + 0.1 }}
            className={`relative p-4 sm:p-5 lg:p-6 ${
              awayWon
                ? 'bg-gradient-to-l from-retro-gold-900/40 to-retro-gold-800/20'
                : 'bg-gradient-to-l from-jacksons-purple-800/60 to-jacksons-purple-800/20'
            }`}
          >
            {/* Winner crown indicator */}
            {awayWon && (
              <motion.div
                initial={{ scale: 0, rotate: 180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.5, delay: index * 0.08 + 0.3 }}
                className="absolute -top-1 -right-1 w-6 h-6 flex items-center justify-center text-retro-gold-400 text-lg"
              >
                👑
              </motion.div>
            )}

            <div className="flex items-center gap-3 sm:gap-4 flex-row-reverse">
              {/* Avatar with pixelated border */}
              <div className="relative shrink-0">
                {match.awayTrainer?.avatarUrl ? (
                  <div className="relative">
                    <div className={`absolute inset-0 border-[3px] ${awayWon ? 'border-retro-gold-500' : 'border-jacksons-purple-600'}`} />
                    <Image
                      src={match.awayTrainer.avatarUrl}
                      alt={match.awayTrainer.nickname}
                      width={56}
                      height={56}
                      className="w-12 h-12 sm:w-14 sm:h-14 object-cover image-pixelated"
                    />
                  </div>
                ) : (
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center text-white font-black text-sm border-[3px] ${awayWon ? 'border-retro-gold-500 bg-retro-gold-900' : 'border-jacksons-purple-600 bg-gradient-to-br from-jacksons-purple-600 to-snuff-600'}`}>
                    {awayInitials}
                  </div>
                )}
              </div>

              {/* Trainer Info */}
              <div className="flex-1 min-w-0 text-right">
                <div className={`font-pokemon text-xs sm:text-sm uppercase tracking-wider truncate ${awayWon ? 'text-retro-gold-300' : 'text-white'} drop-shadow-[2px_2px_0_rgba(0,0,0,0.8)]`}>
                  {match.awayTrainer?.nickname ?? 'TBD'}
                </div>
                {match.played && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 0.6, delay: index * 0.08 + 0.2 }}
                    className="mt-2 h-2 bg-jacksons-purple-950 border border-jacksons-purple-700 overflow-hidden ml-auto"
                  >
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: awayWon ? 1 : (match.awaySets / (match.homeSets + match.awaySets)) }}
                      transition={{ duration: 0.8, delay: index * 0.08 + 0.4 }}
                      className={`h-full origin-right ${awayWon ? 'bg-retro-gold-500' : 'bg-retro-cyan-500'}`}
                      style={{ transformOrigin: 'right' }}
                    />
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Pixelated bottom border accent */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-jacksons-purple-700 via-retro-gold-500 to-jacksons-purple-700" />
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
      bg: 'bg-retro-gold-900/20',
      glow: 'shadow-[0_0_20px_rgba(255,215,0,0.3)]',
    },
    cyan: {
      title: 'text-retro-cyan-300',
      border: 'border-retro-cyan-500',
      bg: 'bg-retro-cyan-900/20',
      glow: 'shadow-[0_0_20px_rgba(96,80,220,0.3)]',
    },
  };

  const colors = colorClasses[accentColor];

  return (
    <section className="w-full">
      {/* League Header with Pokéball */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-4 mb-6 xs:mb-8 justify-center"
      >
        {/* Left Pokéball */}
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
          className={`w-6 h-6 rounded-full border-[3px] ${colors.border} bg-gradient-to-b from-white to-gray-300 relative overflow-hidden ${colors.glow}`}
        >
          <div className={`absolute bottom-0 left-0 right-0 h-1/2 ${accentColor === 'gold' ? 'bg-retro-gold-500' : 'bg-retro-cyan-600'}`} />
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-jacksons-purple-900 -translate-y-1/2" />
          <div className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-white border-[2px] border-jacksons-purple-900 -translate-x-1/2 -translate-y-1/2" />
        </motion.div>

        <h3
          className={`${colors.title} font-pokemon font-black text-sm xs:text-base sm:text-lg uppercase tracking-[0.25em] drop-shadow-[0_3px_0_rgba(0,0,0,1)]`}
        >
          {leagueName}
        </h3>

        {/* Right Pokéball */}
        <motion.div
          animate={{ rotate: [360, 0] }}
          transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
          className={`w-6 h-6 rounded-full border-[3px] ${colors.border} bg-gradient-to-b from-white to-gray-300 relative overflow-hidden ${colors.glow}`}
        >
          <div className={`absolute bottom-0 left-0 right-0 h-1/2 ${accentColor === 'gold' ? 'bg-retro-gold-500' : 'bg-retro-cyan-600'}`} />
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-jacksons-purple-900 -translate-y-1/2" />
          <div className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-white border-[2px] border-jacksons-purple-900 -translate-x-1/2 -translate-y-1/2" />
        </motion.div>
      </motion.div>

      <div
        className={`retro-border border-[4px] ${colors.border} p-4 xs:p-5 ${colors.bg} ${colors.glow} bg-jacksons-purple-900/40`}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={roundKey}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.3 }}
          >
            {matches.length > 0 ? (
              <div className="space-y-4 sm:space-y-5">
                {matches.map((match, index) => (
                  <MatchCard key={match.id} match={match} index={index} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-white/40">
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  className="text-4xl mb-4"
                >
                  ⚔️
                </motion.div>
                <span className="font-pokemon text-xs uppercase tracking-wider">
                  Sin partidos
                </span>
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
      className="retro-border border-[4px] border-retro-gold-500 bg-gradient-to-b from-retro-gold-900/30 to-jacksons-purple-900/40 p-8 xs:p-10 text-center shadow-[0_0_30px_rgba(255,215,0,0.2)]"
    >
      <motion.div
        animate={{ y: [0, -8, 0], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
        className="text-5xl mb-6"
      >
        <span role="img" aria-label="calendar">
          📅
        </span>
      </motion.div>
      <h3 className="text-retro-gold-400 font-pokemon font-black text-base xs:text-lg uppercase tracking-[0.25em] mb-4 drop-shadow-[0_3px_0_rgba(0,0,0,1)]">
        Próximamente
      </h3>
      <p className="text-white/60 text-xs xs:text-sm font-mono uppercase tracking-wide leading-relaxed">
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
          whileHover={canGoPrev ? { scale: 1.05, y: -2 } : {}}
          whileTap={canGoPrev ? { scale: 0.95 } : {}}
          className={`retro-border border-[3px] w-12 h-12 flex items-center justify-center font-pokemon text-xl transition-all ${
            canGoPrev
              ? 'border-retro-gold-500 bg-retro-gold-900 text-retro-gold-300 cursor-pointer shadow-[0_0_15px_rgba(255,215,0,0.3)] hover:shadow-[0_0_25px_rgba(255,215,0,0.5)]'
              : 'border-jacksons-purple-700 bg-jacksons-purple-900 text-white/20 cursor-not-allowed'
          }`}
          aria-label="Jornada anterior"
        >
          ◀
        </motion.button>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentRound.round}
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, type: 'spring' }}
            className="flex items-center gap-4"
          >
            <div className="h-px w-16 bg-gradient-to-r from-transparent via-retro-gold-500 to-transparent" />
            <div className="relative">
              <motion.div
                animate={{ boxShadow: ['0 0 20px rgba(255,215,0,0.3)', '0 0 30px rgba(255,215,0,0.5)', '0 0 20px rgba(255,215,0,0.3)'] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                className="retro-border border-[3px] border-retro-gold-500 bg-gradient-to-b from-retro-gold-900 to-jacksons-purple-900 px-6 py-3"
              >
                <h3 className="text-retro-gold-300 font-pokemon font-black text-sm xs:text-base sm:text-lg uppercase tracking-[0.3em] drop-shadow-[0_3px_0_rgba(0,0,0,1)] whitespace-nowrap">
                  Jornada {currentRound.round}
                </h3>
              </motion.div>
            </div>
            <div className="h-px w-16 bg-gradient-to-l from-transparent via-retro-gold-500 to-transparent" />
          </motion.div>
        </AnimatePresence>

        <motion.button
          type="button"
          onClick={handleNext}
          disabled={!canGoNext}
          whileHover={canGoNext ? { scale: 1.05, y: -2 } : {}}
          whileTap={canGoNext ? { scale: 0.95 } : {}}
          className={`retro-border border-[3px] w-12 h-12 flex items-center justify-center font-pokemon text-xl transition-all ${
            canGoNext
              ? 'border-retro-gold-500 bg-retro-gold-900 text-retro-gold-300 cursor-pointer shadow-[0_0_15px_rgba(255,215,0,0.3)] hover:shadow-[0_0_25px_rgba(255,215,0,0.5)]'
              : 'border-jacksons-purple-700 bg-jacksons-purple-900 text-white/20 cursor-not-allowed'
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
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            animate={
              idx === currentRoundIndex
                ? {
                    width: '40px',
                    backgroundColor: 'var(--color-retro-gold-400)',
                    boxShadow: '0 0 15px rgba(255, 215, 0, 0.6)'
                  }
                : {
                    width: '10px',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    boxShadow: '0 0 0px rgba(255, 215, 0, 0)'
                  }
            }
            transition={{ duration: 0.3 }}
            className="h-2.5 rounded-full cursor-pointer border border-jacksons-purple-700"
            aria-label={`Ir a jornada ${matches[idx].round}`}
          />
        ))}
      </div>

      {/* Full-width single column layout on mobile, two columns on larger screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xs:gap-10 lg:gap-12 xl:gap-16 w-full">
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
