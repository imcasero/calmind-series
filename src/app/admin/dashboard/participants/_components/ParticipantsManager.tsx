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
  AdminTextarea,
} from '@/components/admin/ui';
import { createClient } from '@/lib/supabase/client';
import type {
  League,
  LeagueParticipant,
  Season,
  Split,
  Trainer,
} from '@/lib/types/database.types';
import { cn } from '@/lib/utils';

type ParticipantWithTrainer = LeagueParticipant & { trainer: Trainer };

interface ParticipantsManagerProps {
  initialSeasons: Season[];
  initialTrainers: Trainer[];
}

const ITEMS_PER_PAGE = 10;

export default function ParticipantsManager({
  initialSeasons,
  initialTrainers,
}: ParticipantsManagerProps) {
  const router = useRouter();

  // Tab state
  const [activeTab, setActiveTab] = useState<'trainers' | 'assignments'>(
    'trainers',
  );

  // Trainers state
  const [trainers, setTrainers] = useState<Trainer[]>(initialTrainers);
  const [showTrainerForm, setShowTrainerForm] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null);
  const [trainerForm, setTrainerForm] = useState({
    nickname: '',
    avatar_url: '',
    bio: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Assignment state
  const [splits, setSplits] = useState<Split[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [participants, setParticipants] = useState<ParticipantWithTrainer[]>(
    [],
  );
  const [pendingLivesChanges, setPendingLivesChanges] = useState<
    Record<string, number>
  >({});
  const [selectedSeasonId, setSelectedSeasonId] = useState<string | null>(
    () => {
      const active = initialSeasons.find((s) => s.is_active);
      return active?.id ?? initialSeasons[0]?.id ?? null;
    },
  );
  const [selectedSplitId, setSelectedSplitId] = useState<string | null>(null);
  const [selectedLeagueId, setSelectedLeagueId] = useState<string | null>(null);
  const [loadingSplits, setLoadingSplits] = useState(false);
  const [loadingLeagues, setLoadingLeagues] = useState(false);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [selectedTrainerId, setSelectedTrainerId] = useState<string>('');

  // Common state
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  // Filtered and paginated trainers
  const filteredTrainers = useMemo(() => {
    if (!searchQuery.trim()) return trainers;
    const query = searchQuery.toLowerCase();
    return trainers.filter(
      (t) =>
        t.nickname.toLowerCase().includes(query) ||
        (t.bio?.toLowerCase().includes(query) ?? false),
    );
  }, [trainers, searchQuery]);

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

  // Refresh trainers
  const refreshTrainers = async () => {
    const { data } = await supabase
      .from('trainers')
      .select('*')
      .order('nickname', { ascending: true });
    if (data) {
      setTrainers(data);
    }
  };

  // Fetch splits when season changes
  useEffect(() => {
    if (!selectedSeasonId) {
      setSplits([]);
      setSelectedSplitId(null);
      setLeagues([]);
      setSelectedLeagueId(null);
      setPendingLivesChanges({});
      return;
    }

    const fetchSplits = async () => {
      setLoadingSplits(true);
      setSelectedSplitId(null);
      setLeagues([]);
      setSelectedLeagueId(null);
      setPendingLivesChanges({});

      const { data, error } = await supabase
        .from('splits')
        .select('*')
        .eq('season_id', selectedSeasonId)
        .order('split_order', { ascending: true });

      if (error) {
        setError(error.message);
      } else {
        setSplits(data ?? []);
        const activeSplit = data?.find((s) => s.is_active) ?? data?.[0];
        if (activeSplit) {
          setSelectedSplitId(activeSplit.id);
        }
      }
      setLoadingSplits(false);
    };

    fetchSplits();
  }, [selectedSeasonId, supabase.from]);

  // Fetch leagues when split changes
  useEffect(() => {
    if (!selectedSplitId) {
      setLeagues([]);
      setSelectedLeagueId(null);
      setParticipants([]);
      setPendingLivesChanges({});
      return;
    }

    const fetchLeagues = async () => {
      setLoadingLeagues(true);
      setSelectedLeagueId(null);
      setParticipants([]);
      setPendingLivesChanges({});

      const { data, error } = await supabase
        .from('leagues')
        .select('*')
        .eq('split_id', selectedSplitId)
        .order('tier_priority', { ascending: true });

      if (error) {
        setError(error.message);
      } else {
        setLeagues(data ?? []);
        if (data?.[0]) {
          setSelectedLeagueId(data[0].id);
        }
      }
      setLoadingLeagues(false);
    };

    fetchLeagues();
  }, [selectedSplitId, supabase.from]);

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
        setError(error.message);
      } else {
        setParticipants((data ?? []) as ParticipantWithTrainer[]);
      }
      setLoadingParticipants(false);
    };

    fetchParticipants();
  }, [selectedLeagueId, supabase.from]);

  // Trainer handlers
  const handleSaveTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    if (editingTrainer) {
      const { error } = await supabase
        .from('trainers')
        .update({
          nickname: trainerForm.nickname,
          avatar_url: trainerForm.avatar_url || null,
          bio: trainerForm.bio || null,
        })
        .eq('id', editingTrainer.id);

      if (error) {
        setError(error.message);
      } else {
        setEditingTrainer(null);
        setShowTrainerForm(false);
        setTrainerForm({ nickname: '', avatar_url: '', bio: '' });
        await refreshTrainers();
        router.refresh();
      }
    } else {
      const { error } = await supabase.from('trainers').insert({
        nickname: trainerForm.nickname,
        avatar_url: trainerForm.avatar_url || null,
        bio: trainerForm.bio || null,
      });

      if (error) {
        setError(error.message);
      } else {
        setShowTrainerForm(false);
        setTrainerForm({ nickname: '', avatar_url: '', bio: '' });
        await refreshTrainers();
        router.refresh();
      }
    }
    setSaving(false);
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

  const handleDeleteTrainer = async (id: string) => {
    if (
      !confirm(
        '¿Estas seguro de eliminar este entrenador? Se eliminara de todas las divisiones.',
      )
    )
      return;

    const { error } = await supabase.from('trainers').delete().eq('id', id);

    if (error) {
      setError(error.message);
    } else {
      await refreshTrainers();
      router.refresh();
    }
  };

  // Assignment handlers
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

  const handleAssignTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeagueId || !selectedTrainerId) return;

    setSaving(true);
    setError(null);

    const { error } = await supabase.from('league_participants').insert({
      league_id: selectedLeagueId,
      trainer_id: selectedTrainerId,
      initial_seed: participants.length + 1,
      status: 'active',
      lives: 20,
    });

    if (error) {
      setError(error.message);
    } else {
      setSelectedTrainerId('');
      setShowAssignForm(false);
      await refreshParticipants();
      router.refresh();
    }
    setSaving(false);
  };

  const handleRemoveFromLeague = async (participantId: string) => {
    if (!confirm('¿Quitar este entrenador de la division?')) return;

    const { error } = await supabase
      .from('league_participants')
      .delete()
      .eq('id', participantId);

    if (error) {
      setError(error.message);
    } else {
      const newPending = { ...pendingLivesChanges };
      delete newPending[participantId];
      setPendingLivesChanges(newPending);
      await refreshParticipants();
      router.refresh();
    }
  };

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
    if (!hasLivesChanges) return;

    setSaving(true);
    setError(null);

    const updates = Object.entries(pendingLivesChanges).map(([id, lives]) =>
      supabase.from('league_participants').update({ lives }).eq('id', id),
    );

    const results = await Promise.all(updates);
    const errors = results.filter((r) => r.error);

    if (errors.length > 0) {
      setError(`Error al guardar ${errors.length} cambio(s)`);
    } else {
      await refreshParticipants();
      router.refresh();
    }
    setSaving(false);
  };

  // Discard pending changes
  const handleDiscardLivesChanges = () => {
    setPendingLivesChanges({});
  };

  // Get trainers not already in selected league
  const availableTrainers = trainers.filter(
    (t) => !participants.some((p) => p.trainer_id === t.id),
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
                              onClick={() => handleDeleteTrainer(trainer.id)}
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
              onChange={(v) => setSelectedSeasonId(v || null)}
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
              onChange={(v) => setSelectedSplitId(v || null)}
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
              {participants.length === 0 ? (
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
                    {participants.map((participant) => {
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
                                  handleRemoveFromLeague(participant.id)
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
