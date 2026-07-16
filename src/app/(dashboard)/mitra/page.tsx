import { getMitraData } from "./actions";
import { MitraClient } from "./MitraClient";

export const dynamic = "force-dynamic";

export default async function MitraPage() {
  const data = await getMitraData();
  return <MitraClient partnersCount={data.partners.length} />;
}
