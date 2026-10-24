import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface FullBleedSectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

function FullBleedSection({ children, className, id }: FullBleedSectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "relative left-1/2 w-screen -translate-x-1/2 overflow-hidden",
        className,
      )}
    >
      {children}
    </section>
  );
}

export { FullBleedSection };
