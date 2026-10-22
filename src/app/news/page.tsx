import type { Metadata } from "next";

import { NewsPageClient } from "./client";

export const metadata: Metadata = {
  title: "Aktualności",
};

export default function NewsPage() {
  return <NewsPageClient />;
}
