const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.js') || file.endsWith('.jsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('f:/Roastery Operating System/ros-app/src');
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let newContent = content.replace(/Nalweng/g, 'Beanslab').replace(/nalweng/g, 'beanslab').replace(/NALWENG/g, 'BEANSLAB');
    if (content !== newContent) {
        fs.writeFileSync(file, newContent);
        console.log('Updated', file);
    }
});
