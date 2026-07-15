const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src/app/tenant/[subdomain]/_components/themes');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Skip if already has category
  if (content.includes('{product.category}')) continue;

  // Different themes use different tags for product.name, e.g., <h4>, <h3>
  const regex = /(<h[34][^>]*>\{product\.name\}<\/h[34]>)/g;
  
  if (regex.test(content)) {
    content = content.replace(regex, `$1\n                {product.category && (\n                  <span className="inline-block mt-2 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border border-[var(--t-accent)] text-[var(--t-accent)] bg-[var(--t-accent)]/10">\n                    {product.category}\n                  </span>\n                )}`);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  } else {
    console.log(`Could not find {product.name} in ${file}`);
  }
}
