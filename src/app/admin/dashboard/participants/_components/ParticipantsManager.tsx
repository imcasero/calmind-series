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
  AdminTextarea,
} from '@/components/admin/ui';
import { useLeagueSelector } from '@/lib/hooks/useLeagueSelector';
import { createClient } from '@/lib/supabase/client';
import type {
  LeagueParticipant,
  Season,
  Trainer,
} from '@/lib/types/database.types';
import { TrainerInputSchema } from '@/lib/types/schemas';
import { cn } from '@/lib/utils';
import {
  assignParticipantAction,
  createTrainerAction,
  deleteTrainerAction,
  removeParticipantAction,
  updateParticipantLivesAction,
  updateTrainerAction,
} from '../_actions';

type ParticipantWithTrainer = LeagueParticipant & { trainer: Trainer };

type PendingConfirm =
  | { kind: 'delete-trainer'; trainerId: string }
  | { kind: 'remove-from-league'; participantId: string }
  | null;

type TrainerOptimistic =
  | { type: 'create'; trainer: Trainer }
  | { type: 'update'; trainer: Trainer }
  | { type: 'delete'; id: string };

type ParticipantOptimistic =
  | { type: 'assign'; participant: ParticipantWithTrainer }
  | { type: 'remove'; id: string }
  | { type: 'lives'; changes: Array<{ id: string; lives: number }> };

interface ParticipantsManagerProps {
  initialSeasons: Season[];
  initialTrainers: Trainer[];
}

const ITEMS_PER_PAGE = 10;

function trainersReducer(
  state: Trainer[],
  action: TrainerOptimistic,
): Trainer[] {
  switch (action.type) {
    case 'create':
      return [...state, action.trainer].sort((a, b) =>
        a.nickname.localeCompare(b.nickname),
      );
    case 'update':
      return state.map((t) =>
        t.id === action.trainer.id ? action.trainer : t,
      );
    case 'delete':
      return state.filter((t) => t.id !== action.id);
    default:
      return state;
  }
}

function participantsReducer(
  state: ParticipantWithTrainer[],
  action: ParticipantOptimistic,
): ParticipantWithTrainer[] {
  switch (action.type) {
    case 'assign':
      return [...state, action.participant].sort(
        (a, b) => (a.initial_seed ?? 0) - (b.initial_seed ?? 0),
      );
    case 'remove':
      return state.filter((p) => p.id !== action.id);
    case 'lives': {
      const map = new Map(action.changes.map((c) => [c.id, c.lives]));
      return state.map((p) =>
        map.has(p.id) ? { ...p, lives: map.get(p.id) ?? p.lives } : p,
      );
    }
    default:
      return state;
  }
}

export default function ParticipantsManager({
  initialSeasons,
  initialTrainers,
}: ParticipantsManagerProps) {
  // Tab state
  const [activeTab, setActiveTab] = useState<'trainers' | 'assignments'>(
    'trainers',
  );

  // Trainers state — base state is the server-provided list, mutated through
  // useOptimistic. After actions resolve we re-fetch via the browser client
  // (READ only — see DivisionsManager / SeasonsManager pilot for the same
  // pattern).
  const [trainers, setTrainers] = useState<Trainer[]>(initialTrainers);
  const [optimisticTrainers, applyTrainerOptimistic] = useOptimistic(
    trainers,
    trainersReducer,
  );
  const [showTrainerForm, setShowTrainerForm] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null);
  const [trainerForm, setTrainerForm] = useState({
    nickname: '',
    avatar_url: '',
    bio: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Assignment cascade (Season → Split → League) via shared hook
  const {
    splits,
    leagues,
    selectedSeasonId,
    selectedSplitId,
    selectedLeagueId,
    setSeasonId,
    setSplitId,
    setLeagueId,
    loadingSplits,
    loadingLeagues,
    error: selectorError,
    clearError: clearSelectorError,
  } = useLeagueSelector({ initialSeasons, depth: 'season-split-league' });

  // Assignment state
  const [participants, setParticipants] = useState<ParticipantWithTrainer[]>(
    [],
  );
  const [optimisticParticipants, applyParticipantOptimistic] = useOptimistic(
    participants,
    participantsReducer,
  );
  const [pendingLivesChanges, setPendingLivesChanges] = useState<
    Record<string, number>
  >({});
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [selectedTrainerId, setSelectedTrainerId] = useState<string>('');

  // Common state
  const [localError, setLocalError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm>(null);

  // Browser-side READ client (no writes — all mutations go through Server
  // Actions in `../_actions.ts`). Kept so the trainer list and the
  // per-league participants can hot-refresh after a mutation without
  // forcing a full router round-trip.
  const supabase = createClient();

  const error = localError ?? selectorError;
  const setError = (value: string | null) => {
    setLocalError(value);
    if (value === null) clearSelectorError();
  };

  // Auto-select first league when leagues finish loading (preserves prior UX).
  useEffect(() => {
    if (leagues.length > 0 && !selectedLeagueId) {
      setLeagueId(leagues[0].id);
    }
  }, [leagues, selectedLeagueId, setLeagueId]);

  // Filtered and paginated trainers
  const filteredTrainers = useMemo(() => {
    if (!searchQuery.trim()) return optimisticTrainers;
    const query = searchQuery.toLowerCase();
    return optimisticTrainers.filter(
      (t) =>
        t.nickname.toLowerCase().includes(query) ||
        (t.bio?.toLowerCase().includes(query) ?? false),
    );
  }, [optimisticTrainers, searchQuery]);

  const totalPages = Math.ceil(filteredTrainers.length / ITEMS_PER_PAGE);
  const paginatedTrainers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTrainers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredTrainers, currentPage]);

  // Check for pending lives changes
  const hasLivesChanges = Object.keys(pendingLivesChanges).length > 0;

  // Get current lives for a participant (pending or original)
  const getCurrentLives = (participant: ParticipantWithTrainer) => {
    if (pendingLivesChanges[participant.id] !== undefined) {
      return pendingLivesChanges[participant.id];
    }
    return participant.lives ?? 0;
  };

  // Browser-side READ: refresh trainers list after a mutation.
  const refreshTrainers = async () => {
    const { data } = await supabase
      .from('trainers')
      .select('*')
      .order('nickname', { ascending: true });
    if (data) {
      setTrainers(data);
    }
  };

  // Fetch participants when league changes
  useEffect(() => {
    if (!selectedLeagueId) {
      setParticipants([]);
      setPendingLivesChanges({});
      return;
    }

    const fetchParticipants = async () => {
      setLoadingParticipants(true);
      setPendingLivesChanges({});

      const { data, error } = await supabase
        .from('league_participants')
        .select('*, trainer:trainers(*)')
        .eq('league_id', selectedLeagueId)
        .order('initial_seed', { ascending: true });

      if (error) {
        setLocalError(error.message);
      } else {
        setParticipants((data ?? []) as ParticipantWithTrainer[]);
      }
      setLoadingParticipants(false);
    };

    fetchParticipants();
  }, [selectedLeagueId, supabase]);

  // Browser-side READ: refresh participants after a mutation.
  const refreshParticipants = async () => {
    if (!selectedLeagueId) return;

    const { data } = await supabase
      .from('league_participants')
      .select('*, trainer:trainers(*)')
      .eq('league_id', selectedLeagueId)
      .order('initial_seed', { ascending: true });

    if (data) {
      setParticipants(data as ParticipantWithTrainer[]);
      setPendingLivesChanges({});
    }
  };

  // Trainer handlers
  const handleSaveTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const parsed = TrainerInputSchema.safeParse({
      nickname: trainerForm.nickname,
      avatar_url: trainerForm.avatar_url,
      bio: trainerForm.bio,
    });
    if (!parsed.success) {
      setError(parsed.error.issues.map((i) => i.message).join(' · '));
      setSaving(false);
      return;
    }

    if (editingTrainer) {
      const optimistic: Trainer = { ...editingTrainer, ...parsed.data };
      startTransition(async () => {
        applyTrainerOptimistic({ type: 'update', trainer: optimistic });
        const result = await updateTrainerAction(
          editingTrainer.id,
          parsed.data,
        );
        if (!result.ok) {
          setError(result.error);
        } else {
          setEditingTrainer(null);
          setShowTrainerForm(false);
          setTrainerForm({ nickname: '', avatar_url: '', bio: '' });
          await refreshTrainers();
        }
        setSaving(false);
      });
    } else {
      const tempTrainer: Trainer = {
        id: `optimistic-${crypto.randomUUID()}`,
        nickname: parsed.data.nickname,
        avatar_url: parsed.data.avatar_url,
        bio: parsed.data.bio,
        created_at: new Date().toISOString(),
      };
      startTransition(async () => {
        applyTrainerOptimistic({ type: 'create', trainer: tempTrainer });
        const result = await createTrainerAction(parsed.data);
        if (!result.ok) {
          setError(result.error);
        } else {
          setShowTrainerForm(false);
          setTrainerForm({ nickname: '', avatar_url: '', bio: '' });
          await refreshTrainers();
        }
        setSaving(false);
      });
    }
  };

  const handleEditTrainer = (trainer: Trainer) => {
    setEditingTrainer(trainer);
    setTrainerForm({
      nickname: trainer.nickname,
      avatar_url: trainer.avatar_url ?? '',
      bio: trainer.bio ?? '',
    });
    setShowTrainerForm(true);
  };

  const requestDeleteTrainer = (trainerId: string) => {
    setPendingConfirm({ kind: 'delete-trainer', trainerId });
  };

  const runDeleteTrainer = (id: string) => {
    startTransition(async () => {
      applyTrainerOptimistic({ type: 'delete', id });
      const result = await deleteTrainerAction(id);
      if (!result.ok) {
        setError(result.error);
      } else {
        await refreshTrainers();
      }
    });
  };

  // Assignment handlers
  const handleAssignTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeagueId || !selectedTrainerId || !selectedSplitId) return;

    setSaving(true);
    setError(null);

    const trainer = trainers.find((t) => t.id === selectedTrainerId);
    if (!trainer) {
      setError('Entrenador no encontrado');
      setSaving(false);
      return;
    }

    const initialSeed = participants.length + 1;
    const lives = 20;
    const tempParticipant: ParticipantWithTrainer = {
      id: `optimistic-${crypto.randomUUID()}`,
      league_id: selectedLeagueId,
      trainer_id: selectedTrainerId,
      initial_seed: initialSeed,
      status: 'active',
      lives,
      trainer,
    };

    startTransition(async () => {
      applyParticipantOptimistic({
        type: 'assign',
        participant: tempParticipant,
      });
      const result = await assignParticipantAction({
        leagueId: selectedLeagueId,
        trainerId: selectedTrainerId,
        splitId: selectedSplitId,
        initialSeed,
        lives,
      });
      if (!result.ok) {
        setError(result.error);
      } else {
        setSelectedTrainerId('');
        setShowAssignForm(false);
        await refreshParticipants();
      }
      setSaving(false);
    });
  };

  const requestRemoveFromLeague = (participantId: string) => {
    setPendingConfirm({ kind: 'remove-from-league', participantId });
  };

  const runRemoveFromLeague = (participantId: string) => {
    if (!selectedSplitId || !selectedLeagueId) return;
    const splitId = selectedSplitId;
    const leagueId = selectedLeagueId;
    startTransition(async () => {
      applyParticipantOptimistic({ type: 'remove', id: participantId });
      const result = await removeParticipantAction(participantId, {
        splitId,
        leagueId,
      });
      if (!result.ok) {
        setError(result.error);
      } else {
        const newPending = { ...pendingLivesChanges };
        delete newPending[participantId];
        setPendingLivesChanges(newPending);
        await refreshParticipants();
      }
    });
  };

  const cancelConfirm = () => setPendingConfirm(null);

  const confirmPending = () => {
    if (!pendingConfirm) return;
    const current = pendingConfirm;
    setPendingConfirm(null);

    if (current.kind === 'delete-trainer') {
      runDeleteTrainer(current.trainerId);
    } else {
      runRemoveFromLeague(current.participantId);
    }
  };

  const confirmProps =
    pendingConfirm?.kind === 'delete-trainer'
      ? {
          title: 'Eliminar entrenador',
          message:
            '¿Estas seguro de eliminar este entrenador? Se eliminara de todas las divisiones.',
        }
      : pendingConfirm?.kind === 'remove-from-league'
        ? {
            title: 'Quitar de la división',
            message: '¿Quitar este entrenador de la division?',
          }
        : { title: '', message: '' };

  // Pending lives changes (local only)
  const handleLocalLivesChange = (
    participantId: string,
    currentLives: number,
    delta: number,
  ) => {
    const newLives = Math.max(0, currentLives + delta);
    setPendingLivesChanges((prev) => ({
      ...prev,
      [participantId]: newLives,
    }));
  };

  // Save all pending lives changes
  const handleSaveLivesChanges = async () => {
    if (!hasLivesChanges || !selectedSplitId || !selectedLeagueId) return;

    setSaving(true);
    setError(null);

    const changes = Object.entries(pendingLivesChanges).map(([id, lives]) => ({
      id,
      lives,
    }));
    const splitId = selectedSplitId;
    const leagueId = selectedLeagueId;

    startTransition(async () => {
      applyParticipantOptimistic({ type: 'lives', changes });
      const result = await updateParticipantLivesAction(changes, {
        splitId,
        leagueId,
      });
      if (!result.ok) {
        setError(result.error);
      } else {
        await refreshParticipants();
      }
      setSaving(false);
    });
  };

  // Discard pending changes
  const handleDiscardLivesChanges = () => {
    setPendingLivesChanges({});
  };

  // Get trainers not already in selected league
  const availableTrainers = optimisticTrainers.filter(
    (t) => !optimisticParticipants.some((p) => p.trainer_id === t.id),
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <h1 className="font-pixel text-lg uppercase tracking-wider text-px-gold">
        Participantes
      </h1>

      {error && (
        <AdminErrorBanner message={error} onDismiss={() => setError(null)} />
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        <TabButton
          active={activeTab === 'trainers'}
          onClick={() => setActiveTab('trainers')}
        >
          Entrenadores
        </TabButton>
        <TabButton
          active={activeTab === 'assignments'}
          onClick={() => setActiveTab('assignments')}
        >
          Asignación a Divisiones
          {hasLivesChanges && (
            <span className="ml-2 grid size-4 place-items-center border border-px-deep bg-px-danger text-[8px] text-px-ink">
              !
            </span>
          )}
        </TabButton>
      </div>

      {activeTab === 'trainers' ? (
        /* Trainers Tab */
        <div className="flex flex-col gap-4">
          {/* Actions Bar */}
          <AdminCard className="flex flex-wrap items-center justify-between gap-4">
            <input
              type="text"
              aria-label="Buscar"
              placeholder="Buscar por nickname o bio..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pixel-input min-w-[250px]"
            />
            <AdminButton
              tone="primary"
              onClick={() => {
                setEditingTrainer(null);
                setTrainerForm({ nickname: '', avatar_url: '', bio: '' });
                setShowTrainerForm(true);
              }}
            >
              + Nuevo Entrenador
            </AdminButton>
          </AdminCard>

          {/* Trainer Form Modal */}
          {showTrainerForm && (
            <AdminModal
              title={editingTrainer ? 'Editar Entrenador' : 'Nuevo Entrenador'}
              onClose={() => {
                setShowTrainerForm(false);
                setEditingTrainer(null);
                setTrainerForm({ nickname: '', avatar_url: '', bio: '' });
              }}
            >
              <form
                onSubmit={handleSaveTrainer}
                className="flex flex-col gap-4"
              >
                <AdminInput
                  id="nickname"
                  label="Nickname *"
                  type="text"
                  value={trainerForm.nickname}
                  onChange={(e) =>
                    setTrainerForm({ ...trainerForm, nickname: e.target.value })
                  }
                  required
                  placeholder="Ej: AshKetchum"
                />
                <AdminInput
                  id="avatar_url"
                  label="Avatar URL"
                  type="text"
                  value={trainerForm.avatar_url}
                  onChange={(e) =>
                    setTrainerForm({
                      ...trainerForm,
                      avatar_url: e.target.value,
                    })
                  }
                  placeholder="https://..."
                />
                <AdminTextarea
                  id="bio"
                  label="Bio"
                  value={trainerForm.bio}
                  onChange={(e) =>
                    setTrainerForm({ ...trainerForm, bio: e.target.value })
                  }
                  placeholder="Descripción del entrenador..."
                  rows={3}
                  className="resize-none"
                />
                <div className="flex gap-3 pt-2">
                  <AdminButton
                    tone="ghost"
                    onClick={() => {
                      setShowTrainerForm(false);
                      setEditingTrainer(null);
                      setTrainerForm({ nickname: '', avatar_url: '', bio: '' });
                    }}
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

          {/* Trainers Table */}
          <div className="border-[3px] border-px-border bg-px-elev shadow-[4px_4px_0_0_var(--color-px-deep)]">
            {filteredTrainers.length === 0 ? (
              <p className="p-8 text-center font-retro text-lg text-px-ink-dim">
                {searchQuery
                  ? 'No se encontraron entrenadores.'
                  : 'No hay entrenadores registrados.'}
              </p>
            ) : (
              <>
                <table className="pixel-table">
                  <thead>
                    <tr>
                      <th>Avatar</th>
                      <th>Nickname</th>
                      <th>Bio</th>
                      <th className="text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTrainers.map((trainer) => (
                      <tr key={trainer.id}>
                        <td>
                          <TrainerAvatar
                            url={trainer.avatar_url}
                            nickname={trainer.nickname}
                          />
                        </td>
                        <td className="text-px-ink">{trainer.nickname}</td>
                        <td className="max-w-xs truncate text-px-ink-dim">
                          {trainer.bio || '-'}
                        </td>
                        <td>
                          <div className="flex items-center justify-end gap-2">
                            <AdminButton
                              tone="cyan"
                              size="sm"
                              onClick={() => handleEditTrainer(trainer)}
                            >
                              Editar
                            </AdminButton>
                            <AdminButton
                              tone="danger"
                              size="sm"
                              onClick={() => requestDeleteTrainer(trainer.id)}
                            >
                              Eliminar
                            </AdminButton>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between border-t-[3px] border-px-border bg-px-deep px-6 py-4">
                    <span className="font-retro text-base text-px-ink-dim">
                      Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
                      {Math.min(
                        currentPage * ITEMS_PER_PAGE,
                        filteredTrainers.length,
                      )}{' '}
                      de {filteredTrainers.length}
                    </span>
                    <div className="flex items-center gap-2">
                      <AdminButton
                        tone="default"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage === 1}
                      >
                        Anterior
                      </AdminButton>
                      <span className="px-2 font-num text-sm text-px-ink">
                        {currentPage} / {totalPages}
                      </span>
                      <AdminButton
                        tone="default"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages}
                      >
                        Siguiente
                      </AdminButton>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      ) : (
        /* Assignments Tab */
        <div className="flex flex-col gap-4">
          {/* Selectors */}
          <AdminCard className="flex flex-wrap items-center gap-3">
            <SelectorField
              label="Temporada"
              value={selectedSeasonId ?? ''}
              onChange={(v) => setSeasonId(v || null)}
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
              onChange={(v) => setSplitId(v || null)}
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
              onChange={(v) => setLeagueId(v || null)}
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

            {selectedLeagueId && availableTrainers.length > 0 && (
              <AdminButton
                tone="primary"
                onClick={() => setShowAssignForm(true)}
              >
                + Asignar
              </AdminButton>
            )}
          </AdminCard>

          {/* Save/Discard Bar */}
          {hasLivesChanges && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-[3px] border-px-gold bg-px-deep p-4">
              <span className="font-pixel text-[10px] uppercase tracking-wider text-px-gold">
                {Object.keys(pendingLivesChanges).length} cambio(s) sin guardar
              </span>
              <div className="flex gap-2">
                <AdminButton
                  tone="ghost"
                  size="sm"
                  onClick={handleDiscardLivesChanges}
                >
                  Descartar
                </AdminButton>
                <AdminButton
                  tone="success"
                  size="sm"
                  onClick={handleSaveLivesChanges}
                  disabled={saving}
                >
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </AdminButton>
              </div>
            </div>
          )}

          {/* Assign Form Modal */}
          {showAssignForm && (
            <AdminModal
              title="Asignar Entrenador"
              onClose={() => {
                setShowAssignForm(false);
                setSelectedTrainerId('');
              }}
            >
              <form
                onSubmit={handleAssignTrainer}
                className="flex flex-col gap-4"
              >
                <AdminSelect
                  id="trainer-select"
                  label="Entrenador"
                  value={selectedTrainerId}
                  onChange={(e) => setSelectedTrainerId(e.target.value)}
                  required
                >
                  <option value="">Seleccionar entrenador</option>
                  {availableTrainers.map((trainer) => (
                    <option key={trainer.id} value={trainer.id}>
                      {trainer.nickname}
                    </option>
                  ))}
                </AdminSelect>
                <div className="flex gap-3 pt-2">
                  <AdminButton
                    tone="ghost"
                    onClick={() => {
                      setShowAssignForm(false);
                      setSelectedTrainerId('');
                    }}
                    className="flex-1 justify-center"
                  >
                    Cancelar
                  </AdminButton>
                  <AdminButton
                    type="submit"
                    tone="primary"
                    disabled={saving || !selectedTrainerId}
                    className="flex-1 justify-center"
                  >
                    {saving ? 'Guardando...' : 'Asignar'}
                  </AdminButton>
                </div>
              </form>
            </AdminModal>
          )}

          {/* Participants Table */}
          {!selectedLeagueId ? (
            <EmptyPanel text="Selecciona temporada, split y división para ver los participantes." />
          ) : loadingParticipants ? (
            <EmptyPanel text="Cargando participantes..." />
          ) : (
            <div className="border-[3px] border-px-border bg-px-elev shadow-[4px_4px_0_0_var(--color-px-deep)]">
              {optimisticParticipants.length === 0 ? (
                <p className="p-8 text-center font-retro text-lg text-px-ink-dim">
                  No hay participantes asignados a esta división.
                </p>
              ) : (
                <table className="pixel-table">
                  <thead>
                    <tr>
                      <th>Seed</th>
                      <th>Entrenador</th>
                      <th>Vidas</th>
                      <th>Estado</th>
                      <th className="text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {optimisticParticipants.map((participant) => {
                      const currentLives = getCurrentLives(participant);
                      const hasChange =
                        pendingLivesChanges[participant.id] !== undefined;
                      return (
                        <tr
                          key={participant.id}
                          className={hasChange ? 'bg-px-base' : undefined}
                        >
                          <td>
                            <span className="grid size-8 place-items-center border-2 border-px-border bg-px-deep font-num text-sm text-px-ink">
                              {participant.initial_seed ?? '-'}
                            </span>
                          </td>
                          <td>
                            <div className="flex items-center gap-3">
                              <TrainerAvatar
                                url={participant.trainer?.avatar_url ?? null}
                                nickname={participant.trainer?.nickname ?? '?'}
                                small
                              />
                              <span className="text-px-ink">
                                {participant.trainer?.nickname ?? 'Unknown'}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  handleLocalLivesChange(
                                    participant.id,
                                    currentLives,
                                    -1,
                                  )
                                }
                                disabled={currentLives <= 0}
                                className="grid size-7 place-items-center border-2 border-px-deep bg-px-danger font-pixel text-xs text-px-ink disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                -
                              </button>
                              <span
                                className={cn(
                                  'min-w-[3rem] text-center font-num font-bold',
                                  hasChange
                                    ? 'text-px-magenta'
                                    : 'text-px-gold',
                                )}
                              >
                                {currentLives}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  handleLocalLivesChange(
                                    participant.id,
                                    currentLives,
                                    1,
                                  )
                                }
                                className="grid size-7 place-items-center border-2 border-px-deep bg-px-success font-pixel text-xs text-px-deep"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td>
                            <AdminBadge
                              tone={
                                participant.status === 'active'
                                  ? 'success'
                                  : 'neutral'
                              }
                            >
                              {participant.status ?? 'active'}
                            </AdminBadge>
                          </td>
                          <td>
                            <div className="flex items-center justify-end gap-2">
                              <AdminButton
                                tone="danger"
                                size="sm"
                                onClick={() =>
                                  requestRemoveFromLeague(participant.id)
                                }
                              >
                                Quitar
                              </AdminButton>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
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
  small = false,
}: {
  url: string | null;
  nickname: string;
  small?: boolean;
}) {
  const sizeClass = small ? 'size-8' : 'size-10';
  if (url) {
    return (
      <img
        src={url}
        alt={nickname}
        className={cn('border-2 border-px-border object-cover', sizeClass)}
      />
    );
  }
  return (
    <div
      className={cn(
        'grid place-items-center border-2 border-px-border bg-px-deep font-pixel text-xs text-px-ink',
        sizeClass,
      )}
    >
      {nickname.charAt(0).toUpperCase()}
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
