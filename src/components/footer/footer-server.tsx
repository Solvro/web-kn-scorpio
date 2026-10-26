import { FooterClient } from "@/components/footer/footer-clinet";
import { getGeneralInfo } from "@/lib/api/general";

export async function FooterServer({
  recruitmentAvailable,
}: {
  recruitmentAvailable: boolean;
}) {
  const generalInfo = await getGeneralInfo();

  return (
    <FooterClient
      generalInfo={generalInfo}
      recruitmentAvailable={recruitmentAvailable}
    />
  );
}
