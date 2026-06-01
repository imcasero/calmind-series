/**
 * Full-shell skeleton used while `<PixelShell>`'s server fetch resolves.
 * Mirrors the dark px-bg backdrop so the page does not flash content.
 * Server Component, no client JS.
 *
 * Mounted as the Suspense fallback for hub/archive layouts under Wave-A
 * REQ-44 — the layout's async data block extracts into a child function so
 * the cacheComponents flag (Wave B) can land without aborting prerender.
 */
export function ShellSkeleton() {
  return (
    <div className="min-h-screen bg-px-bg animate-pulse" aria-hidden="true" />
  );
}
