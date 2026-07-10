import { getMasterData } from "./actions";
import { MasterDataClient } from "./_components/MasterDataClient";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { SESSION_OPTIONS, type SessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function MasterDataPage() {
  const session = await getIronSession<{ user?: SessionUser }>(await cookies(), SESSION_OPTIONS);
  const data = await getMasterData();
  return <MasterDataClient data={data} userRole={session.user?.role || "OWNER"} />;
}
