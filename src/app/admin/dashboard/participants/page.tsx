'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type {
  League,
  LeagueParticipant,
  Season,
  Split,
  Trainer,
} from '@/lib/types/database.types';

type ParticipantWithTrainer = LeagueParticipant & { trainer: Trainer };

const ITEMS_PER_PAGE = 10;

export default function ParticipantsPage() {
  // Tab state
  const [activeTab, setActiveTab] = useState<'trainers' | 'assignments'>(
    'trainers',
  );

  // Trainers state
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loadingTrainers, setLoadingTrainers] = useState(true);
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
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [splits, setSplits] = useState<Split[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [participants, setParticipants] = useState<ParticipantWithTrainer[]>(
    [],
  );
  const [pendingLivesChanges, setPendingLivesChanges] = useState<
    Record<string, number>
  >({});
  const [selectedSeasonId, setSelectedSeasonId] = useState<string | null>(null);
  const [selectedSplitId, setSelectedSplitId] = useState<string | null>(null);
  const [selectedLeagueId, setSelectedLeagueId] = useState<string | null>(null);
  const [loadingSeasons, setLoadingSeasons] = useState(true);
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

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Check if there are pending changes
  const hasLivesChanges = Object.keys(pendingLivesChanges).length > 0;

  // Get current lives (pending or original)
  const getCurrentLives = (participant: ParticipantWithTrainer) => {
    return pendingLivesChanges[participant.id] ?? participant.lives;
  };

  // Fetch trainers
  const fetchTrainers = async () => {
    setLoadingTrainers(true);
    const { data, error } = await supabase
      .from('trainers')
      .select('*')
      .order('nickname', { ascending: true });

    if (error) {
      setError(error.message);
    } else {
      setTrainers(data ?? []);
    }
    setLoadingTrainers(false);
  };

  // Fetch seasons
  const fetchSeasons = async () => {
    const { data, error } = await supabase
      .from('seasons')
      .select('*')
      .order('year', { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setSeasons(data ?? []);
      const activeSeason =
        (data as Season[] | null)?.find((s) => s.is_active) ?? data?.[0];
      if (activeSeason) {
        setSelectedSeasonId(activeSeason.id);
      }
    }
    setLoadingSeasons(false);
  };

  useEffect(() => {
    fetchTrainers();
    fetchSeasons();
  }, []);

  // Fetch splits when season changes
  useEffect(() => {
    if (!selectedSeasonId) {
      setSplits([]);
      setSelectedSplitId(null);
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
        .eq('season_id', selectedSeasonId as string)
        .order('split_order', { ascending: true });

      if (error) {
        setError(error.message);
      } else {
        setSplits(data ?? []);
        const activeSplit =
          (data as Split[] | null)?.find((s) => s.is_active) ?? data?.[0];
        if (activeSplit) {
          setSelectedSplitId(activeSplit.id);
        }
      }
      setLoadingSplits(false);
    };

    fetchSplits();
  }, [selectedSeasonId]);

  // Fetch leagues when split changes
  useEffect(() => {
    if (!selectedSplitId) {
      setLeagues([]);
      setSelectedLeagueId(null);
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
        .eq('split_id', selectedSplitId as string)
        .order('tier_priority', { ascending: true });

      if (error) {
        setError(error.message);
      } else {
        setLeagues(data ?? []);
        if (data?.[0]) {
          setSelectedLeagueId((data as League[])[0].id);
        }
      }
      setLoadingLeagues(false);
    };

    fetchLeagues();
  }, [selectedSplitId]);

  // Fetch participants when league changes
  useEffect(() => {
    if (!selectedLeagueId) {
      setParticipants([]);
      return;
    }

    const fetchParticipants = async () => {
      setLoadingParticipants(true);
      setPendingLivesChanges({});

      const { data, error } = await supabase
        .from('league_participants')
        .select(`*, trainer:trainers(*)`)
        .eq('league_id', selectedLeagueId as string)
        .order('initial_seed', { ascending: true });

      if (error) {
        setError(error.message);
      } else {
        setParticipants((data ?? []) as ParticipantWithTrainer[]);
      }
      setLoadingParticipants(false);
    };

    fetchParticipants();
  }, [selectedLeagueId]);

  // Trainer handlers
  const handleSaveTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    if (editingTrainer) {
      // Update existing
      const { error } = await (supabase as any)
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
        await fetchTrainers();
      }
    } else {
      // Create new
      const { error } = await (supabase as any).from('trainers').insert({
        nickname: trainerForm.nickname,
        avatar_url: trainerForm.avatar_url || null,
        bio: trainerForm.bio || null,
      });

      if (error) {
        setError(error.message);
      } else {
        setShowTrainerForm(false);
        setTrainerForm({ nickname: '', avatar_url: '', bio: '' });
        await fetchTrainers();
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
        '¿Estás seguro de eliminar este entrenador? Se eliminará de todas las divisiones.',
      )
    )
      return;

    const { error } = await supabase.from('trainers').delete().eq('id', id);

    if (error) {
      setError(error.message);
    } else {
      await fetchTrainers();
    }
  };

  const closeTrainerForm = () => {
    setShowTrainerForm(false);
    setEditingTrainer(null);
    setTrainerForm({ nickname: '', avatar_url: '', bio: '' });
  };

  // Assignment handlers
  const refreshParticipants = async () => {
    if (!selectedLeagueId) return;

    const { data } = await supabase
      .from('league_participants')
      .select(`*, trainer:trainers(*)`)
      .eq('league_id', selectedLeagueId as string)
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

    const { error } = await (supabase as any)
      .from('league_participants')
      .insert({
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
    }
    setSaving(false);
  };

  const handleRemoveFromLeague = async (participantId: string) => {
    if (!confirm('¿Quitar este entrenador de la división?')) return;

    const { error } = await supabase
      .from('league_participants')
      .delete()
      .eq('id', participantId);

    if (error) {
      setError(error.message);
    } else {
      // Remove from pending changes if exists
      const newPending = { ...pendingLivesChanges };
      delete newPending[participantId];
      setPendingLivesChanges(newPending);
      await refreshParticipants();
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
      (supabase as any)
        .from('league_participants')
        .update({ lives })
        .eq('id', id),
    );

    const results = await Promise.all(updates);
    const errors = results.filter((r) => r.error);

    if (errors.length > 0) {
      setError(`Error al guardar ${errors.length} cambio(s)`);
    } else {
      await refreshParticipants();
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-retro-gold-500 uppercase tracking-wider">
          Participantes
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
          onClick={() => setActiveTab('trainers')}
          className={`
            px-6 py-3 font-bold uppercase tracking-wide text-sm border-4 transition-all duration-100
            ${
              activeTab === 'trainers'
                ? 'bg-retro-gold-500 text-jacksons-purple-950 border-jacksons-purple-950 shadow-[2px_2px_0px_0px_#1a1a1a]'
                : 'bg-jacksons-purple-800 text-jacksons-purple-200 border-jacksons-purple-600 hover:bg-jacksons-purple-700'
            }
          `}
        >
          👥 Entrenadores
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('assignments')}
          className={`
            px-6 py-3 font-bold uppercase tracking-wide text-sm border-4 transition-all duration-100
            ${
              activeTab === 'assignments'
                ? 'bg-retro-gold-500 text-jacksons-purple-950 border-jacksons-purple-950 shadow-[2px_2px_0px_0px_#1a1a1a]'
                : 'bg-jacksons-purple-800 text-jacksons-purple-200 border-jacksons-purple-600 hover:bg-jacksons-purple-700'
            }
          `}
        >
          ⚔️ Asignación a Divisiones
          {hasLivesChanges && (
            <span className="ml-2 px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full">
              !
            </span>
          )}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'trainers' ? (
        /* Trainers Tab */
        <div className="space-y-4">
          {/* Search and Add */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px] max-w-md">
              <input
                type="text"
                placeholder="Buscar por nickname o bio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 bg-jacksons-purple-950 text-white border-4 border-jacksons-purple-600 focus:outline-none focus:border-retro-gold-500 placeholder-jacksons-purple-400"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingTrainer(null);
                setTrainerForm({ nickname: '', avatar_url: '', bio: '' });
                setShowTrainerForm(true);
              }}
              className="px-6 py-2 bg-retro-gold-500 text-jacksons-purple-950 border-4 border-jacksons-purple-950 font-bold uppercase tracking-wide text-sm shadow-[4px_4px_0px_0px_#1a1a1a] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#1a1a1a] transition-all duration-100"
            >
              + Nuevo Entrenador
            </button>
          </div>

          {/* Trainer Form Modal */}
          {showTrainerForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-jacksons-purple-800 border-4 border-jacksons-purple-600 p-6 shadow-[4px_4px_0px_0px_#1a1a1a] w-full max-w-md">
                <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-4">
                  {editingTrainer ? 'Editar Entrenador' : 'Nuevo Entrenador'}
                </h2>
                <form onSubmit={handleSaveTrainer} className="space-y-4">
                  <div>
                    <label
                      htmlFor="nickname"
                      className="block text-jacksons-purple-200 text-sm uppercase tracking-wide mb-2"
                    >
                      Nickname *
                    </label>
                    <input
                      id="nickname"
                      type="text"
                      value={trainerForm.nickname}
                      onChange={(e) =>
                        setTrainerForm({
                          ...trainerForm,
                          nickname: e.target.value,
                        })
                      }
                      required
                      placeholder="Ej: AshKetchum"
                      className="w-full px-4 py-3 bg-jacksons-purple-950 text-white border-4 border-jacksons-purple-600 focus:outline-none focus:border-retro-gold-500 placeholder-jacksons-purple-400"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="avatar_url"
                      className="block text-jacksons-purple-200 text-sm uppercase tracking-wide mb-2"
                    >
                      Avatar URL
                    </label>
                    <input
                      id="avatar_url"
                      type="text"
                      value={trainerForm.avatar_url}
                      onChange={(e) =>
                        setTrainerForm({
                          ...trainerForm,
                          avatar_url: e.target.value,
                        })
                      }
                      placeholder="https://..."
                      className="w-full px-4 py-3 bg-jacksons-purple-950 text-white border-4 border-jacksons-purple-600 focus:outline-none focus:border-retro-gold-500 placeholder-jacksons-purple-400"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="bio"
                      className="block text-jacksons-purple-200 text-sm uppercase tracking-wide mb-2"
                    >
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      value={trainerForm.bio}
                      onChange={(e) =>
                        setTrainerForm({ ...trainerForm, bio: e.target.value })
                      }
                      placeholder="Descripción del entrenador..."
                      rows={3}
                      className="w-full px-4 py-3 bg-jacksons-purple-950 text-white border-4 border-jacksons-purple-600 focus:outline-none focus:border-retro-gold-500 placeholder-jacksons-purple-400 resize-none"
                    />
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={closeTrainerForm}
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

          {/* Trainers Table */}
          <div className="bg-jacksons-purple-800 border-4 border-jacksons-purple-600 shadow-[4px_4px_0px_0px_#1a1a1a] overflow-hidden">
            {loadingTrainers ? (
              <div className="p-8 text-center text-jacksons-purple-300">
                Cargando entrenadores...
              </div>
            ) : filteredTrainers.length === 0 ? (
              <div className="p-8 text-center text-jacksons-purple-300">
                {searchQuery
                  ? 'No se encontraron entrenadores.'
                  : 'No hay entrenadores registrados.'}
              </div>
            ) : (
              <>
                <table className="w-full">
                  <thead>
                    <tr className="bg-jacksons-purple-900 border-b-4 border-jacksons-purple-600">
                      <th className="px-6 py-4 text-left text-sm font-bold text-retro-gold-500 uppercase tracking-wider">
                        Avatar
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-retro-gold-500 uppercase tracking-wider">
                        Nickname
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-retro-gold-500 uppercase tracking-wider">
                        Bio
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-retro-gold-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTrainers.map((trainer) => (
                      <tr
                        key={trainer.id}
                        className="border-b-2 border-jacksons-purple-700 hover:bg-jacksons-purple-700/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          {trainer.avatar_url ? (
                            <img
                              src={trainer.avatar_url}
                              alt={trainer.nickname}
                              className="w-10 h-10 border-2 border-jacksons-purple-500 object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-jacksons-purple-600 border-2 border-jacksons-purple-500 flex items-center justify-center text-white font-bold">
                              {trainer.nickname.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-white font-medium">
                          {trainer.nickname}
                        </td>
                        <td className="px-6 py-4 text-jacksons-purple-300 text-sm max-w-xs truncate">
                          {trainer.bio || '-'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditTrainer(trainer)}
                              className="px-4 py-2 bg-retro-cyan-500 text-white border-2 border-retro-cyan-700 text-xs font-bold uppercase hover:bg-retro-cyan-400 transition-all duration-100"
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteTrainer(trainer.id)}
                              className="px-4 py-2 bg-red-600 text-white border-2 border-red-800 text-xs font-bold uppercase hover:bg-red-500 transition-all duration-100"
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 bg-jacksons-purple-900 border-t-2 border-jacksons-purple-600">
                    <span className="text-jacksons-purple-300 text-sm">
                      Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
                      {Math.min(
                        currentPage * ITEMS_PER_PAGE,
                        filteredTrainers.length,
                      )}{' '}
                      de {filteredTrainers.length}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage === 1}
                        className="px-3 py-1 bg-jacksons-purple-700 text-white border-2 border-jacksons-purple-600 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-jacksons-purple-600 transition-all"
                      >
                        ← Anterior
                      </button>
                      <span className="text-white text-sm px-3">
                        {currentPage} / {totalPages}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 bg-jacksons-purple-700 text-white border-2 border-jacksons-purple-600 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-jacksons-purple-600 transition-all"
                      >
                        Siguiente →
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      ) : (
        /* Assignments Tab */
        <div className="space-y-4">
          {/* Selectors */}
          <div className="flex items-center gap-4 flex-wrap bg-jacksons-purple-800 border-4 border-jacksons-purple-600 p-4 shadow-[4px_4px_0px_0px_#1a1a1a]">
            <div className="flex items-center gap-2">
              <label
                htmlFor="season-select"
                className="text-jacksons-purple-200 text-sm uppercase tracking-wide"
              >
                Temporada:
              </label>
              <select
                id="season-select"
                value={selectedSeasonId ?? ''}
                onChange={(e) => setSelectedSeasonId(e.target.value || null)}
                className="px-4 py-2 bg-jacksons-purple-950 text-white border-4 border-jacksons-purple-600 focus:outline-none focus:border-retro-gold-500 cursor-pointer"
              >
                <option value="">Seleccionar</option>
                {seasons.map((season) => (
                  <option key={season.id} value={season.id}>
                    {season.name} {season.is_active ? '★' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label
                htmlFor="split-select"
                className="text-jacksons-purple-200 text-sm uppercase tracking-wide"
              >
                Split:
              </label>
              <select
                id="split-select"
                value={selectedSplitId ?? ''}
                onChange={(e) => setSelectedSplitId(e.target.value || null)}
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
                htmlFor="league-select"
                className="text-jacksons-purple-200 text-sm uppercase tracking-wide"
              >
                División:
              </label>
              <select
                id="league-select"
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

            {selectedLeagueId && availableTrainers.length > 0 && (
              <button
                type="button"
                onClick={() => setShowAssignForm(true)}
                className="px-4 py-2 bg-retro-gold-500 text-jacksons-purple-950 border-4 border-jacksons-purple-950 font-bold uppercase tracking-wide text-sm shadow-[4px_4px_0px_0px_#1a1a1a] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#1a1a1a] transition-all duration-100"
              >
                + Asignar
              </button>
            )}
          </div>

          {/* Save/Discard Changes Bar */}
          {hasLivesChanges && (
            <div className="flex items-center justify-between bg-orange-600 border-4 border-orange-800 p-4 shadow-[4px_4px_0px_0px_#1a1a1a]">
              <span className="text-white font-bold">
                ⚠️ Tienes {Object.keys(pendingLivesChanges).length} cambio(s) sin
                guardar
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleDiscardLivesChanges}
                  className="px-4 py-2 bg-jacksons-purple-600 text-white border-2 border-jacksons-purple-800 font-bold uppercase text-sm hover:bg-jacksons-purple-500 transition-all"
                >
                  Descartar
                </button>
                <button
                  type="button"
                  onClick={handleSaveLivesChanges}
                  disabled={saving}
                  className="px-4 py-2 bg-green-600 text-white border-2 border-green-800 font-bold uppercase text-sm hover:bg-green-500 disabled:opacity-50 transition-all"
                >
                  {saving ? 'Guardando...' : '💾 Guardar Cambios'}
                </button>
              </div>
            </div>
          )}

          {/* Assign Form Modal */}
          {showAssignForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-jacksons-purple-800 border-4 border-jacksons-purple-600 p-6 shadow-[4px_4px_0px_0px_#1a1a1a] w-full max-w-md">
                <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-4">
                  Asignar Entrenador
                </h2>
                <form onSubmit={handleAssignTrainer} className="space-y-4">
                  <div>
                    <label
                      htmlFor="trainer-select"
                      className="block text-jacksons-purple-200 text-sm uppercase tracking-wide mb-2"
                    >
                      Entrenador
                    </label>
                    <select
                      id="trainer-select"
                      value={selectedTrainerId}
                      onChange={(e) => setSelectedTrainerId(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-jacksons-purple-950 text-white border-4 border-jacksons-purple-600 focus:outline-none focus:border-retro-gold-500 cursor-pointer"
                    >
                      <option value="">Seleccionar entrenador</option>
                      {availableTrainers.map((trainer) => (
                        <option key={trainer.id} value={trainer.id}>
                          {trainer.nickname}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAssignForm(false);
                        setSelectedTrainerId('');
                      }}
                      className="flex-1 px-4 py-3 bg-jacksons-purple-600 text-white border-4 border-jacksons-purple-950 font-bold uppercase tracking-wide text-sm hover:bg-jacksons-purple-500 transition-all duration-100"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={saving || !selectedTrainerId}
                      className="flex-1 px-4 py-3 bg-retro-gold-500 text-jacksons-purple-950 border-4 border-jacksons-purple-950 font-bold uppercase tracking-wide text-sm shadow-[4px_4px_0px_0px_#1a1a1a] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#1a1a1a] disabled:opacity-50 transition-all duration-100"
                    >
                      {saving ? 'Guardando...' : 'Asignar'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Participants Table */}
          {!selectedLeagueId ? (
            <div className="bg-jacksons-purple-800 border-4 border-jacksons-purple-600 p-8 shadow-[4px_4px_0px_0px_#1a1a1a] text-center">
              <p className="text-jacksons-purple-300">
                Selecciona temporada, split y división para ver los
                participantes.
              </p>
            </div>
          ) : loadingParticipants ? (
            <div className="bg-jacksons-purple-800 border-4 border-jacksons-purple-600 p-8 shadow-[4px_4px_0px_0px_#1a1a1a] text-center">
              <p className="text-jacksons-purple-300">
                Cargando participantes...
              </p>
            </div>
          ) : (
            <div className="bg-jacksons-purple-800 border-4 border-jacksons-purple-600 shadow-[4px_4px_0px_0px_#1a1a1a] overflow-hidden">
              {participants.length === 0 ? (
                <div className="p-8 text-center text-jacksons-purple-300">
                  No hay participantes asignados a esta división.
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-jacksons-purple-900 border-b-4 border-jacksons-purple-600">
                      <th className="px-6 py-4 text-left text-sm font-bold text-retro-gold-500 uppercase tracking-wider">
                        Seed
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-retro-gold-500 uppercase tracking-wider">
                        Entrenador
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-retro-gold-500 uppercase tracking-wider">
                        Vidas
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-retro-gold-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-retro-gold-500 uppercase tracking-wider">
                        Acciones
                      </th>
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
                          className={`border-b-2 border-jacksons-purple-700 hover:bg-jacksons-purple-700/50 transition-colors ${hasChange ? 'bg-orange-900/20' : ''}`}
                        >
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center justify-center w-8 h-8 bg-jacksons-purple-600 border-2 border-jacksons-purple-500 text-white font-bold text-sm">
                              {participant.initial_seed ?? '-'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {participant.trainer?.avatar_url ? (
                                <img
                                  src={participant.trainer.avatar_url}
                                  alt={participant.trainer.nickname}
                                  className="w-8 h-8 border-2 border-jacksons-purple-500 object-cover"
                                />
                              ) : (
                                <div className="w-8 h-8 bg-jacksons-purple-600 border-2 border-jacksons-purple-500 flex items-center justify-center text-white font-bold text-xs">
                                  {participant.trainer?.nickname
                                    ?.charAt(0)
                                    .toUpperCase() ?? '?'}
                                </div>
                              )}
                              <span className="text-white font-medium">
                                {participant.trainer?.nickname ?? 'Unknown'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
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
                                className="w-7 h-7 bg-red-600 text-white border-2 border-red-800 font-bold text-sm hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                              >
                                -
                              </button>
                              <span
                                className={`font-bold min-w-[3rem] text-center ${hasChange ? 'text-orange-400' : 'text-retro-gold-400'}`}
                              >
                                ❤️ {currentLives}
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
                                className="w-7 h-7 bg-green-600 text-white border-2 border-green-800 font-bold text-sm hover:bg-green-500 transition-all"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 text-xs font-bold uppercase border-2 ${participant.status === 'active' ? 'bg-green-600 border-green-800 text-white' : 'bg-jacksons-purple-600 border-jacksons-purple-800 text-jacksons-purple-200'}`}
                            >
                              {participant.status ?? 'active'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveFromLeague(participant.id)
                                }
                                className="px-4 py-2 bg-red-600 text-white border-2 border-red-800 text-xs font-bold uppercase hover:bg-red-500 transition-all duration-100"
                              >
                                Quitar
                              </button>
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
