import type { Metadata } from "next";

import { ContactPageClient } from "./client";

export const metadata: Metadata = {
  title: "Kontakt",
};

export const dynamic = "force-dynamic";

export default function ContactPage() {
  return <ContactPageClient />;
}
