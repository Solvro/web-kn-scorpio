import type { LucideIcon } from "lucide-react";
import {
  GlobeIcon,
  GraduationCapIcon,
  MailIcon,
  PhoneIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react";
import Image from "next/image";

import { FadeIn } from "@/app/contact/motion";
import { SectionHeading } from "@/app/contact/section-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { getAcademicAdvisors } from "@/lib/api/academic-advisors";
import { getManagementTeam } from "@/lib/api/management-team";

const CARD_HOVER =
  "h-full transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 motion-reduce:transition-none motion-reduce:hover:translate-y-0";

function withProtocol(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return `https://${url}`;
}

/** Delay by column so a row cascades, without long waits on tall grids. */
function stagger(index: number): number {
  return (index % 4) * 0.07;
}

/** Round icon button; the full value stays available via tooltip and screen readers. */
function ContactAction({
  href,
  label,
  detail,
  icon: Icon,
  external = false,
}: {
  href: string;
  label: string;
  detail: string;
  icon: LucideIcon;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      title={detail}
      aria-label={`${label}: ${detail}`}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="border-border bg-muted/40 text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary focus-visible:ring-ring/50 flex size-11 items-center justify-center rounded-full border transition-colors outline-none focus-visible:ring-2"
    >
      <Icon aria-hidden className="size-5" />
    </a>
  );
}

export async function ManagementTeam() {
  const managementTeam = await getManagementTeam();
  const academicAdvisors = await getAcademicAdvisors();

  if (managementTeam.length === 0 || academicAdvisors.length === 0) {
    return null;
  }

  return (
    <>
      <section id="zarzad" className="mt-24 scroll-mt-24">
        <SectionHeading
          icon={UsersIcon}
          title="Zarząd Koła"
          description="Osoby odpowiedzialne za kierowanie pracami zespołu i reprezentację projektu."
        />

        <div className="grid gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {managementTeam.map((member, index) => (
            <FadeIn key={member.name} delay={stagger(index)} className="h-full">
              <Card className={CARD_HOVER}>
                <CardContent className="flex flex-col items-center justify-center">
                  <div className="border-border/80 bg-muted relative my-2 flex size-48 shrink-0 items-center justify-center overflow-hidden rounded-full border">
                    {member.avatar ? (
                      <Image
                        src={member.avatar}
                        alt={member.name}
                        className="object-cover"
                        fill
                        unoptimized
                      />
                    ) : (
                      <UserIcon className="text-muted-foreground/50 size-20" />
                    )}
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <Badge variant="outline-sm">{member.role}</Badge>
                    <p className="text-foreground my-2 truncate text-center text-base font-bold">
                      {member.name}
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="justify-center border-t">
                  <PhoneIcon className="text-primary size-4" />
                  {member.phone}
                </CardFooter>
              </Card>
            </FadeIn>
          ))}
        </div>
      </section>

      <section id="opiekunowie" className="mt-24 scroll-mt-24">
        <SectionHeading
          icon={GraduationCapIcon}
          title="Opiekunowie Projektu"
          description="Kadra akademicka Politechniki Wrocławskiej wspierająca rozwój naukowy i techniczny SCORPIO."
        />

        <div className="grid gap-6 md:grid-cols-3">
          {academicAdvisors.map((advisor, index) => (
            <FadeIn
              key={advisor.name}
              delay={stagger(index)}
              className="h-full"
            >
              <Card className={CARD_HOVER}>
                <CardContent className="flex flex-col items-center justify-center">
                  <div className="border-border/80 bg-muted relative my-2 flex size-48 shrink-0 items-center justify-center overflow-hidden rounded-full border">
                    {advisor.avatar ? (
                      <Image
                        src={advisor.avatar}
                        alt={advisor.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <UserIcon className="text-muted-foreground/50 size-20" />
                    )}
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-foreground my-2 truncate text-center text-base font-bold">
                      {advisor.name}
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="justify-center gap-3 border-t">
                  <ContactAction
                    href={`mailto:${advisor.email}`}
                    label="Wyślij e-mail"
                    detail={advisor.email}
                    icon={MailIcon}
                  />
                  <ContactAction
                    href={`tel:${advisor.phone}`}
                    label="Zadzwoń"
                    detail={advisor.phone}
                    icon={PhoneIcon}
                  />
                  <ContactAction
                    href={withProtocol(advisor.web)}
                    label="Otwórz stronę"
                    detail={advisor.web}
                    icon={GlobeIcon}
                    external
                  />
                </CardFooter>
              </Card>
            </FadeIn>
          ))}
        </div>
      </section>
    </>
  );
}
