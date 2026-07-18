const fs = require('fs');
const path = require('path');

const directory = 'src';

function walkDir(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            if (!file.includes('node_modules') && !file.includes('.next')) {
                results = results.concat(walkDir(file));
            }
        } else {
            if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walkDir(directory);
let totalFixed = 0;

files.forEach(file => {
    if (file.includes('date-utils.ts')) return;
    let content = fs.readFileSync(file, 'utf8');
    
    if (content.includes('getTodayString()') && !content.includes('import {') && !content.includes('getTodayString')) {
        // wait, the previous check !content.includes('getTodayString') is wrong.
    }
    
    // Better check:
    if (content.includes('getTodayString()') && !content.match(/import\s+{[^}]*getTodayString[^}]*}\s+from\s+["']@\/lib\/date-utils["']/)) {
        // We need to add or update the import.
        if (content.includes('import { getCurrentDate } from "@/lib/date-utils"')) {
            content = content.replace('import { getCurrentDate } from "@/lib/date-utils"', 'import { getCurrentDate, getTodayString } from "@/lib/date-utils"');
        } else {
            // Find the last import
            const importMatches = [...content.matchAll(/^import .* from .*$/gm)];
            if (importMatches.length > 0) {
                const lastImport = importMatches[importMatches.length - 1];
                const lastImportIndex = lastImport.index + lastImport[0].length;
                content = content.slice(0, lastImportIndex) + '\nimport { getTodayString } from "@/lib/date-utils";' + content.slice(lastImportIndex);
            } else {
                content = 'import { getTodayString } from "@/lib/date-utils";\n' + content;
            }
        }
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Added import to ${file}`);
        totalFixed++;
    }
});

console.log(`Total files fixed imports: ${totalFixed}`);
