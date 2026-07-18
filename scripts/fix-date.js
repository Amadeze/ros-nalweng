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
    if (file.includes('date-utils.ts')) return;
    let content = fs.readFileSync(file, 'utf8');
    let hasChanges = false;
    
    if (content.includes('getCurrentDate().toISOString().split("T")[0]')) {
        content = content.replace(/getCurrentDate\(\)\.toISOString\(\)\.split\("T"\)\[0\]/g, 'getTodayString()');
        
        // update import
        if (!content.includes('getTodayString')) {
            content = content.replace(/import \{ getCurrentDate \} from "@\/lib\/date-utils";/, 'import { getCurrentDate, getTodayString } from "@/lib/date-utils";');
        }
        hasChanges = true;
    }
    
    if (hasChanges) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Fixed string in ${file}`);
        totalReplaced++;
    }
});

console.log(`Total fixed string: ${totalReplaced}`);
