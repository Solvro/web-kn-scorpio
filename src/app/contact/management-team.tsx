import {
  GlobeIcon,
  GraduationCapIcon,
  MailIcon,
  PhoneIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react";
import Image from "next/image";

import { ACADEMIC_ADVISORS, BOARD_MEMBERS } from "@/app/contact/temporary-data";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export function ManagementTeam() {
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
          {BOARD_MEMBERS.map((member) => (
            <Card key={member.name}>
              <CardContent className="flex flex-col items-center justify-center">
                <div className="border-border/80 bg-muted relative my-2 flex size-48 shrink-0 items-center justify-center overflow-hidden rounded-full border">
                  {member.src ? (
                    <Image
                      src={member.src}
                      alt={member.name}
                      fill
                      className="object-cover"
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
          {ACADEMIC_ADVISORS.map((advisor) => (
            <Card key={advisor.name}>
              <CardContent className="flex flex-col items-center justify-center">
                <div className="border-border/80 bg-muted relative my-2 flex size-48 shrink-0 items-center justify-center overflow-hidden rounded-full border">
                  {advisor.src ? (
                    <Image
                      src={advisor.src}
                      alt={advisor.name}
                      fill
                      className="object-cover"
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
              <CardFooter className="flex-col items-start border-t px-2">
                <p className="flex items-center gap-2">
                  <MailIcon className="text-primary size-4" />
                  {advisor.email}
                </p>
                <p className="flex items-center gap-2">
                  <PhoneIcon className="text-primary size-4" />
                  {advisor.phone}
                </p>
                <p className="flex items-center gap-2">
                  <GlobeIcon className="text-primary size-4" />
                  {advisor.web}
                </p>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
