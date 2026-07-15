const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('f:/Roastery Operating System/ros-app/src/app/(dashboard)');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  if (content.includes('tx.inventoryLedger.create({')) {
    content = content.replace(/tx\.inventoryLedger\.create\(\{/g, 'appendLedger(tx, {');
    
    // Add import if missing
    if (!content.includes('appendLedger')) {
      content = 'import { appendLedger } from "@/lib/stock";\n' + content;
    }
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content);
    console.log('Updated', file);
  }
});
