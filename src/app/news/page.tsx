import type { Metadata } from "next";

import { getNews } from "@/lib/api/news";

import { NewsPageClient } from "./client";

export const metadata: Metadata = {
  title: "Aktualności",
  description:
    "Zawody, wydarzenia i podsumowania sezonów Koła Naukowego Scorpio z Politechniki Wrocławskiej.",
};

// Static, re-rendered at most every 5 minutes so CMS edits show up without a redeploy.
export const revalidate = 300;

export default async function NewsPage() {
  const news = await getNews();
  return <NewsPageClient news={news} />;
}
