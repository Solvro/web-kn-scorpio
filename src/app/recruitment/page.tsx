import type { Metadata } from "next";

import { RecruitmentPageClient } from "./client";

export const metadata: Metadata = {
  title: "Rekrutacja | KN SCORPIO",
  description:
    "Dołącz do Koła Naukowego SCORPIO na Politechnice Wrocławskiej. Szukamy pasjonatów do działów Konstrukcji, Elektroniki, Software, Science i Marketingu.",
};

export default function RecruitmentPage() {
  return <RecruitmentPageClient />;
}
