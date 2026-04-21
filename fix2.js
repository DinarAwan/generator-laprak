const fs = require('fs');

let live = fs.readFileSync('components/LiveCanvas.tsx', 'utf8');

// 1. Update BREAKABLE_SEL
live = live.replace(/const BREAKABLE_SEL = \[\s*'\.breakable-p',\s*'img',\s*'\.code-block',\s*'\.my-4',\s*'\.header-breakable',\s*\]\.join\(\', \'\);/, `const BREAKABLE_SEL = [
  '.breakable-p',
  '.figure-block',
  '.header-breakable',
].join(', ');`);

// 2. Add figure-block to wrappers
const wrappersToUpdate = [
  { search: /className="text-center my-3"/g, replace: 'className="text-center my-3 figure-block"' },
  { search: /className="text-left my-3"/g, replace: 'className="text-left my-3 figure-block"' },
  { search: /className="w-full my-4"/g, replace: 'className="w-full my-4 figure-block"' },
  { search: /className="text-center"/g, replace: 'className="text-center figure-block"' },
  { search: /className="text-left"/g, replace: 'className="text-left figure-block"' }
];

wrappersToUpdate.forEach(item => {
  // Be careful not to replace text-center or text-left globally everywhere.
  // Let's target the exact <div> declarations for blocks.
});

// Since the above is risky if it mismatches, I'll do exact string replacements based on the ID.
live = live.replace(/<div id=\{\`pre-img-\$\{index\}\`\} className="text-center my-3">/g, `<div id={\`pre-img-\$\{index\}\`} className="text-center my-3 figure-block">`);
live = live.replace(/<div id=\{\`pre-code-\$\{index\}\`\} className="text-left my-3">/g, `<div id={\`pre-code-\$\{index\}\`} className="text-left my-3 figure-block">`);
live = live.replace(/<div id=\{\`pre-tab-\$\{index\}\`\} className="w-full my-4">/g, `<div id={\`pre-tab-\$\{index\}\`} className="w-full my-4 figure-block">`);

live = live.replace(/<div id=\{\`has-img-\$\{index\}\`\} className="text-center">/g, `<div id={\`has-img-\$\{index\}\`} className="text-center figure-block">`);
live = live.replace(/<div id=\{\`has-code-\$\{index\}\`\} className="text-left">/g, `<div id={\`has-code-\$\{index\}\`} className="text-left figure-block">`);
live = live.replace(/<div id=\{\`has-tab-\$\{index\}\`\} className="w-full my-4">/g, `<div id={\`has-tab-\$\{index\}\`} className="w-full my-4 figure-block">`);

live = live.replace(/<div id=\{\`pos-img-\$\{index\}\`\} className="text-center my-3">/g, `<div id={\`pos-img-\$\{index\}\`} className="text-center my-3 figure-block">`);
live = live.replace(/<div id=\{\`pos-code-\$\{index\}\`\} className="text-left my-3">/g, `<div id={\`pos-code-\$\{index\}\`} className="text-left my-3 figure-block">`);
live = live.replace(/<div id=\{\`pos-tab-\$\{index\}\`\} className="w-full my-4">/g, `<div id={\`pos-tab-\$\{index\}\`} className="w-full my-4 figure-block">`);

// 3. Fix measureRef bounding box to match visual-slice-content width
live = live.replace(/<div\n\s*style=\{\{\n\s*position: 'absolute',\n\s*top: 0,\n\s*left: 0,\n\s*width: '100%',\n\s*visibility: 'hidden',\n\s*pointerEvents: 'none',\n\s*zIndex: -50,\n\s*\}\}\n\s*>/, `<div
          style={{
            position: 'absolute',
            top: 0,
            left: \`\$\{PAGE_ML\}px\`,
            right: \`\$\{PAGE_MR\}px\`,
            visibility: 'hidden',
            pointerEvents: 'none',
            zIndex: -50,
          }}
        >`);

fs.writeFileSync('components/LiveCanvas.tsx', live);
console.log('Done fix2');
