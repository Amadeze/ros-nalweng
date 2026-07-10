import { prisma } from "./src/lib/prisma";

async function main() {
  const fg = await prisma.product.findMany({
    where: { type: 'FINISHED_GOODS' },
    include: {
      ledgerEntries: true,
      recipes: true
    }
  });
  
  for (const p of fg) {
    let produced = 0;
    let sold = 0;
    
    for (const l of p.ledgerEntries) {
      if (l.refType === 'PRODUCTION_FG_IN') produced += Number(l.quantityUnit || 0);
      if (l.refType === 'SALE_FG_OUT') sold += Number(l.quantityUnit || 0);
    }
    
    const weightPerUnitGrams = p.recipes.length > 0 ? Number(p.recipes[0].outputGrams) : 0;
    const soldKg = (sold * weightPerUnitGrams) / 1000;
    
    console.log(`[FG] ${p.name}: Diproduksi = ${produced} unit, Terjual = ${sold} unit (${soldKg} kg)`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
