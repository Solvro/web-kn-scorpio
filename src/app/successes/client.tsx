"use client";

import { tallyAchievements } from "@/lib/achievements";
import type { Achievement } from "@/lib/achievements";
import type { SuccessesPageContent } from "@/lib/api/achievements";

import { ArchiveSection } from "./archive-section";
import { ResultsMatrix } from "./results-matrix";
import { StoriesSection } from "./stories-section";
import { SuccessesHero } from "./successes-hero";
import { TallySection } from "./tally-section";

export function SuccessesPageClient({
  page,
  achievements,
}: {
  page: SuccessesPageContent | null;
  achievements: Achievement[];
}) {
  return (
    <>
      {page == null ? (
        <h1 className="text-foreground px-4 pt-14 text-5xl font-bold tracking-tighter sm:px-6 sm:text-6xl lg:pt-20 lg:text-8xl">
          Sukcesy
        </h1>
      ) : (
        <SuccessesHero hero={page.hero} />
      )}
      <TallySection
        tally={tallyAchievements(achievements)}
        content={page?.tally ?? { title: null, image: null }}
      />
      <StoriesSection
        title={page?.storiesTitle ?? null}
        stories={achievements.filter((item) => item.featured)}
      />
      <ResultsMatrix
        title={page?.matrix.title ?? null}
        intro={page?.matrix.intro ?? null}
        achievements={achievements}
      />
      <ArchiveSection
        title={page?.archiveTitle ?? null}
        achievements={achievements}
      />
    </>
  );
}
