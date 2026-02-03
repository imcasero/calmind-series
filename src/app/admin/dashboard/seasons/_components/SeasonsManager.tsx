'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Season } from '@/lib/types/database.types';

interface SeasonsManagerProps {
  initialSeasons: Season[];
}

export default function SeasonsManager({
  initialSeasons,
}: SeasonsManagerProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSeason, setNewSeason] = useState({
    name: '',
    year: new Date().getFullYear(),
  });
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const { error } = await supabase
      .from('seasons')
      .insert({ name: newSeason.name, year: newSeason.year, is_active: false });

    if (error) {
      setError(error.message);
    } else {
      setNewSeason({ name: '', year: new Date().getFullYear() });
      setShowCreateForm(false);
      router.refresh();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta temporada?')) return;

    const { error } = await supabase.from('seasons').delete().eq('id', id);

    if (error) {
      setError(error.message);
    } else {
      router.refresh();
    }
  };

  const handleActivate = async (id: string) => {
    setError(null);

    // First, deactivate all seasons
    const { error: deactivateError } = await supabase
      .from('seasons')
      .update({ is_active: false })
      .neq('id', id);

    if (deactivateError) {
      setError(deactivateError.message);
      return;
    }

    // Then activate the selected one
    const { error: activateError } = await supabase
      .from('seasons')
      .update({ is_active: true })
      .eq('id', id);

    if (activateError) {
      setError(activateError.message);
    } else {
      router.refresh();
    }
  };

  const handleDeactivate = async (id: string) => {
    const { error } = await supabase
      .from('seasons')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      setError(error.message);
    } else {
      router.refresh();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-retro-gold-500 uppercase tracking-wider">
          Temporadas
        </h1>
        <button
          type="button"
          onClick={() => setShowCreateForm(true)}
          className="
            px-6 py-3
            bg-retro-gold-500 text-jacksons-purple-950
            border-4 border-jacksons-purple-950
            font-bold uppercase tracking-wide text-sm
            shadow-[4px_4px_0px_0px_#1a1a1a]
            hover:translate-x-0.5 hover:translate-y-0.5
            hover:shadow-[2px_2px_0px_0px_#1a1a1a]
            transition-all duration-100
          "
        >
          + Nueva Temporada
        </button>
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
              Nueva Temporada
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
                  value={newSeason.name}
                  onChange={(e) =>
                    setNewSeason({ ...newSeason, name: e.target.value })
                  }
                  required
                  placeholder="Ej: Temporada 1"
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
                  htmlFor="year"
                  className="block text-jacksons-purple-200 text-sm uppercase tracking-wide mb-2"
                >
                  Año
                </label>
                <input
                  id="year"
                  type="number"
                  value={newSeason.year}
                  onChange={(e) =>
                    setNewSeason({
                      ...newSeason,
                      year: parseInt(e.target.value, 10),
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

      {/* Seasons Table */}
      <div className="bg-jacksons-purple-800 border-4 border-jacksons-purple-600 shadow-[4px_4px_0px_0px_#1a1a1a] overflow-hidden">
        {initialSeasons.length === 0 ? (
          <div className="p-8 text-center text-jacksons-purple-300">
            No hay temporadas creadas.
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-jacksons-purple-900 border-b-4 border-jacksons-purple-600">
                <th className="px-6 py-4 text-left text-sm font-bold text-retro-gold-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-retro-gold-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-retro-gold-500 uppercase tracking-wider">
                  Año
                </th>
                <th className="px-6 py-4 text-right text-sm font-bold text-retro-gold-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {initialSeasons.map((season) => (
                <tr
                  key={season.id}
                  className="border-b-2 border-jacksons-purple-700 hover:bg-jacksons-purple-700/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    {season.is_active ? (
                      <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-600 border-2 border-green-800 text-white text-xs font-bold uppercase">
                        <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
                        Activa
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 px-3 py-1 bg-jacksons-purple-600 border-2 border-jacksons-purple-800 text-jacksons-purple-200 text-xs font-bold uppercase">
                        Inactiva
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-white font-medium">
                    {season.name}
                  </td>
                  <td className="px-6 py-4 text-jacksons-purple-200">
                    {season.year}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {season.is_active ? (
                        <button
                          type="button"
                          onClick={() => handleDeactivate(season.id)}
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
                          onClick={() => handleActivate(season.id)}
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
                        onClick={() => handleDelete(season.id)}
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
    </div>
  );
}
