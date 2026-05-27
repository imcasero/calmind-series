import type { Metadata } from 'next';
import {
  HubRightColumn,
  NewsRail,
  PhaseBanner,
  ProjectedBracketTeaser,
  StandingsLive,
  StoryBeat,
} from '@/components/hub';
import {
  getActiveSeasonWithSplit,
  getCurrentRound,
  getDivisionPreview,
  getMatchesByRound,
} from '@/lib/queries';
import { buildNews, buildStoryBeat } from '@/lib/utils/editorial';
import { getPhase } from '@/lib/utils/phase';

export const metadata: Metadata = {
  title: 'Hub',
  description: 'Centro de mando del split activo de Pokemon Calmind Series.',
};

/**
 * Hub master dashboard (FR3): phase banner, story beat, dual live standings,
 * projected bracket teaser, right-column feed, and the news rail. All sections
 * are Server Components fed by server-resolved data; the shell (TopBar, chips,
 * marquee) comes from `app/hub/layout.tsx`.
 */
export default async function HubPage() {
  const seasonInfo = await getActiveSeasonWithSplit();
  const split = seasonInfo?.activeSplit;

  if (!seasonInfo || !split) {
    return (
      <div className="py-20 text-center">
        <h1 className="font-pixel text-2xl text-px-ink">PRETEMPORADA</h1>
        <p className="mt-4 font-retro text-lg text-px-ink-soft">
          No hay un split activo. El próximo arranca pronto.
        </p>
      </div>
    );
  }

  const [currentRound, preview, matchesByRound] = await Promise.all([
    getCurrentRound(split.id),
    getDivisionPreview(split.id),
    getMatchesByRound(split.id),
  ]);

  const phase = getPhase(currentRound);
  const allMatches = matchesByRound.flatMap((r) => r.matches);
  const storyBeat = buildStoryBeat(preview, currentRound);
  const news = buildNews(preview, currentRound);

  return (
    <div className="flex flex-col gap-8">
      <PhaseBanner
        phase={phase}
        currentRound={currentRound}
        seasonName={seasonInfo.name}
        splitName={split.name}
      />
      <StoryBeat text={storyBeat} currentRound={currentRound} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-8">
          <StandingsLive preview={preview} matches={allMatches} />
          <ProjectedBracketTeaser
            preview={preview}
            currentRound={currentRound}
          />
        </div>
        <HubRightColumn
          preview={preview}
          matchesByRound={matchesByRound}
          currentRound={currentRound}
        />
      </div>

      <NewsRail items={news} />
    </div>
  );
}
