'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  AdminButton,
  AdminErrorBanner,
  AdminInput,
  AdminModal,
} from '@/components/admin/ui';
import { createClient } from '@/lib/supabase/client';
import type { League, Season, Split } from '@/lib/types/database.types';

interface DivisionsManagerProps {
  initialSeasons: Season[];
}

export default function DivisionsManager({
  initialSeasons,
}: DivisionsManagerProps) {
  const router = useRouter();
  const [selectedSeasonId, setSelectedSeasonId] = useState<string | null>(
    () => {
      const active = initialSeasons.find((s) => s.is_active);
      return active?.id ?? initialSeasons[0]?.id ?? null;
    },
  );
  const [splits, setSplits] = useState<Split[]>([]);
  const [selectedSplitId, setSelectedSplitId] = useState<string | null>(null);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loadingSplits, setLoadingSplits] = useState(false);
  const [loadingLeagues, setLoadingLeagues] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newLeague, setNewLeague] = useState({
    tier_name: '',
    tier_priority: 1,
  });
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

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
        const splitsData = (data ?? []) as Split[];
        setSplits(splitsData);
        const activeSplit =
          splitsData.find((s) => s.is_active) ?? splitsData[0];
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
        setNewLeague((prev) => ({
          ...prev,
          tier_priority: (data?.length ?? 0) + 1,
        }));
      }
      setLoadingLeagues(false);
    };

    fetchLeagues();
  }, [selectedSplitId, supabase.from]);

  const refreshLeagues = async () => {
    if (!selectedSplitId) return;

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
      router.refresh();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estas seguro de eliminar esta division?')) return;

    const { error } = await supabase.from('leagues').delete().eq('id', id);

    if (error) {
      setError(error.message);
    } else {
      await refreshLeagues();
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
            onChange={(e) => setSelectedSeasonId(e.target.value || null)}
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
            onChange={(e) => setSelectedSplitId(e.target.value || null)}
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
                          onClick={() => handleDelete(league.id)}
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
