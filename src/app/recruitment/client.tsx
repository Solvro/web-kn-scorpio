"use client";

import {
  ClipboardTextIcon,
  CursorClickIcon,
  EnvelopeSimpleIcon,
  PaperPlaneTiltIcon,
} from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";

import { DepartmentExplorer } from "@/app/recruitment/department-explorer";
import { RecruitmentHero } from "@/app/recruitment/recruitment-hero";
import {
  APPLICATION_FORM_URL,
  RECRUITMENT_DEADLINE,
  RECRUITMENT_EMAIL,
} from "@/app/recruitment/temporary-data";
import { FullBleedSection } from "@/components/full-bleed-section";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const JOIN_STEPS = [
  {
    icon: CursorClickIcon,
    title: "Wybierz dział",
    text: "Przejrzyj pięć działów i znajdź ten, który Cię ciekawi.",
  },
  {
    icon: ClipboardTextIcon,
    title: "Rozwiąż zadanie",
    text: "Każdy dział ma zadanie rekrutacyjne. Pokaż, jak podchodzisz do problemu.",
  },
  {
    icon: PaperPlaneTiltIcon,
    title: "Wyślij zgłoszenie",
    text: "Wypełnij formularz, a my skontaktujemy się z Tobą.",
  },
];

const BENEFITS = [
  {
    title: "Zawody na całym świecie",
    text: "Startujemy w Rover Challenge w Europie, Azji, Ameryce Północnej i Australii.",
    image: "/images/field-desert.jpg",
    alt: "Łazik Scorpio na pustynnym torze zawodów",
    className: "md:col-span-7 md:row-span-2 min-h-[420px]",
  },
  {
    title: "Praktyka zamiast teorii",
    text: "Projektujesz, budujesz i testujesz części, które naprawdę jeżdżą.",
    image: "/images/field-electronics.jpg",
    alt: "Praca przy elektronice łazika",
    className: "md:col-span-5 min-h-[260px]",
  },
  {
    title: "Jeden projekt, wiele kierunków",
    text: "Mechanicy, elektronicy, programiści, naukowcy i marketingowcy przy jednym łaziku.",
    image: "/images/software-tent.jpg",
    alt: "Zespół operatorów przy laptopach podczas zawodów",
    className: "md:col-span-5 min-h-[260px]",
  },
];

function JoinSteps() {
  const reduce = useReducedMotion() ?? false;

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:py-28">
      <Reveal>
        <h2 className="text-foreground text-4xl font-bold tracking-tighter sm:text-5xl">
          Jak dołączyć
        </h2>
      </Reveal>

      <ol className="relative mt-14 grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8">
        {/* Connector that draws itself once the steps scroll into view */}
        <motion.span
          aria-hidden
          className="bg-primary/50 absolute top-7 right-[16%] left-[16%] hidden h-px origin-left md:block"
          initial={reduce ? false : { scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />
        {JOIN_STEPS.map((step, index) => (
          <motion.li
            key={step.title}
            className="relative flex flex-col md:items-center md:text-center"
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{
              duration: 0.6,
              delay: 0.25 + index * 0.25,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <span className="border-primary/50 bg-background text-primary relative flex size-14 items-center justify-center rounded-full border">
              <step.icon weight="bold" className="size-6" />
            </span>
            <h3 className="text-foreground mt-6 text-xl font-bold">
              {step.title}
            </h3>
            <p className="text-muted-foreground mt-2 max-w-xs text-base leading-relaxed">
              {step.text}
            </p>
          </motion.li>
        ))}
      </ol>
    </section>
  );
}

function Benefits() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-24 sm:px-6 lg:pb-32">
      <Reveal>
        <h2 className="text-foreground text-4xl font-bold tracking-tighter sm:text-5xl">
          Co zyskujesz
        </h2>
      </Reveal>

      <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-12">
        {BENEFITS.map((benefit, index) => (
          <Reveal
            key={benefit.title}
            delay={index * 100}
            className={cn(
              "group relative overflow-hidden rounded-lg",
              benefit.className,
            )}
          >
            <Image
              src={benefit.image}
              alt={benefit.alt}
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

function ClosingBand() {
  return (
    <FullBleedSection className="bg-primary">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-20 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:py-24">
        <Reveal>
          <h2 className="text-primary-foreground max-w-2xl text-4xl leading-[1.05] font-bold tracking-tighter sm:text-5xl lg:text-6xl">
            Rekrutacja trwa do {RECRUITMENT_DEADLINE}.
          </h2>
        </Reveal>
        <Reveal delay={150} className="flex flex-col gap-3 sm:flex-row">
          <Button
            size="lg"
            className="bg-background text-foreground hover:bg-background/85 h-12 gap-2 px-6 text-base active:scale-[0.98]"
            nativeButton={false}
            render={
              <a
                href={APPLICATION_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <PaperPlaneTiltIcon weight="bold" />
                Wyślij zgłoszenie
              </a>
            }
          />
          <Button
            size="lg"
            variant="ghost"
            className="text-primary-foreground hover:text-primary-foreground border-primary-foreground/50 h-12 gap-2 border px-6 text-base hover:bg-white/10 active:scale-[0.98]"
            nativeButton={false}
            render={
              <a href={`mailto:${RECRUITMENT_EMAIL}`}>
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

export function RecruitmentPageClient() {
  return (
    <main className="flex flex-col">
      <RecruitmentHero />
      <JoinSteps />
      <DepartmentExplorer />
      <Benefits />
      <ClosingBand />
    </main>
  );
}
