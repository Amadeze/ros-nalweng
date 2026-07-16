const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../src/app/tenant/[subdomain]/_components/themes');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  let changed = false;
  if (content.includes('cart.items.length')) {
    content = content.replace(/cart\.items\.length/g, '(cart.items[tenant.subdomain] || []).length');
    changed = true;
  }
  if (content.includes('cart?.items?.length')) {
    content = content.replace(/cart\?\.items\?\.length/g, '(cart.items[tenant.subdomain] || []).length');
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }
}
