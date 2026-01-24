'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import type { ActiveSplitInfo } from '@/lib/queries';
import { createClient } from '@/lib/supabase/client';
import type {
  League,
  LeagueParticipant,
  Match,
  Season,
  Split,
  Trainer,
} from '@/lib/types/database.types';

type ParticipantWithTrainer = LeagueParticipant & { trainer: Trainer };
type MatchWithTrainers = Match & {
  home_trainer: Trainer | null;
  away_trainer: Trainer | null;
};

interface MatchesManagerProps {
  initialSeasons: Season[];
  activeSplitInfo: ActiveSplitInfo | null;
}

export default function MatchesManager({
  initialSeasons,
  activeSplitInfo,
}: MatchesManagerProps) {
  const router = useRouter();

  // Tab state
  const [activeTab, setActiveTab] = useState<'results' | 'planning'>('results');

  // Common state
  const [splits, setSplits] = useState<Split[]>([]);
  const [leagues, setLeagues] = useState<League[]>(
    activeSplitInfo?.leagues ?? [],
  );
  const [participants, setParticipants] = useState<ParticipantWithTrainer[]>(
    [],
  );
  const [matches, setMatches] = useState<MatchWithTrainers[]>([]);

  // Results tab - auto-select active split
  const [resultsLeagueId, setResultsLeagueId] = useState<string | null>(
    activeSplitInfo?.leagues[0]?.id ?? null,
  );

  // Planning tab - manual selection
  const [selectedSeasonId, setSelectedSeasonId] = useState<string | null>(
    activeSplitInfo?.season.id ??
      initialSeasons.find((s) => s.is_active)?.id ??
      null,
  );
  const [selectedSplitId, setSelectedSplitId] = useState<string | null>(
    activeSplitInfo?.split.id ?? null,
  );
  const [selectedLeagueId, setSelectedLeagueId] = useState<string | null>(null);
  const [selectedRound, setSelectedRound] = useState<number>(1);

  // Loading states
  const [loadingSplits, setLoadingSplits] = useState(false);
  const [loadingLeagues, setLoadingLeagues] = useState(false);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  // Form states
  const [showMatchForm, setShowMatchForm] = useState(false);
  const [editingMatch, setEditingMatch] = useState<MatchWithTrainers | null>(
    null,
  );
  const [matchForm, setMatchForm] = useState({
    home_trainer_id: '',
    away_trainer_id: '',
    round: 1,
    match_group: 'regular',
    match_tag: '',
  });

  // Result editing
  const [editingResultId, setEditingResultId] = useState<string | null>(null);
  const [resultForm, setResultForm] = useState({ home_sets: 0, away_sets: 0 });

  // Common state
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  // Get unique rounds from matches
  const availableRounds = useMemo(() => {
    const rounds = [...new Set(matches.map((m) => m.round))].sort(
      (a, b) => a - b,
    );
    return rounds.length > 0 ? rounds : [1];
  }, [matches]);

  // Filter matches by round for planning tab
  const matchesByRound = useMemo(() => {
    return matches.filter((m) => m.round === selectedRound);
  }, [matches, selectedRound]);

  // Fetch splits when season changes (for planning tab)
  useEffect(() => {
    if (!selectedSeasonId || activeTab !== 'planning') return;

    const fetchSplits = async () => {
      setLoadingSplits(true);

      const { data, error } = await supabase
        .from('splits')
        .select('*')
        .eq('season_id', selectedSeasonId)
        .order('split_order', { ascending: true });

      if (error) {
        setError(error.message);
      } else {
        setSplits(data ?? []);
        if (data?.[0] && !selectedSplitId) {
          setSelectedSplitId(data[0].id);
        }
      }
      setLoadingSplits(false);
    };

    fetchSplits();
  }, [selectedSeasonId, activeTab]);

  // Fetch leagues when split changes
  useEffect(() => {
    const splitId =
      activeTab === 'results' ? activeSplitInfo?.split.id : selectedSplitId;
    if (!splitId) {
      setLeagues([]);
      return;
    }

    const fetchLeagues = async () => {
      setLoadingLeagues(true);

      const { data, error } = await supabase
        .from('leagues')
        .select('*')
        .eq('split_id', splitId)
        .order('tier_priority', { ascending: true });

      if (error) {
        setError(error.message);
      } else {
        setLeagues(data ?? []);
        if (data?.[0]) {
          if (activeTab === 'results') {
            setResultsLeagueId(data[0].id);
          } else {
            setSelectedLeagueId(data[0].id);
          }
        }
      }
      setLoadingLeagues(false);
    };

    fetchLeagues();
  }, [activeSplitInfo?.split.id, selectedSplitId, activeTab]);

  // Fetch matches when league changes
  useEffect(() => {
    const leagueId =
      activeTab === 'results' ? resultsLeagueId : selectedLeagueId;
    if (!leagueId) {
      setMatches([]);
      return;
    }

    const fetchMatches = async () => {
      setLoadingMatches(true);

      const { data, error } = await supabase
        .from('matches')
        .select(
          `
          *,
          home_trainer:trainers!matches_home_trainer_id_fkey(*),
          away_trainer:trainers!matches_away_trainer_id_fkey(*)
        `,
        )
        .eq('league_id', leagueId)
        .order('round', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) {
        setError(error.message);
      } else {
        setMatches((data ?? []) as MatchWithTrainers[]);
      }
      setLoadingMatches(false);
    };

    fetchMatches();
  }, [resultsLeagueId, selectedLeagueId, activeTab]);

  // Fetch participants for planning tab
  useEffect(() => {
    if (!selectedLeagueId || activeTab !== 'planning') {
      setParticipants([]);
      return;
    }

    const fetchParticipants = async () => {
      setLoadingParticipants(true);

      const { data, error } = await supabase
        .from('league_participants')
        .select('*, trainer:trainers(*)')
        .eq('league_id', selectedLeagueId)
        .order('initial_seed', { ascending: true });

      if (error) {
        setError(error.message);
      } else {
        setParticipants((data ?? []) as ParticipantWithTrainer[]);
      }
      setLoadingParticipants(false);
    };

    fetchParticipants();
  }, [selectedLeagueId, activeTab]);

  // Refresh matches
  const refreshMatches = async () => {
    const leagueId =
      activeTab === 'results' ? resultsLeagueId : selectedLeagueId;
    if (!leagueId) return;

    const { data } = await supabase
      .from('matches')
      .select(
        `
        *,
        home_trainer:trainers!matches_home_trainer_id_fkey(*),
        away_trainer:trainers!matches_away_trainer_id_fkey(*)
      `,
      )
      .eq('league_id', leagueId)
      .order('round', { ascending: true })
      .order('created_at', { ascending: true });

    if (data) {
      setMatches(data as MatchWithTrainers[]);
    }
  };

  // Result handlers
  const handleStartEditResult = (match: MatchWithTrainers) => {
    setEditingResultId(match.id);
    setResultForm({
      home_sets: match.home_sets ?? 0,
      away_sets: match.away_sets ?? 0,
    });
  };

  const handleCancelEditResult = () => {
    setEditingResultId(null);
    setResultForm({ home_sets: 0, away_sets: 0 });
  };

  const handleSaveResult = async (matchId: string) => {
    setSaving(true);
    setError(null);

    const { error } = await supabase
      .from('matches')
      .update({
        home_sets: resultForm.home_sets,
        away_sets: resultForm.away_sets,
        played: true,
      })
      .eq('id', matchId);

    if (error) {
      setError(error.message);
    } else {
      setEditingResultId(null);
      await refreshMatches();
      router.refresh();
    }
    setSaving(false);
  };

  const handleClearResult = async (matchId: string) => {
    if (!confirm('¿Limpiar el resultado de este partido?')) return;

    setSaving(true);
    const { error } = await supabase
      .from('matches')
      .update({
        home_sets: null,
        away_sets: null,
        played: false,
      })
      .eq('id', matchId);

    if (error) {
      setError(error.message);
    } else {
      await refreshMatches();
      router.refresh();
    }
    setSaving(false);
  };

  // Planning handlers
  const handleOpenMatchForm = (match?: MatchWithTrainers) => {
    if (match) {
      setEditingMatch(match);
      setMatchForm({
        home_trainer_id: match.home_trainer_id ?? '',
        away_trainer_id: match.away_trainer_id ?? '',
        round: match.round,
        match_group: match.match_group,
        match_tag: match.match_tag,
      });
    } else {
      setEditingMatch(null);
      setMatchForm({
        home_trainer_id: '',
        away_trainer_id: '',
        round: selectedRound,
        match_group: 'regular',
        match_tag: '',
      });
    }
    setShowMatchForm(true);
  };

  const handleCloseMatchForm = () => {
    setShowMatchForm(false);
    setEditingMatch(null);
    setMatchForm({
      home_trainer_id: '',
      away_trainer_id: '',
      round: selectedRound,
      match_group: 'regular',
      match_tag: '',
    });
  };

  const handleSaveMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeagueId || !selectedSplitId) return;

    setSaving(true);
    setError(null);

    if (editingMatch) {
      const { error } = await supabase
        .from('matches')
        .update({
          home_trainer_id: matchForm.home_trainer_id || null,
          away_trainer_id: matchForm.away_trainer_id || null,
          round: matchForm.round,
          match_group: matchForm.match_group,
          match_tag: matchForm.match_tag,
        })
        .eq('id', editingMatch.id);

      if (error) {
        setError(error.message);
      } else {
        handleCloseMatchForm();
        await refreshMatches();
        router.refresh();
      }
    } else {
      const { error } = await supabase.from('matches').insert({
        league_id: selectedLeagueId,
        split_id: selectedSplitId,
        home_trainer_id: matchForm.home_trainer_id || null,
        away_trainer_id: matchForm.away_trainer_id || null,
        round: matchForm.round,
        match_group: matchForm.match_group,
        match_tag: matchForm.match_tag || `J${matchForm.round}`,
        played: false,
      });

      if (error) {
        setError(error.message);
      } else {
        handleCloseMatchForm();
        await refreshMatches();
        router.refresh();
      }
    }
    setSaving(false);
  };

  const handleDeleteMatch = async (matchId: string) => {
    if (!confirm('¿Eliminar este partido?')) return;

    setSaving(true);
    const { error } = await supabase.from('matches').delete().eq('id', matchId);

    if (error) {
      setError(error.message);
    } else {
      await refreshMatches();
      router.refresh();
    }
    setSaving(false);
  };

  // Get available trainers for match form
  const getAvailableTrainers = (excludeId?: string) => {
    return participants.filter((p) => p.trainer_id !== excludeId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-retro-gold-500 uppercase tracking-wider">
          Partidos
        </h1>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-600 border-4 border-red-800 p-4 text-white text-sm">
          {error}
          <button
            type="button"
            onClick={() => setError(null)}
            className="ml-4 underline"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('results')}
          className={`
            px-6 py-3 font-bold uppercase tracking-wide text-sm border-4 transition-all duration-100
            ${
              activeTab === 'results'
                ? 'bg-retro-gold-500 text-jacksons-purple-950 border-jacksons-purple-950 shadow-[2px_2px_0px_0px_#1a1a1a]'
                : 'bg-jacksons-purple-800 text-jacksons-purple-200 border-jacksons-purple-600 hover:bg-jacksons-purple-700'
            }
          `}
        >
          Resultados
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('planning')}
          className={`
            px-6 py-3 font-bold uppercase tracking-wide text-sm border-4 transition-all duration-100
            ${
              activeTab === 'planning'
                ? 'bg-retro-gold-500 text-jacksons-purple-950 border-jacksons-purple-950 shadow-[2px_2px_0px_0px_#1a1a1a]'
                : 'bg-jacksons-purple-800 text-jacksons-purple-200 border-jacksons-purple-600 hover:bg-jacksons-purple-700'
            }
          `}
        >
          Planificacion
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'results' ? (
        /* Results Tab */
        <div className="space-y-4">
          {/* Active Split Info + League Selector */}
          <div className="flex items-center gap-4 flex-wrap bg-jacksons-purple-800 border-4 border-jacksons-purple-600 p-4 shadow-[4px_4px_0px_0px_#1a1a1a]">
            {activeSplitInfo ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-jacksons-purple-200 text-sm uppercase tracking-wide">
                    Split Activo:
                  </span>
                  <span className="px-3 py-1 bg-retro-gold-500 text-jacksons-purple-950 font-bold text-sm border-2 border-jacksons-purple-950">
                    {activeSplitInfo.split.name}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <label
                    htmlFor="results-league"
                    className="text-jacksons-purple-200 text-sm uppercase tracking-wide"
                  >
                    Division:
                  </label>
                  <select
                    id="results-league"
                    value={resultsLeagueId ?? ''}
                    onChange={(e) => setResultsLeagueId(e.target.value || null)}
                    disabled={loadingLeagues}
                    className="px-4 py-2 bg-jacksons-purple-950 text-white border-4 border-jacksons-purple-600 focus:outline-none focus:border-retro-gold-500 cursor-pointer disabled:opacity-50"
                  >
                    <option value="">
                      {loadingLeagues ? 'Cargando...' : 'Seleccionar'}
                    </option>
                    {leagues.map((league) => (
                      <option key={league.id} value={league.id}>
                        {league.tier_name}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <p className="text-jacksons-purple-300">
                No hay un split activo configurado.
              </p>
            )}
          </div>

          {/* Matches List for Results */}
          {!resultsLeagueId ? (
            <div className="bg-jacksons-purple-800 border-4 border-jacksons-purple-600 p-8 shadow-[4px_4px_0px_0px_#1a1a1a] text-center">
              <p className="text-jacksons-purple-300">
                Selecciona una division para ver los partidos.
              </p>
            </div>
          ) : loadingMatches ? (
            <div className="bg-jacksons-purple-800 border-4 border-jacksons-purple-600 p-8 shadow-[4px_4px_0px_0px_#1a1a1a] text-center">
              <p className="text-jacksons-purple-300">Cargando partidos...</p>
            </div>
          ) : matches.length === 0 ? (
            <div className="bg-jacksons-purple-800 border-4 border-jacksons-purple-600 p-8 shadow-[4px_4px_0px_0px_#1a1a1a] text-center">
              <p className="text-jacksons-purple-300">
                No hay partidos planificados para esta division.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {availableRounds.map((round) => {
                const roundMatches = matches.filter((m) => m.round === round);
                if (roundMatches.length === 0) return null;

                return (
                  <div
                    key={round}
                    className="bg-jacksons-purple-800 border-4 border-jacksons-purple-600 shadow-[4px_4px_0px_0px_#1a1a1a] overflow-hidden"
                  >
                    <div className="bg-jacksons-purple-900 border-b-4 border-jacksons-purple-600 px-6 py-3">
                      <h3 className="text-retro-gold-500 font-bold uppercase tracking-wider">
                        Jornada {round}
                      </h3>
                    </div>
                    <div className="divide-y-2 divide-jacksons-purple-700">
                      {roundMatches.map((match) => (
                        <div
                          key={match.id}
                          className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-jacksons-purple-700/30 transition-colors"
                        >
                          {/* Match Display */}
                          <div className="flex items-center gap-4 flex-1">
                            {/* Home Trainer */}
                            <div className="flex items-center gap-2 flex-1 justify-end">
                              <span className="text-white font-medium text-right">
                                {match.home_trainer?.nickname ?? 'TBD'}
                              </span>
                              {match.home_trainer?.avatar_url ? (
                                <img
                                  src={match.home_trainer.avatar_url}
                                  alt=""
                                  className="w-8 h-8 border-2 border-jacksons-purple-500 object-cover"
                                />
                              ) : (
                                <div className="w-8 h-8 bg-jacksons-purple-600 border-2 border-jacksons-purple-500 flex items-center justify-center text-white font-bold text-xs">
                                  {match.home_trainer?.nickname?.charAt(0) ??
                                    '?'}
                                </div>
                              )}
                            </div>

                            {/* Score / Edit */}
                            {editingResultId === match.id ? (
                              <div className="flex items-center gap-2 px-4">
                                <input
                                  type="number"
                                  min="0"
                                  max="3"
                                  value={resultForm.home_sets}
                                  onChange={(e) =>
                                    setResultForm({
                                      ...resultForm,
                                      home_sets: parseInt(e.target.value) || 0,
                                    })
                                  }
                                  className="w-12 h-10 text-center bg-jacksons-purple-950 text-white border-2 border-jacksons-purple-500 font-bold"
                                />
                                <span className="text-jacksons-purple-400 font-bold">
                                  -
                                </span>
                                <input
                                  type="number"
                                  min="0"
                                  max="3"
                                  value={resultForm.away_sets}
                                  onChange={(e) =>
                                    setResultForm({
                                      ...resultForm,
                                      away_sets: parseInt(e.target.value) || 0,
                                    })
                                  }
                                  className="w-12 h-10 text-center bg-jacksons-purple-950 text-white border-2 border-jacksons-purple-500 font-bold"
                                />
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 px-4 min-w-[80px] justify-center">
                                {match.played ? (
                                  <span className="text-retro-gold-400 font-bold text-lg">
                                    {match.home_sets} - {match.away_sets}
                                  </span>
                                ) : (
                                  <span className="text-jacksons-purple-400 font-bold">
                                    VS
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Away Trainer */}
                            <div className="flex items-center gap-2 flex-1">
                              {match.away_trainer?.avatar_url ? (
                                <img
                                  src={match.away_trainer.avatar_url}
                                  alt=""
                                  className="w-8 h-8 border-2 border-jacksons-purple-500 object-cover"
                                />
                              ) : (
                                <div className="w-8 h-8 bg-jacksons-purple-600 border-2 border-jacksons-purple-500 flex items-center justify-center text-white font-bold text-xs">
                                  {match.away_trainer?.nickname?.charAt(0) ??
                                    '?'}
                                </div>
                              )}
                              <span className="text-white font-medium">
                                {match.away_trainer?.nickname ?? 'TBD'}
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            {editingResultId === match.id ? (
                              <>
                                <button
                                  type="button"
                                  onClick={handleCancelEditResult}
                                  className="px-3 py-2 bg-jacksons-purple-600 text-white border-2 border-jacksons-purple-800 text-xs font-bold uppercase hover:bg-jacksons-purple-500 transition-all"
                                >
                                  Cancelar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSaveResult(match.id)}
                                  disabled={saving}
                                  className="px-3 py-2 bg-green-600 text-white border-2 border-green-800 text-xs font-bold uppercase hover:bg-green-500 disabled:opacity-50 transition-all"
                                >
                                  {saving ? '...' : 'Guardar'}
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleStartEditResult(match)}
                                  className="px-3 py-2 bg-retro-cyan-500 text-white border-2 border-retro-cyan-700 text-xs font-bold uppercase hover:bg-retro-cyan-400 transition-all"
                                >
                                  {match.played ? 'Editar' : 'Resultado'}
                                </button>
                                {match.played && (
                                  <button
                                    type="button"
                                    onClick={() => handleClearResult(match.id)}
                                    className="px-3 py-2 bg-orange-600 text-white border-2 border-orange-800 text-xs font-bold uppercase hover:bg-orange-500 transition-all"
                                  >
                                    Limpiar
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Planning Tab */
        <div className="space-y-4">
          {/* Selectors */}
          <div className="flex items-center gap-4 flex-wrap bg-jacksons-purple-800 border-4 border-jacksons-purple-600 p-4 shadow-[4px_4px_0px_0px_#1a1a1a]">
            <div className="flex items-center gap-2">
              <label
                htmlFor="planning-season"
                className="text-jacksons-purple-200 text-sm uppercase tracking-wide"
              >
                Temporada:
              </label>
              <select
                id="planning-season"
                value={selectedSeasonId ?? ''}
                onChange={(e) => {
                  setSelectedSeasonId(e.target.value || null);
                  setSelectedSplitId(null);
                  setSelectedLeagueId(null);
                }}
                className="px-4 py-2 bg-jacksons-purple-950 text-white border-4 border-jacksons-purple-600 focus:outline-none focus:border-retro-gold-500 cursor-pointer"
              >
                <option value="">Seleccionar</option>
                {initialSeasons.map((season) => (
                  <option key={season.id} value={season.id}>
                    {season.name} {season.is_active ? '★' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label
                htmlFor="planning-split"
                className="text-jacksons-purple-200 text-sm uppercase tracking-wide"
              >
                Split:
              </label>
              <select
                id="planning-split"
                value={selectedSplitId ?? ''}
                onChange={(e) => {
                  setSelectedSplitId(e.target.value || null);
                  setSelectedLeagueId(null);
                }}
                disabled={!selectedSeasonId || loadingSplits}
                className="px-4 py-2 bg-jacksons-purple-950 text-white border-4 border-jacksons-purple-600 focus:outline-none focus:border-retro-gold-500 cursor-pointer disabled:opacity-50"
              >
                <option value="">
                  {loadingSplits ? 'Cargando...' : 'Seleccionar'}
                </option>
                {splits.map((split) => (
                  <option key={split.id} value={split.id}>
                    {split.name} {split.is_active ? '★' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label
                htmlFor="planning-league"
                className="text-jacksons-purple-200 text-sm uppercase tracking-wide"
              >
                Division:
              </label>
              <select
                id="planning-league"
                value={selectedLeagueId ?? ''}
                onChange={(e) => setSelectedLeagueId(e.target.value || null)}
                disabled={!selectedSplitId || loadingLeagues}
                className="px-4 py-2 bg-jacksons-purple-950 text-white border-4 border-jacksons-purple-600 focus:outline-none focus:border-retro-gold-500 cursor-pointer disabled:opacity-50"
              >
                <option value="">
                  {loadingLeagues ? 'Cargando...' : 'Seleccionar'}
                </option>
                {leagues.map((league) => (
                  <option key={league.id} value={league.id}>
                    {league.tier_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Round selector + Add match */}
          {selectedLeagueId && (
            <div className="flex items-center justify-between gap-4 flex-wrap bg-jacksons-purple-800 border-4 border-jacksons-purple-600 p-4 shadow-[4px_4px_0px_0px_#1a1a1a]">
              <div className="flex items-center gap-2">
                <label
                  htmlFor="round-select"
                  className="text-jacksons-purple-200 text-sm uppercase tracking-wide"
                >
                  Jornada:
                </label>
                <select
                  id="round-select"
                  value={selectedRound}
                  onChange={(e) => setSelectedRound(parseInt(e.target.value))}
                  className="px-4 py-2 bg-jacksons-purple-950 text-white border-4 border-jacksons-purple-600 focus:outline-none focus:border-retro-gold-500 cursor-pointer"
                >
                  {[...Array(20)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Jornada {i + 1}
                      {availableRounds.includes(i + 1) ? ' ●' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled
                  className="px-4 py-2 bg-jacksons-purple-600 text-jacksons-purple-400 border-4 border-jacksons-purple-700 font-bold uppercase tracking-wide text-sm cursor-not-allowed opacity-50"
                  title="Proximamente: Carga de CSV"
                >
                  Importar CSV
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenMatchForm()}
                  disabled={participants.length < 2}
                  className="px-4 py-2 bg-retro-gold-500 text-jacksons-purple-950 border-4 border-jacksons-purple-950 font-bold uppercase tracking-wide text-sm shadow-[4px_4px_0px_0px_#1a1a1a] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#1a1a1a] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-100"
                >
                  + Nuevo Partido
                </button>
              </div>
            </div>
          )}

          {/* Match Form Modal */}
          {showMatchForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-jacksons-purple-800 border-4 border-jacksons-purple-600 p-6 shadow-[4px_4px_0px_0px_#1a1a1a] w-full max-w-md">
                <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-4">
                  {editingMatch ? 'Editar Partido' : 'Nuevo Partido'}
                </h2>
                <form onSubmit={handleSaveMatch} className="space-y-4">
                  <div>
                    <label
                      htmlFor="home-trainer"
                      className="block text-jacksons-purple-200 text-sm uppercase tracking-wide mb-2"
                    >
                      Entrenador Local *
                    </label>
                    <select
                      id="home-trainer"
                      value={matchForm.home_trainer_id}
                      onChange={(e) =>
                        setMatchForm({
                          ...matchForm,
                          home_trainer_id: e.target.value,
                        })
                      }
                      required
                      className="w-full px-4 py-3 bg-jacksons-purple-950 text-white border-4 border-jacksons-purple-600 focus:outline-none focus:border-retro-gold-500 cursor-pointer"
                    >
                      <option value="">Seleccionar</option>
                      {getAvailableTrainers(matchForm.away_trainer_id).map(
                        (p) => (
                          <option key={p.trainer_id} value={p.trainer_id ?? ''}>
                            {p.trainer?.nickname}
                          </option>
                        ),
                      )}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="away-trainer"
                      className="block text-jacksons-purple-200 text-sm uppercase tracking-wide mb-2"
                    >
                      Entrenador Visitante *
                    </label>
                    <select
                      id="away-trainer"
                      value={matchForm.away_trainer_id}
                      onChange={(e) =>
                        setMatchForm({
                          ...matchForm,
                          away_trainer_id: e.target.value,
                        })
                      }
                      required
                      className="w-full px-4 py-3 bg-jacksons-purple-950 text-white border-4 border-jacksons-purple-600 focus:outline-none focus:border-retro-gold-500 cursor-pointer"
                    >
                      <option value="">Seleccionar</option>
                      {getAvailableTrainers(matchForm.home_trainer_id).map(
                        (p) => (
                          <option key={p.trainer_id} value={p.trainer_id ?? ''}>
                            {p.trainer?.nickname}
                          </option>
                        ),
                      )}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="match-round"
                        className="block text-jacksons-purple-200 text-sm uppercase tracking-wide mb-2"
                      >
                        Jornada *
                      </label>
                      <input
                        id="match-round"
                        type="number"
                        min="1"
                        value={matchForm.round}
                        onChange={(e) =>
                          setMatchForm({
                            ...matchForm,
                            round: parseInt(e.target.value) || 1,
                          })
                        }
                        required
                        className="w-full px-4 py-3 bg-jacksons-purple-950 text-white border-4 border-jacksons-purple-600 focus:outline-none focus:border-retro-gold-500"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="match-group"
                        className="block text-jacksons-purple-200 text-sm uppercase tracking-wide mb-2"
                      >
                        Grupo
                      </label>
                      <select
                        id="match-group"
                        value={matchForm.match_group}
                        onChange={(e) =>
                          setMatchForm({
                            ...matchForm,
                            match_group: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-jacksons-purple-950 text-white border-4 border-jacksons-purple-600 focus:outline-none focus:border-retro-gold-500 cursor-pointer"
                      >
                        <option value="regular">Regular</option>
                        <option value="playoff">Playoff</option>
                        <option value="final">Final</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="match-tag"
                      className="block text-jacksons-purple-200 text-sm uppercase tracking-wide mb-2"
                    >
                      Etiqueta (opcional)
                    </label>
                    <input
                      id="match-tag"
                      type="text"
                      value={matchForm.match_tag}
                      onChange={(e) =>
                        setMatchForm({
                          ...matchForm,
                          match_tag: e.target.value,
                        })
                      }
                      placeholder={`J${matchForm.round}`}
                      className="w-full px-4 py-3 bg-jacksons-purple-950 text-white border-4 border-jacksons-purple-600 focus:outline-none focus:border-retro-gold-500 placeholder-jacksons-purple-400"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={handleCloseMatchForm}
                      className="flex-1 px-4 py-3 bg-jacksons-purple-600 text-white border-4 border-jacksons-purple-950 font-bold uppercase tracking-wide text-sm hover:bg-jacksons-purple-500 transition-all duration-100"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 px-4 py-3 bg-retro-gold-500 text-jacksons-purple-950 border-4 border-jacksons-purple-950 font-bold uppercase tracking-wide text-sm shadow-[4px_4px_0px_0px_#1a1a1a] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#1a1a1a] disabled:opacity-50 transition-all duration-100"
                    >
                      {saving ? 'Guardando...' : 'Guardar'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Matches List for Planning */}
          {!selectedLeagueId ? (
            <div className="bg-jacksons-purple-800 border-4 border-jacksons-purple-600 p-8 shadow-[4px_4px_0px_0px_#1a1a1a] text-center">
              <p className="text-jacksons-purple-300">
                Selecciona temporada, split y division para planificar partidos.
              </p>
            </div>
          ) : loadingMatches || loadingParticipants ? (
            <div className="bg-jacksons-purple-800 border-4 border-jacksons-purple-600 p-8 shadow-[4px_4px_0px_0px_#1a1a1a] text-center">
              <p className="text-jacksons-purple-300">Cargando...</p>
            </div>
          ) : participants.length < 2 ? (
            <div className="bg-jacksons-purple-800 border-4 border-jacksons-purple-600 p-8 shadow-[4px_4px_0px_0px_#1a1a1a] text-center">
              <p className="text-jacksons-purple-300">
                Se necesitan al menos 2 participantes en esta division para
                crear partidos.
              </p>
            </div>
          ) : (
            <div className="bg-jacksons-purple-800 border-4 border-jacksons-purple-600 shadow-[4px_4px_0px_0px_#1a1a1a] overflow-hidden">
              <div className="bg-jacksons-purple-900 border-b-4 border-jacksons-purple-600 px-6 py-3 flex items-center justify-between">
                <h3 className="text-retro-gold-500 font-bold uppercase tracking-wider">
                  Jornada {selectedRound}
                </h3>
                <span className="text-jacksons-purple-300 text-sm">
                  {matchesByRound.length} partido(s)
                </span>
              </div>

              {matchesByRound.length === 0 ? (
                <div className="p-8 text-center text-jacksons-purple-300">
                  No hay partidos en esta jornada.
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-jacksons-purple-900/50 border-b-2 border-jacksons-purple-600">
                      <th className="px-6 py-3 text-left text-sm font-bold text-retro-gold-500 uppercase tracking-wider">
                        Local
                      </th>
                      <th className="px-6 py-3 text-center text-sm font-bold text-retro-gold-500 uppercase tracking-wider">
                        VS
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-bold text-retro-gold-500 uppercase tracking-wider">
                        Visitante
                      </th>
                      <th className="px-6 py-3 text-center text-sm font-bold text-retro-gold-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-right text-sm font-bold text-retro-gold-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {matchesByRound.map((match) => (
                      <tr
                        key={match.id}
                        className="border-b-2 border-jacksons-purple-700 hover:bg-jacksons-purple-700/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {match.home_trainer?.avatar_url ? (
                              <img
                                src={match.home_trainer.avatar_url}
                                alt=""
                                className="w-8 h-8 border-2 border-jacksons-purple-500 object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 bg-jacksons-purple-600 border-2 border-jacksons-purple-500 flex items-center justify-center text-white font-bold text-xs">
                                {match.home_trainer?.nickname?.charAt(0) ?? '?'}
                              </div>
                            )}
                            <span className="text-white font-medium">
                              {match.home_trainer?.nickname ?? 'TBD'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {match.played ? (
                            <span className="text-retro-gold-400 font-bold">
                              {match.home_sets} - {match.away_sets}
                            </span>
                          ) : (
                            <span className="text-jacksons-purple-400 font-bold">
                              VS
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {match.away_trainer?.avatar_url ? (
                              <img
                                src={match.away_trainer.avatar_url}
                                alt=""
                                className="w-8 h-8 border-2 border-jacksons-purple-500 object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 bg-jacksons-purple-600 border-2 border-jacksons-purple-500 flex items-center justify-center text-white font-bold text-xs">
                                {match.away_trainer?.nickname?.charAt(0) ?? '?'}
                              </div>
                            )}
                            <span className="text-white font-medium">
                              {match.away_trainer?.nickname ?? 'TBD'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`px-2 py-1 text-xs font-bold uppercase border-2 ${
                              match.played
                                ? 'bg-green-600 border-green-800 text-white'
                                : 'bg-jacksons-purple-600 border-jacksons-purple-800 text-jacksons-purple-200'
                            }`}
                          >
                            {match.played ? 'Jugado' : 'Pendiente'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenMatchForm(match)}
                              className="px-3 py-2 bg-retro-cyan-500 text-white border-2 border-retro-cyan-700 text-xs font-bold uppercase hover:bg-retro-cyan-400 transition-all"
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteMatch(match.id)}
                              className="px-3 py-2 bg-red-600 text-white border-2 border-red-800 text-xs font-bold uppercase hover:bg-red-500 transition-all"
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
