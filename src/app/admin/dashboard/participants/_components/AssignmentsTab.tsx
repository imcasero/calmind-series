'use client';

import { useEffect, useState } from 'react';
import {
  AdminBadge,
  AdminButton,
  AdminCard,
  AdminConfirmModal,
  AdminErrorBanner,
  AdminModal,
  AdminSelect,
} from '@/components/admin/ui';
import { useLeagueSelector } from '@/lib/hooks/useLeagueSelector';
import type { Season, Trainer } from '@/lib/types/database.types';
import { cn } from '@/lib/utils';
import { EmptyPanel, SelectorField, TrainerAvatar } from './shared';
import { useParticipantsManager } from './useParticipantsManager';

interface Props {
  initialSeasons: Season[];
  trainers: Trainer[];
  onPendingLivesChange?: (count: number) => void;
}

export default function AssignmentsTab({
  initialSeasons,
  trainers,
  onPendingLivesChange,
}: Props) {
  const {
    splits,
    leagues,
    selectedSeasonId,
    selectedSplitId,
    selectedLeagueId,
    setSeasonId,
    setSplitId,
    setLeagueId,
    loadingSplits,
    loadingLeagues,
    error: selectorError,
    clearError: clearSelectorError,
  } = useLeagueSelector({ initialSeasons, depth: 'season-split-league' });

  const {
    participants,
    loading,
    error: managerError,
    clearError: clearManagerError,
    pendingLivesCount,
    hasLivesChanges,
    hasPendingLivesChange,
    getLives,
    setLives,
    assign,
    remove,
    saveLives,
    discardLives,
  } = useParticipantsManager({
    leagueId: selectedLeagueId,
    splitId: selectedSplitId,
  });

  const [showAssign, setShowAssign] = useState(false);
  const [selectedTrainerId, setSelectedTrainerId] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const error = localError ?? selectorError ?? managerError;
  const dismissError = () => {
    setLocalError(null);
    clearSelectorError();
    clearManagerError();
  };

  useEffect(() => {
    if (leagues.length > 0 && !selectedLeagueId) {
      setLeagueId(leagues[0].id);
    }
  }, [leagues, selectedLeagueId, setLeagueId]);

  useEffect(() => {
    onPendingLivesChange?.(pendingLivesCount);
  }, [pendingLivesCount, onPendingLivesChange]);

  const availableTrainers = trainers.filter(
    (t) => !participants.some((p) => p.trainer_id === t.id),
  );

  const closeAssign = () => {
    setShowAssign(false);
    setSelectedTrainerId('');
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    const trainer = trainers.find((t) => t.id === selectedTrainerId);
    if (!trainer) {
      setLocalError('Entrenador no encontrado');
      return;
    }
    setSaving(true);
    setLocalError(null);
    const result = await assign(trainer);
    if (!result.ok) {
      setLocalError(result.error);
    } else {
      closeAssign();
    }
    setSaving(false);
  };

  const handleConfirmRemove = async () => {
    if (!confirmRemoveId) return;
    const id = confirmRemoveId;
    setConfirmRemoveId(null);
    const result = await remove(id);
    if (!result.ok) setLocalError(result.error);
  };

  const handleSaveLives = async () => {
    setSaving(true);
    setLocalError(null);
    const result = await saveLives();
    if (!result.ok) setLocalError(result.error);
    setSaving(false);
  };

  return (
    <div className="flex flex-col gap-4">
      {error && <AdminErrorBanner message={error} onDismiss={dismissError} />}

      <AdminCard className="flex flex-wrap items-center gap-3">
        <SelectorField
          label="Temporada"
          value={selectedSeasonId ?? ''}
          onChange={(v) => setSeasonId(v || null)}
        >
          <option value="">Seleccionar</option>
          {initialSeasons.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} {s.is_active ? '★' : ''}
            </option>
          ))}
        </SelectorField>

        <SelectorField
          label="Split"
          value={selectedSplitId ?? ''}
          onChange={(v) => setSplitId(v || null)}
          disabled={!selectedSeasonId || loadingSplits}
        >
          <option value="">
            {loadingSplits ? 'Cargando...' : 'Seleccionar'}
          </option>
          {splits.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} {s.is_active ? '★' : ''}
            </option>
          ))}
        </SelectorField>

        <SelectorField
          label="División"
          value={selectedLeagueId ?? ''}
          onChange={(v) => setLeagueId(v || null)}
          disabled={!selectedSplitId || loadingLeagues}
        >
          <option value="">
            {loadingLeagues ? 'Cargando...' : 'Seleccionar'}
          </option>
          {leagues.map((l) => (
            <option key={l.id} value={l.id}>
              {l.tier_name}
            </option>
          ))}
        </SelectorField>

        {selectedLeagueId && availableTrainers.length > 0 && (
          <AdminButton tone="primary" onClick={() => setShowAssign(true)}>
            + Asignar
          </AdminButton>
        )}
      </AdminCard>

      {hasLivesChanges && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-[3px] border-px-gold bg-px-deep p-4">
          <span className="font-pixel text-[10px] uppercase tracking-wider text-px-gold">
            {pendingLivesCount} cambio(s) sin guardar
          </span>
          <div className="flex gap-2">
            <AdminButton tone="ghost" size="sm" onClick={discardLives}>
              Descartar
            </AdminButton>
            <AdminButton
              tone="success"
              size="sm"
              onClick={handleSaveLives}
              disabled={saving}
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </AdminButton>
          </div>
        </div>
      )}

      {showAssign && (
        <AdminModal title="Asignar Entrenador" onClose={closeAssign}>
          <form onSubmit={handleAssign} className="flex flex-col gap-4">
            <AdminSelect
              id="trainer-select"
              label="Entrenador"
              value={selectedTrainerId}
              onChange={(e) => setSelectedTrainerId(e.target.value)}
              required
            >
              <option value="">Seleccionar entrenador</option>
              {availableTrainers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nickname}
                </option>
              ))}
            </AdminSelect>
            <div className="flex gap-3 pt-2">
              <AdminButton
                tone="ghost"
                onClick={closeAssign}
                className="flex-1 justify-center"
              >
                Cancelar
              </AdminButton>
              <AdminButton
                type="submit"
                tone="primary"
                disabled={saving || !selectedTrainerId}
                className="flex-1 justify-center"
              >
                {saving ? 'Guardando...' : 'Asignar'}
              </AdminButton>
            </div>
          </form>
        </AdminModal>
      )}

      {!selectedLeagueId ? (
        <EmptyPanel text="Selecciona temporada, split y división para ver los participantes." />
      ) : loading ? (
        <EmptyPanel text="Cargando participantes..." />
      ) : participants.length === 0 ? (
        <div className="border-[3px] border-px-border bg-px-elev shadow-[4px_4px_0_0_var(--color-px-deep)]">
          <p className="p-8 text-center font-retro text-lg text-px-ink-dim">
            No hay participantes asignados a esta división.
          </p>
        </div>
      ) : (
        <div className="border-[3px] border-px-border bg-px-elev shadow-[4px_4px_0_0_var(--color-px-deep)]">
          <table className="pixel-table">
            <thead>
              <tr>
                <th>Seed</th>
                <th>Entrenador</th>
                <th>Vidas</th>
                <th>Estado</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {participants.map((p) => {
                const currentLives = getLives(p);
                const hasChange = hasPendingLivesChange(p.id);
                return (
                  <tr
                    key={p.id}
                    className={hasChange ? 'bg-px-base' : undefined}
                  >
                    <td>
                      <span className="grid size-8 place-items-center border-2 border-px-border bg-px-deep font-num text-sm text-px-ink">
                        {p.initial_seed ?? '-'}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <TrainerAvatar
                          url={p.trainer?.avatar_url ?? null}
                          nickname={p.trainer?.nickname ?? '?'}
                          small
                        />
                        <span className="text-px-ink">
                          {p.trainer?.nickname ?? 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setLives(p.id, currentLives, -1)}
                          disabled={currentLives <= 0}
                          className="grid size-7 place-items-center border-2 border-px-deep bg-px-danger font-pixel text-xs text-px-ink disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          -
                        </button>
                        <span
                          className={cn(
                            'min-w-[3rem] text-center font-num font-bold',
                            hasChange ? 'text-px-magenta' : 'text-px-gold',
                          )}
                        >
                          {currentLives}
                        </span>
                        <button
                          type="button"
                          onClick={() => setLives(p.id, currentLives, 1)}
                          className="grid size-7 place-items-center border-2 border-px-deep bg-px-success font-pixel text-xs text-px-deep"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td>
                      <AdminBadge
                        tone={p.status === 'active' ? 'success' : 'neutral'}
                      >
                        {p.status ?? 'active'}
                      </AdminBadge>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-2">
                        <AdminButton
                          tone="danger"
                          size="sm"
                          onClick={() => setConfirmRemoveId(p.id)}
                        >
                          Quitar
                        </AdminButton>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <AdminConfirmModal
        open={confirmRemoveId !== null}
        title="Quitar de la división"
        message="¿Quitar este entrenador de la division?"
        variant="danger"
        onConfirm={handleConfirmRemove}
        onCancel={() => setConfirmRemoveId(null)}
      />
    </div>
  );
}
