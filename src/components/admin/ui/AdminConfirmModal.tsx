import { AdminButton } from './AdminButton';
import { AdminModal } from './AdminModal';

interface AdminConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'neutral';
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Pixel admin confirmation modal. Replaces `window.confirm()` at destructive
 * action sites (delete a season, clear a match result, remove a trainer, etc.).
 * Composes AdminModal (overlay + frame) + AdminButton (ghost cancel + danger
 * confirm). Controlled visibility: parent owns `open`, `onConfirm`, `onCancel`.
 */
export function AdminConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  onConfirm,
  onCancel,
}: AdminConfirmModalProps) {
  if (!open) return null;

  return (
    <AdminModal title={title} onClose={onCancel}>
      <div className="flex flex-col gap-4">
        <p className="font-retro text-base text-px-ink">{message}</p>
        <div className="flex gap-3 pt-2">
          <AdminButton
            tone="ghost"
            onClick={onCancel}
            className="flex-1 justify-center"
          >
            {cancelLabel}
          </AdminButton>
          <AdminButton
            tone={variant === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            className="flex-1 justify-center"
          >
            {confirmLabel}
          </AdminButton>
        </div>
      </div>
    </AdminModal>
  );
}
