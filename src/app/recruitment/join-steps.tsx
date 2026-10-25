import {
  ClipboardTextIcon,
  CursorClickIcon,
  PaperPlaneTiltIcon,
} from "@phosphor-icons/react";
import { useRef } from "react";

import { HighlightedText } from "@/components/highlighted-text";
import { Reveal } from "@/components/reveal";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import type {
  RecruitmentStep,
  RecruitmentStepIcon,
} from "@/lib/api/recruitment-steps";

const STEP_ICONS = {
  "cursor-click": CursorClickIcon,
  "clipboard-text": ClipboardTextIcon,
  "paper-plane-tilt": PaperPlaneTiltIcon,
} satisfies Record<RecruitmentStepIcon, unknown>;

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

export function JoinSteps({
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
