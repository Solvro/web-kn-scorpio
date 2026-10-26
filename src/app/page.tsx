import type { Metadata } from "next";

import { HomePageClient } from "@/app/client";
import { getDivisions } from "@/lib/api/divisions";
import { getFieldPhotos } from "@/lib/api/field-photos";
import { getGeneralInfo } from "@/lib/api/general";
import { getHomePage } from "@/lib/api/home-page";
import { getNews } from "@/lib/api/news";
import { getProjects } from "@/lib/api/projects";
import { getRecruitmentDeadline } from "@/lib/api/recruitment-page";
import { getRovers } from "@/lib/api/rovers";
import { getStats } from "@/lib/api/stats";
import { cleanText } from "@/lib/api/text";
import { isRecruitmentOpen } from "@/lib/recruitment-deadline";

export const metadata: Metadata = {
  title: "KN SCORPIO | Łazik marsjański Politechniki Wrocławskiej",
  description:
    "Koło Naukowe Pojazdów Niekonwencjonalnych Scorpio (dawniej OFF-ROAD) projektuje i buduje łaziki marsjańskie na Politechnice Wrocławskiej od 2006 roku.",
};

// Re-render at most every 5 minutes, so CMS edits (and a CMS that was down at build time) show up without a redeploy.
export const revalidate = 300;

export default async function Home() {
  const [
    page,
    stats,
    rovers,
    fieldPhotos,
    projects,
    divisions,
    news,
    recruitmentDeadline,
    general,
  ] = await Promise.all([
    getHomePage(),
    getStats(),
    getRovers(),
    getFieldPhotos(),
    getProjects(),
    getDivisions(),
    getNews(4),
    getRecruitmentDeadline(),
    getGeneralInfo(),
  ]);

  return (
    <HomePageClient
      page={page}
      stats={stats}
      rovers={rovers}
      fieldPhotos={fieldPhotos}
      projects={projects}
      divisions={divisions}
      news={news}
      recruitment={
        recruitmentDeadline == null
          ? null
          : {
              deadline: recruitmentDeadline,
              isOpen: isRecruitmentOpen(recruitmentDeadline),
            }
      }
      contactEmail={cleanText(general.contact_email)}
    />
  );
}
