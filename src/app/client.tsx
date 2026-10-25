"use client";

import { DepartmentsSection } from "@/app/departments-section";
import { FieldGallerySection } from "@/app/field-gallery-section";
import { HeroSection } from "@/app/hero-section";
import { JoinSection } from "@/app/join-section";
import { ManifestoSection } from "@/app/manifesto-section";
import { NewsSection } from "@/app/news-section";
import { ProjectsSection } from "@/app/projects-section";
import { RoverSection } from "@/app/rover-section";
import type { Division } from "@/lib/api/divisions";
import type { FieldPhoto } from "@/lib/api/field-photos";
import type { HomePageContent } from "@/lib/api/home-page";
import type { NewsItem } from "@/lib/api/news";
import type { Project } from "@/lib/api/projects";
import type { Rover } from "@/lib/api/rovers";
import type { Stat } from "@/lib/api/stats";

interface HomePageClientProps {
  page: HomePageContent | null;
  stats: Stat[];
  rovers: Rover[];
  fieldPhotos: FieldPhoto[];
  projects: Project[];
  divisions: Division[];
  news: NewsItem[];
  /** Deadline plus the server's open/closed answer; null without a recruitment entry. */
  recruitment: { deadline: string; isOpen: boolean } | null;
  contactEmail: string | null;
}

// Sections whose CMS data is missing render nothing, so the page degrades
// gracefully when the CMS is unreachable.
export function HomePageClient({
  page,
  stats,
  rovers,
  fieldPhotos,
  projects,
  divisions,
  news,
  recruitment,
  contactEmail,
}: HomePageClientProps) {
  return (
    <main className="flex flex-col">
      {page?.hero == null ? null : (
        <HeroSection
          hero={page.hero}
          showRoversLink={rovers.length > 0}
          recruitmentAvailable={recruitment != null}
        />
      )}
      <ManifestoSection manifesto={page?.manifesto ?? null} stats={stats} />
      {page == null ? null : (
        <>
          <RoverSection heading={page.rovers} rovers={rovers} />
          <FieldGallerySection heading={page.field} photos={fieldPhotos} />
          <ProjectsSection heading={page.projects} projects={projects} />
          <DepartmentsSection
            heading={page.divisions}
            divisions={divisions}
            recruitmentAvailable={recruitment != null}
          />
          <NewsSection title={page.newsTitle} news={news} />
        </>
      )}
      {page?.join == null ? null : (
        <JoinSection
          join={page.join}
          recruitment={recruitment}
          contactEmail={contactEmail}
        />
      )}
    </main>
  );
}
