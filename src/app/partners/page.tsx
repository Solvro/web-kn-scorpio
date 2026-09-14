import type { Metadata } from "next";

import { PartnersPageClient } from "./client";

export const metadata: Metadata = {
  title: "Partnerzy",
};

export default function PartnersPage() {
  return <PartnersPageClient />;
}
