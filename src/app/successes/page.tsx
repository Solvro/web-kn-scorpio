import type { Metadata } from "next";

import { SuccessesPageClient } from "./client";

export const metadata: Metadata = {
  title: "Sukcesy",
};

export default function SuccessesPage() {
  return <SuccessesPageClient />;
}
