import type { LucideIcon } from "lucide-react";

import { FadeIn } from "@/app/contact/motion";

export function SectionHeading({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <FadeIn className="mb-8 flex items-center gap-4">
      <div className="bg-primary/10 border-primary/20 text-primary rounded-lg border p-2.5">
        <Icon aria-hidden className="size-6" />
      </div>
      <div>
        <h2 className="text-foreground text-2xl font-bold tracking-tighter sm:text-3xl">
          {title}
        </h2>
        <p className="text-muted-foreground mt-1 max-w-xl text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </FadeIn>
  );
}
