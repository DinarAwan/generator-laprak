const fs = require('fs');

let live = fs.readFileSync('components/LiveCanvas.tsx', 'utf8');

live = live.replace(
  /const currentMT = parseFloat\(child\.style\.marginTop \|\| '0'\) \|\| 0;\s+const push = currentMT \+ spaceLeft;/g,
  `const oldMT = parseFloat(window.getComputedStyle(child).marginTop) || 0;
                const push = oldMT + spaceLeft;`
);

fs.writeFileSync('components/LiveCanvas.tsx', live);
console.log('Fixed margin calculation');
