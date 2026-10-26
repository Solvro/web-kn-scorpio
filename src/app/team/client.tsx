"use client";

"use client";

import type { LucideIcon } from "lucide-react";
import {
  BadgeCheckIcon,
  FlashlightIcon,
  FlaskConicalIcon,
  MegaphoneIcon,
  MonitorIcon,
  SettingsIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import type { KeyboardEvent } from "react";

import { TeamMember } from "@/app/team/team-member";
import { Badge } from "@/components/ui/badge";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import type { TeamGroup, TeamMemberData } from "@/lib/api/team";
import { cn } from "@/lib/utils";

const SECTIONS: {
  group: TeamGroup;
  title: string;
  description: string;
  icon: LucideIcon;
  gridClass: string;
}[] = [
  {
    group: "management",
    title: "Zarząd",
    description:
      "Osoby odpowiedzialne za kierunek rozwoju projektu i koordynację prac zespołu.",
    icon: UsersIcon,
    gridClass: "sm:grid-cols-2 lg:grid-cols-4",
  },
  {
    group: "advisor",
    title: "Opiekunowie",
    description:
      "Kadra akademicka wspierająca projekt merytorycznie i naukowo.",
    icon: UserIcon,
    gridClass: "md:grid-cols-3",
  },
  {
    group: "construction",
    title: "Konstrukcja",
    description:
      "Projektowanie i rozwój mechanicznej konstrukcji łazików marsjańskich.",
    icon: SettingsIcon,
    gridClass: "sm:grid-cols-2 lg:grid-cols-4",
  },
  {
    group: "electronics",
    title: "Elektronika",
    description: "Układy zasilania, PCB i systemy sterowania platformy.",
    icon: FlashlightIcon,
    gridClass: "sm:grid-cols-2 lg:grid-cols-4",
  },
  {
    group: "software",
    title: "Software",
    description:
      "Oprogramowanie autonomii, telemetrii, sterowania i przetwarzania danych.",
    icon: MonitorIcon,
    gridClass: "sm:grid-cols-2 lg:grid-cols-4",
  },
  {
    group: "science",
    title: "Science",
    description:
      "Eksperymenty naukowe, analiza próbek i scenariusze misji badawczych.",
    icon: FlaskConicalIcon,
    gridClass: "sm:grid-cols-2 lg:grid-cols-4",
  },
  {
    group: "marketing",
    title: "Marketing",
    description:
      "Komunikacja zespołu, partnerstwa i obecność projektu w mediach.",
    icon: MegaphoneIcon,
    gridClass: "sm:grid-cols-2 lg:grid-cols-4",
  },
];

function SectionHeading({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <div className="mb-8 flex items-center gap-3">
      <div className="bg-primary/10 border-primary/20 text-primary rounded-lg border p-2">
        <Icon className="size-6" />
      </div>
      <div>
        <h2 className="text-foreground text-2xl font-bold tracking-tight">
          {title}
        </h2>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
    </div>
  );
}

const STANDALONE_GROUPS = new Set<TeamGroup>(["management", "advisor"]);

const STANDALONE_SECTIONS = SECTIONS.filter((section): boolean =>
  STANDALONE_GROUPS.has(section.group),
);
const DEPARTMENT_SECTIONS = SECTIONS.filter(
  (section) => !STANDALONE_GROUPS.has(section.group),
);

function DepartmentTabs({ members }: { members: TeamMemberData[] }) {
  const reduce = usePrefersReducedMotion();
  const tabReferences = useRef<(HTMLButtonElement | null)[]>([]);
  const [selected, setSelected] = useState<TeamGroup | null>(null);

  const departments = DEPARTMENT_SECTIONS.filter((section) =>
    members.some((member) => member.group === section.group),
  );

  if (departments.length === 0) {
    return null;
  }

  const activeIndex = Math.max(
    departments.findIndex((section) => section.group === selected),
    0,
  );
  const active = departments[activeIndex];
  const activeMembers = members.filter(
    (member) => member.group === active.group,
  );

  const select = (index: number) => {
    setSelected(departments[index].group);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const count = departments.length;
    let next: number;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown": {
        next = (activeIndex + 1) % count;
        break;
      }
      case "ArrowLeft":
      case "ArrowUp": {
        next = (activeIndex - 1 + count) % count;
        break;
      }
      case "Home": {
        next = 0;
        break;
      }
      case "End": {
        next = count - 1;
        break;
      }
      default: {
        return;
      }
    }
    event.preventDefault();
    select(next);
    tabReferences.current[next]?.focus();
  };

  return (
    <section id="dzialy" className="scroll-mt-20">
      <div
        role="tablist"
        aria-label="Działy"
        className="-mx-4 mb-10 flex [scrollbar-width:none] gap-2 overflow-x-auto px-4 py-1 sm:mx-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {departments.map((section, index) => {
          const isSelected = index === activeIndex;
          const Icon = section.icon;
          return (
            <button
              key={section.group}
              ref={(node) => {
                tabReferences.current[index] = node;
              }}
              type="button"
              role="tab"
              id={`tab-${section.group}`}
              aria-selected={isSelected}
              aria-controls={`panel-${section.group}`}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => {
                select(index);
              }}
              onKeyDown={handleKeyDown}
              className={cn(
                "focus-visible:ring-ring/50 relative flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors duration-200 outline-none focus-visible:ring-3 sm:text-base",
                isSelected
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:bg-primary/10 hover:text-primary",
              )}
            >
              {isSelected ? (
                <motion.span
                  layoutId="team-department-tab"
                  transition={
                    reduce
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 500, damping: 40 }
                  }
                  className="bg-primary absolute inset-0 rounded-lg"
                />
              ) : null}
              <Icon className="relative size-4 sm:size-5" />
              <span className="relative">{section.title}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={active.group}
          role="tabpanel"
          id={`panel-${active.group}`}
          aria-labelledby={`tab-${active.group}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.2 }}
        >
          <SectionHeading
            title={active.title}
            description={active.description}
            icon={active.icon}
          />
          <div className={`grid grid-cols-1 gap-6 ${active.gridClass}`}>
            {activeMembers.map((member) => (
              <TeamMember key={member.id} member={member} />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

export function TeamPageClient({ members }: { members: TeamMemberData[] }) {
  return (
    <main className="container mx-auto px-4 py-12 md:py-20">
      <section className="relative left-1/2 -mt-12 mb-16 w-screen -translate-x-1/2 overflow-hidden pt-28 pb-16 md:-mt-20">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="bg-primary/10 absolute -top-32 left-1/2 h-88 w-lg -translate-x-1/2 rounded-full blur-[110px]" />
          <div className="via-primary/30 absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent to-transparent" />
          <div className="from-background via-background/60 absolute inset-x-0 bottom-0 h-36 bg-linear-to-t to-transparent" />
        </div>

        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto max-w-3xl">
            <Badge
              variant="outline"
              className="border-primary/30 bg-background/80 text-primary shadow-sm backdrop-blur-md"
            >
              <BadgeCheckIcon className="size-3.5" />
              Zespół KN SCORPIO
            </Badge>
            <h1 className="text-foreground mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Poznaj nasz <span className="text-primary">zespół</span>
            </h1>
            <p className="text-muted-foreground mx-auto mt-5 max-w-2xl text-base leading-relaxed sm:text-lg">
              Jesteśmy grupą ponad 50 ambitnych studentów, którzy rozwijają
              łaziki marsjańskie oraz kompetencje techniczne i organizacyjne.
            </p>
          </div>
        </div>
      </section>

      <div className="space-y-20">
        {STANDALONE_SECTIONS.map((section) => {
          const sectionMembers = members.filter(
            (member) => member.group === section.group,
          );
          if (sectionMembers.length === 0) {
            return null;
          }
          return (
            <section key={section.group} id={section.group}>
              <SectionHeading
                title={section.title}
                description={section.description}
                icon={section.icon}
              />
              <div className={`grid grid-cols-1 gap-6 ${section.gridClass}`}>
                {sectionMembers.map((member) => (
                  <TeamMember key={member.id} member={member} />
                ))}
              </div>
            </section>
          );
        })}

        <DepartmentTabs members={members} />
      </div>
    </main>
  );
}
