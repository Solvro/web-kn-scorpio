"use client";

import { Benefits } from "@/app/recruitment/benefits";
import { ClosingBand } from "@/app/recruitment/closing-band";
import { DepartmentExplorer } from "@/app/recruitment/department-explorer";
import { JoinSteps } from "@/app/recruitment/join-steps";
import { RecruitmentHero } from "@/app/recruitment/recruitment-hero";
import { useRecruitmentStatus } from "@/hooks/use-recruitment-status";
import type { Division } from "@/lib/api/divisions";
import type { RecruitmentBenefit } from "@/lib/api/recruitment-benefits";
import type { RecruitmentPageContent } from "@/lib/api/recruitment-page";
import type { RecruitmentStep } from "@/lib/api/recruitment-steps";

interface RecruitmentPageClientProps {
  page: RecruitmentPageContent | null;
  /** Server-computed; the client switches to the live countdown after hydration. */
  isOpen: boolean;
  steps: RecruitmentStep[];
  divisions: Division[];
  benefits: RecruitmentBenefit[];
}

function RecruitmentContent({
  page,
  isOpen,
  steps,
  divisions,
  benefits,
}: RecruitmentPageClientProps & { page: RecruitmentPageContent }) {
  // One status for the whole page, so the hero and the closing band never disagree.
  const status = useRecruitmentStatus(page.deadline, isOpen);

  return (
    <main className="flex flex-col">
      <RecruitmentHero page={page} status={status} />
      <JoinSteps title={page.stepsTitle} steps={steps} />
      <DepartmentExplorer heading={page.divisions} divisions={divisions} />
      <Benefits title={page.benefitsTitle} benefits={benefits} />
      <ClosingBand page={page} isOpen={status.isOpen} />
    </main>
  );
}

export function RecruitmentPageClient(props: RecruitmentPageClientProps) {
  // Section headings live in the recruitment_page entry, so without it the
  // sections would render with empty <h2>s; hide them like any missing data.
  if (props.page == null) {
    return <main className="flex flex-col" />;
  }
  return <RecruitmentContent {...props} page={props.page} />;
}
