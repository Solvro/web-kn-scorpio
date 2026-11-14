import type { Metadata } from "next";

import { getNews } from "@/lib/api/news";
import { getPartners, getPartnersPage } from "@/lib/api/partners";
import { getStats } from "@/lib/api/stats";

import { PartnersPageClient } from "./client";

export const metadata: Metadata = {
  title: "Partnerzy",
  description:
    "Firmy i instytucje, które wspierają budowę łazików marsjańskich Scorpio, oraz oferta współpracy dla nowych partnerów.",
};

// Static, re-rendered at most every 5 minutes so CMS edits show up without a redeploy.
export const revalidate = 300;

export default async function PartnersPage() {
  const [page, partners, stats, news] = await Promise.all([
    getPartnersPage(),
    getPartners(),
    getStats(),
    getNews(),
  ]);
  return (
    <PartnersPageClient
      page={page}
      partners={partners}
      stats={stats}
      news={news.filter((item) => item.category === "partners")}
    />
  );
}
