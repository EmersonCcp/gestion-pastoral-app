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
            if (file.endsWith('.html') || file.endsWith('.ts')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('./src/app');
let modifiedCount = 0;

files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    // Match Tailwind classes like text-blue-500, hover:bg-blue-600, border-blue-200 etc
    const newContent = content.replace(/(?<!\w)(text|bg|border|ring|shadow|fill|stroke)-blue-(\d{2,3})/g, '$1-primary-$2')
                              .replace(/hover:(text|bg|border|ring|shadow)-blue-(\d{2,3})/g, 'hover:$1-primary-$2')
                              .replace(/focus:(text|bg|border|ring|shadow)-blue-(\d{2,3})/g, 'focus:$1-primary-$2')
                              .replace(/active:(text|bg|border|ring|shadow)-blue-(\d{2,3})/g, 'active:$1-primary-$2');
    
    if (content !== newContent) {
        fs.writeFileSync(file, newContent, 'utf8');
        console.log(`Updated ${file}`);
        modifiedCount++;
    }
});

console.log(`Total html/ts files modified: ${modifiedCount}`);
