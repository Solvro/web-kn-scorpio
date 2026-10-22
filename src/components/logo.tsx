import Link from "next/link";

import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        "text-foreground inline-flex items-center gap-1 text-xl font-black tracking-widest transition-opacity hover:opacity-90",
        className,
      )}
      aria-label="Strona główna SCORPIO"
    >
      SC
      <span className="bg-primary inline-block size-2.5 rounded-full" />
      RPIO
    </Link>
  );
}
