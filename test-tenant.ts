import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(".env.local") });

import { createTenant } from "./src/app/superadmin/tenants/actions";

async function main() {
  try {
    const res = await createTenant({
      code: "TEST-002",
      name: "Test Roastery 2",
      subdomain: "test2",
      adminName: "Test Admin 2",
      adminEmail: "test2@roastery.com"
    });
    console.log("Result:", res);
  } catch(e) {
    console.error("Crash:", e);
  }
}
main();
