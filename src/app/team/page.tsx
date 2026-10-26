import type { Metadata } from "next";

import { TeamPageClient } from "@/app/team/client";
import { getTeamMembers } from "@/lib/api/team";

export const metadata: Metadata = {
  title: "Zespół",
};

export default async function TeamPage() {
  const members = await getTeamMembers();
  return <TeamPageClient members={members} />;
}
