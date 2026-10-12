import type { Metadata } from "next";

import { HomePageClient } from "@/app/client";

export const metadata: Metadata = {
  title: "KN SCORPIO | Łazik marsjański Politechniki Wrocławskiej",
  description:
    "Koło Naukowe Pojazdów Niekonwencjonalnych Scorpio (dawniej OFF-ROAD) projektuje i buduje łaziki marsjańskie na Politechnice Wrocławskiej od 2006 roku.",
};

export default function Home() {
  return <HomePageClient />;
}
