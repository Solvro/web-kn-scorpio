import {
  GlobeIcon,
  GraduationCapIcon,
  MailIcon,
  PhoneIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { getAcademicAdvisors } from "@/lib/api/academic-advisors";
import { getManagementTeam } from "@/lib/api/management-team";

function withProtocol(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return `https://${url}`;
}

export async function ManagementTeam() {
  const managementTeam = await getManagementTeam();
  const academicAdvisors = await getAcademicAdvisors();

  if (managementTeam.length === 0 || academicAdvisors.length === 0) {
    return null;
  }

  return (
    <>
      <section className="mt-20">
        <div className="mb-8 flex items-center gap-3">
          <div className="bg-primary/10 border-primary/20 text-primary rounded-lg border p-2">
            <UsersIcon className="size-6" />
          </div>
          <div>
            <h2 className="text-foreground text-2xl font-bold tracking-tight">
              Zarząd Koła
            </h2>
            <p className="text-muted-foreground text-sm">
              Osoby odpowiedzialne za kierowanie pracami zespołu i reprezentację
              projektu.
            </p>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {managementTeam.map((member) => (
            <Card key={member.name}>
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
          ))}
        </div>
      </section>

      <section className="mt-20">
        <div className="mb-8 flex items-center gap-3">
          <div className="bg-primary/10 border-primary/20 text-primary rounded-lg border p-2">
            <GraduationCapIcon className="size-6" />
          </div>
          <div>
            <h2 className="text-foreground text-2xl font-bold tracking-tight">
              Opiekunowie Projektu
            </h2>
            <p className="text-muted-foreground text-sm">
              Kadra akademicka Politechniki Wrocławskiej wspierająca rozwój
              naukowy i techniczny SCORPIO.
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {academicAdvisors.map((advisor) => (
            <Card key={advisor.name}>
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
              <CardFooter className="flex-col items-center gap-2 border-t px-2 py-2">
                <a
                  href={`mailto:${advisor.email}`}
                  className="text-foreground hover:text-primary flex items-center justify-center gap-2 text-center transition-colors"
                >
                  <MailIcon className="text-primary size-4" />
                  {advisor.email}
                </a>
                <a
                  href={`tel:${advisor.phone}`}
                  className="text-foreground hover:text-primary flex items-center justify-center gap-2 text-center transition-colors"
                >
                  <PhoneIcon className="text-primary size-4" />
                  {advisor.phone}
                </a>
                <a
                  href={withProtocol(advisor.web)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:text-primary flex items-center justify-center gap-2 text-center transition-colors"
                >
                  <GlobeIcon className="text-primary size-4" />
                  {advisor.web}
                </a>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
