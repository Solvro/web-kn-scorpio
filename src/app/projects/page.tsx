import type { Metadata } from "next";

import { ProjectsPageClient } from "./client";

export const metadata: Metadata = {
  title: "Projekty",
};

export default function ProjectsPage() {
  return <ProjectsPageClient />;
}
