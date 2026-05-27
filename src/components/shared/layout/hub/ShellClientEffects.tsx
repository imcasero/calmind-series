'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

/**
 * Client-side shell effects (FR10):
 *  - scroll to top on route change;
 *  - Supabase Realtime → `router.refresh()` when results change, so the server
 *    tree (standings, feed, phase) repaints without a full page reload. The
 *    refreshed `getCurrentRound` re-seeds `PhaseProvider`, mutating the phase live.
 * Renders nothing.
 */
export function ShellClientEffects() {
  const router = useRouter();
  const pathname = usePathname();

  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname is the scroll-reset trigger, not read inside.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('redesign-shell')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'matches' },
        () => router.refresh(),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'league_participants' },
        () => router.refresh(),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [router]);

  return null;
}
