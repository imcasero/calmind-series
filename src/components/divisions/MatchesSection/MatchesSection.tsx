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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ scale: 1.01, backgroundColor: 'rgba(61, 53, 128, 0.7)' }}
      className="flex items-center justify-between gap-3 p-3 bg-jacksons-purple-700/50 rounded cursor-default"
    >
      {/* Home Trainer */}
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        {match.homeTrainer?.avatarUrl ? (
          <Image
            src={match.homeTrainer.avatarUrl}
            alt={match.homeTrainer.nickname}
            width={36}
            height={36}
            className="w-9 h-9 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs bg-linear-to-br from-jacksons-purple-500 to-snuff-500 shrink-0">
            {homeInitials}
          </div>
        )}
        <span className="text-white font-semibold text-sm whitespace-nowrap">
          {match.homeTrainer?.nickname ?? 'TBD'}
        </span>
      </div>

      {/* Score */}
      <div className="flex items-center gap-1.5 shrink-0 px-3 justify-center">
        {match.played ? (
          <>
            <motion.span
              initial={{ scale: 1 }}
              animate={
                match.homeSets > match.awaySets ? { scale: [1, 1.2, 1] } : {}
              }
              transition={{ duration: 0.3 }}
              className={`text-base font-bold ${
                match.homeSets > match.awaySets
                  ? 'text-retro-gold-400'
                  : 'text-white/60'
              }`}
            >
              {match.homeSets}
            </motion.span>
            <span className="text-white/40 text-sm">-</span>
            <motion.span
              initial={{ scale: 1 }}
              animate={
                match.awaySets > match.homeSets ? { scale: [1, 1.2, 1] } : {}
              }
              transition={{ duration: 0.3 }}
              className={`text-base font-bold ${
                match.awaySets > match.homeSets
                  ? 'text-retro-gold-400'
                  : 'text-white/60'
              }`}
            >
              {match.awaySets}
            </motion.span>
          </>
        ) : (
          <span className="text-white/40 text-sm">vs</span>
        )}
      </div>

      {/* Away Trainer */}
      <div className="flex items-center gap-2.5 flex-1 min-w-0 justify-end">
        <span className="text-white font-semibold text-sm whitespace-nowrap">
          {match.awayTrainer?.nickname ?? 'TBD'}
        </span>
        {match.awayTrainer?.avatarUrl ? (
          <Image
            src={match.awayTrainer.avatarUrl}
            alt={match.awayTrainer.nickname}
            width={36}
            height={36}
            className="w-9 h-9 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs bg-linear-to-br from-jacksons-purple-500 to-snuff-500 shrink-0">
            {awayInitials}
          </div>
        )}
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
    },
    cyan: {
      title: 'text-retro-cyan-300',
      border: 'border-retro-cyan-500',
    },
  };

  const colors = colorClasses[accentColor];

  return (
    <section className="w-full">
      <h3
        className={`${colors.title} font-bold text-sm xs:text-base uppercase tracking-wide mb-3 xs:mb-4 text-center`}
      >
        {leagueName}
      </h3>
      <div
        className={`retro-border border-2 ${colors.border} bg-jacksons-purple-800/80 p-3 xs:p-4`}
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
              <div className="space-y-2">
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
      className="retro-border border-2 border-jacksons-purple-600 bg-jacksons-purple-800/80 p-6 xs:p-8 text-center"
    >
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        className="text-4xl mb-4"
      >
        <span role="img" aria-label="calendar">
          &#128197;
        </span>
      </motion.div>
      <h3 className="text-retro-gold-400 font-bold text-sm xs:text-base uppercase tracking-wide mb-2">
        Próximamente
      </h3>
      <p className="text-white/60 text-xs xs:text-sm">
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
      <div className="flex items-center justify-center gap-4 mb-4">
        <motion.button
          type="button"
          onClick={handlePrev}
          disabled={!canGoPrev}
          whileHover={canGoPrev ? { scale: 1.2 } : {}}
          whileTap={canGoPrev ? { scale: 0.9 } : {}}
          className={`text-xl font-bold transition-colors ${
            canGoPrev
              ? 'text-retro-gold-400 hover:text-retro-gold-300 cursor-pointer'
              : 'text-white/20 cursor-not-allowed'
          }`}
          aria-label="Jornada anterior"
        >
          &#8249;
        </motion.button>

        <AnimatePresence mode="wait">
          <motion.h3
            key={currentRound.round}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.15 }}
            className="text-retro-gold-400 font-bold text-sm xs:text-base uppercase tracking-wide min-w-[140px] text-center"
          >
            Jornada {currentRound.round}
          </motion.h3>
        </AnimatePresence>

        <motion.button
          type="button"
          onClick={handleNext}
          disabled={!canGoNext}
          whileHover={canGoNext ? { scale: 1.2 } : {}}
          whileTap={canGoNext ? { scale: 0.9 } : {}}
          className={`text-xl font-bold transition-colors ${
            canGoNext
              ? 'text-retro-gold-400 hover:text-retro-gold-300 cursor-pointer'
              : 'text-white/20 cursor-not-allowed'
          }`}
          aria-label="Jornada siguiente"
        >
          &#8250;
        </motion.button>
      </div>

      {/* Round indicator */}
      <div className="flex justify-center gap-1.5 mb-6">
        {matches.map((_, idx) => (
          <motion.button
            key={matches[idx].round}
            type="button"
            onClick={() => setCurrentRoundIndex(idx)}
            whileHover={{ scale: 1.3 }}
            whileTap={{ scale: 0.9 }}
            animate={
              idx === currentRoundIndex
                ? { scale: 1.2, backgroundColor: '#ffed4e' }
                : { scale: 1, backgroundColor: 'rgba(255,255,255,0.2)' }
            }
            transition={{ duration: 0.2 }}
            className="w-2.5 h-2.5 rounded-full cursor-pointer"
            aria-label={`Ir a jornada ${matches[idx].round}`}
          />
        ))}
      </div>

      {/* Two-column layout for leagues - fixed height to prevent resizing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 w-full">
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
