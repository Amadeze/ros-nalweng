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
  if (!fs.existsSync(fullPath)) return;

  let code = fs.readFileSync(fullPath, 'utf8');

  let newCode = code;
  let index = 0;
  while ((index = newCode.indexOf('<motion.button', index)) !== -1) {
    let closeTagIndex = newCode.indexOf('</button>', index);
    if (closeTagIndex !== -1) {
       let nextButton = newCode.indexOf('<button', index + 14);
       if (nextButton === -1 || nextButton > closeTagIndex) {
          newCode = newCode.substring(0, closeTagIndex) + '</motion.button>' + newCode.substring(closeTagIndex + 9);
       } else {
          // there's a nested button? unlikely, but let's skip if true
       }
    }
    index += 14;
  }

  fs.writeFileSync(fullPath, newCode, 'utf8');
  console.log(`Fixed buttons in ${themePath}`);
});
