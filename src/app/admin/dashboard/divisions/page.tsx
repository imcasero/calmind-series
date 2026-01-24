'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Season, Split, League } from '@/lib/types/database.types';

export default function DivisionsPage() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [splits, setSplits] = useState<Split[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string | null>(null);
  const [selectedSplitId, setSelectedSplitId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingSplits, setLoadingSplits] = useState(false);
  const [loadingLeagues, setLoadingLeagues] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newLeague, setNewLeague] = useState({ tier_name: '', tier_priority: 1 });
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  // Fetch seasons on mount
  useEffect(() => {
    const fetchSeasons = async () => {
      const { data, error } = await supabase
        .from('seasons')
        .select('*')
        .order('year', { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setSeasons(data ?? []);
        // Auto-select active season
        const activeSeason = data?.find((s) => s.is_active) ?? data?.[0];
        if (activeSeason) {
          setSelectedSeasonId(activeSeason.id);
        }
      }
      setLoading(false);
    };

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

      const { data, error } = await supabase
        .from('splits')
        .select('*')
        .eq('season_id', selectedSeasonId)
        .order('split_order', { ascending: true });

      if (error) {
        setError(error.message);
      } else {
        setSplits(data ?? []);
        // Auto-select active split
        const activeSplit = data?.find((s) => s.is_active) ?? data?.[0];
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
      return;
    }

    const fetchLeagues = async () => {
      setLoadingLeagues(true);

      const { data, error } = await supabase
        .from('leagues')
        .select('*')
        .eq('split_id', selectedSplitId)
        .order('tier_priority', { ascending: true });

      if (error) {
        setError(error.message);
      } else {
        setLeagues(data ?? []);
        setNewLeague((prev) => ({ ...prev, tier_priority: (data?.length ?? 0) + 1 }));
      }
      setLoadingLeagues(false);
    };

    fetchLeagues();
  }, [selectedSplitId]);

  const refreshLeagues = async () => {
    const { data } = await supabase
      .from('leagues')
      .select('*')
      .eq('split_id', selectedSplitId)
      .order('tier_priority', { ascending: true });

    if (data) {
      setLeagues(data);
      setNewLeague((prev) => ({ ...prev, tier_priority: data.length + 1 }));
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSplitId) return;

    setSaving(true);
    setError(null);

    const { error } = await supabase.from('leagues').insert({
      split_id: selectedSplitId,
      tier_name: newLeague.tier_name,
      tier_priority: newLeague.tier_priority,
    });

    if (error) {
      setError(error.message);
    } else {
      setNewLeague({ tier_name: '', tier_priority: leagues.length + 2 });
      setShowCreateForm(false);
      await refreshLeagues();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta división?')) return;

    const { error } = await supabase.from('leagues').delete().eq('id', id);

    if (error) {
      setError(error.message);
    } else {
      await refreshLeagues();
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-jacksons-purple-300">
        Cargando...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Selectors */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-xl font-bold text-retro-gold-500 uppercase tracking-wider">
          Divisiones
        </h1>

        <div className="flex items-center gap-4 flex-wrap">
          {/* Season Selector */}
          <div className="flex items-center gap-2">
            <label htmlFor="season-select" className="text-jacksons-purple-200 text-sm uppercase tracking-wide">
              Temporada:
            </label>
            <select
              id="season-select"
              value={selectedSeasonId ?? ''}
              onChange={(e) => setSelectedSeasonId(e.target.value || null)}
              className="
                px-4 py-2
                bg-jacksons-purple-950 text-white
                border-4 border-jacksons-purple-600
                focus:outline-none focus:border-retro-gold-500
                cursor-pointer
              "
            >
              <option value="">Seleccionar</option>
              {seasons.map((season) => (
                <option key={season.id} value={season.id}>
                  {season.name} {season.is_active ? '★' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Split Selector */}
          <div className="flex items-center gap-2">
            <label htmlFor="split-select" className="text-jacksons-purple-200 text-sm uppercase tracking-wide">
              Split:
            </label>
            <select
              id="split-select"
              value={selectedSplitId ?? ''}
              onChange={(e) => setSelectedSplitId(e.target.value || null)}
              disabled={!selectedSeasonId || loadingSplits}
              className="
                px-4 py-2
                bg-jacksons-purple-950 text-white
                border-4 border-jacksons-purple-600
                focus:outline-none focus:border-retro-gold-500
                cursor-pointer
                disabled:opacity-50 disabled:cursor-not-allowed
              "
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

          {selectedSplitId && (
            <button
              type="button"
              onClick={() => setShowCreateForm(true)}
              className="
                px-6 py-2
                bg-retro-gold-500 text-jacksons-purple-950
                border-4 border-jacksons-purple-950
                font-bold uppercase tracking-wide text-sm
                shadow-[4px_4px_0px_0px_#1a1a1a]
                hover:translate-x-0.5 hover:translate-y-0.5
                hover:shadow-[2px_2px_0px_0px_#1a1a1a]
                transition-all duration-100
              "
            >
              + Nueva División
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-600 border-4 border-red-800 p-4 text-white text-sm">
          {error}
        </div>
      )}

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-jacksons-purple-800 border-4 border-jacksons-purple-600 p-6 shadow-[4px_4px_0px_0px_#1a1a1a] w-full max-w-md">
            <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-4">
              Nueva División
            </h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label htmlFor="tier_name" className="block text-jacksons-purple-200 text-sm uppercase tracking-wide mb-2">
                  Nombre
                </label>
                <input
                  id="tier_name"
                  type="text"
                  value={newLeague.tier_name}
                  onChange={(e) => setNewLeague({ ...newLeague, tier_name: e.target.value })}
                  required
                  placeholder="Ej: Primera División"
                  className="
                    w-full px-4 py-3
                    bg-jacksons-purple-950 text-white
                    border-4 border-jacksons-purple-600
                    focus:outline-none focus:border-retro-gold-500
                    placeholder-jacksons-purple-400
                  "
                />
              </div>
              <div>
                <label htmlFor="tier_priority" className="block text-jacksons-purple-200 text-sm uppercase tracking-wide mb-2">
                  Prioridad (1 = más alta)
                </label>
                <input
                  id="tier_priority"
                  type="number"
                  min="1"
                  value={newLeague.tier_priority}
                  onChange={(e) => setNewLeague({ ...newLeague, tier_priority: parseInt(e.target.value) })}
                  required
                  className="
                    w-full px-4 py-3
                    bg-jacksons-purple-950 text-white
                    border-4 border-jacksons-purple-600
                    focus:outline-none focus:border-retro-gold-500
                  "
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="
                    flex-1 px-4 py-3
                    bg-jacksons-purple-600 text-white
                    border-4 border-jacksons-purple-950
                    font-bold uppercase tracking-wide text-sm
                    hover:bg-jacksons-purple-500
                    transition-all duration-100
                  "
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="
                    flex-1 px-4 py-3
                    bg-retro-gold-500 text-jacksons-purple-950
                    border-4 border-jacksons-purple-950
                    font-bold uppercase tracking-wide text-sm
                    shadow-[4px_4px_0px_0px_#1a1a1a]
                    hover:translate-x-0.5 hover:translate-y-0.5
                    hover:shadow-[2px_2px_0px_0px_#1a1a1a]
                    disabled:opacity-50
                    transition-all duration-100
                  "
                >
                  {saving ? 'Guardando...' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Content */}
      {!selectedSeasonId ? (
        <div className="bg-jacksons-purple-800 border-4 border-jacksons-purple-600 p-8 shadow-[4px_4px_0px_0px_#1a1a1a] text-center">
          <p className="text-jacksons-purple-300">
            Selecciona una temporada para ver sus divisiones.
          </p>
        </div>
      ) : !selectedSplitId ? (
        <div className="bg-jacksons-purple-800 border-4 border-jacksons-purple-600 p-8 shadow-[4px_4px_0px_0px_#1a1a1a] text-center">
          <p className="text-jacksons-purple-300">
            {splits.length === 0
              ? 'Esta temporada no tiene splits. Crea uno primero en la sección Splits.'
              : 'Selecciona un split para ver sus divisiones.'}
          </p>
        </div>
      ) : loadingLeagues ? (
        <div className="bg-jacksons-purple-800 border-4 border-jacksons-purple-600 p-8 shadow-[4px_4px_0px_0px_#1a1a1a] text-center">
          <p className="text-jacksons-purple-300">Cargando divisiones...</p>
        </div>
      ) : (
        <div className="bg-jacksons-purple-800 border-4 border-jacksons-purple-600 shadow-[4px_4px_0px_0px_#1a1a1a] overflow-hidden">
          {leagues.length === 0 ? (
            <div className="p-8 text-center text-jacksons-purple-300">
              No hay divisiones creadas para este split.
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-jacksons-purple-900 border-b-4 border-jacksons-purple-600">
                  <th className="px-6 py-4 text-left text-sm font-bold text-retro-gold-500 uppercase tracking-wider">
                    Prioridad
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-retro-gold-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-retro-gold-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {leagues.map((league) => (
                  <tr
                    key={league.id}
                    className="border-b-2 border-jacksons-purple-700 hover:bg-jacksons-purple-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-jacksons-purple-600 border-2 border-jacksons-purple-500 text-white font-bold text-sm">
                        {league.tier_priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white font-medium">
                      {league.tier_name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleDelete(league.id)}
                          className="
                            px-4 py-2
                            bg-red-600 text-white
                            border-2 border-red-800
                            text-xs font-bold uppercase
                            hover:bg-red-500
                            transition-all duration-100
                          "
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
  );
}
