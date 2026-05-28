'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  AdminBadge,
  AdminButton,
  AdminErrorBanner,
  AdminInput,
  AdminModal,
} from '@/components/admin/ui';
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
            onChange={(e) => setSelectedSeasonId(e.target.value || null)}
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

      {/* Content */}
      {!selectedSeasonId ? (
        <EmptyPanel text="Selecciona una temporada para gestionar sus splits." />
      ) : loadingSplits ? (
        <EmptyPanel text="Cargando splits..." />
      ) : (
        <div className="border-[3px] border-px-border bg-px-elev shadow-[4px_4px_0_0_var(--color-px-deep)]">
          {splits.length === 0 ? (
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
                {splits.map((split) => (
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
                          onClick={() => handleDelete(split.id)}
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
