"use client";

import {
  ClipboardTextIcon,
  CursorClickIcon,
  EnvelopeSimpleIcon,
  PaperPlaneTiltIcon,
} from "@phosphor-icons/react";
import Image from "next/image";
import { useRef } from "react";

import { DepartmentExplorer } from "@/app/recruitment/department-explorer";
import { RecruitmentHero } from "@/app/recruitment/recruitment-hero";
import { FullBleedSection } from "@/components/full-bleed-section";
import { HighlightedText } from "@/components/highlighted-text";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { useRecruitmentStatus } from "@/hooks/use-recruitment-status";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import type { Division } from "@/lib/api/divisions";
import type { RecruitmentBenefit } from "@/lib/api/recruitment-benefits";
import type { RecruitmentPageContent } from "@/lib/api/recruitment-page";
import type {
  RecruitmentStep,
  RecruitmentStepIcon,
} from "@/lib/api/recruitment-steps";
import { cmsImageLoader } from "@/lib/cms-image";
import { formatDeadline } from "@/lib/recruitment-deadline";
import { cn } from "@/lib/utils";

const STEP_ICONS = {
  "cursor-click": CursorClickIcon,
  "clipboard-text": ClipboardTextIcon,
  "paper-plane-tilt": PaperPlaneTiltIcon,
} satisfies Record<RecruitmentStepIcon, unknown>;

// The first benefit takes the large tile.
const BENEFIT_TILES = [
  "md:col-span-7 md:row-span-2 min-h-[420px]",
  "md:col-span-5 min-h-[260px]",
  "md:col-span-5 min-h-[260px]",
];

function StepsConnector() {
  const ref = useRef<HTMLSpanElement>(null);
  useScrollReveal(ref, 0.6);
  // Decorative line between the step icons; drawn on scroll like Reveal.
  return (
    <span
      ref={ref}
      aria-hidden
      className="bg-primary/50 motion-safe:ease-out-expo absolute top-7 right-[16%] left-[16%] hidden h-px origin-left data-[reveal=pending]:scale-x-0 motion-safe:transition-transform motion-safe:duration-1200 md:block"
    />
  );
}

function JoinSteps({
  title,
  steps,
}: {
  title: string;
  steps: RecruitmentStep[];
}) {
  if (steps.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:py-28">
      <Reveal>
        {title === "" ? null : (
          <h2 className="text-foreground text-4xl font-bold tracking-tighter sm:text-5xl">
            <HighlightedText text={title} />
          </h2>
        )}
      </Reveal>

      <ol className="relative mt-14 grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8">
        <StepsConnector />
        {steps.map((step, index) => {
          const Icon = STEP_ICONS[step.icon];
          return (
            <li key={step.id} className="relative">
              <Reveal
                delay={250 + index * 250}
                className="flex flex-col md:items-center md:text-center"
              >
                <span className="border-primary/50 bg-background text-primary relative flex size-14 items-center justify-center rounded-full border">
                  <Icon weight="bold" className="size-6" />
                </span>
                <h3 className="text-foreground mt-6 text-xl font-bold">
                  {step.title}
                </h3>
                <p className="text-muted-foreground mt-2 max-w-xs text-base leading-relaxed">
                  {step.text}
                </p>
              </Reveal>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function Benefits({
  title,
  benefits,
}: {
  title: string;
  benefits: RecruitmentBenefit[];
}) {
  if (benefits.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-24 sm:px-6 lg:pb-32">
      <Reveal>
        {title === "" ? null : (
          <h2 className="text-foreground text-4xl font-bold tracking-tighter sm:text-5xl">
            <HighlightedText text={title} />
          </h2>
        )}
      </Reveal>

      <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-12">
        {benefits.slice(0, BENEFIT_TILES.length).map((benefit, index) => (
          <Reveal
            key={benefit.id}
            delay={index * 100}
            className={cn(
              "group relative overflow-hidden rounded-lg",
              BENEFIT_TILES[index],
            )}
          >
            <Image
              loader={cmsImageLoader}
              src={benefit.image.src}
              alt={benefit.image.alt}
              fill
              sizes="(min-width: 768px) 58vw, 100vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
            />
            <div className="from-background via-background/50 absolute inset-0 bg-linear-to-t to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <h3 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
                {benefit.title}
              </h3>
              <p className="text-foreground/80 mt-2 max-w-md text-sm leading-relaxed sm:text-base">
                {benefit.text}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function ClosingBand({
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

interface RecruitmentPageClientProps {
  page: RecruitmentPageContent | null;
  /** Server-computed; the client switches to the live countdown after hydration. */
  isOpen: boolean;
  steps: RecruitmentStep[];
  divisions: Division[];
  benefits: RecruitmentBenefit[];
}

function RecruitmentContent({
  page,
  isOpen,
  steps,
  divisions,
  benefits,
}: RecruitmentPageClientProps & { page: RecruitmentPageContent }) {
  // One status for the whole page, so the hero and the closing band never disagree.
  const status = useRecruitmentStatus(page.deadline, isOpen);

  return (
    <main className="flex flex-col">
      <RecruitmentHero page={page} status={status} />
      <JoinSteps title={page.stepsTitle} steps={steps} />
      <DepartmentExplorer heading={page.divisions} divisions={divisions} />
      <Benefits title={page.benefitsTitle} benefits={benefits} />
      <ClosingBand page={page} isOpen={status.isOpen} />
    </main>
  );
}

export function RecruitmentPageClient(props: RecruitmentPageClientProps) {
  // Section headings live in the recruitment_page entry, so without it the
  // sections would render with empty <h2>s; hide them like any missing data.
  if (props.page == null) {
    return <main className="flex flex-col" />;
  }
  return <RecruitmentContent {...props} page={props.page} />;
}
