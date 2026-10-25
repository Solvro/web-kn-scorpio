import { EnvelopeSimpleIcon, PaperPlaneTiltIcon } from "@phosphor-icons/react";

import { FullBleedSection } from "@/components/full-bleed-section";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import type { RecruitmentPageContent } from "@/lib/api/recruitment-page";
import { formatDeadline } from "@/lib/recruitment-deadline";

export function ClosingBand({
  page,
  isOpen,
}: {
  page: RecruitmentPageContent;
  isOpen: boolean;
}) {
  return (
    <FullBleedSection className="bg-primary">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-20 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:py-24">
        <Reveal>
          <h2 className="text-primary-foreground max-w-2xl text-4xl leading-[1.05] font-bold tracking-tighter sm:text-5xl lg:text-6xl">
            {isOpen
              ? `Rekrutacja trwa do ${formatDeadline(page.deadline)}.`
              : "Rekrutacja zakończona."}
          </h2>
        </Reveal>
        <Reveal delay={150} className="flex flex-col gap-3 sm:flex-row">
          {isOpen ? (
            <Button
              size="lg"
              className="bg-background text-foreground hover:bg-background/85 h-12 gap-2 px-6 text-base active:scale-[0.98]"
              nativeButton={false}
              render={
                <a
                  href={page.formUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <PaperPlaneTiltIcon weight="bold" />
                  Wyślij zgłoszenie
                </a>
              }
            />
          ) : null}
          <Button
            size="lg"
            variant="ghost"
            className="text-primary-foreground hover:text-primary-foreground border-primary-foreground/50 h-12 gap-2 border px-6 text-base hover:bg-white/10 active:scale-[0.98]"
            nativeButton={false}
            render={
              <a href={`mailto:${page.contactEmail}`}>
                <EnvelopeSimpleIcon weight="bold" />
                Napisz do nas
              </a>
            }
          />
        </Reveal>
      </div>
    </FullBleedSection>
  );
}
