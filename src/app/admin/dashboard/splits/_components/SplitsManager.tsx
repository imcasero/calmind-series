'use client';

import { startTransition, useEffect, useOptimistic, useState } from 'react';
import {
  AdminBadge,
  AdminButton,
  AdminConfirmModal,
  AdminErrorBanner,
  AdminInput,
  AdminModal,
} from '@/components/admin/ui';
import { useLeagueSelector } from '@/lib/hooks/useLeagueSelector';
import type { Season, Split } from '@/lib/types/database.types';
import { SplitCreateInputSchema } from '@/lib/types/schemas';
import {
  activateSplitAction,
  createSplitAction,
  deactivateSplitAction,
  deleteSplitAction,
} from '../_actions';

interface SplitsManagerProps {
  initialSeasons: Season[];
}

type SplitOptimistic =
  | { type: 'create'; split: Split }
  | { type: 'delete'; id: string }
  | { type: 'activate'; id: string; seasonId: string }
  | { type: 'deactivate'; id: string };

function optimisticReducer(state: Split[], action: SplitOptimistic): Split[] {
  switch (action.type) {
    case 'create':
      return [...state, action.split].sort(
        (a, b) => a.split_order - b.split_order,
      );
    case 'delete':
      return state.filter((s) => s.id !== action.id);
    case 'activate':
      // Mirror seasons pilot: target active, every other split in season inactive.
      return state.map((s) => {
        if (s.id === action.id) return { ...s, is_active: true };
        if (s.season_id === action.seasonId) return { ...s, is_active: false };
        return s;
      });
    case 'deactivate':
      return state.map((s) =>
        s.id === action.id ? { ...s, is_active: false } : s,
      );
    default:
      return state;
  }
}

export default function SplitsManager({ initialSeasons }: SplitsManagerProps) {
  const {
    splits,
    selectedSeasonId,
    setSeasonId,
    loadingSplits,
    error: selectorError,
    clearError: clearSelectorError,
    refresh,
  } = useLeagueSelector({ initialSeasons, depth: 'season-split' });
  const [optimisticSplits, applyOptimistic] = useOptimistic(
    splits,
    optimisticReducer,
  );
  const [localError, setLocalError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSplit, setNewSplit] = useState({ name: '', split_order: 1 });
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    id: string | null;
  }>({ open: false, id: null });

  const error = localError ?? selectorError;
  const setError = (value: string | null) => {
    setLocalError(value);
    if (value === null) clearSelectorError();
  };

  // Keep create-form `split_order` in sync with the loaded splits length.
  useEffect(() => {
    setNewSplit((prev) => ({ ...prev, split_order: splits.length + 1 }));
  }, [splits.length]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeasonId) return;

    setSaving(true);
    setError(null);

    const parsed = SplitCreateInputSchema.safeParse({
      name: newSplit.name,
      split_order: newSplit.split_order,
    });
    if (!parsed.success) {
      setError(parsed.error.issues.map((i) => i.message).join(' · '));
      setSaving(false);
      return;
    }

    const tempSplit: Split = {
      id: `optimistic-${crypto.randomUUID()}`,
      season_id: selectedSeasonId,
      name: parsed.data.name,
      split_order: parsed.data.split_order,
      is_active: false,
      created_at: new Date().toISOString(),
    };

    startTransition(async () => {
      applyOptimistic({ type: 'create', split: tempSplit });
      const result = await createSplitAction(selectedSeasonId, parsed.data);
      if (!result.ok) {
        setError(result.error);
      } else {
        setNewSplit({ name: '', split_order: splits.length + 2 });
        setShowCreateForm(false);
        await refresh();
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
    if (!id || !selectedSeasonId) return;
    setConfirmDelete({ open: false, id: null });

    startTransition(async () => {
      applyOptimistic({ type: 'delete', id });
      const result = await deleteSplitAction(id, selectedSeasonId);
      if (!result.ok) {
        setError(result.error);
      } else {
        await refresh();
      }
    });
  };

  const handleActivate = (id: string) => {
    if (!selectedSeasonId) return;
    setError(null);
    const seasonId = selectedSeasonId;
    startTransition(async () => {
      applyOptimistic({ type: 'activate', id, seasonId });
      const result = await activateSplitAction(id, seasonId);
      if (!result.ok) {
        setError(result.error);
      } else {
        await refresh();
      }
    });
  };

  const handleDeactivate = (id: string) => {
    startTransition(async () => {
      applyOptimistic({ type: 'deactivate', id });
      const result = await deactivateSplitAction(id);
      if (!result.ok) {
        setError(result.error);
      } else {
        await refresh();
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-pixel text-lg uppercase tracking-wider text-px-gold">
          Splits
        </h1>

        <div className="flex flex-wrap items-center gap-3">
          <span className="font-pixel text-[9px] uppercase tracking-wider text-px-ink-dim">
            Temporada
          </span>
          <select
            value={selectedSeasonId ?? ''}
            onChange={(e) => setSeasonId(e.target.value || null)}
            className="pixel-input w-auto cursor-pointer"
          >
            <option value="">Seleccionar</option>
            {initialSeasons.map((season) => (
              <option key={season.id} value={season.id}>
                {season.name} ({season.year}) {season.is_active ? '★' : ''}
              </option>
            ))}
          </select>
          {selectedSeasonId && (
            <AdminButton tone="primary" onClick={() => setShowCreateForm(true)}>
              + Nuevo Split
            </AdminButton>
          )}
        </div>
      </div>

      {error && (
        <AdminErrorBanner message={error} onDismiss={() => setError(null)} />
      )}

      {/* Create Modal */}
      {showCreateForm && (
        <AdminModal
          title="Nuevo Split"
          onClose={() => setShowCreateForm(false)}
        >
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <AdminInput
              id="name"
              label="Nombre"
              type="text"
              value={newSplit.name}
              onChange={(e) =>
                setNewSplit({ ...newSplit, name: e.target.value })
              }
              required
              placeholder="Ej: Split 1"
            />
            <AdminInput
              id="split_order"
              label="Orden"
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
        title="Eliminar split"
        message="¿Estas seguro de eliminar este split? Se eliminaran tambien sus divisiones."
        variant="danger"
        onConfirm={confirmDeleteAction}
        onCancel={cancelDelete}
      />

      {/* Content */}
      {!selectedSeasonId ? (
        <EmptyPanel text="Selecciona una temporada para gestionar sus splits." />
      ) : loadingSplits ? (
        <EmptyPanel text="Cargando splits..." />
      ) : (
        <div className="border-[3px] border-px-border bg-px-elev shadow-[4px_4px_0_0_var(--color-px-deep)]">
          {optimisticSplits.length === 0 ? (
            <p className="p-8 text-center font-retro text-lg text-px-ink-dim">
              No hay splits creados para esta temporada.
            </p>
          ) : (
            <table className="pixel-table">
              <thead>
                <tr>
                  <th>Estado</th>
                  <th>Orden</th>
                  <th>Nombre</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {optimisticSplits.map((split) => (
                  <tr key={split.id}>
                    <td>
                      {split.is_active ? (
                        <AdminBadge tone="success">
                          <span className="blink">●</span> Activo
                        </AdminBadge>
                      ) : (
                        <AdminBadge tone="neutral">Inactivo</AdminBadge>
                      )}
                    </td>
                    <td>
                      <span className="grid size-8 place-items-center border-2 border-px-border bg-px-deep font-num text-sm text-px-ink">
                        {split.split_order}
                      </span>
                    </td>
                    <td className="text-px-ink">{split.name}</td>
                    <td>
                      <div className="flex items-center justify-end gap-2">
                        {split.is_active ? (
                          <AdminButton
                            tone="default"
                            size="sm"
                            onClick={() => handleDeactivate(split.id)}
                          >
                            Desactivar
                          </AdminButton>
                        ) : (
                          <AdminButton
                            tone="success"
                            size="sm"
                            onClick={() => handleActivate(split.id)}
                          >
                            Activar
                          </AdminButton>
                        )}
                        <AdminButton
                          tone="danger"
                          size="sm"
                          onClick={() => requestDelete(split.id)}
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
      )}
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
