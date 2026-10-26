import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { TeamMemberData } from "@/lib/api/team";
import { cmsImageLoader } from "@/lib/cms-image";

const DEFAULT_PHOTO = "/team/member-default.jpg";
const DEFAULT_PHOTO_HOVER = "/team/member-default-hover.jpg";

const SIZES = "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw";

const HOVER_CLASS =
  "object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100";

export function TeamMember({ member }: { member: TeamMemberData }) {
  const photoSource = member.photo?.src;
  const hoverSource = member.photo_hover?.src;

  const hasPhoto = photoSource != null && photoSource !== "";
  const hasHover = hoverSource != null && hoverSource !== "";

  return (
    <Card className="group overflow-hidden">
      <CardContent className="p-0">
        <div className="bg-muted relative aspect-square w-full overflow-hidden">
          {hasPhoto ? (
            <Image
              loader={cmsImageLoader}
              src={photoSource}
              alt={member.photo?.alt ?? member.name}
              fill
              sizes={SIZES}
              className="object-cover"
            />
          ) : (
            <Image
              src={DEFAULT_PHOTO}
              alt={member.name}
              fill
              sizes={SIZES}
              className="object-cover"
            />
          )}

          {hasPhoto ? (
            hasHover ? (
              <Image
                loader={cmsImageLoader}
                src={hoverSource}
                alt=""
                aria-hidden
                fill
                sizes={SIZES}
                className={HOVER_CLASS}
              />
            ) : null
          ) : (
            <Image
              src={DEFAULT_PHOTO_HOVER}
              alt=""
              aria-hidden
              fill
              sizes={SIZES}
              className={HOVER_CLASS}
            />
          )}
        </div>
        <div className="space-y-2 p-5 text-center">
          <h3 className="text-foreground text-lg font-bold">{member.name}</h3>
          {member.role == null || member.role === "" ? null : (
            <Badge variant="outline-sm">{member.role}</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
