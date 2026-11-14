import Image from "next/image";

import type { Partner } from "@/lib/api/partners";
import { cmsImageLoader } from "@/lib/cms-image";
import { cn } from "@/lib/utils";

/**
 * Partner logo, centred in whatever light cell it is placed in. Logos are
 * sized by area, not width, so a long wordmark and a square badge look
 * equally heavy.
 */
export function LogoMark({
  partner,
  area,
  className,
}: {
  partner: Pick<Partner, "name" | "logo">;
  /** Target logo area in px² at full size; the cell's padding still bounds it. */
  area: number;
  className?: string;
}) {
  const { logo } = partner;
  const aspect = logo.width / logo.height;
  const width = Math.round(Math.sqrt(area * aspect));

  return (
    <div className={cn("flex items-center justify-center p-[10%]", className)}>
      <Image
        loader={cmsImageLoader}
        src={logo.src}
        alt={logo.alt === "" ? partner.name : logo.alt}
        width={logo.width}
        height={logo.height}
        sizes={`${String(width)}px`}
        style={{ width }}
        className="h-auto max-h-full max-w-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.05]"
      />
    </div>
  );
}
