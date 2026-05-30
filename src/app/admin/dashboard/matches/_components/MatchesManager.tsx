'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  AdminBadge,
  AdminButton,
  AdminCard,
  AdminErrorBanner,
  AdminInput,
  AdminModal,
  AdminSelect,
} from '@/components/admin/ui';
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
import {
  MatchPlanningInputSchema,
  MatchResultInputSchema,
} from '@/lib/types/schemas';
import { cn } from '@/lib/utils';

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

  // Special rounds (J15/J16)
  const [generatingSpecialMatches, setGeneratingSpecialMatches] =
    useState(false);

  // Common state
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  // Helper functions for J15/J16 generation
  const fetchRankingsByLeague = async (leagueId: string) => {
    const { data, error } = await supabase
      .from('league_rankings')
      .select('trainer_id, position, nickname')
      .eq('league_id', leagueId)
      .not('position', 'is', null)
      .order('position', { ascending: true })
      .limit(8);

    if (error) throw error;
    return data ?? [];
  };

  const fetchJ15Matches = async (leagueId: string) => {
    const { data, error } = await supabase
      .from('matches')
      .select(
        'id, match_tag, played, home_trainer_id, away_trainer_id, home_sets, away_sets',
      )
      .eq('league_id', leagueId)
      .eq('round', 15);

    if (error) throw error;
    return data ?? [];
  };

  const getMatchOutcome = (
    match: {
      played: boolean | null;
      home_trainer_id: string | null;
      away_trainer_id: string | null;
      home_sets: number | null;
      away_sets: number | null;
    },
    type: 'winner' | 'loser',
  ): string | null => {
    if (!match.played) return null;
    const homeWins = (match.home_sets || 0) > (match.away_sets || 0);
    if (type === 'winner') {
      return homeWins ? match.home_trainer_id : match.away_trainer_id;
    }
    return homeWins ? match.away_trainer_id : match.home_trainer_id;
  };

  const getLeagueTier = (leagueId: string): 'primera' | 'segunda' => {
    const league = leagues.find((l) => l.id === leagueId);
    return league?.tier_priority === 1 ? 'primera' : 'segunda';
  };

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
  }, [selectedSeasonId, activeTab, selectedSplitId, supabase.from]);

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
  }, [activeSplitInfo?.split.id, selectedSplitId, activeTab, supabase.from]);

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
  }, [resultsLeagueId, selectedLeagueId, activeTab, supabase.from]);

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
  }, [selectedLeagueId, activeTab, supabase.from]);

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

    const parsed = MatchResultInputSchema.safeParse({
      home_sets: resultForm.home_sets,
      away_sets: resultForm.away_sets,
    });
    if (!parsed.success) {
      setError(parsed.error.issues.map((i) => i.message).join(' · '));
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from('matches')
      .update({
        ...parsed.data,
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

    const effectiveTag = matchForm.match_tag || `J${matchForm.round}`;
    const parsed = MatchPlanningInputSchema.safeParse({
      home_trainer_id: matchForm.home_trainer_id,
      away_trainer_id: matchForm.away_trainer_id,
      round: matchForm.round,
      match_group: matchForm.match_group,
      match_tag: effectiveTag,
    });
    if (!parsed.success) {
      setError(parsed.error.issues.map((i) => i.message).join(' · '));
      setSaving(false);
      return;
    }

    if (editingMatch) {
      const { error } = await supabase
        .from('matches')
        .update(parsed.data)
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
        ...parsed.data,
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

  // J15 Generation Handler
  const handleGenerateJ15Matches = async () => {
    if (!selectedLeagueId || !selectedSplitId) return;

    setGeneratingSpecialMatches(true);
    setError(null);

    try {
      const rankings = await fetchRankingsByLeague(selectedLeagueId);

      if (rankings.length < 8) {
        throw new Error(
          'Se necesitan al menos 8 participantes con posición en el ranking.',
        );
      }

      for (let i = 0; i < 8; i++) {
        if (!rankings[i].trainer_id) {
          throw new Error(
            `El participante en posición ${i + 1} no tiene trainer_id válido.`,
          );
        }
      }

      const matchesToCreate = [
        {
          league_id: selectedLeagueId,
          split_id: selectedSplitId,
          round: 15,
          match_group: 'top_4',
          match_tag: 'semi_1',
          home_trainer_id: rankings[0].trainer_id,
          away_trainer_id: rankings[3].trainer_id,
          played: false,
        },
        {
          league_id: selectedLeagueId,
          split_id: selectedSplitId,
          round: 15,
          match_group: 'top_4',
          match_tag: 'semi_2',
          home_trainer_id: rankings[1].trainer_id,
          away_trainer_id: rankings[2].trainer_id,
          played: false,
        },
        {
          league_id: selectedLeagueId,
          split_id: selectedSplitId,
          round: 15,
          match_group: 'bottom_4',
          match_tag: 'survival_1',
          home_trainer_id: rankings[4].trainer_id,
          away_trainer_id: rankings[7].trainer_id,
          played: false,
        },
        {
          league_id: selectedLeagueId,
          split_id: selectedSplitId,
          round: 15,
          match_group: 'bottom_4',
          match_tag: 'survival_2',
          home_trainer_id: rankings[5].trainer_id,
          away_trainer_id: rankings[6].trainer_id,
          played: false,
        },
      ];

      const { error } = await supabase.from('matches').insert(matchesToCreate);
      if (error) throw error;

      await refreshMatches();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error generando J15');
    } finally {
      setGeneratingSpecialMatches(false);
    }
  };

  // J16 Generation Handler
  const handleGenerateJ16Matches = async () => {
    if (!selectedLeagueId || !selectedSplitId) return;

    setGeneratingSpecialMatches(true);
    setError(null);

    try {
      const j15Matches = await fetchJ15Matches(selectedLeagueId);

      if (j15Matches.length !== 4) {
        throw new Error(
          'No se encontraron los 4 partidos de J15 para esta liga.',
        );
      }

      const semi1 = j15Matches.find((m) => m.match_tag === 'semi_1');
      const semi2 = j15Matches.find((m) => m.match_tag === 'semi_2');
      const surv1 = j15Matches.find((m) => m.match_tag === 'survival_1');
      const surv2 = j15Matches.find((m) => m.match_tag === 'survival_2');

      if (!semi1 || !semi2 || !surv1 || !surv2) {
        throw new Error(
          'Faltan partidos de J15 (semi_1, semi_2, survival_1, survival_2)',
        );
      }

      const tier = getLeagueTier(selectedLeagueId);

      const matchesToCreate =
        tier === 'primera'
          ? [
              {
                league_id: selectedLeagueId,
                split_id: selectedSplitId,
                round: 16,
                match_group: 'top_4',
                match_tag: 'grand_final',
                home_trainer_id: getMatchOutcome(semi1, 'winner'),
                away_trainer_id: getMatchOutcome(semi2, 'winner'),
                played: false,
              },
              {
                league_id: selectedLeagueId,
                split_id: selectedSplitId,
                round: 16,
                match_group: 'top_4',
                match_tag: '3rd_place',
                home_trainer_id: getMatchOutcome(semi1, 'loser'),
                away_trainer_id: getMatchOutcome(semi2, 'loser'),
                played: false,
              },
              {
                league_id: selectedLeagueId,
                split_id: selectedSplitId,
                round: 16,
                match_group: 'bottom_4',
                match_tag: 'relegation_battle',
                home_trainer_id: getMatchOutcome(surv1, 'winner'),
                away_trainer_id: getMatchOutcome(surv2, 'winner'),
                played: false,
              },
              {
                league_id: selectedLeagueId,
                split_id: selectedSplitId,
                round: 16,
                match_group: 'bottom_4',
                match_tag: 'honor_battle',
                home_trainer_id: getMatchOutcome(surv1, 'loser'),
                away_trainer_id: getMatchOutcome(surv2, 'loser'),
                played: false,
              },
            ]
          : [
              {
                league_id: selectedLeagueId,
                split_id: selectedSplitId,
                round: 16,
                match_group: 'top_4',
                match_tag: 'segunda_final',
                home_trainer_id: getMatchOutcome(semi1, 'winner'),
                away_trainer_id: getMatchOutcome(semi2, 'winner'),
                played: false,
              },
              {
                league_id: selectedLeagueId,
                split_id: selectedSplitId,
                round: 16,
                match_group: 'top_4',
                match_tag: 'opportunity',
                home_trainer_id: getMatchOutcome(semi1, 'loser'),
                away_trainer_id: getMatchOutcome(semi2, 'loser'),
                played: false,
              },
              {
                league_id: selectedLeagueId,
                split_id: selectedSplitId,
                round: 16,
                match_group: 'bottom_4',
                match_tag: 'last_chance',
                home_trainer_id: getMatchOutcome(surv1, 'winner'),
                away_trainer_id: getMatchOutcome(surv2, 'winner'),
                played: false,
              },
              {
                league_id: selectedLeagueId,
                split_id: selectedSplitId,
                round: 16,
                match_group: 'bottom_4',
                match_tag: 'honor_segunda',
                home_trainer_id: getMatchOutcome(surv1, 'loser'),
                away_trainer_id: getMatchOutcome(surv2, 'loser'),
                played: false,
              },
            ];

      const { error } = await supabase.from('matches').insert(matchesToCreate);
      if (error) throw error;

      await refreshMatches();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error generando J16');
    } finally {
      setGeneratingSpecialMatches(false);
    }
  };

  // Get available trainers for match form
  const getAvailableTrainers = (excludeId?: string) => {
    return participants.filter((p) => p.trainer_id !== excludeId);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <h1 className="font-pixel text-lg uppercase tracking-wider text-px-gold">
        Partidos
      </h1>

      {error && (
        <AdminErrorBanner message={error} onDismiss={() => setError(null)} />
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        <TabButton
          active={activeTab === 'results'}
          onClick={() => setActiveTab('results')}
        >
          Resultados
        </TabButton>
        <TabButton
          active={activeTab === 'planning'}
          onClick={() => setActiveTab('planning')}
        >
          Planificación
        </TabButton>
      </div>

      {activeTab === 'results' ? (
        /* Results Tab */
        <div className="flex flex-col gap-4">
          {/* Active Split + League Selector */}
          <AdminCard className="flex flex-wrap items-center gap-4">
            {activeSplitInfo ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="font-pixel text-[9px] uppercase tracking-wider text-px-ink-dim">
                    Split Activo
                  </span>
                  <AdminBadge tone="gold">
                    {activeSplitInfo.split.name}
                  </AdminBadge>
                </div>

                <SelectorField
                  label="División"
                  value={resultsLeagueId ?? ''}
                  onChange={(v) => setResultsLeagueId(v || null)}
                  disabled={loadingLeagues}
                >
                  <option value="">
                    {loadingLeagues ? 'Cargando...' : 'Seleccionar'}
                  </option>
                  {leagues.map((league) => (
                    <option key={league.id} value={league.id}>
                      {league.tier_name}
                    </option>
                  ))}
                </SelectorField>
              </>
            ) : (
              <p className="font-retro text-base text-px-ink-dim">
                No hay un split activo configurado.
              </p>
            )}
          </AdminCard>

          {/* Matches List */}
          {!resultsLeagueId ? (
            <EmptyPanel text="Selecciona una división para ver los partidos." />
          ) : loadingMatches ? (
            <EmptyPanel text="Cargando partidos..." />
          ) : matches.length === 0 ? (
            <EmptyPanel text="No hay partidos planificados para esta división." />
          ) : (
            <div className="flex flex-col gap-4">
              {availableRounds.map((round) => {
                const roundMatches = matches.filter((m) => m.round === round);
                if (roundMatches.length === 0) return null;

                return (
                  <div
                    key={round}
                    className="border-[3px] border-px-border bg-px-elev shadow-[4px_4px_0_0_var(--color-px-deep)]"
                  >
                    <div className="border-b-[3px] border-px-border bg-px-deep px-6 py-3">
                      <h3 className="font-pixel text-sm uppercase tracking-wider text-px-gold">
                        Jornada {round}
                      </h3>
                    </div>
                    <div>
                      {roundMatches.map((match) => (
                        <ResultRow
                          key={match.id}
                          match={match}
                          isEditing={editingResultId === match.id}
                          resultForm={resultForm}
                          setResultForm={setResultForm}
                          saving={saving}
                          onStartEdit={handleStartEditResult}
                          onCancelEdit={handleCancelEditResult}
                          onSave={handleSaveResult}
                          onClear={handleClearResult}
                        />
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
        <div className="flex flex-col gap-4">
          {/* Selectors */}
          <AdminCard className="flex flex-wrap items-center gap-3">
            <SelectorField
              label="Temporada"
              value={selectedSeasonId ?? ''}
              onChange={(v) => {
                setSelectedSeasonId(v || null);
                setSelectedSplitId(null);
                setSelectedLeagueId(null);
              }}
            >
              <option value="">Seleccionar</option>
              {initialSeasons.map((season) => (
                <option key={season.id} value={season.id}>
                  {season.name} {season.is_active ? '★' : ''}
                </option>
              ))}
            </SelectorField>

            <SelectorField
              label="Split"
              value={selectedSplitId ?? ''}
              onChange={(v) => {
                setSelectedSplitId(v || null);
                setSelectedLeagueId(null);
              }}
              disabled={!selectedSeasonId || loadingSplits}
            >
              <option value="">
                {loadingSplits ? 'Cargando...' : 'Seleccionar'}
              </option>
              {splits.map((split) => (
                <option key={split.id} value={split.id}>
                  {split.name} {split.is_active ? '★' : ''}
                </option>
              ))}
            </SelectorField>

            <SelectorField
              label="División"
              value={selectedLeagueId ?? ''}
              onChange={(v) => setSelectedLeagueId(v || null)}
              disabled={!selectedSplitId || loadingLeagues}
            >
              <option value="">
                {loadingLeagues ? 'Cargando...' : 'Seleccionar'}
              </option>
              {leagues.map((league) => (
                <option key={league.id} value={league.id}>
                  {league.tier_name}
                </option>
              ))}
            </SelectorField>
          </AdminCard>

          {/* Round + actions */}
          {selectedLeagueId && (
            <AdminCard className="flex flex-wrap items-center justify-between gap-3">
              <SelectorField
                label="Jornada"
                value={String(selectedRound)}
                onChange={(v) => setSelectedRound(parseInt(v, 10))}
              >
                {[...Array(20)].map((_, i) => {
                  const round = i + 1;
                  return (
                    <option key={`round-${round}`} value={round}>
                      Jornada {round}
                      {availableRounds.includes(round) ? ' ●' : ''}
                    </option>
                  );
                })}
              </SelectorField>

              <div className="flex flex-wrap items-center gap-2">
                <AdminButton tone="default" disabled>
                  Importar CSV
                </AdminButton>

                {selectedRound === 15 ? (
                  <AdminButton
                    tone="primary"
                    onClick={handleGenerateJ15Matches}
                    disabled={
                      generatingSpecialMatches || matchesByRound.length > 0
                    }
                  >
                    {generatingSpecialMatches
                      ? 'Generando...'
                      : 'Generar Cruces J15'}
                  </AdminButton>
                ) : selectedRound === 16 ? (
                  <AdminButton
                    tone="primary"
                    onClick={handleGenerateJ16Matches}
                    disabled={
                      generatingSpecialMatches || matchesByRound.length > 0
                    }
                  >
                    {generatingSpecialMatches
                      ? 'Generando...'
                      : 'Generar Finales J16'}
                  </AdminButton>
                ) : (
                  <AdminButton
                    tone="primary"
                    onClick={() => handleOpenMatchForm()}
                    disabled={participants.length < 2}
                  >
                    + Nuevo Partido
                  </AdminButton>
                )}
              </div>
            </AdminCard>
          )}

          {/* Match Form Modal */}
          {showMatchForm && (
            <AdminModal
              title={editingMatch ? 'Editar Partido' : 'Nuevo Partido'}
              onClose={handleCloseMatchForm}
            >
              <form onSubmit={handleSaveMatch} className="flex flex-col gap-4">
                <AdminSelect
                  id="home-trainer"
                  label="Entrenador Local *"
                  value={matchForm.home_trainer_id}
                  onChange={(e) =>
                    setMatchForm({
                      ...matchForm,
                      home_trainer_id: e.target.value,
                    })
                  }
                  required
                >
                  <option value="">Seleccionar</option>
                  {getAvailableTrainers(matchForm.away_trainer_id).map((p) => (
                    <option key={p.trainer_id} value={p.trainer_id ?? ''}>
                      {p.trainer?.nickname}
                    </option>
                  ))}
                </AdminSelect>

                <AdminSelect
                  id="away-trainer"
                  label="Entrenador Visitante *"
                  value={matchForm.away_trainer_id}
                  onChange={(e) =>
                    setMatchForm({
                      ...matchForm,
                      away_trainer_id: e.target.value,
                    })
                  }
                  required
                >
                  <option value="">Seleccionar</option>
                  {getAvailableTrainers(matchForm.home_trainer_id).map((p) => (
                    <option key={p.trainer_id} value={p.trainer_id ?? ''}>
                      {p.trainer?.nickname}
                    </option>
                  ))}
                </AdminSelect>

                <div className="grid grid-cols-2 gap-4">
                  <AdminInput
                    id="match-round"
                    label="Jornada *"
                    type="number"
                    min="1"
                    value={matchForm.round}
                    onChange={(e) =>
                      setMatchForm({
                        ...matchForm,
                        round: parseInt(e.target.value, 10) || 1,
                      })
                    }
                    required
                  />
                  <AdminSelect
                    id="match-group"
                    label="Grupo"
                    value={matchForm.match_group}
                    onChange={(e) =>
                      setMatchForm({
                        ...matchForm,
                        match_group: e.target.value,
                      })
                    }
                  >
                    <option value="regular">Regular</option>
                    <option value="playoff">Playoff</option>
                    <option value="final">Final</option>
                  </AdminSelect>
                </div>

                <AdminInput
                  id="match-tag"
                  label="Etiqueta (opcional)"
                  type="text"
                  value={matchForm.match_tag}
                  onChange={(e) =>
                    setMatchForm({ ...matchForm, match_tag: e.target.value })
                  }
                  placeholder={`J${matchForm.round}`}
                />

                <div className="flex gap-3 pt-2">
                  <AdminButton
                    tone="ghost"
                    onClick={handleCloseMatchForm}
                    className="flex-1 justify-center"
                  >
                    Cancelar
                  </AdminButton>
                  <AdminButton
                    type="submit"
                    tone="primary"
                    disabled={saving}
                    className="flex-1 justify-center"
                  >
                    {saving ? 'Guardando...' : 'Guardar'}
                  </AdminButton>
                </div>
              </form>
            </AdminModal>
          )}

          {/* Matches List for Planning */}
          {!selectedLeagueId ? (
            <EmptyPanel text="Selecciona temporada, split y división para planificar partidos." />
          ) : loadingMatches || loadingParticipants ? (
            <EmptyPanel text="Cargando..." />
          ) : participants.length < 2 &&
            selectedRound !== 15 &&
            selectedRound !== 16 ? (
            <EmptyPanel text="Se necesitan al menos 2 participantes en esta división para crear partidos." />
          ) : selectedRound === 15 || selectedRound === 16 ? (
            /* Grouped Display for J15/J16 */
            <div className="flex flex-col gap-6">
              {matchesByRound.length === 0 ? (
                <EmptyPanel
                  text={`No hay partidos en esta jornada. Usa el botón "Generar ${selectedRound === 15 ? 'Cruces J15' : 'Finales J16'}" para crearlos automáticamente.`}
                />
              ) : (
                <>
                  {['top_4', 'bottom_4'].map((group) => {
                    const groupMatches = matchesByRound.filter(
                      (m) => m.match_group === group,
                    );
                    if (groupMatches.length === 0) return null;

                    const groupTitle =
                      group === 'top_4'
                        ? selectedRound === 16
                          ? 'FINALES Y PLAYOFFS'
                          : 'PLAYOFFS · TOP 4'
                        : 'SUPERVIVENCIA · BOTTOM 4';

                    return (
                      <PlanningMatchesTable
                        key={group}
                        title={groupTitle}
                        matches={groupMatches}
                        onEdit={handleOpenMatchForm}
                        onDelete={handleDeleteMatch}
                      />
                    );
                  })}

                  {selectedRound === 16 && (
                    <div className="border-2 border-px-gold/40 bg-px-deep p-4">
                      <p className="mb-2 font-pixel text-[9px] uppercase tracking-wider text-px-gold">
                        Próximo Evento
                      </p>
                      <p className="font-retro text-base text-px-ink-soft">
                        <span className="font-bold text-px-gold">
                          El Olimpo:
                        </span>{' '}
                        Perdedor [Lucha por Permanencia] vs Ganador [La
                        Oportunidad]
                      </p>
                      <p className="mt-1 font-retro text-sm text-px-ink-dim">
                        Este combate determina el ascenso/descenso entre Primera
                        y Segunda División.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="border-[3px] border-px-border bg-px-elev shadow-[4px_4px_0_0_var(--color-px-deep)]">
              <div className="flex items-center justify-between border-b-[3px] border-px-border bg-px-deep px-6 py-3">
                <h3 className="font-pixel text-sm uppercase tracking-wider text-px-gold">
                  Jornada {selectedRound}
                </h3>
                <span className="font-retro text-base text-px-ink-dim">
                  {matchesByRound.length} partido(s)
                </span>
              </div>
              {matchesByRound.length === 0 ? (
                <p className="p-8 text-center font-retro text-lg text-px-ink-dim">
                  No hay partidos en esta jornada.
                </p>
              ) : (
                <MatchesTable
                  matches={matchesByRound}
                  onEdit={handleOpenMatchForm}
                  onDelete={handleDeleteMatch}
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- Internal helpers ---------- */

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center border-[3px] px-5 py-3 font-pixel text-[10px] uppercase tracking-wider transition-colors',
        active
          ? 'border-px-gold bg-px-gold text-px-deep'
          : 'border-px-border bg-px-elev text-px-ink-soft hover:border-px-border-hi',
      )}
    >
      {children}
    </button>
  );
}

function SelectorField({
  label,
  value,
  onChange,
  disabled = false,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-pixel text-[9px] uppercase tracking-wider text-px-ink-dim">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="pixel-input w-auto cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
      >
        {children}
      </select>
    </div>
  );
}

function TrainerAvatar({
  url,
  nickname,
}: {
  url: string | null | undefined;
  nickname: string | undefined;
}) {
  if (url) {
    return (
      <img
        src={url}
        alt=""
        className="size-8 border-2 border-px-border object-cover"
      />
    );
  }
  return (
    <div className="grid size-8 place-items-center border-2 border-px-border bg-px-deep font-pixel text-xs text-px-ink">
      {(nickname ?? '?').charAt(0).toUpperCase()}
    </div>
  );
}

function EmptyPanel({ text }: { text: string }) {
  return (
    <div className="border-[3px] border-px-border bg-px-elev p-8 text-center shadow-[4px_4px_0_0_var(--color-px-deep)]">
      <p className="font-retro text-lg text-px-ink-dim">{text}</p>
    </div>
  );
}

function ResultRow({
  match,
  isEditing,
  resultForm,
  setResultForm,
  saving,
  onStartEdit,
  onCancelEdit,
  onSave,
  onClear,
}: {
  match: MatchWithTrainers;
  isEditing: boolean;
  resultForm: { home_sets: number; away_sets: number };
  setResultForm: (form: { home_sets: number; away_sets: number }) => void;
  saving: boolean;
  onStartEdit: (match: MatchWithTrainers) => void;
  onCancelEdit: () => void;
  onSave: (id: string) => void;
  onClear: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-px-border/40 px-6 py-4 last:border-b-0 hover:bg-px-base">
      <div className="flex flex-1 flex-wrap items-center gap-4">
        {/* Home Trainer (right-aligned) */}
        <div className="flex flex-1 items-center justify-end gap-2">
          <span className="text-right font-retro text-base text-px-ink">
            {match.home_trainer?.nickname ?? 'TBD'}
          </span>
          <TrainerAvatar
            url={match.home_trainer?.avatar_url}
            nickname={match.home_trainer?.nickname}
          />
        </div>

        {/* Score / Edit */}
        {isEditing ? (
          <div className="flex items-center gap-2 px-4">
            <input
              type="number"
              min="0"
              max="3"
              value={resultForm.home_sets}
              onChange={(e) =>
                setResultForm({
                  ...resultForm,
                  home_sets: parseInt(e.target.value, 10) || 0,
                })
              }
              className="pixel-input w-14 text-center font-num"
            />
            <span className="font-pixel text-xs text-px-ink-dim">-</span>
            <input
              type="number"
              min="0"
              max="3"
              value={resultForm.away_sets}
              onChange={(e) =>
                setResultForm({
                  ...resultForm,
                  away_sets: parseInt(e.target.value, 10) || 0,
                })
              }
              className="pixel-input w-14 text-center font-num"
            />
          </div>
        ) : (
          <div className="flex min-w-[80px] items-center justify-center px-4">
            {match.played ? (
              <span className="font-num text-lg font-bold text-px-gold">
                {match.home_sets} - {match.away_sets}
              </span>
            ) : (
              <span className="font-pixel text-[10px] uppercase text-px-ink-dim">
                VS
              </span>
            )}
          </div>
        )}

        {/* Away Trainer */}
        <div className="flex flex-1 items-center gap-2">
          <TrainerAvatar
            url={match.away_trainer?.avatar_url}
            nickname={match.away_trainer?.nickname}
          />
          <span className="font-retro text-base text-px-ink">
            {match.away_trainer?.nickname ?? 'TBD'}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {isEditing ? (
          <>
            <AdminButton tone="ghost" size="sm" onClick={onCancelEdit}>
              Cancelar
            </AdminButton>
            <AdminButton
              tone="success"
              size="sm"
              onClick={() => onSave(match.id)}
              disabled={saving}
            >
              {saving ? '...' : 'Guardar'}
            </AdminButton>
          </>
        ) : (
          <>
            <AdminButton
              tone="cyan"
              size="sm"
              onClick={() => onStartEdit(match)}
            >
              {match.played ? 'Editar' : 'Resultado'}
            </AdminButton>
            {match.played && (
              <AdminButton
                tone="default"
                size="sm"
                onClick={() => onClear(match.id)}
              >
                Limpiar
              </AdminButton>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function MatchesTable({
  matches,
  onEdit,
  onDelete,
}: {
  matches: MatchWithTrainers[];
  onEdit: (match: MatchWithTrainers) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <table className="pixel-table">
      <thead>
        <tr>
          <th>Local</th>
          <th className="text-center">VS</th>
          <th>Visitante</th>
          <th className="text-center">Estado</th>
          <th className="text-right">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {matches.map((match) => (
          <tr key={match.id}>
            <td>
              <div className="flex items-center gap-2">
                <TrainerAvatar
                  url={match.home_trainer?.avatar_url}
                  nickname={match.home_trainer?.nickname}
                />
                <span className="text-px-ink">
                  {match.home_trainer?.nickname ?? 'TBD'}
                </span>
              </div>
            </td>
            <td className="text-center">
              {match.played ? (
                <span className="font-num font-bold text-px-gold">
                  {match.home_sets} - {match.away_sets}
                </span>
              ) : (
                <span className="font-pixel text-[10px] text-px-ink-dim">
                  VS
                </span>
              )}
            </td>
            <td>
              <div className="flex items-center gap-2">
                <TrainerAvatar
                  url={match.away_trainer?.avatar_url}
                  nickname={match.away_trainer?.nickname}
                />
                <span className="text-px-ink">
                  {match.away_trainer?.nickname ?? 'TBD'}
                </span>
              </div>
            </td>
            <td className="text-center">
              <AdminBadge tone={match.played ? 'success' : 'neutral'}>
                {match.played ? 'Jugado' : 'Pendiente'}
              </AdminBadge>
            </td>
            <td>
              <div className="flex items-center justify-end gap-2">
                <AdminButton
                  tone="cyan"
                  size="sm"
                  onClick={() => onEdit(match)}
                >
                  Editar
                </AdminButton>
                <AdminButton
                  tone="danger"
                  size="sm"
                  onClick={() => onDelete(match.id)}
                >
                  Eliminar
                </AdminButton>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function PlanningMatchesTable({
  title,
  matches,
  onEdit,
  onDelete,
}: {
  title: string;
  matches: MatchWithTrainers[];
  onEdit: (match: MatchWithTrainers) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="border-[3px] border-px-border bg-px-elev shadow-[4px_4px_0_0_var(--color-px-deep)]">
      <div className="border-b-[3px] border-px-border bg-px-deep px-6 py-3">
        <h4 className="font-pixel text-sm uppercase tracking-wider text-px-gold">
          {title}
        </h4>
      </div>
      <MatchesTable matches={matches} onEdit={onEdit} onDelete={onDelete} />
    </div>
  );
}
