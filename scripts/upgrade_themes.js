const fs = require('fs');
const path = require('path');

const THEMES_DIR = path.join(__dirname, '..', 'src', 'app', 'tenant', '[subdomain]', '_components', 'themes');

const themes = [
  'botanical/BotanicalTheme.tsx',
  'club/ClubTheme.tsx',
  'cyber/CyberTheme.tsx',
  'editorial/EditorialTheme.tsx',
  'heritage/HeritageTheme.tsx',
  'industrial/IndustrialTheme.tsx',
  'liquid/LiquidTheme.tsx',
  'luxury/LuxuryTheme.tsx',
  'neomodern/NeoModernTheme.tsx',
  'playful/PlayfulTheme.tsx',
];

themes.forEach(themePath => {
  const fullPath = path.join(THEMES_DIR, themePath);
  if (!fs.existsSync(fullPath)) {
    console.log(`Skipping ${themePath} (not found)`);
    return;
  }

  let code = fs.readFileSync(fullPath, 'utf8');

  // 1. Upgrade "Add to Cart" buttons
  // Find <button ... onClick={() => handleAddToCart ...> and change to <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
  code = code.replace(/<button([^>]*onClick=\{\(\) => handleAddToCart\([^>]*>)/g, '<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}$1');
  code = code.replace(/(<motion\.button[^>]*handleAddToCart[^>]*>[\s\S]*?)<\/button>/g, '$1</motion.button>');

  // 2. Upgrade Section Titles (h2)
  // Ensure we don't double wrap if already motion.h2
  code = code.replace(/<h2([^>]*)>/g, (match, p1) => {
    if (match.includes('<motion.h2')) return match;
    return `<motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }}${p1}>`;
  });
  code = code.replace(/<\/h2>/g, '</motion.h2>');

  // 3. Upgrade Section Descriptions (p elements following h2)
  // Very tricky via regex, so let's target specific classes instead or just add it to all <section> wrappers instead.
  
  // 4. Upgrade Product Card Shadows
  // Look for className="" inside the map of products
  // We'll just look for `className="` inside the product mapping block if possible.
  // Actually, a simpler way is to find `group` or `transition-all` inside the product map and inject `hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.2)]`
  
  // Let's add premium shadow to the main catalog item wrapper (often starts with `key={item.id}` inside motion.div)
  code = code.replace(/(key=\{item\.id\}[^>]*className=["'][^"']*)(["'])/g, (match, p1, p2) => {
    if (p1.includes('shadow-')) return match; // already has shadow
    return `${p1} hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-500 ease-out${p2}`;
  });

  // 5. Ensure Framer Motion is imported (sometimes we might have used motion.h2 without import, though all 10 have motion imported)
  
  // 6. Smooth Scroll for sections
  code = code.replace(/<section([^>]*)>/g, (match, p1) => {
    if (match.includes('<motion.section')) return match;
    return `<motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }}${p1}>`;
  });
  code = code.replace(/<\/section>/g, '</motion.section>');

  fs.writeFileSync(fullPath, code, 'utf8');
  console.log(`Upgraded ${themePath}`);
});

console.log("Done upgrading themes!");
