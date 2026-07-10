import { prisma } from "./src/lib/prisma";

async function main() {
  const products = await prisma.product.findMany({
    where: { type: 'GREEN_BEAN' },
    include: {
      ledgerEntries: true
    }
  });
  
  for (const p of products) {
    let bought = 0;
    let roasted = 0;
    
    for (const l of p.ledgerEntries) {
      if (l.refType === 'PURCHASE_GB') bought += Number(l.quantityKg || 0);
      if (l.refType === 'ROASTING_GB_OUT') roasted += Number(l.quantityKg || 0);
    }
    
    console.log(`[GB] ${p.name}: Dibeli = ${bought} kg, Keluar ke Roasting = ${roasted} kg`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
