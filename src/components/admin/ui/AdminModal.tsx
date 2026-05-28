import type { ReactNode } from 'react';

interface AdminModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/** Pixel modal: dim overlay + bordered card. Open/close state lives in the parent. */
export function AdminModal({ title, onClose, children }: AdminModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md border-[3px] border-px-border bg-px-base p-6 shadow-[6px_6px_0_0_var(--color-px-deep)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-pixel text-sm uppercase tracking-wider text-px-ink">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="font-pixel text-px-ink-dim transition-colors hover:text-px-magenta"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
