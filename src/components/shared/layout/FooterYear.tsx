'use client';

import { useEffect, useState } from 'react';

/**
 * Renders the current year on the client. Extracted out of `Footer.tsx`
 * because `cacheComponents: true` (F4 REQ-40) cannot tolerate a
 * non-deterministic `new Date()` call inside the root-layout server tree.
 * The initial server HTML renders nothing; the year hydrates immediately.
 */
export function FooterYear() {
  const [year, setYear] = useState<number | null>(null);
  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);
  return <>{year ?? ''}</>;
}
