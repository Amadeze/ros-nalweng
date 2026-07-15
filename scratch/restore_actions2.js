import fs from 'fs';

let content = fs.readFileSync('f:/Roastery Operating System/ros-app/src/app/(dashboard)/penjualan/actions.ts', 'utf8');

const missing = `import { requireTenantPrisma } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { appendLedger } from "@/lib/stock";

// =============================================================================
// TYPES
// =============================================================================

export type CustomerOption = {
  id: string;
`;

if (!content.includes('export type CustomerOption = {')) {
  content = content.replace('"use server";\n  code: string;', '"use server";\n' + missing + '  code: string;');
  fs.writeFileSync('f:/Roastery Operating System/ros-app/src/app/(dashboard)/penjualan/actions.ts', content);
}
