import { getRoastingPageData } from "./actions";
import { RoastingClient } from "./_components/RoastingClient";

export const dynamic = "force-dynamic";

export default async function RoastingPage() {
  const data = await getRoastingPageData();

  return (
    <RoastingClient
      batches={data.batches}
      gbOptions={data.gbOptions}
      rbOptions={data.rbOptions}
      machineOptions={data.machineOptions}
    />
  );
}
