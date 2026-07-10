import { getMitraData } from "./actions";
import { MitraClient } from "./MitraClient";

export const dynamic = "force-dynamic";

export default function MitraPage() {
  return <MitraClient />;
}
