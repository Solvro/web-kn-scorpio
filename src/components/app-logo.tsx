/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import Image from "next/image";

import Logo from "@/assets/logo.svg";

export function AppLogo(): React.JSX.Element {
  return <Image src={Logo} alt="Logo" className="block h-9 w-auto" />;
}
