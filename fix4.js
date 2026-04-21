const fs = require('fs');

let live = fs.readFileSync('components/LiveCanvas.tsx', 'utf8');

// Replace all image styles to have a max-height
live = live.replace(/className="mx-auto max-w-\[90%\] border border-gray-300"/g, 'className="mx-auto max-w-[90%] max-h-[600px] object-contain border border-gray-300"');

fs.writeFileSync('components/LiveCanvas.tsx', live);
console.log('Fixed image dimensions');
