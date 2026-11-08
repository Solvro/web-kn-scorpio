import type { Metadata } from "next";

import { getAchievements, getSuccessesPage } from "@/lib/api/achievements";

import { SuccessesPageClient } from "./client";

export const metadata: Metadata = {
  title: "Sukcesy",
  description:
    "Miejsca na podium zawodów Rover Challenge w Ameryce Północnej, Europie, Azji i Australii oraz nagrody Koła Naukowego Scorpio.",
};

// Static, re-rendered at most every 5 minutes so CMS edits show up without a redeploy.
export const revalidate = 300;

export default async function SuccessesPage() {
  const [page, achievements] = await Promise.all([
    getSuccessesPage(),
    getAchievements(),
  ]);
  return <SuccessesPageClient page={page} achievements={achievements} />;
}
