/**
 * Empty-state card used by the hub/archive pages when there is no active split
 * (or no data to display). Server Component, no client JS.
 *
 * Centralizes the markup that was duplicated across six hub pages
 * (`py-20 text-center` block with a pixel heading + retro body).
 */
interface EmptyStateProps {
  title: string;
  body: string;
}

export function EmptyState({ title, body }: EmptyStateProps) {
  return (
    <div className="py-20 text-center">
      <h1 className="font-pixel text-2xl text-px-ink">{title}</h1>
      <p className="mt-4 font-retro text-lg text-px-ink-soft">{body}</p>
    </div>
  );
}
