"use client";

import { ArrowRightIcon } from "@phosphor-icons/react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

import { HERO_IMAGE } from "@/app/temporary-data";
import { Button } from "@/components/ui/button";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;
const HEADLINE = ["Budujemy", "łaziki", "na", "Marsa."];

export function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Push into the photo as the visitor leaves the hero, so the rover reads as the subject.
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.18]);
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-35%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const dim = useTransform(scrollYProgress, [0, 1], [0, 0.6]);

  return (
    <section
      ref={ref}
      className="relative left-1/2 -mt-16 h-[100dvh] min-h-[640px] w-screen -translate-x-1/2 overflow-hidden"
    >
      <motion.div
        className="absolute inset-0"
        initial={
          reduce ? false : { clipPath: "inset(14% 10% 14% 10% round 12px)" }
        }
        animate={{ clipPath: "inset(0% 0% 0% 0% round 0px)" }}
        transition={{ duration: 1.5, ease: EASE_OUT }}
      >
        <motion.div
          className="absolute inset-0"
          style={reduce ? undefined : { scale: imageScale, y: imageY }}
        >
          <motion.div
            className="absolute inset-0"
            initial={reduce ? false : { scale: 1.25 }}
            animate={{ scale: 1 }}
            transition={{ duration: 2.2, ease: EASE_OUT }}
          >
            <Image
              src={HERO_IMAGE.src}
              alt={HERO_IMAGE.alt}
              fill
              priority
              sizes="100vw"
              className="object-cover object-[55%_35%]"
            />
          </motion.div>
        </motion.div>
        <div className="from-background via-background/60 md:via-background/30 absolute inset-0 bg-linear-to-t to-transparent" />
        <div className="from-background/80 absolute inset-0 hidden bg-linear-to-r via-transparent to-transparent md:block" />
        <motion.div
          className="bg-background absolute inset-0"
          style={{ opacity: reduce ? 0 : dim }}
        />
      </motion.div>

      <motion.div
        style={reduce ? undefined : { y: contentY, opacity: contentOpacity }}
        className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-16 sm:px-6 md:pb-24"
      >
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9, ease: EASE_OUT }}
          className="text-primary text-sm font-semibold tracking-[0.2em] uppercase"
        >
          Koło Naukowe Scorpio
        </motion.p>

        <h1 className="text-foreground mt-4 max-w-4xl text-5xl leading-[1.05] font-bold tracking-tighter sm:text-6xl lg:text-8xl">
          {HEADLINE.map((word, index) => (
            <span
              key={word}
              className="inline-block overflow-hidden pr-[0.22em] pb-1 align-bottom"
            >
              <motion.span
                className={
                  word === "Marsa."
                    ? "text-primary inline-block"
                    : "inline-block"
                }
                initial={reduce ? false : { y: "110%", filter: "blur(8px)" }}
                animate={{ y: "0%", filter: "blur(0px)" }}
                transition={{
                  duration: 0.9,
                  delay: 1 + index * 0.09,
                  ease: EASE_OUT,
                }}
              >
                {word}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.45, ease: EASE_OUT }}
        >
          <p className="text-foreground/80 mt-6 max-w-lg text-base leading-relaxed sm:text-lg">
            Studenci Politechniki Wrocławskiej projektują i budują łaziki
            marsjańskie od 2006 roku. Osiem generacji za nami.
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
              className="bg-background/40 hover:bg-background/70 h-12 px-6 text-base backdrop-blur-md active:scale-[0.98]"
              nativeButton={false}
              render={<a href="#generacje">Poznaj łaziki</a>}
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
