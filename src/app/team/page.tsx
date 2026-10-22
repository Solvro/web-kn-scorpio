import {
  Flashlight,
  FlaskConical,
  Monitor,
  Settings,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { Activity } from "react";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";

export const metadata: Metadata = {
  title: "Zespół",
};

function TeamMember({
  name,
  position,
  src,
}: {
  name: string;
  position?: string;
  src?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="bg-muted relative aspect-square w-full shrink-0 overflow-hidden rounded-lg">
        <Activity mode={src === undefined ? "hidden" : "visible"}>
          <Image
            src={src ?? ""}
            alt={name}
            width={500}
            height={500}
            className="object-cover"
          />
        </Activity>
      </div>
      <div className="flex h-full flex-col items-center justify-between gap-1 text-center">
        <h4 className="text-foreground text-2xl font-semibold">{name}</h4>
        <p className="text-primary text-xl font-semibold">{position}</p>
      </div>
    </div>
  );
}

export default function TeamPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
      <div className="space-y-12">
        <div className="space-y-6">
          <h2 className="text-primary text-5xl font-semibold">Kim jesteśmy?</h2>
          <p className="text-lg">
            Jesteśmy grupą ponad 50 ambitnych studentów, którzy w wolnym czasie
            budują łaziki. Każdy z nas zajmuje się inną dziedziną, dzięki czemu
            tworzymy niesamowicie różnorodny i inspirujący zespół.
          </p>
        </div>
        <div className="space-y-6">
          <h3 className="text-primary text-4xl font-semibold">Zarząd</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <TeamMember
              name="Dominik Pawliszewski"
              position="Prezes"
              src="/team/Dominik-Pawilszewski.jpg"
            />
            <TeamMember
              name="Kinga Adamska"
              position="Wiceprezes"
              src="/team/Kinga_Adamska.jpg"
            />
            <TeamMember
              name="Krzysztof Piechota"
              position="Program Director"
              src="/team/Krzysztof-Piechota.jpg"
            />
            <TeamMember
              name="Krysia Fluder"
              position="Liderka Działu Marketing"
              src="/team/Krysia_Fluder.jpg"
            />
          </div>
        </div>
        <div className="space-y-6">
          <h3 className="text-primary text-4xl font-semibold">Opiekunowie</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <TeamMember
              name="Dr hab. inż. Maciej Zwierzchowski, prof. PWR"
              position="Opiekun Koła Naukowego Scorpio"
              src="/advisors/Maciej.jpg"
            />
            <TeamMember
              name="Dr inż. Adrian Zakrzewski"
              position="Opiekun Koła Naukowego Scorpio"
              src="/advisors/Adrian.jpg"
            />
            <TeamMember
              name="Dr inż. Jakub Chołodowski"
              position="Opiekun Koła Naukowego Scorpio"
              src="/advisors/Jakub.jpg"
            />
          </div>
        </div>
        <div className="space-y-6">
          <h3 className="text-primary text-4xl font-semibold">Działy</h3>
          <ButtonGroup>
            <Button size="lg">
              <Settings />
              Konstrukcja
            </Button>
            <Button size="lg" variant="secondary">
              <Flashlight /> Elektronika
            </Button>
            <Button size="lg" variant="secondary">
              <Monitor /> Software
            </Button>
            <Button size="lg" variant="secondary">
              <FlaskConical /> Science
            </Button>
            <Button size="lg" variant="secondary">
              <Users /> Marketing
            </Button>
          </ButtonGroup>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <TeamMember
              name="Dominik Pawliszewski"
              position="Prezes"
              src="/team/Dominik-Pawilszewski.jpg"
            />
            <TeamMember
              name="Kinga Adamska"
              position="Wiceprezes"
              src="/team/Kinga_Adamska.jpg"
            />
            <TeamMember
              name="Krzysztof Piechota"
              position="Program Director"
              src="/team/Krzysztof-Piechota.jpg"
            />
            <TeamMember
              name="Krysia Fluder"
              position="Liderka Działu Marketing"
              src="/team/Krysia_Fluder.jpg"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
