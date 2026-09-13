import type { Metadata } from "next";

import { TeamPageClient } from "./client";

export const metadata: Metadata = {
  title: "Zespół",
};

export default function TeamPage() {
  return <TeamPageClient />;
}
