"use client";

import { DepartmentsSection } from "@/app/departments-section";
import { FieldGallerySection } from "@/app/field-gallery-section";
import { HeroSection } from "@/app/hero-section";
import { JoinSection } from "@/app/join-section";
import { ManifestoSection } from "@/app/manifesto-section";
import { NewsSection } from "@/app/news-section";
import { ProjectsSection } from "@/app/projects-section";
import { RoverSection } from "@/app/rover-section";

export function HomePageClient() {
  return (
    <main className="flex flex-col">
      <HeroSection />
      <ManifestoSection />
      <RoverSection />
      <FieldGallerySection />
      <ProjectsSection />
      <DepartmentsSection />
      <NewsSection />
      <JoinSection />
    </main>
  );
}
