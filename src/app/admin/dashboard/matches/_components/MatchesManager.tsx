'use client';

import {
  startTransition,
  useEffect,
  useMemo,
  useOptimistic,
  useState,
} from 'react';
import {
  AdminBadge,
  AdminButton,
  AdminCard,
  AdminConfirmModal,
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
import {
  clearMatchResultAction,
  createMatchAction,
  deleteMatchAction,
  generateJ15MatchesAction,
  generateJ16MatchesAction,
  saveMatchResultAction,
  updateMatchAction,
} from '../_actions';

type ParticipantWithTrainer = LeagueParticipant & { trainer: Trainer };
type MatchWithTrainers = Match & {
  home_trainer: Trainer | null;
  away_trainer: Trainer | null;
};

type PendingMatchConfirm =
  | { kind: 'clear-result'; matchId: string }
  | { kind: 'delete-match'; matchId: string }
  | null;

type MatchOptimistic =
  | { type: 'result'; id: string; homeSets: number; awaySets: number }
  | { type: 'clear'; id: string }
  | { type: 'create'; match: MatchWithTrainers }
  | { type: 'update'; match: MatchWithTrainers }
  | { type: 'delete'; id: string }
  | { type: 'bulk-insert'; matches: MatchWithTrainers[] };

function matchesReducer(
  state: MatchWithTrainers[],
  action: MatchOptimistic,
): MatchWithTrainers[] {
  switch (action.type) {
    case 'result':
      return state.map((m) =>
        m.id === action.id
          ? {
              ...m,
              home_sets: action.homeSets,
              away_sets: action.awaySets,
              played: true,
            }
          : m,
      );
    case 'clear':
      return state.map((m) =>
        m.id === action.id
          ? { ...m, home_sets: null, away_sets: null, played: false }
          : m,
      );
    case 'create':
      return [...state, action.match];
    case 'update':
      return state.map((m) => (m.id === action.match.id ? action.match : m));
    case 'delete':
      return state.filter((m) => m.id !== action.id);
    case 'bulk-insert':
      return [...state, ...action.matches];
    default:
      return state;
  }
}

interface MatchesManagerProps {
  initialSeasons: Season[];
  activeSplitInfo: ActiveSplitInfo | null;
}

export default function MatchesManager({
  initialSeasons,
  activeSplitInfo,
}: MatchesManagerProps) {
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
  const [optimisticMatches, applyMatchOptimistic] = useOptimistic(
    matches,
    matchesReducer,
  );

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
  const [pendingConfirm, setPendingConfirm] =
    useState<PendingMatchConfirm>(null);

  // Browser-side READ client (no writes — all mutations flow through Server
  // Actions in `../_actions.ts`). Kept for the four read effects below
  // (splits, leagues, matches, participants) and the post-mutation
  // `refreshMatches` reconciliation.
  const supabase = createClient();

  // Get unique rounds from matches
  const availableRounds = useMemo(() => {
    const rounds = [...new Set(optimisticMatches.map((m) => m.round))].sort(
      (a, b) => a - b,
    );
    return rounds.length > 0 ? rounds : [1];
  }, [optimisticMatches]);

  // Filter matches by round for planning tab
  const matchesByRound = useMemo(() => {
    return optimisticMatches.filter((m) => m.round === selectedRound);
  }, [optimisticMatches, selectedRound]);

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

  // Derive the (splitId, leagueId) pair to pass to Server Actions based on
  // the active tab. Results tab uses `activeSplitInfo` + `resultsLeagueId`;
  // planning tab uses the manual selection state.
  const getActionCtx = (): { splitId: string; leagueId: string } | null => {
    if (activeTab === 'results') {
      const splitId = activeSplitInfo?.split.id;
      if (!splitId || !resultsLeagueId) return null;
      return { splitId, leagueId: resultsLeagueId };
    }
    if (!selectedSplitId || !selectedLeagueId) return null;
    return { splitId: selectedSplitId, leagueId: selectedLeagueId };
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
    const ctx = getActionCtx();
    if (!ctx) {
      setError('Selecciona split y división primero.');
      setSaving(false);
      return;
    }

    startTransition(async () => {
      applyMatchOptimistic({
        type: 'result',
        id: matchId,
        homeSets: parsed.data.home_sets,
        awaySets: parsed.data.away_sets,
      });
      const result = await saveMatchResultAction(matchId, parsed.data, ctx);
      if (!result.ok) {
        setError(result.error);
      } else {
        setEditingResultId(null);
        await refreshMatches();
      }
      setSaving(false);
    });
  };

  const requestClearResult = (matchId: string) => {
    setPendingConfirm({ kind: 'clear-result', matchId });
  };

  const runClearResult = (matchId: string) => {
    const ctx = getActionCtx();
    if (!ctx) {
      setError('Selecciona split y división primero.');
      return;
    }
    setSaving(true);
    startTransition(async () => {
      applyMatchOptimistic({ type: 'clear', id: matchId });
      const result = await clearMatchResultAction(matchId, ctx);
      if (!result.ok) {
        setError(result.error);
      } else {
        await refreshMatches();
      }
      setSaving(false);
    });
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

    const homeTrainer =
      participants.find((p) => p.trainer_id === parsed.data.home_trainer_id)
        ?.trainer ?? null;
    const awayTrainer =
      participants.find((p) => p.trainer_id === parsed.data.away_trainer_id)
        ?.trainer ?? null;

    if (editingMatch) {
      const optimistic: MatchWithTrainers = {
        ...editingMatch,
        ...parsed.data,
        home_trainer: homeTrainer,
        away_trainer: awayTrainer,
      };
      startTransition(async () => {
        applyMatchOptimistic({ type: 'update', match: optimistic });
        const result = await updateMatchAction(editingMatch.id, parsed.data, {
          splitId: selectedSplitId,
          leagueId: selectedLeagueId,
        });
        if (!result.ok) {
          setError(result.error);
        } else {
          handleCloseMatchForm();
          await refreshMatches();
        }
        setSaving(false);
      });
    } else {
      const tempMatch: MatchWithTrainers = {
        id: `optimistic-${crypto.randomUUID()}`,
        league_id: selectedLeagueId,
        split_id: selectedSplitId,
        ...parsed.data,
        home_sets: null,
        away_sets: null,
        played: false,
        metadata: null,
        created_at: new Date().toISOString(),
        home_trainer: homeTrainer,
        away_trainer: awayTrainer,
      };
      startTransition(async () => {
        applyMatchOptimistic({ type: 'create', match: tempMatch });
        const result = await createMatchAction({
          leagueId: selectedLeagueId,
          splitId: selectedSplitId,
          input: parsed.data,
        });
        if (!result.ok) {
          setError(result.error);
        } else {
          handleCloseMatchForm();
          await refreshMatches();
        }
        setSaving(false);
      });
    }
  };

  const requestDeleteMatch = (matchId: string) => {
    setPendingConfirm({ kind: 'delete-match', matchId });
  };

  const runDeleteMatch = (matchId: string) => {
    const ctx = getActionCtx();
    if (!ctx) {
      setError('Selecciona split y división primero.');
      return;
    }
    setSaving(true);
    startTransition(async () => {
      applyMatchOptimistic({ type: 'delete', id: matchId });
      const result = await deleteMatchAction(matchId, ctx);
      if (!result.ok) {
        setError(result.error);
      } else {
        await refreshMatches();
      }
      setSaving(false);
    });
  };

  const cancelConfirm = () => setPendingConfirm(null);

  const confirmPending = () => {
    if (!pendingConfirm) return;
    const current = pendingConfirm;
    setPendingConfirm(null);

    if (current.kind === 'clear-result') {
      runClearResult(current.matchId);
    } else {
      runDeleteMatch(current.matchId);
    }
  };

  const confirmProps =
    pendingConfirm?.kind === 'clear-result'
      ? {
          title: 'Limpiar resultado',
          message: '¿Limpiar el resultado de este partido?',
        }
      : pendingConfirm?.kind === 'delete-match'
        ? {
            title: 'Eliminar partido',
            message: '¿Eliminar este partido?',
          }
        : { title: '', message: '' };

  // J15 Generation Handler — ports the existing button-driven bulk insert
  // verbatim to a Server Action. F6c (auto-cascade on J14 completion) is
  // explicitly out of scope per REQ-78.
  const handleGenerateJ15Matches = () => {
    if (!selectedLeagueId || !selectedSplitId) return;

    setGeneratingSpecialMatches(true);
    setError(null);

    const leagueId = selectedLeagueId;
    const splitId = selectedSplitId;

    startTransition(async () => {
      const result = await generateJ15MatchesAction(leagueId, splitId);
      if (!result.ok) {
        setError(result.error);
      } else {
        await refreshMatches();
      }
      setGeneratingSpecialMatches(false);
    });
  };

  // J16 Generation Handler — server action looks up `tier_priority` and J15
  // rows itself; the client only passes (leagueId, splitId).
  const handleGenerateJ16Matches = () => {
    if (!selectedLeagueId || !selectedSplitId) return;

    setGeneratingSpecialMatches(true);
    setError(null);

    const leagueId = selectedLeagueId;
    const splitId = selectedSplitId;

    startTransition(async () => {
      const result = await generateJ16MatchesAction(leagueId, splitId);
      if (!result.ok) {
        setError(result.error);
      } else {
        await refreshMatches();
      }
      setGeneratingSpecialMatches(false);
    });
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
          ) : optimisticMatches.length === 0 ? (
            <EmptyPanel text="No hay partidos planificados para esta división." />
          ) : (
            <div className="flex flex-col gap-4">
              {availableRounds.map((round) => {
                const roundMatches = optimisticMatches.filter(
                  (m) => m.round === round,
                );
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
                          onClear={requestClearResult}
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
                        onDelete={requestDeleteMatch}
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
                  onDelete={requestDeleteMatch}
                />
              )}
            </div>
          )}
        </div>
      )}

      <AdminConfirmModal
        open={pendingConfirm !== null}
        title={confirmProps.title}
        message={confirmProps.message}
        variant="danger"
        onConfirm={confirmPending}
        onCancel={cancelConfirm}
      />
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
