import type { Metadata } from "next";

import { ContactPageClient } from "./client";

export const metadata: Metadata = {
  title: "Kontakt",
};

export default function ContactPage() {
  return <ContactPageClient />;
}
