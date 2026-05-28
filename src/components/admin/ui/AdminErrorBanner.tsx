interface AdminErrorBannerProps {
  message: string;
  onDismiss?: () => void;
}

/** Inline error banner for admin forms/screens. */
export function AdminErrorBanner({
  message,
  onDismiss,
}: AdminErrorBannerProps) {
  return (
    <div className="flex items-start justify-between gap-4 border-[3px] border-px-danger bg-px-deep p-4">
      <p className="font-retro text-base text-px-danger">{message}</p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 font-pixel text-[9px] uppercase tracking-wider text-px-ink-dim transition-colors hover:text-px-ink"
        >
          Cerrar
        </button>
      )}
    </div>
  );
}
