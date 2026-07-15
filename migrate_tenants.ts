import { prisma } from './src/lib/prisma';

async function main() {
  let t = await prisma.tenant.findUnique({where: {code: 'NALWENG'}});
  if (!t) {
    t = await prisma.tenant.create({data: {name: 'Nalweng Roastery', code: 'NALWENG'}});
  }
  const models = ['user', 'customer', 'supplier', 'product', 'packaging', 'recipe', 'purchase', 'roastingBatch', 'productionBatch', 'invoice', 'payment', 'inventoryLedger', 'expense', 'partner', 'capitalTransaction', 'profitDistribution'];
  for (let m of models) {
    if ((prisma as any)[m]) {
      const res = await (prisma as any)[m].updateMany({where: {tenantId: null}, data: {tenantId: t.id}});
      console.log('Updated ' + res.count + ' ' + m);
    }
  }
  console.log('Done!');
}
main().finally(() => prisma.$disconnect());
