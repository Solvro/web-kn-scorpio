import { FooterClient } from "@/components/footer/footer-clinet";
import { getGeneralInfo } from "@/lib/api/general";

export async function FooterServer() {
  const generalInfo = await getGeneralInfo();

  return <FooterClient generalInfo={generalInfo} />;
}
