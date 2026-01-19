'use client';

import { useMemo, useState } from 'react';
import type { MatchEntry, MatchesByRound } from '@/lib/types/queries.types';

interface MatchesSectionProps {
  matches: MatchesByRound;
}

function MatchCard({ match }: { match: MatchEntry }) {
  const homeInitials =
    match.homeTrainer?.nickname.slice(0, 2).toUpperCase() ?? '??';
  const awayInitials =
    match.awayTrainer?.nickname.slice(0, 2).toUpperCase() ?? '??';

  return (
    <div className="flex items-center justify-between gap-2 p-3 bg-jacksons-purple-700/50 rounded">
      {/* Home Trainer */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {match.homeTrainer?.avatarUrl ? (
          <img
            src={match.homeTrainer.avatarUrl}
            alt={match.homeTrainer.nickname}
            className="w-8 h-8 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs bg-linear-to-br from-jacksons-purple-500 to-snuff-500 shrink-0">
            {homeInitials}
          </div>
        )}
        <span className="text-white font-semibold text-xs truncate">
          {match.homeTrainer?.nickname ?? 'TBD'}
        </span>
      </div>

      {/* Score */}
      <div className="flex items-center gap-1 shrink-0">
        {match.played ? (
          <>
            <span
              className={`text-sm font-bold ${
                match.homeSets > match.awaySets
                  ? 'text-retro-gold-400'
                  : 'text-white/60'
              }`}
            >
              {match.homeSets}
            </span>
            <span className="text-white/40 text-xs">-</span>
            <span
              className={`text-sm font-bold ${
                match.awaySets > match.homeSets
                  ? 'text-retro-gold-400'
                  : 'text-white/60'
              }`}
            >
              {match.awaySets}
            </span>
          </>
        ) : (
          <span className="text-white/40 text-xs px-2">vs</span>
        )}
      </div>

      {/* Away Trainer */}
      <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
        <span className="text-white font-semibold text-xs truncate text-right">
          {match.awayTrainer?.nickname ?? 'TBD'}
        </span>
        {match.awayTrainer?.avatarUrl ? (
          <img
            src={match.awayTrainer.avatarUrl}
            alt={match.awayTrainer.nickname}
            className="w-8 h-8 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs bg-linear-to-br from-jacksons-purple-500 to-snuff-500 shrink-0">
            {awayInitials}
          </div>
        )}
      </div>
    </div>
  );
}

function LeagueMatchesList({
  leagueName,
  matches,
  accentColor,
}: {
  leagueName: string;
  matches: MatchEntry[];
  accentColor: 'gold' | 'cyan';
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
    <section>
      <h3
        className={`${colors.title} font-bold text-sm xs:text-base uppercase tracking-wide mb-3 xs:mb-4 text-center`}
      >
        {leagueName}
      </h3>
      <div
        className={`retro-border border-2 ${colors.border} bg-jacksons-purple-800/80 p-3 xs:p-4`}
      >
        <div className="space-y-2">
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      </div>
    </section>
  );
}

function EmptyState() {
  return (
    <div className="retro-border border-2 border-jacksons-purple-600 bg-jacksons-purple-800/80 p-6 xs:p-8 text-center">
      <div className="text-4xl mb-4">
        <span role="img" aria-label="calendar">
          &#128197;
        </span>
      </div>
      <h3 className="text-retro-gold-400 font-bold text-sm xs:text-base uppercase tracking-wide mb-2">
        Próximamente
      </h3>
      <p className="text-white/60 text-xs xs:text-sm">
        Los enfrentamientos de este split aún no han sido programados.
      </p>
    </div>
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
    <div>
      {/* Round Navigation */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <button
          type="button"
          onClick={handlePrev}
          disabled={!canGoPrev}
          className={`text-lg font-bold transition-colors ${
            canGoPrev
              ? 'text-retro-gold-400 hover:text-retro-gold-300 cursor-pointer'
              : 'text-white/20 cursor-not-allowed'
          }`}
          aria-label="Jornada anterior"
        >
          &lt;
        </button>

        <h3 className="text-retro-gold-400 font-bold text-sm xs:text-base uppercase tracking-wide min-w-[120px] text-center">
          Jornada {currentRound.round}
        </h3>

        <button
          type="button"
          onClick={handleNext}
          disabled={!canGoNext}
          className={`text-lg font-bold transition-colors ${
            canGoNext
              ? 'text-retro-gold-400 hover:text-retro-gold-300 cursor-pointer'
              : 'text-white/20 cursor-not-allowed'
          }`}
          aria-label="Jornada siguiente"
        >
          &gt;
        </button>
      </div>

      {/* Round indicator */}
      <div className="flex justify-center gap-1 mb-6">
        {matches.map((_, idx) => (
          <button
            key={matches[idx].round}
            type="button"
            onClick={() => setCurrentRoundIndex(idx)}
            className={`w-2 h-2 rounded-full transition-colors ${
              idx === currentRoundIndex
                ? 'bg-retro-gold-400'
                : 'bg-white/20 hover:bg-white/40'
            }`}
            aria-label={`Ir a jornada ${matches[idx].round}`}
          />
        ))}
      </div>

      {/* Two-column layout for leagues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 xs:gap-8">
        {primeraMatches.length > 0 && (
          <LeagueMatchesList
            leagueName="Primera División"
            matches={primeraMatches}
            accentColor="gold"
          />
        )}

        {segundaMatches.length > 0 && (
          <LeagueMatchesList
            leagueName="Segunda División"
            matches={segundaMatches}
            accentColor="cyan"
          />
        )}
      </div>
    </div>
  );
}
