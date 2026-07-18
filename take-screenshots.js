const { chromium } = require('playwright');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { sealData } = require('iron-session');
const path = require('path');

async function main() {
  const SESSION_OPTIONS = require(path.join(__dirname, 'src/lib/session')).SESSION_OPTIONS;
  const getTenantAccessState = require(path.join(__dirname, 'src/lib/subscription')).getTenantAccessState;

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

  const owners = await prisma.user.findMany({
    where: { isActive: true, role: 'OWNER', tenant: { isActive: true } },
    select: {
      id: true, name: true, email: true, role: true, tenantId: true,
      tenant: { select: { isActive: true, subscriptionTier: true, subscriptionStatus: true, trialEndsAt: true, nextBillingDate: true } },
    },
  });

  const owner = owners.find(c => getTenantAccessState(c.tenant) === 'ACTIVE');
  if (!owner) { console.log('No owner found'); process.exit(1); }

  const { tenant: _, ...user } = owner;
  const cookie = await sealData({ user }, { password: SESSION_OPTIONS.password, ttl: SESSION_OPTIONS.cookieOptions.maxAge });
  await prisma.$disconnect();

  const browser = await chromium.launch();
  const context = await browser.newContext();
  await context.addCookies([{
    name: SESSION_OPTIONS.cookieName,
    value: cookie,
    domain: 'localhost',
    path: '/',
    httpOnly: true,
    sameSite: 'Lax',
  }]);

  const viewports = [
    { width: 360, height: 800, name: '360x800' },
    { width: 390, height: 844, name: '390x844' },
  ];

  for (const vp of viewports) {
    const page = await context.newPage();
    await page.setViewportSize({ width: vp.width, height: vp.height });

    await page.goto('http://localhost:3000/penjualan', { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    await page.screenshot({ path: `test-results/penjualan-${vp.name}.png`, fullPage: false });
    console.log(`Screenshot: penjualan-${vp.name}.png`);

    await page.goto('http://localhost:3000/inventory', { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    await page.screenshot({ path: `test-results/inventory-${vp.name}.png`, fullPage: false });
    console.log(`Screenshot: inventory-${vp.name}.png`);

    await page.close();
  }

  await browser.close();
  console.log('Done');
}

main().catch(e => { console.error(e); process.exit(1); });
