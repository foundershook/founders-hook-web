
const fs = require('fs');

let content = fs.readFileSync('src/app/globals.css', 'utf8');

// Replace amber-500 hex with white
content = content.replace(/#e7b563/g, '#ffffff');

// Replace amber-400 hex with light gray (for hover)
content = content.replace(/#dfba80/g, '#e5e5e5');

// Replace rgba(231, 181, 99, ...) with rgba(255, 255, 255, ...)
content = content.replace(/rgba\(231, 181, 99,/g, 'rgba(255, 255, 255,');

fs.writeFileSync('src/app/globals.css', content, 'utf8');
console.log('Fixed globals.css');

