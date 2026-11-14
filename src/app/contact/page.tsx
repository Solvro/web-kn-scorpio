import type { Metadata } from "next";

import { ContactPageClient } from "./client";

export const metadata: Metadata = {
  title: "Kontakt",
  description:
    "Skontaktuj się z Kołem Naukowym Off-Road SCORPIO na Politechnice Wrocławskiej.",
};

export const dynamic = "force-dynamic";

export default function ContactPage() {
  return <ContactPageClient />;
}
