import { getMasterData } from "./actions";
import { MasterDataClient } from "./_components/MasterDataClient";

export const dynamic = "force-dynamic";

export default async function MasterDataPage() {
  const data = await getMasterData();
  return <MasterDataClient data={data} />;
}
