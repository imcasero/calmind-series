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

function RoundSection({
  round,
  matches,
}: {
  round: number;
  matches: MatchEntry[];
}) {
  // Group matches by league
  const matchesByLeague = matches.reduce(
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

  const leagueNames = Object.keys(matchesByLeague).sort();

  return (
    <section className="retro-border border-2 border-jacksons-purple-600 bg-jacksons-purple-800/80 p-3 xs:p-4">
      <h3 className="text-retro-gold-400 font-bold text-sm xs:text-base uppercase tracking-wide mb-3 text-center">
        Jornada {round}
      </h3>

      <div className="space-y-4">
        {leagueNames.map((leagueName) => (
          <div key={leagueName}>
            <h4 className="text-retro-cyan-300 font-semibold text-xs uppercase tracking-wide mb-2 text-center">
              {leagueName}
            </h4>
            <div className="space-y-2">
              {matchesByLeague[leagueName].map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          </div>
        ))}
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
  if (matches.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-4 xs:space-y-6">
      {matches.map(({ round, matches: roundMatches }) => (
        <RoundSection key={round} round={round} matches={roundMatches} />
      ))}
    </div>
  );
}
