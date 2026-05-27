import Link from 'next/link';
import { PixelLightning } from '@/components/shared/ui/pixel';
import { ROUTES } from '@/lib/constants/routes';

interface StoryBeatProps {
  text: string;
  currentRound: number;
}

/** Editorial "beat" card — the weekly headline, auto-generated from standings. */
export function StoryBeat({ text, currentRound }: StoryBeatProps) {
  return (
    <section className="flex flex-col items-start gap-4 border-[3px] border-px-magenta bg-px-base p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <PixelLightning size={40} />
        <p className="font-retro text-xl leading-snug text-px-ink">{text}</p>
      </div>
      {currentRound > 0 && (
        <Link
          href={ROUTES.hubCalendar}
          className="pixel-btn pixel-btn--ghost pixel-btn--sm shrink-0"
        >
          VER J{currentRound} ►
        </Link>
      )}
    </section>
  );
}
