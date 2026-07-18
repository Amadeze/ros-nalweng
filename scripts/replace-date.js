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
let totalReplaced = 0;

files.forEach(file => {
    // Skip date-utils itself
    if (file.includes('date-utils.ts')) return;
    
    let content = fs.readFileSync(file, 'utf8');
    
    // Check if new Date() exists
    if (content.includes('new Date()')) {
        // Skip webhook files as they process external UTC times mostly, 
        // wait, webhook times should be local if we want to save local time, but let's replace them anyway 
        // because we want local time in the DB.
        
        let newContent = content.replace(/new Date\(\)/g, 'getCurrentDate()');
        
        // Add import if not present
        if (!newContent.includes('import { getCurrentDate }')) {
            // Find the last import
            const importMatches = [...newContent.matchAll(/^import .* from .*$/gm)];
            if (importMatches.length > 0) {
                const lastImport = importMatches[importMatches.length - 1];
                const lastImportIndex = lastImport.index + lastImport[0].length;
                newContent = newContent.slice(0, lastImportIndex) + '\nimport { getCurrentDate } from "@/lib/date-utils";' + newContent.slice(lastImportIndex);
            } else {
                newContent = 'import { getCurrentDate } from "@/lib/date-utils";\n' + newContent;
            }
        }
        
        fs.writeFileSync(file, newContent, 'utf8');
        console.log(`Replaced in ${file}`);
        totalReplaced++;
    }
});

console.log(`Total files modified: ${totalReplaced}`);
