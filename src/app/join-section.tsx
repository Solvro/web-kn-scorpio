"use client";

import { ArrowRightIcon, EnvelopeSimpleIcon } from "@phosphor-icons/react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

import { RECRUITMENT_DEADLINE } from "@/app/recruitment/temporary-data";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";

export function JoinSection() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);

  return (
    <section
      ref={ref}
      className="relative left-1/2 flex min-h-[85dvh] w-screen -translate-x-1/2 items-end overflow-hidden"
    >
      <motion.div
        className="absolute inset-[-14%_0]"
        style={reduce ? undefined : { y }}
      >
        <Image
          src="/images/field-river.jpg"
          alt="Łazik Scorpio nad rzeką, w tle płaskowyże o zachodzie słońca"
          fill
          sizes="100vw"
          className="object-cover object-[50%_60%]"
        />
      </motion.div>
      <div className="from-background via-background/60 absolute inset-0 bg-linear-to-t to-transparent" />
      <div className="from-background/70 absolute inset-0 hidden bg-linear-to-r to-transparent md:block" />

      <div className="relative mx-auto w-full max-w-7xl px-4 pt-40 pb-20 sm:px-6 lg:pb-28">
        <Reveal className="max-w-2xl">
          <h2 className="text-foreground text-4xl leading-[1.05] font-bold tracking-tighter sm:text-6xl lg:text-7xl">
            Następny łazik zbudujesz z nami.
          </h2>
          <p className="text-foreground/80 mt-5 max-w-md text-base leading-relaxed sm:text-lg">
            Szukamy osób do pięciu działów. Rekrutacja trwa do{" "}
            {RECRUITMENT_DEADLINE}.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              className="h-12 gap-2 px-6 text-base active:scale-[0.98]"
              nativeButton={false}
              render={
                <Link href="/recruitment">
                  Dołącz do nas
                  <ArrowRightIcon
                    weight="bold"
                    className="transition-transform group-hover/button:translate-x-1"
                  />
                </Link>
              }
            />
            <Button
              size="lg"
              variant="outline"
              className="bg-background/40 hover:bg-background/70 h-12 gap-2 px-6 text-base backdrop-blur-md active:scale-[0.98]"
              nativeButton={false}
              render={
                <a href="mailto:marketing@scorpio.pwr.edu.pl">
                  <EnvelopeSimpleIcon weight="bold" />
                  Napisz do nas
                </a>
              }
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
