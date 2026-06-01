'use client';

import { startTransition, useOptimistic, useState } from 'react';
import {
  AdminBadge,
  AdminButton,
  AdminConfirmModal,
  AdminErrorBanner,
  AdminInput,
  AdminModal,
} from '@/components/admin/ui';
import type { Season } from '@/lib/types/database.types';
import { SeasonCreateInputSchema } from '@/lib/types/schemas';
import {
  activateSeasonAction,
  createSeasonAction,
  deactivateSeasonAction,
  deleteSeasonAction,
} from '../_actions';

interface SeasonsManagerProps {
  initialSeasons: Season[];
}

type OptimisticAction =
  | { type: 'create'; season: Season }
  | { type: 'delete'; id: string }
  | { type: 'activate'; id: string }
  | { type: 'deactivate'; id: string };

function optimisticReducer(
  state: Season[],
  action: OptimisticAction,
): Season[] {
  switch (action.type) {
    case 'create':
      return [...state, action.season];
    case 'delete':
      return state.filter((s) => s.id !== action.id);
    case 'activate':
      return state.map((s) => ({ ...s, is_active: s.id === action.id }));
    case 'deactivate':
      return state.map((s) =>
        s.id === action.id ? { ...s, is_active: false } : s,
      );
    default:
      return state;
  }
}

export default function SeasonsManager({
  initialSeasons,
}: SeasonsManagerProps) {
  const [optimisticSeasons, applyOptimistic] = useOptimistic(
    initialSeasons,
    optimisticReducer,
  );
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSeason, setNewSeason] = useState({
    name: '',
    year: new Date().getFullYear(),
  });
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    id: string | null;
  }>({ open: false, id: null });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const parsed = SeasonCreateInputSchema.safeParse({
      name: newSeason.name,
      year: newSeason.year,
    });
    if (!parsed.success) {
      setError(parsed.error.issues.map((i) => i.message).join(' · '));
      setSaving(false);
      return;
    }

    const tempSeason: Season = {
      id: `optimistic-${crypto.randomUUID()}`,
      name: parsed.data.name,
      year: parsed.data.year,
      is_active: false,
      created_at: new Date().toISOString(),
    };

    startTransition(async () => {
      applyOptimistic({ type: 'create', season: tempSeason });
      const result = await createSeasonAction(parsed.data);
      if (!result.ok) {
        setError(result.error);
      } else {
        setNewSeason({ name: '', year: new Date().getFullYear() });
        setShowCreateForm(false);
      }
      setSaving(false);
    });
  };

  const requestDelete = (id: string) => {
    setConfirmDelete({ open: true, id });
  };

  const cancelDelete = () => {
    setConfirmDelete({ open: false, id: null });
  };

  const confirmDeleteAction = () => {
    const id = confirmDelete.id;
    if (!id) return;
    setConfirmDelete({ open: false, id: null });

    startTransition(async () => {
      applyOptimistic({ type: 'delete', id });
      const result = await deleteSeasonAction(id);
      if (!result.ok) {
        setError(result.error);
      }
    });
  };

  const handleActivate = (id: string) => {
    setError(null);
    startTransition(async () => {
      applyOptimistic({ type: 'activate', id });
      const result = await activateSeasonAction(id);
      if (!result.ok) {
        setError(result.error);
      }
    });
  };

  const handleDeactivate = (id: string) => {
    startTransition(async () => {
      applyOptimistic({ type: 'deactivate', id });
      const result = await deactivateSeasonAction(id);
      if (!result.ok) {
        setError(result.error);
      }
    });
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

      <AdminConfirmModal
        open={confirmDelete.open}
        title="Eliminar temporada"
        message="¿Estás seguro de eliminar esta temporada?"
        variant="danger"
        onConfirm={confirmDeleteAction}
        onCancel={cancelDelete}
      />

      {/* Table */}
      <div className="border-[3px] border-px-border bg-px-elev shadow-[4px_4px_0_0_var(--color-px-deep)]">
        {optimisticSeasons.length === 0 ? (
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
              {optimisticSeasons.map((season) => (
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
                        onClick={() => requestDelete(season.id)}
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
