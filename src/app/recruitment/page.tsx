import type { Metadata } from "next";

import { getDivisions } from "@/lib/api/divisions";
import { getRecruitmentBenefits } from "@/lib/api/recruitment-benefits";
import { getRecruitmentPage } from "@/lib/api/recruitment-page";
import { getRecruitmentSteps } from "@/lib/api/recruitment-steps";
import { isRecruitmentOpen } from "@/lib/recruitment-deadline";

import { RecruitmentPageClient } from "./client";

export const metadata: Metadata = {
  title: "Rekrutacja | KN SCORPIO",
  description:
    "Dołącz do Koła Naukowego SCORPIO na Politechnice Wrocławskiej. Szukamy pasjonatów do działów Konstrukcji, Elektroniki, Software, Science i Marketingu.",
};

// Re-render at most every 5 minutes, so the deadline and CMS edits stay current.
export const revalidate = 300;

export default async function RecruitmentPage() {
  const [page, steps, divisions, benefits] = await Promise.all([
    getRecruitmentPage(),
    getRecruitmentSteps(),
    getDivisions(),
    getRecruitmentBenefits(),
  ]);

  return (
    <RecruitmentPageClient
      page={page}
      isOpen={page != null && isRecruitmentOpen(page.deadline)}
      steps={steps}
      divisions={divisions}
      benefits={benefits}
    />
  );
}
