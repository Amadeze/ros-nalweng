const fs = require('fs');
const path = require('path');

const DIRECTORIES = [
  'src/app/(dashboard)',
  'src/components'
];

const REPLACEMENTS = [
  { from: /\bbg-white\b/g, to: "bg-white/5" },
  { from: /\bborder-zinc-200\b/g, to: "border-white/10" },
  { from: /\bborder-zinc-100\b/g, to: "border-white/10" },
  { from: /\bborder-slate-200\b/g, to: "border-white/10" },
  { from: /\bbg-zinc-50\/50\b/g, to: "bg-white/5" },
  { from: /\bbg-zinc-50\b/g, to: "bg-white/10" },
  { from: /\bbg-slate-50\b/g, to: "bg-white/10" },
  { from: /\btext-zinc-900\b/g, to: "text-white" },
  { from: /\btext-zinc-800\b/g, to: "text-slate-100" },
  { from: /\btext-zinc-700\b/g, to: "text-slate-200" },
  { from: /\btext-zinc-600\b/g, to: "text-zinc-400" },
  { from: /\btext-zinc-500\b/g, to: "text-zinc-400" },
  { from: /\btext-slate-900\b/g, to: "text-white" },
  { from: /\btext-slate-800\b/g, to: "text-slate-100" },
  { from: /\btext-slate-700\b/g, to: "text-slate-200" },
  { from: /\btext-slate-600\b/g, to: "text-slate-300" },
  { from: /\btext-slate-500\b/g, to: "text-slate-400" },
  { from: /\bbg-zinc-900\b/g, to: "bg-[#00a8d6] text-white" },
  { from: /\bhover:bg-zinc-700\b/g, to: "hover:bg-[#00a8d6]/80" },
  { from: /\btext-black\b/g, to: "text-white" },
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
