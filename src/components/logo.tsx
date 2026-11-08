import Image from "next/image";
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
        "inline-flex items-center transition-opacity hover:opacity-90",
        className,
      )}
      aria-label="Strona główna SCORPIO"
    >
      <Image
        src="/kn-scorpio-logo.png"
        alt="SCORPIO"
        width={2560}
        height={698}
        sizes="160px"
        className="h-10 w-auto"
        priority
      />
    </Link>
  );
}
