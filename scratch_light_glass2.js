const fs = require('fs');
const path = require('path');

const DIRECTORIES = [
  'src/app/(dashboard)',
  'src/components'
];

const REPLACEMENTS = [
  { from: /\bbg-zinc-50\/50\b/g, to: "bg-white/30" },
  { from: /\bhover:bg-zinc-50\b/g, to: "hover:bg-white/50" },
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      
      for (const rule of REPLACEMENTS) {
        const newContent = content.replace(rule.from, rule.to);
        if (newContent !== content) {
          content = newContent;
          modified = true;
        }
      }
      
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Modified:', fullPath);
      }
    }
  }
}

DIRECTORIES.forEach(dir => {
  const absoluteDir = path.resolve(__dirname, dir);
  if (fs.existsSync(absoluteDir)) {
    processDirectory(absoluteDir);
  }
});
console.log('Done.');
