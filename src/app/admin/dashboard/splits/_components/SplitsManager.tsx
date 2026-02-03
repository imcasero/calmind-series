'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Season, Split } from '@/lib/types/database.types';

interface SplitsManagerProps {
  initialSeasons: Season[];
}

export default function SplitsManager({ initialSeasons }: SplitsManagerProps) {
  const router = useRouter();
  const [selectedSeasonId, setSelectedSeasonId] = useState<string | null>(
    () => {
      const active = initialSeasons.find((s) => s.is_active);
      return active?.id ?? initialSeasons[0]?.id ?? null;
    },
  );
  const [splits, setSplits] = useState<Split[]>([]);
  const [loadingSplits, setLoadingSplits] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSplit, setNewSplit] = useState({ name: '', split_order: 1 });
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  // Fetch splits when season changes
  useEffect(() => {
    if (!selectedSeasonId) {
      setSplits([]);
      return;
    }

    const fetchSplits = async () => {
      setLoadingSplits(true);
      setError(null);

      const { data, error } = await supabase
        .from('splits')
        .select('*')
        .eq('season_id', selectedSeasonId)
        .order('split_order', { ascending: true });

      if (error) {
        setError(error.message);
      } else {
        setSplits(data ?? []);
        setNewSplit((prev) => ({
          ...prev,
          split_order: (data?.length ?? 0) + 1,
        }));
      }
      setLoadingSplits(false);
    };

    fetchSplits();
  }, [selectedSeasonId, supabase.from]);

  const refreshSplits = async () => {
    if (!selectedSeasonId) return;

    const { data } = await supabase
      .from('splits')
      .select('*')
      .eq('season_id', selectedSeasonId)
      .order('split_order', { ascending: true });

    if (data) {
      setSplits(data);
      setNewSplit((prev) => ({ ...prev, split_order: data.length + 1 }));
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeasonId) return;

    setSaving(true);
    setError(null);

    const { error } = await supabase.from('splits').insert({
      season_id: selectedSeasonId,
      name: newSplit.name,
      split_order: newSplit.split_order,
      is_active: false,
    });

    if (error) {
      setError(error.message);
    } else {
      setNewSplit({ name: '', split_order: splits.length + 2 });
      setShowCreateForm(false);
      await refreshSplits();
      router.refresh();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        '¿Estas seguro de eliminar este split? Se eliminaran tambien sus divisiones.',
      )
    )
      return;

    const { error } = await supabase.from('splits').delete().eq('id', id);

    if (error) {
      setError(error.message);
    } else {
      await refreshSplits();
      router.refresh();
    }
  };

  const handleActivate = async (id: string) => {
    setError(null);

    // First, deactivate all splits in this season
    const { error: deactivateError } = await supabase
      .from('splits')
      .update({ is_active: false })
      .eq('season_id', selectedSeasonId as string);

    if (deactivateError) {
      setError(deactivateError.message);
      return;
    }

    // Then activate the selected one
    const { error: activateError } = await supabase
      .from('splits')
      .update({ is_active: true })
      .eq('id', id);

    if (activateError) {
      setError(activateError.message);
    } else {
      await refreshSplits();
      router.refresh();
    }
  };

  const handleDeactivate = async (id: string) => {
    const { error } = await supabase
      .from('splits')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      setError(error.message);
    } else {
      await refreshSplits();
      router.refresh();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Season Selector */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-xl font-bold text-retro-gold-500 uppercase tracking-wider">
          Splits
        </h1>

        <div className="flex items-center gap-4">
          {/* Season Selector */}
          <div className="flex items-center gap-3">
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
              className="
                px-4 py-2
                bg-jacksons-purple-950 text-white
                border-4 border-jacksons-purple-600
                focus:outline-none focus:border-retro-gold-500
                cursor-pointer
              "
            >
              <option value="">Seleccionar temporada</option>
              {initialSeasons.map((season) => (
                <option key={season.id} value={season.id}>
                  {season.name} ({season.year}) {season.is_active ? '★' : ''}
                </option>
              ))}
            </select>
          </div>

          {selectedSeasonId && (
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
              + Nuevo Split
            </button>
          )}
        </div>
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

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-jacksons-purple-800 border-4 border-jacksons-purple-600 p-6 shadow-[4px_4px_0px_0px_#1a1a1a] w-full max-w-md">
            <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-4">
              Nuevo Split
            </h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-jacksons-purple-200 text-sm uppercase tracking-wide mb-2"
                >
                  Nombre
                </label>
                <input
                  id="name"
                  type="text"
                  value={newSplit.name}
                  onChange={(e) =>
                    setNewSplit({ ...newSplit, name: e.target.value })
                  }
                  required
                  placeholder="Ej: Split 1"
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
                <label
                  htmlFor="split_order"
                  className="block text-jacksons-purple-200 text-sm uppercase tracking-wide mb-2"
                >
                  Orden
                </label>
                <input
                  id="split_order"
                  type="number"
                  min="1"
                  value={newSplit.split_order}
                  onChange={(e) =>
                    setNewSplit({
                      ...newSplit,
                      split_order: parseInt(e.target.value, 10),
                    })
                  }
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
            Selecciona una temporada para gestionar sus splits.
          </p>
        </div>
      ) : loadingSplits ? (
        <div className="bg-jacksons-purple-800 border-4 border-jacksons-purple-600 p-8 shadow-[4px_4px_0px_0px_#1a1a1a] text-center">
          <p className="text-jacksons-purple-300">Cargando splits...</p>
        </div>
      ) : (
        <div className="bg-jacksons-purple-800 border-4 border-jacksons-purple-600 shadow-[4px_4px_0px_0px_#1a1a1a] overflow-hidden">
          {splits.length === 0 ? (
            <div className="p-8 text-center text-jacksons-purple-300">
              No hay splits creados para esta temporada.
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-jacksons-purple-900 border-b-4 border-jacksons-purple-600">
                  <th className="px-6 py-4 text-left text-sm font-bold text-retro-gold-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-retro-gold-500 uppercase tracking-wider">
                    Orden
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
                {splits.map((split) => (
                  <tr
                    key={split.id}
                    className="border-b-2 border-jacksons-purple-700 hover:bg-jacksons-purple-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      {split.is_active ? (
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-600 border-2 border-green-800 text-white text-xs font-bold uppercase">
                          <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-jacksons-purple-600 border-2 border-jacksons-purple-800 text-jacksons-purple-200 text-xs font-bold uppercase">
                          Inactivo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-jacksons-purple-600 border-2 border-jacksons-purple-500 text-white font-bold text-sm">
                        {split.split_order}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white font-medium">
                      {split.name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {split.is_active ? (
                          <button
                            type="button"
                            onClick={() => handleDeactivate(split.id)}
                            className="
                              px-4 py-2
                              bg-orange-500 text-white
                              border-2 border-orange-700
                              text-xs font-bold uppercase
                              hover:bg-orange-400
                              transition-all duration-100
                            "
                          >
                            Desactivar
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleActivate(split.id)}
                            className="
                              px-4 py-2
                              bg-green-600 text-white
                              border-2 border-green-800
                              text-xs font-bold uppercase
                              hover:bg-green-500
                              transition-all duration-100
                            "
                          >
                            Activar
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDelete(split.id)}
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
