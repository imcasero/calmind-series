'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { EXTERNAL_ROUTES, ROUTES } from '@/lib/constants/routes';
import type { SeasonWithSplits } from '@/lib/queries';
import { cn } from '@/lib/utils';
import { HubNav } from './HubNav';
import { PhaseChip } from './PhaseChip';
import { SeasonSplitChip } from './SeasonSplitChip';

interface TopBarProps {
  activeSeasonName: string | null;
  activeSplitName: string | null;
  seasons: SeasonWithSplits[];
}

/**
 * Sticky pixel top bar: logo + wordmark, Season/Split chip, phase chip, nav, and
 * the primary CTA. Goes from transparent to a blurred backdrop once scrolled.
 */
export function TopBar({
  activeSeasonName,
  activeSplitName,
  seasons,
}: TopBarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b-[3px] border-px-border transition-colors',
        scrolled ? 'bg-px-deep/90 backdrop-blur-sm' : 'bg-transparent',
      )}
    >
      <div className="mx-auto flex w-full max-w-[1280px] flex-wrap items-center gap-3 px-6 py-3">
        <Link href={ROUTES.HOME} className="flex items-center gap-2">
          <Image
            src="/CalmindSeriesLogo.png"
            alt="Calmind Series"
            width={40}
            height={40}
            className="[image-rendering:pixelated]"
          />
          <span className="font-pixel text-sm text-px-ink">CALMIND</span>
        </Link>

        <SeasonSplitChip
          activeSeasonName={activeSeasonName}
          activeSplitName={activeSplitName}
          seasons={seasons}
        />
        <PhaseChip />

        <div className="flex-1" />

        <HubNav />

        <Link
          href={EXTERNAL_ROUTES.INSCRIPTION_FORM}
          target="_blank"
          rel="noopener noreferrer"
          className="pixel-btn pixel-btn--primary pixel-btn--sm"
        >
          ► INSCRÍBETE
        </Link>
      </div>
    </header>
  );
}
