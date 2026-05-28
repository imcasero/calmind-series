'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  AdminBadge,
  AdminButton,
  AdminErrorBanner,
  AdminInput,
  AdminModal,
} from '@/components/admin/ui';
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
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-pixel text-lg uppercase tracking-wider text-px-gold">
          Temporadas
        </h1>
        <AdminButton tone="primary" onClick={() => setShowCreateForm(true)}>
          + Nueva Temporada
        </AdminButton>
      </div>

      {error && (
        <AdminErrorBanner message={error} onDismiss={() => setError(null)} />
      )}

      {/* Create Modal */}
      {showCreateForm && (
        <AdminModal
          title="Nueva Temporada"
          onClose={() => setShowCreateForm(false)}
        >
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <AdminInput
              id="name"
              label="Nombre"
              type="text"
              value={newSeason.name}
              onChange={(e) =>
                setNewSeason({ ...newSeason, name: e.target.value })
              }
              required
              placeholder="Ej: Temporada 1"
            />
            <AdminInput
              id="year"
              label="Año"
              type="number"
              value={newSeason.year}
              onChange={(e) =>
                setNewSeason({
                  ...newSeason,
                  year: parseInt(e.target.value, 10),
                })
              }
              required
            />
            <div className="flex gap-3 pt-2">
              <AdminButton
                tone="ghost"
                onClick={() => setShowCreateForm(false)}
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
                {saving ? 'Guardando...' : 'Crear'}
              </AdminButton>
            </div>
          </form>
        </AdminModal>
      )}

      {/* Table */}
      <div className="border-[3px] border-px-border bg-px-elev shadow-[4px_4px_0_0_var(--color-px-deep)]">
        {initialSeasons.length === 0 ? (
          <p className="p-8 text-center font-retro text-lg text-px-ink-dim">
            No hay temporadas creadas.
          </p>
        ) : (
          <table className="pixel-table">
            <thead>
              <tr>
                <th>Estado</th>
                <th>Nombre</th>
                <th>Año</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {initialSeasons.map((season) => (
                <tr key={season.id}>
                  <td>
                    {season.is_active ? (
                      <AdminBadge tone="success">
                        <span className="blink">●</span> Activa
                      </AdminBadge>
                    ) : (
                      <AdminBadge tone="neutral">Inactiva</AdminBadge>
                    )}
                  </td>
                  <td className="text-px-ink">{season.name}</td>
                  <td className="font-num text-px-ink-soft">{season.year}</td>
                  <td>
                    <div className="flex items-center justify-end gap-2">
                      {season.is_active ? (
                        <AdminButton
                          tone="default"
                          size="sm"
                          onClick={() => handleDeactivate(season.id)}
                        >
                          Desactivar
                        </AdminButton>
                      ) : (
                        <AdminButton
                          tone="success"
                          size="sm"
                          onClick={() => handleActivate(season.id)}
                        >
                          Activar
                        </AdminButton>
                      )}
                      <AdminButton
                        tone="danger"
                        size="sm"
                        onClick={() => handleDelete(season.id)}
                      >
                        Eliminar
                      </AdminButton>
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
