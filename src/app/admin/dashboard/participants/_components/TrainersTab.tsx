'use client';

import { useMemo, useState } from 'react';
import {
  AdminButton,
  AdminCard,
  AdminConfirmModal,
  AdminErrorBanner,
  AdminInput,
  AdminModal,
  AdminTextarea,
} from '@/components/admin/ui';
import type { Trainer } from '@/lib/types/database.types';
import { TrainerInputSchema } from '@/lib/types/schemas';
import { TrainerAvatar } from './shared';
import type { TrainersManager } from './useTrainersManager';

const PER_PAGE = 10;

const EMPTY_FORM = { nickname: '', avatar_url: '', bio: '' };

interface Props {
  manager: TrainersManager;
}

export default function TrainersTab({ manager }: Props) {
  const { trainers, create, update, remove } = manager;

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Trainer | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return trainers;
    const q = search.toLowerCase();
    return trainers.filter(
      (t) =>
        t.nickname.toLowerCase().includes(q) ||
        (t.bio?.toLowerCase().includes(q) ?? false),
    );
  }, [trainers, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return filtered.slice(start, start + PER_PAGE);
  }, [filtered, page]);

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const parsed = TrainerInputSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues.map((i) => i.message).join(' · '));
      setSaving(false);
      return;
    }

    const result = editing
      ? await update(editing.id, parsed.data, editing)
      : await create(parsed.data);

    if (!result.ok) {
      setError(result.error);
    } else {
      closeForm();
    }
    setSaving(false);
  };

  const handleEdit = (t: Trainer) => {
    setEditing(t);
    setForm({
      nickname: t.nickname,
      avatar_url: t.avatar_url ?? '',
      bio: t.bio ?? '',
    });
    setShowForm(true);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteId) return;
    const id = confirmDeleteId;
    setConfirmDeleteId(null);
    const result = await remove(id);
    if (!result.ok) setError(result.error);
  };

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <AdminErrorBanner message={error} onDismiss={() => setError(null)} />
      )}

      <AdminCard className="flex flex-wrap items-center justify-between gap-4">
        <input
          type="text"
          aria-label="Buscar"
          placeholder="Buscar por nickname o bio..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="pixel-input min-w-[250px]"
        />
        <AdminButton
          tone="primary"
          onClick={() => {
            setEditing(null);
            setForm(EMPTY_FORM);
            setShowForm(true);
          }}
        >
          + Nuevo Entrenador
        </AdminButton>
      </AdminCard>

      {showForm && (
        <AdminModal
          title={editing ? 'Editar Entrenador' : 'Nuevo Entrenador'}
          onClose={closeForm}
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <AdminInput
              id="nickname"
              label="Nickname *"
              type="text"
              value={form.nickname}
              onChange={(e) => setForm({ ...form, nickname: e.target.value })}
              required
              placeholder="Ej: AshKetchum"
            />
            <AdminInput
              id="avatar_url"
              label="Avatar URL"
              type="text"
              value={form.avatar_url}
              onChange={(e) => setForm({ ...form, avatar_url: e.target.value })}
              placeholder="https://..."
            />
            <AdminTextarea
              id="bio"
              label="Bio"
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Descripción del entrenador..."
              rows={3}
              className="resize-none"
            />
            <div className="flex gap-3 pt-2">
              <AdminButton
                tone="ghost"
                onClick={closeForm}
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
                {saving ? 'Guardando...' : 'Guardar'}
              </AdminButton>
            </div>
          </form>
        </AdminModal>
      )}

      <div className="border-[3px] border-px-border bg-px-elev shadow-[4px_4px_0_0_var(--color-px-deep)]">
        {filtered.length === 0 ? (
          <p className="p-8 text-center font-retro text-lg text-px-ink-dim">
            {search
              ? 'No se encontraron entrenadores.'
              : 'No hay entrenadores registrados.'}
          </p>
        ) : (
          <>
            <table className="pixel-table">
              <thead>
                <tr>
                  <th>Avatar</th>
                  <th>Nickname</th>
                  <th>Bio</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <TrainerAvatar url={t.avatar_url} nickname={t.nickname} />
                    </td>
                    <td className="text-px-ink">{t.nickname}</td>
                    <td className="max-w-xs truncate text-px-ink-dim">
                      {t.bio || '-'}
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-2">
                        <AdminButton
                          tone="cyan"
                          size="sm"
                          onClick={() => handleEdit(t)}
                        >
                          Editar
                        </AdminButton>
                        <AdminButton
                          tone="danger"
                          size="sm"
                          onClick={() => setConfirmDeleteId(t.id)}
                        >
                          Eliminar
                        </AdminButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t-[3px] border-px-border bg-px-deep px-6 py-4">
                <span className="font-retro text-base text-px-ink-dim">
                  Mostrando {(page - 1) * PER_PAGE + 1}-
                  {Math.min(page * PER_PAGE, filtered.length)} de{' '}
                  {filtered.length}
                </span>
                <div className="flex items-center gap-2">
                  <AdminButton
                    tone="default"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Anterior
                  </AdminButton>
                  <span className="px-2 font-num text-sm text-px-ink">
                    {page} / {totalPages}
                  </span>
                  <AdminButton
                    tone="default"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Siguiente
                  </AdminButton>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <AdminConfirmModal
        open={confirmDeleteId !== null}
        title="Eliminar entrenador"
        message="¿Estas seguro de eliminar este entrenador? Se eliminara de todas las divisiones."
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}
