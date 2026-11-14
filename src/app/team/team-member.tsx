"use client";

import { motion } from "motion/react";
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

export function TeamMember({
  member,
  index = 0,
}: {
  member: TeamMemberData;
  /** Position in the grid, used to stagger the entrance animation. */
  index?: number;
}) {
  const photoSource = member.photo?.src;
  const hoverSource = member.photo_hover?.src;

  const hasPhoto = photoSource != null && photoSource !== "";
  const hasHover = hoverSource != null && hoverSource !== "";

  return (
    <motion.div
      className="h-full"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.55,
        delay: (index % 4) * 0.07,
        ease: "easeOut",
      }}
    >
      <Card className="group hover:border-primary/40 hover:shadow-primary/10 h-full overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0">
        <CardContent className="flex h-full flex-col p-0">
          <div className="bg-muted relative aspect-square w-full shrink-0 overflow-hidden">
            <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100">
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
          </div>
          {/* One line for the name and one for the role: every tile has the same height, without empty gaps */}
          <div className="flex flex-1 flex-col items-center gap-1.5 px-5 py-4 text-center">
            <h3
              title={member.name}
              className="text-foreground group-hover:text-primary w-full truncate text-lg leading-7 font-bold transition-colors duration-300"
            >
              {member.name}
            </h3>
            <div className="flex min-h-6 max-w-full items-center justify-center">
              {member.role == null || member.role === "" ? null : (
                <Badge variant="outline-sm" className="max-w-full truncate">
                  {member.role}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
