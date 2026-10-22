import type { Metadata } from "next";

import { RecruitmentPageClient } from "./client";

export const metadata: Metadata = {
  title: "Rekrutacja",
};

export default function RecruitmentPage() {
  return <RecruitmentPageClient />;
}
