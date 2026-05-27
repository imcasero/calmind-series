'use client';

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  isFinalsUnlocked as computeFinalsUnlocked,
  progressPct as computeProgressPct,
  getPhase,
  type Phase,
} from '@/lib/utils/phase';

interface PhaseContextValue {
  currentRound: number;
  /** Update the round — FR10 realtime calls this when results change. */
  setCurrentRound: (round: number) => void;
  phase: Phase;
  isFinalsUnlocked: boolean;
  progressPct: number;
}

const PhaseContext = createContext<PhaseContextValue | null>(null);

interface PhaseProviderProps {
  /** Server-resolved current round (from `getCurrentRound`). */
  initialRound: number;
  children: ReactNode;
}

/**
 * Holds the active tournament round in client state and exposes the derived phase
 * via `usePhase()`. Seeded from a server-resolved round; the setter lets FR10
 * realtime repaint the whole UI when the round ticks, without a page reload.
 */
export function PhaseProvider({ initialRound, children }: PhaseProviderProps) {
  const [currentRound, setCurrentRound] = useState(initialRound);

  // Resync when navigating to a different split (prop changes without remount).
  useEffect(() => {
    setCurrentRound(initialRound);
  }, [initialRound]);

  const value = useMemo<PhaseContextValue>(
    () => ({
      currentRound,
      setCurrentRound,
      phase: getPhase(currentRound),
      isFinalsUnlocked: computeFinalsUnlocked(currentRound),
      progressPct: computeProgressPct(currentRound),
    }),
    [currentRound],
  );

  return (
    <PhaseContext.Provider value={value}>{children}</PhaseContext.Provider>
  );
}

/** Access the phase context. Throws if used outside a `PhaseProvider`. */
export function usePhase(): PhaseContextValue {
  const ctx = useContext(PhaseContext);
  if (ctx === null) {
    throw new Error('usePhase must be used within a PhaseProvider');
  }
  return ctx;
}
