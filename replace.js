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
      if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css') || file.endsWith('.js')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src');
files.push('./tailwind.config.js');

const replacements = [
  { from: /bg-amber-500 text-white/g, to: 'bg-white text-ink-950' },
  { from: /bg-amber-500\/15 text-amber-400/g, to: 'bg-white/15 text-white' },
  { from: /bg-amber-50 text-amber-700 border-amber-200/g, to: 'bg-ink-800 text-sand-200 border-ink-700' },
  { from: /bg-amber-50 text-amber-700 border border-amber-200/g, to: 'bg-ink-800 text-sand-200 border border-ink-700' },
  { from: /text-amber-500/g, to: 'text-white' },
  { from: /text-amber-400/g, to: 'text-sand-100' },
  { from: /bg-amber-500/g, to: 'bg-white' },
  { from: /hover:bg-amber-400/g, to: 'hover:bg-sand-200' },
  { from: /hover:text-amber-400/g, to: 'hover:text-white' },
  { from: /border-amber-500/g, to: 'border-white' },
  { from: /border-amber-600/g, to: 'border-white' },
  { from: /btn-amber/g, to: 'btn-white' },
  { from: /badge-amber/g, to: 'badge-white' },
  { from: /amber-gradient/g, to: 'white-gradient' },
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  replacements.forEach(r => {
    content = content.replace(r.from, r.to);
  });
  
  // Specific fix for globals.css
  if (file.endsWith('globals.css')) {
    content = content.replace(/rgba\(247, 144, 9/g, 'rgba(255, 255, 255');
  }
  
  // Specific fix for tailwind.config.js
  if (file.endsWith('tailwind.config.js')) {
    content = content.replace(/rgba\(247, 144, 9/g, 'rgba(255, 255, 255');
    content = content.replace(/linear-gradient\(135deg, #fdb022 0%, #f79009 50%, #dc6803 100%\)/g, 'linear-gradient(135deg, #ffffff 0%, #d4d4d4 50%, #a3a3a3 100%)');
  }

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated', file);
  }
});
