'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  AdminButton,
  AdminConfirmModal,
  AdminErrorBanner,
  AdminInput,
  AdminModal,
} from '@/components/admin/ui';
import { useLeagueSelector } from '@/lib/hooks/useLeagueSelector';
import { createClient } from '@/lib/supabase/client';
import type { Season } from '@/lib/types/database.types';
import { LeagueCreateInputSchema } from '@/lib/types/schemas';

interface DivisionsManagerProps {
  initialSeasons: Season[];
}

export default function DivisionsManager({
  initialSeasons,
}: DivisionsManagerProps) {
  const router = useRouter();
  const {
    splits,
    leagues,
    selectedSeasonId,
    selectedSplitId,
    setSeasonId,
    setSplitId,
    loadingSplits,
    loadingLeagues,
    error: selectorError,
    clearError: clearSelectorError,
    refresh,
  } = useLeagueSelector({ initialSeasons, depth: 'season-split-league' });
  const [localError, setLocalError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newLeague, setNewLeague] = useState({
    tier_name: '',
    tier_priority: 1,
  });
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    id: string | null;
  }>({ open: false, id: null });

  const supabase = createClient();

  const error = localError ?? selectorError;
  const setError = (value: string | null) => {
    setLocalError(value);
    if (value === null) clearSelectorError();
  };

  // Keep create-form `tier_priority` in sync with the loaded leagues length.
  useEffect(() => {
    setNewLeague((prev) => ({ ...prev, tier_priority: leagues.length + 1 }));
  }, [leagues.length]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSplitId) return;

    setSaving(true);
    setError(null);

    const parsed = LeagueCreateInputSchema.safeParse({
      tier_name: newLeague.tier_name,
      tier_priority: newLeague.tier_priority,
    });
    if (!parsed.success) {
      setError(parsed.error.issues.map((i) => i.message).join(' · '));
      setSaving(false);
      return;
    }

    const { error } = await supabase.from('leagues').insert({
      split_id: selectedSplitId,
      ...parsed.data,
    });

    if (error) {
      setError(error.message);
    } else {
      setNewLeague({ tier_name: '', tier_priority: leagues.length + 2 });
      setShowCreateForm(false);
      await refresh();
      router.refresh();
    }
    setSaving(false);
  };

  const requestDelete = (id: string) => {
    setConfirmDelete({ open: true, id });
  };

  const cancelDelete = () => {
    setConfirmDelete({ open: false, id: null });
  };

  const confirmDeleteAction = async () => {
    const id = confirmDelete.id;
    if (!id) return;
    setConfirmDelete({ open: false, id: null });

    const { error } = await supabase.from('leagues').delete().eq('id', id);

    if (error) {
      setError(error.message);
    } else {
      await refresh();
      router.refresh();
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-pixel text-lg uppercase tracking-wider text-px-gold">
          Divisiones
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
                {season.name} {season.is_active ? '★' : ''}
              </option>
            ))}
          </select>

          <span className="font-pixel text-[9px] uppercase tracking-wider text-px-ink-dim">
            Split
          </span>
          <select
            value={selectedSplitId ?? ''}
            onChange={(e) => setSplitId(e.target.value || null)}
            disabled={!selectedSeasonId || loadingSplits}
            className="pixel-input w-auto cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
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

          {selectedSplitId && (
            <AdminButton tone="primary" onClick={() => setShowCreateForm(true)}>
              + Nueva División
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
          title="Nueva División"
          onClose={() => setShowCreateForm(false)}
        >
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <AdminInput
              id="tier_name"
              label="Nombre"
              type="text"
              value={newLeague.tier_name}
              onChange={(e) =>
                setNewLeague({ ...newLeague, tier_name: e.target.value })
              }
              required
              placeholder="Ej: Primera División"
            />
            <AdminInput
              id="tier_priority"
              label="Prioridad (1 = más alta)"
              type="number"
              min="1"
              value={newLeague.tier_priority}
              onChange={(e) =>
                setNewLeague({
                  ...newLeague,
                  tier_priority: parseInt(e.target.value, 10),
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
        title="Eliminar división"
        message="¿Estas seguro de eliminar esta division?"
        variant="danger"
        onConfirm={confirmDeleteAction}
        onCancel={cancelDelete}
      />

      {/* Content */}
      {!selectedSeasonId ? (
        <EmptyPanel text="Selecciona una temporada para ver sus divisiones." />
      ) : !selectedSplitId ? (
        <EmptyPanel
          text={
            splits.length === 0
              ? 'Esta temporada no tiene splits. Crea uno primero en la sección Splits.'
              : 'Selecciona un split para ver sus divisiones.'
          }
        />
      ) : loadingLeagues ? (
        <EmptyPanel text="Cargando divisiones..." />
      ) : (
        <div className="border-[3px] border-px-border bg-px-elev shadow-[4px_4px_0_0_var(--color-px-deep)]">
          {leagues.length === 0 ? (
            <p className="p-8 text-center font-retro text-lg text-px-ink-dim">
              No hay divisiones creadas para este split.
            </p>
          ) : (
            <table className="pixel-table">
              <thead>
                <tr>
                  <th>Prioridad</th>
                  <th>Nombre</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {leagues.map((league) => (
                  <tr key={league.id}>
                    <td>
                      <span className="grid size-8 place-items-center border-2 border-px-border bg-px-deep font-num text-sm text-px-ink">
                        {league.tier_priority}
                      </span>
                    </td>
                    <td className="text-px-ink">{league.tier_name}</td>
                    <td>
                      <div className="flex items-center justify-end gap-2">
                        <AdminButton
                          tone="danger"
                          size="sm"
                          onClick={() => requestDelete(league.id)}
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
