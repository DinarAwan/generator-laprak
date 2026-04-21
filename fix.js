const fs = require('fs');

let live = fs.readFileSync('components/LiveCanvas.tsx', 'utf8');

// 1. toRoman
live = live.replace("const A4_PX   = 1122.5;", `function toRoman(num: number): string {
  const romanMap: [number, string][] = [
    [100, 'c'], [90, 'xc'], [50, 'l'], [40, 'xl'], [10, 'x'],
    [9, 'ix'], [5, 'v'], [4, 'iv'], [1, 'i']
  ];
  let result = '';
  let n = num;
  for (const [val, sym] of romanMap) {
    while (n >= val) {
      result += sym;
      n -= val;
    }
  }
  return result || '0';
}

const A4_PX   = 1122.5;`);

// 2. BREAKABLE_SEL
live = live.replace(/const BREAKABLE_SEL = \[\s*'\.soal-container',\s*'\.section-block',\s*'\.breakable-p',\s*'img',\s*'\.code-block',\s*'\.my-4',\s*\]\.join\(\', \'\);/, `const BREAKABLE_SEL = [
  '.breakable-p',
  'img',
  '.code-block',
  '.my-4',
  '.header-breakable',
].join(', ');`);

// 3. PaginatedText
live = live.replace(/<p key=\{pIdx\} className="mb-2 breakable-p">\s*\{p\}\s*<\/p>/g, `<p key={pIdx} className="mb-2 breakable-p whitespace-pre-wrap">
            {p}
          </p>`);
live = live.replace(/if \(!p\.trim\(\)\) return <br key=\{pIdx\} \/>;/g, `if (!p.trim()) return <p key={pIdx} className="mb-2 breakable-p min-h-[1.5em]">{"\\u00A0"}</p>;`);

// 4. PageSectionProps
live = live.replace(/isCover\?: boolean;\n\}/g, `isCover?: boolean;\n  isRoman?: boolean;\n}`);
live = live.replace(/isCover = false,\n\}: PageSectionProps\)/g, `isCover = false,\n  isRoman = false,\n}: PageSectionProps)`);

// 5. PageSection usage of \`data-is-roman\` and \`toRoman\`
live = live.replace(/data-start-page=\{startPage\}\n\s*className="relative print:hidden flex flex-col gap-\[16px\]"/g, `data-start-page={startPage}\n        data-is-roman={isRoman}\n        className="relative print:hidden flex flex-col gap-[16px]"`);
live = live.replace(/\{!hidePageNumber && pageNum >= 2 && \(/g, `{!hidePageNumber && (`);
live = live.replace(/\{pageNum\}\n\s*<\/div>\n\s*\)}/g, `{isRoman ? toRoman(pageNum) : pageNum}\n                </div>\n              )}`);

// 6. Offsets
live = live.replace(/const offsets = \{\n[\s\S]*?  \};\n/g, `const romanOffsets = {
    cover:              1,
    'daftar-isi':       1 + pCover,
    'daftar-gambar':    1 + pCover + pIsi,
    'daftar-tabel':     1 + pCover + pIsi + pGbr,
    'daftar-kode':      1 + pCover + pIsi + pGbr + pTbl,
    'daftar-pertemuan': 1 + pCover + pIsi + pGbr + pTbl + pKd,
  };

  const arabicOffsets = {
    'pre-test':         2,
    hasil:              2 + pPreTest,
    'post-test':        2 + pPreTest + pHasil,
  };
`);

// 7. renderDaftarPage
live = live.replace(/items: \{ id: string; label: string; halaman: string \}\[\].*\n  \)/g, `items: { id: string; label: string; halaman: string }[],
    isRoman: boolean = false
  )`);
live = live.replace(/startPage=\{offsets\[id as keyof typeof offsets\]\}/g, `startPage={romanOffsets[id as keyof typeof romanOffsets]} isRoman={isRoman}`);

// 8. Passing coordinates
live = live.replace(/startPage=\{offsets\['cover'\]\}/g, `startPage={romanOffsets['cover']} isRoman`);
live = live.replace(/daftars\.isi\)\}/g, `daftars.isi, true)}`);
live = live.replace(/daftars\.gambar\)\}/g, `daftars.gambar, true)}`);
live = live.replace(/daftars\.tabel\)\}/g, `daftars.tabel, true)}`);
live = live.replace(/daftars\.kode\)\}/g, `daftars.kode, true)}`);
live = live.replace(/\[\]\)\}/g, `[], true)}`);
live = live.replace(/startPage=\{offsets\['pre-test'\]\}/g, `startPage={arabicOffsets['pre-test']}`);
live = live.replace(/startPage=\{offsets\['hasil'\]\}/g, `startPage={arabicOffsets['hasil']}`);
live = live.replace(/startPage=\{offsets\['post-test'\]\}/g, `startPage={arabicOffsets['post-test']}`);

// 9. Replace bare <p> with PaginatedText where necessary!
// For Intro:
live = live.replace(/<p className="text-\[11pt\] mb-3 text-justify">\{data\.preTestIntro\}<\/p>/g, `<PaginatedText className="text-[11pt] mb-3 text-justify" text={data.preTestIntro} />`);
live = live.replace(/<p className="text-\[11pt\] mb-3 text-justify">\{data\.postTestIntro\}<\/p>/g, `<PaginatedText className="text-[11pt] mb-3 text-justify" text={data.postTestIntro} />`);
live = live.replace(/<p className="text-\[11pt\] mb-4 text-justify">\{hasil\.intro\}<\/p>/g, `<PaginatedText className="text-[11pt] mb-4 text-justify" text={hasil.intro} />`);

// For Soal Pertanyaan code (with backticks inside text replacement, be careful):
live = live.replace(/<p className="text-\[11pt\] text-justify">\{soal\.pertanyaan \|\| `Pertanyaan \$\{index \+ 1\}`\}<\/p>/g, `<PaginatedText className="text-[11pt] text-justify" text={soal.pertanyaan || \`Pertanyaan \${index + 1}\`} />`);
// For Jawaban analisis:
live = live.replace(/<p className="text-\[11pt\] text-justify">\{soal\.analisis\}<\/p>/g, `<PaginatedText className="text-[11pt] text-justify" text={soal.analisis} />`);

// Add header-breakable where needed
live = live.replace(/<p className="text-\[11pt\] font-bold mb-1">Alat dan Bahan:<\/p>/g, `<p className="text-[11pt] font-bold mb-1 header-breakable">Alat dan Bahan:</p>`);
live = live.replace(/<p className="text-\[11pt\] font-bold mb-1">Langkah Kerja:<\/p>/g, `<p className="text-[11pt] font-bold mb-1 header-breakable">Langkah Kerja:</p>`);
live = live.replace(/<p className="text-\[11pt\] font-bold mb-1">Implementasi\/Screenshot:<\/p>/g, `<p className="text-[11pt] font-bold mb-1 header-breakable">Implementasi/Screenshot:</p>`);
live = live.replace(/<p className="text-\[11pt\] font-bold mb-1">Analisis Hasil :<\/p>/g, `<p className="text-[11pt] font-bold mb-1 header-breakable">Analisis Hasil :</p>`);
live = live.replace(/<p className="text-\[11pt\] text-justify">Jawaban<\/p>/g, `<p className="text-[11pt] text-justify header-breakable">Jawaban</p>`);

// Also fix hasil intro / penjelsaan
live = live.replace(/<p className="text-\[11pt\] text-justify mb-2">\{ss\.penjelasan_atas\}<\/p>/g, `<PaginatedText className="text-[11pt] text-justify mb-2" text={ss.penjelasan_atas} />`);
live = live.replace(/<p className="text-\[11pt\] text-justify mt-2">\{ss\.penjelasan_bawah\}<\/p>/g, `<PaginatedText className="text-[11pt] text-justify mt-2" text={ss.penjelasan_bawah} />`);

// Replace <PageSection ... isCover> to include isRoman explicitly if not already
live = live.replace(/hidePageNumber isCover>/g, `hidePageNumber isCover isRoman>`);

fs.writeFileSync('components/LiveCanvas.tsx', live);

let daftar = fs.readFileSync('components/tabs/DaftarTab.tsx', 'utf8');
daftar = daftar.replace(/const getPageNumber = \(id: string\): string => \{/, `const toRoman = (num: number): string => {
      const romanMap: [number, string][] = [
        [100, 'c'], [90, 'xc'], [50, 'l'], [40, 'xl'], [10, 'x'],
        [9, 'ix'], [5, 'v'], [4, 'iv'], [1, 'i']
      ];
      let result = '';
      let n = num;
      for (const [val, sym] of romanMap) {
        while (n >= val) {
          result += sym;
          n -= val;
        }
      }
      return result || '0';
    };

    const getPageNumber = (id: string): string => {`);

daftar = daftar.replace(/return \(startPage \+ pageOffset\)\.toString\(\);/g, `const isRoman = section.getAttribute('data-is-roman') === 'true';\n      const num = startPage + pageOffset;\n      return isRoman ? toRoman(num) : num.toString();`);

daftar = daftar.replace(/return section\.getAttribute\('data-start-page'\) \|\| '';/g, `const sp = section.getAttribute('data-start-page') || '';\n      if (!sp) return '';\n      const isRoman = section.getAttribute('data-is-roman') === 'true';\n      return isRoman ? toRoman(parseInt(sp, 10)) : sp;`);

fs.writeFileSync('components/tabs/DaftarTab.tsx', daftar);

console.log('Done!');
