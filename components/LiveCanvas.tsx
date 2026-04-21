'use client';

import { useEffect, useRef, useState, useCallback, ReactNode } from 'react';
import type { FormData as LaprakFormData } from '@/lib/types';

interface LiveCanvasProps {
  data: LaprakFormData;
}

function capitalizeEachWord(str: string): string {
  if (!str) return '';
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}

// ── Konstanta A4 ──────────────────────────────────────────────────────────────
const A4_PX   = 1122.5;  // 297mm @96dpi
const PAGE_MT = 151.18;  // 4cm  (margin atas)
const PAGE_MB = 113.39;  // 3cm  (margin bawah)
const PAGE_ML = 151.18;  // 4cm  (margin kiri)
const PAGE_MR = 113.39;  // 3cm  (margin kanan)

// Tinggi area cetak per halaman (ruang yang boleh diisi konten)
const PRINT_H = A4_PX - PAGE_MT - PAGE_MB; // ≈ 857.93 px

// Selector elemen yang boleh dipindah ke halaman berikutnya
const BREAKABLE_SEL = [
  '.soal-container',
  '.section-block',
  '.breakable-p',
  'img',
  '.code-block',
  '.my-4',
].join(', ');

// ─────────────────────────────────────────────────────────────────────────────

function PaginatedText({ text, className = '' }: { text: string; className?: string }) {
  if (!text) return null;
  const paragraphs = text.split('\n');
  return (
    <div className={className}>
      {paragraphs.map((p, pIdx) => {
        if (!p.trim()) return <br key={pIdx} />;
        return (
          <p key={pIdx} className="mb-2 breakable-p">
            {p}
          </p>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

interface PageSectionProps {
  id: string;
  startPage: number;
  onPagesCalculated: (id: string, count: number) => void;
  children: ReactNode;
  hidePageNumber?: boolean;
  isCover?: boolean;
}

function PageSection({
  id,
  startPage,
  onPagesCalculated,
  children,
  hidePageNumber = false,
  isCover = false,
}: PageSectionProps) {
  const [pagesCount, setPagesCount] = useState(1);
  const measureRef = useRef<HTMLDivElement>(null);
  const pushMapRef = useRef<Map<number, number>>(new Map());

  const notify = useCallback(
    (n: number) => onPagesCalculated(id, n),
    [id, onPagesCalculated]
  );

  // ── 1. Hitung dorongan (Push) pada elemen terpotong dan terapkan ──────────
  useEffect(() => {
    const el = measureRef.current;
    if (!el) return;

    function measureAndBreak() {
      requestAnimationFrame(() => {
        if (!el) return;

        if (!isCover) {
          // 1a. Reset margin lama di layer pengukur
          const breakables = Array.from(el.querySelectorAll<HTMLElement>(BREAKABLE_SEL));
          breakables.forEach((b) => (b.style.marginTop = ''));

          const containerRect = el.getBoundingClientRect();
          const newPushMap = new Map<number, number>();

          // 1b. Kalkulasi tabrakan garis halaman
          breakables.forEach((child, idx) => {
            const elRect = child.getBoundingClientRect();
            const elTop = elRect.top - containerRect.top;
            const elBot = elTop + elRect.height;
            const elH = elRect.height;

            if (elH === 0) return;

            const pageIdx = Math.floor(elTop / PRINT_H);
            const pageBottom = (pageIdx + 1) * PRINT_H;

            if (elBot > pageBottom && elTop < pageBottom) {
              const spaceLeft = pageBottom - elTop;
              if (spaceLeft < elH) {
                const currentMT = parseFloat(child.style.marginTop || '0') || 0;
                const push = currentMT + spaceLeft;
                child.style.marginTop = `${push}px`;
                newPushMap.set(idx, push);
              }
            }
          });

          pushMapRef.current = newPushMap;

          // 1c. Sync margin seketika ke lembaran layar yang eksis saat ini
          const currentSection = document.getElementById(`section-${id}`);
          if (currentSection) {
            const slices = Array.from(currentSection.querySelectorAll<HTMLElement>('.visual-slice-content'));
            slices.forEach((slice) => {
              const sliceBreakables = Array.from(slice.querySelectorAll<HTMLElement>(BREAKABLE_SEL));
              sliceBreakables.forEach((b) => (b.style.marginTop = ''));
              newPushMap.forEach((mt, idx) => {
                const target = sliceBreakables[idx];
                if (target) target.style.marginTop = `${mt}px`;
              });
            });
          }
        }

        // 1d. Kalkulasi halaman berdasar tinggi layer yang sudah terdorong
        const totalH = el.getBoundingClientRect().height;
        let n = 1;
        if (totalH > PRINT_H) {
          n = 1 + Math.ceil((totalH - PRINT_H) / PRINT_H);
        }
        setPagesCount((prev) => (prev === n ? prev : n));
      });
    }

    const ro = new ResizeObserver(measureAndBreak);
    ro.observe(el);

    const imgs = el.querySelectorAll<HTMLImageElement>('img');
    imgs.forEach((img) => {
      if (!img.complete) {
        img.addEventListener('load', measureAndBreak, { once: true });
      }
    });

    measureAndBreak();
    return () => ro.disconnect();
  }, [isCover, id]);

  // ── 2. Sync Effect (Agresif): Tetapkan margin ke DOM tiap kali React Render ─
  // Penting agar lembar baru yang di-render langsung punya push yang sama
  useEffect(() => {
    if (isCover || pushMapRef.current.size === 0) return;
    const currentSection = document.getElementById(`section-${id}`);
    if (currentSection) {
      const slices = Array.from(currentSection.querySelectorAll<HTMLElement>('.visual-slice-content'));
      slices.forEach((slice) => {
        const sliceBreakables = Array.from(slice.querySelectorAll<HTMLElement>(BREAKABLE_SEL));
        pushMapRef.current.forEach((mt, idx) => {
          const target = sliceBreakables[idx];
          if (target) {
            if (target.style.marginTop !== `${mt}px`) {
              target.style.marginTop = `${mt}px`;
            }
          }
        });
      });
    }
  });

  return (
    <>
      {/* ── SCREEN: Tumpukan lembaran kertas A4 ── */}
      <div
        id={`section-${id}`}
        data-start-page={startPage}
        className="relative print:hidden flex flex-col gap-[16px]"
        style={{ width: '210mm' }}
      >
        {/* Layer ukur (invisible) */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            visibility: 'hidden',
            pointerEvents: 'none',
            zIndex: -50,
          }}
        >
          <div ref={measureRef} style={{ width: '100%', boxSizing: 'border-box' }}>
            {children}
          </div>
        </div>

        {/* Lembaran-lembaran kertas */}
        {Array.from({ length: pagesCount }).map((_, i) => {
          const pageNum  = startPage + i;
          const clipTop  = i * PRINT_H; // mulai baca konten dari sini

          return (
            <div
              key={`paper-${i}`}
              className="relative bg-white shrink-0"
              style={{
                width: '210mm',
                height: `${A4_PX}px`,
                boxShadow: '0 4px 24px rgba(0,0,0,0.13), 0 1px 4px rgba(0,0,0,0.08)',
                borderRadius: '2px',
                overflow: 'hidden',
              }}
            >
              {/* Margin atas (masker putih) */}
              <div
                style={{
                  position: 'absolute', top: 0, left: 0, right: 0,
                  height: `${PAGE_MT}px`, background: 'white', zIndex: 10,
                }}
              />

              {/* Margin bawah (masker putih) */}
              <div
                style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  height: `${PAGE_MB}px`, background: 'white', zIndex: 10,
                }}
              />

              {/* Konten digeser ke atas sesuai nomor halaman */}
              <div
                style={{
                  position: 'absolute',
                  top: `${PAGE_MT - clipTop}px`,
                  left: `${PAGE_ML}px`,
                  right: `${PAGE_MR}px`,
                }}
              >
                <div className={!isCover ? "visual-slice-content" : ""} style={isCover ? { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: `${PRINT_H}px` } : {}}>
                  {children}
                </div>
              </div>

              {/* Nomor halaman */}
              {!hidePageNumber && pageNum >= 2 && (
                <div
                  className="absolute text-[11pt] font-semibold text-black pointer-events-none"
                  style={{ bottom: `${PAGE_MB / 2}px`, right: `${PAGE_MR}px`, zIndex: 20 }}
                >
                  {pageNum}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── PRINT ONLY ── */}
      <table
        className="hidden print:table w-full relative"
        style={{ pageBreakInside: 'auto', pageBreakAfter: 'always', borderSpacing: 0 }}
      >
        <thead className="print:table-header-group">
          <tr><td style={{ height: '4cm', padding: 0, border: 'none' }}><div style={{ height: '4cm', width: '10px' }} /></td></tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: '0 3cm 0 4cm', border: 'none', verticalAlign: 'top' }}>
              <div
                className={isCover ? 'flex flex-col justify-between items-center text-center' : ''}
                style={isCover ? { minHeight: `calc(${A4_PX}px - 7cm)` } : {}}
              >
                {children}
              </div>
            </td>
          </tr>
        </tbody>
        <tfoot className="print:table-footer-group">
          <tr><td style={{ height: '3cm', padding: 0, border: 'none' }}><div style={{ height: '3cm', width: '10px' }} /></td></tr>
        </tfoot>
      </table>
    </>
  );
}

// ═════════════════════════════════════════════════════════════════════════════

export default function LiveCanvas({ data }: LiveCanvasProps) {
  const { cover, preTest, hasil, postTest } = data;

  const daftars = data.daftars || {
    show: false, pertemuan: '', materi: '',
    isi: [], gambar: [], tabel: [], kode: [],
  };

  const [sectionPages, setSectionPages] = useState<Record<string, number>>({});

  const handlePagesCalculated = useCallback((id: string, count: number) => {
    setSectionPages((prev) => {
      if (prev[id] === count) return prev;
      return { ...prev, [id]: count };
    });
  }, []);

  const pCover   = sectionPages['cover']            || 1;
  const pIsi     = daftars.show && daftars.isi.length    > 0 ? sectionPages['daftar-isi']      || 1 : 0;
  const pGbr     = daftars.show && daftars.gambar.length > 0 ? sectionPages['daftar-gambar']   || 1 : 0;
  const pTbl     = daftars.show && daftars.tabel.length  > 0 ? sectionPages['daftar-tabel']    || 1 : 0;
  const pKd      = daftars.show && daftars.kode.length   > 0 ? sectionPages['daftar-kode']     || 1 : 0;
  const pPtm     = daftars.show                              ? sectionPages['daftar-pertemuan'] || 1 : 0;
  const pPreTest = sectionPages['pre-test']         || 1;
  const pHasil   = sectionPages['hasil']            || 1;

  const offsets = {
    cover:              1,
    'daftar-isi':       1 + pCover,
    'daftar-gambar':    1 + pCover + pIsi,
    'daftar-tabel':     1 + pCover + pIsi + pGbr,
    'daftar-kode':      1 + pCover + pIsi + pGbr + pTbl,
    'daftar-pertemuan': 1 + pCover + pIsi + pGbr + pTbl + pKd,
    'pre-test':         1 + pCover + pIsi + pGbr + pTbl + pKd + pPtm,
    hasil:              1 + pCover + pIsi + pGbr + pTbl + pKd + pPtm + pPreTest,
    'post-test':        1 + pCover + pIsi + pGbr + pTbl + pKd + pPtm + pPreTest + pHasil,
  };

  const renderDaftarPage = (
    id: string,
    title: string,
    items: { id: string; label: string; halaman: string }[]
  ) => {
    if (!daftars.show || (items.length === 0 && id !== 'daftar-pertemuan')) return null;

    if (id === 'daftar-pertemuan') {
      return (
        <PageSection id={id} startPage={offsets[id as keyof typeof offsets]} onPagesCalculated={handlePagesCalculated}>
          <h2 className="font-bold text-[14pt] text-center mb-8">{title}</h2>
          <table className="w-full border-collapse border border-black max-w-[90%] mx-auto">
            <thead>
              <tr>
                <th className="border border-black px-4 py-2 bg-gray-200 w-32">Pertemuan</th>
                <th className="border border-black px-4 py-2 bg-gray-200">Judul Materi</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-black px-4 py-2 text-center text-[11pt]">{daftars.pertemuan}</td>
                <td className="border border-black px-4 py-2 text-center text-[11pt]">{daftars.materi}</td>
              </tr>
            </tbody>
          </table>
        </PageSection>
      );
    }

    return (
      <PageSection id={id} startPage={offsets[id as keyof typeof offsets]} onPagesCalculated={handlePagesCalculated}>
        <h2 className="font-bold text-[14pt] text-center mb-10">{title}</h2>
        <div className="flex flex-col gap-2 w-full">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between items-end w-full">
              <span className="text-[11pt] whitespace-pre-wrap leading-snug shrink-0 max-w-[75%]">{item.label}</span>
              <div className="flex-1 border-b-2 border-dotted border-black mx-2 mb-1 opacity-40 min-w-[16px]" />
              <span className="text-[11pt] font-semibold shrink-0">{item.halaman}</span>
            </div>
          ))}
        </div>
      </PageSection>
    );
  };

  return (
    <div id="print-area" className="a4-paper">

      {/* ══════════ COVER ══════════ */}
      <PageSection id="cover" startPage={offsets['cover']} onPagesCalculated={handlePagesCalculated} hidePageNumber isCover>
        <div className="cover-section top-section">
          <h1 className="font-bold text-[14pt] leading-tight mt-6">LAPORAN PRAKTIKUM</h1>
          <h2 className="font-bold text-[14pt] leading-tight">({cover.mata_praktikum || 'Mata Praktikum'})</h2>
          <h3 className="font-bold text-[14pt] leading-tight mt-1">Materi</h3>
          <h4 className="font-bold text-[14pt] leading-tight">({cover.materi || 'Judul Pertemuan'})</h4>
          <p className="font-bold text-[14pt] leading-tight mt-1">({cover.hari_tanggal || 'Hari Tanggal dan Sesi Praktikum'})</p>
        </div>
        <div className="cover-section mid-section">
          <img src="/uad.png" alt="Logo Universitas Ahmad Dahlan" className="w-[5.5cm] h-[5.5cm] object-contain mx-auto" />
          <div className="author-section mt-10 space-y-1">
            <p className="font-bold text-[12pt]">Disusun Oleh:</p>
            <p className="text-[12pt]">{cover.nama || 'Nama Mahasiswa'}</p>
            <p className="text-[12pt]">{cover.nim || 'NIM'}</p>
          </div>
        </div>
        <div className="cover-section bottom-section pb-[1cm]">
          <p className="font-bold text-[14pt] uppercase tracking-wide">PROGRAM STUDI S1 INFORMATIKA</p>
          <p className="font-bold text-[14pt] uppercase tracking-wide">FAKULTAS TEKNOLOGI INDUSTRI</p>
          <p className="font-bold text-[14pt] uppercase tracking-wide">UNIVERSITAS AHMAD DAHLAN</p>
          <p className="font-bold text-[14pt] mt-6">{cover.tahun || new Date().getFullYear()}</p>
        </div>
      </PageSection>

      {/* ══════════ DAFTAR ══════════ */}
      {renderDaftarPage('daftar-isi',       'DAFTAR ISI',                 daftars.isi)}
      {renderDaftarPage('daftar-gambar',    'DAFTAR GAMBAR',              daftars.gambar)}
      {renderDaftarPage('daftar-tabel',     'DAFTAR TABEL',               daftars.tabel)}
      {renderDaftarPage('daftar-kode',      'DAFTAR KODE PROGRAM',        daftars.kode)}
      {renderDaftarPage('daftar-pertemuan', 'DAFTAR PERTEMUAN PRAKTIKUM', [])}

      {/* ══════════ BAB I: PRE-TEST ══════════ */}
      <PageSection id="pre-test" startPage={offsets['pre-test']} onPagesCalculated={handlePagesCalculated}>
        <div className="flex gap-4">
          <h2 className="font-bold text-[11pt] w-8">I.</h2>
          <div className="flex-1">
            <h2 className="font-bold text-[11pt] mb-4">Pre Test</h2>
            {data.preTestIntro && <p className="text-[11pt] mb-3 text-justify">{data.preTestIntro}</p>}
            <div className="space-y-4">
              {preTest.length > 0 ? (
                preTest.map((soal, index) => {
                  const letter = String.fromCharCode(65 + index);
                  return (
                    <div key={soal.id} className="soal-container">
                      <div className="flex gap-3 pl-4">
                        <span className="text-[11pt] w-4">{letter}.</span>
                        <div className="flex-1">
                          <p className="text-[11pt] text-justify">{soal.pertanyaan || `Pertanyaan ${index + 1}`}</p>
                        </div>
                      </div>
                      <div className="flex gap-3 pl-[3.25rem] mt-1">
                        <span className="text-[11pt] w-4">1.</span>
                        <div className="flex-1 space-y-3">
                          <p className="text-[11pt] text-justify">Jawaban</p>
                          {(!soal.tipe || soal.tipe === 'image') && soal.gambar_url && (
                            <div id={`pre-img-${index}`} className="text-center my-3">
                              <img src={soal.gambar_url} alt={`Gambar I.${index + 1}`} className="mx-auto max-w-[90%] border border-gray-300" />
                              <p className="text-[10pt] font-semibold italic mt-2 text-center">
                                Gambar 1.{index + 1} {soal.judul_gambar ? capitalizeEachWord(soal.judul_gambar) : ''}
                              </p>
                            </div>
                          )}
                          {soal.tipe === 'code' && soal.code && (
                            <div id={`pre-code-${index}`} className="text-left my-3">
                              <div className="code-block">
                                <table className="w-full border-collapse">
                                  <tbody>
                                    {soal.code.split('\n').map((line, i) => (
                                      <tr key={i}>
                                        <td className="w-6 text-right pr-2 border-r border-black select-none align-top whitespace-nowrap opacity-80">{i + 1}</td>
                                        <td className="pl-3 align-top whitespace-pre-wrap break-all">{line || ' '}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                              <p className="text-[10pt] font-semibold italic mt-2 text-center">
                                Kode Program 1.{index + 1} {soal.judul_gambar ? capitalizeEachWord(soal.judul_gambar) : ''}
                              </p>
                            </div>
                          )}
                          {soal.tipe === 'table' && soal.table_data && (
                            <div id={`pre-tab-${index}`} className="w-full my-4">
                              <p className="text-[10pt] font-semibold italic mb-2 text-center">
                                Tabel 1.{index + 1} {soal.judul_gambar ? capitalizeEachWord(soal.judul_gambar) : ''}
                              </p>
                              <table className="w-full border-collapse border border-black mb-4 mx-auto max-w-[95%]">
                                <tbody>
                                  {soal.table_data.map((row, rI) => (
                                    <tr key={rI}>
                                      {row.map((cell, cI) => (
                                        <td key={cI} className={`border border-black px-2 py-1 text-[11pt] ${rI === 0 ? 'font-bold text-center bg-gray-100' : ''}`}>{cell}</td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                          {soal.analisis && <p className="text-[11pt] text-justify">{soal.analisis}</p>}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-[11pt] text-gray-400 italic pl-8">Belum ada soal pre-test ditambahkan.</p>
              )}
            </div>
          </div>
        </div>
      </PageSection>

      {/* ══════════ BAB II: HASIL ══════════ */}
      <PageSection id="hasil" startPage={offsets['hasil']} onPagesCalculated={handlePagesCalculated}>
        <div className="flex gap-4">
          <h2 className="font-bold text-[11pt] w-8">II.</h2>
          <div className="flex-1">
            <h2 className="font-bold text-[11pt] mb-4">Hasil Praktikum</h2>
            {hasil.intro && <p className="text-[11pt] mb-4 text-justify">{hasil.intro}</p>}
            <div className="space-y-4">

              {/* A. Alat dan Bahan */}
              <div className="flex gap-3 pl-4 section-block">
                <span className="text-[11pt] font-bold w-4">A.</span>
                <div className="flex-1">
                  <p className="text-[11pt] font-bold mb-1">Alat dan Bahan:</p>
                  <PaginatedText className="text-[11pt] text-justify" text={hasil.alat_bahan || '(Daftar perangkat lunak, hardware, atau library yang digunakan).'} />
                </div>
              </div>

              {/* B. Langkah Kerja */}
              <div className="flex gap-3 pl-4 section-block">
                <span className="text-[11pt] font-bold w-4">B.</span>
                <div className="flex-1">
                  <p className="text-[11pt] font-bold mb-1">Langkah Kerja:</p>
                  <PaginatedText className="text-[11pt] text-justify" text={hasil.langkah_kerja || '(Ringkasan singkat prosedur yang dilakukan).'} />
                </div>
              </div>

              {/* C. Implementasi */}
              <div className="flex gap-3 pl-4 section-block">
                <span className="text-[11pt] font-bold w-4">C.</span>
                <div className="flex-1">
                  <p className="text-[11pt] font-bold mb-1">Implementasi/Screenshot:</p>
                  <p className="text-[11pt] text-justify mb-3">
                    {hasil.screenshots.some((s) => s.url || s.code || s.table_data) ? '' : 'Sematkan screenshot kode program atau hasil running di sini.'}
                  </p>
                  {hasil.screenshots.map((ss, index) =>
                    (ss.tipe === 'image' && ss.url) || (ss.tipe === 'code' && ss.code) || (ss.tipe === 'table' && ss.table_data) ? (
                      <div key={ss.id} className="my-4 section-block">
                        {ss.penjelasan_atas && <p className="text-[11pt] text-justify mb-2">{ss.penjelasan_atas}</p>}
                        {ss.tipe === 'table' ? (
                          <div id={`has-tab-${index}`} className="w-full my-4">
                            <p className="text-[10pt] font-semibold italic mb-2 text-center">Tabel 2.{index + 1} {ss.judul ? capitalizeEachWord(ss.judul) : ''}</p>
                            <table className="w-full border-collapse border border-black mb-4 mx-auto max-w-[95%]">
                              <tbody>
                                {ss.table_data.map((row, rI) => (
                                  <tr key={rI}>
                                    {row.map((cell, cI) => (
                                      <td key={cI} className={`border border-black px-2 py-1 text-[11pt] ${rI === 0 ? 'font-bold text-center bg-gray-100' : ''}`}>{cell}</td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : ss.tipe === 'image' ? (
                          <div id={`has-img-${index}`} className="text-center">
                            <img src={ss.url} alt={`Gambar 2.${index + 1}`} className="mx-auto max-w-[90%] border border-gray-300" />
                            <p className="text-[10pt] font-semibold italic mt-2 text-center">Gambar 2.{index + 1} {ss.judul ? capitalizeEachWord(ss.judul) : ''}</p>
                          </div>
                        ) : (
                          <div id={`has-code-${index}`} className="text-left">
                            <div className="code-block">
                              <table className="w-full border-collapse">
                                <tbody>
                                  {ss.code.split('\n').map((line, i) => (
                                    <tr key={i}>
                                      <td className="w-6 text-right pr-2 border-r border-black select-none align-top whitespace-nowrap opacity-80">{i + 1}</td>
                                      <td className="pl-3 align-top whitespace-pre-wrap break-all">{line || ' '}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            <p className="text-[10pt] font-semibold italic mt-2 text-center">Kode Program 2.{index + 1} {ss.judul ? capitalizeEachWord(ss.judul) : ''}</p>
                          </div>
                        )}
                        {ss.penjelasan_bawah && <p className="text-[11pt] text-justify mt-2">{ss.penjelasan_bawah}</p>}
                      </div>
                    ) : null
                  )}
                </div>
              </div>

              {/* D. Analisis Hasil */}
              <div className="flex gap-3 pl-4 section-block">
                <span className="text-[11pt] font-bold w-4">D.</span>
                <div className="flex-1">
                  <p className="text-[11pt] font-bold mb-1">Analisis Hasil :</p>
                  <PaginatedText className="text-[11pt] text-justify" text={hasil.analisis_hasil || 'Berikan penjelasan mengenai hasil yang didapatkan. Mengapa hasilnya demikian? Apakah ada kendala saat proses berlangsung?'} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageSection>

      {/* ══════════ BAB III: POST-TEST ══════════ */}
      <PageSection id="post-test" startPage={offsets['post-test']} onPagesCalculated={handlePagesCalculated}>
        <div className="flex gap-4">
          <h2 className="font-bold text-[11pt] w-8">III.</h2>
          <div className="flex-1">
            <h2 className="font-bold text-[11pt] mb-4">Post Test</h2>
            {data.postTestIntro && <p className="text-[11pt] mb-3 text-justify">{data.postTestIntro}</p>}
            <div className="space-y-4">
              {postTest.map((soal, index) => {
                const letter = String.fromCharCode(65 + index);
                return (
                  <div key={soal.id} className="soal-container">
                    <div className="flex gap-3 pl-4">
                      <span className="text-[11pt] w-4">{letter}.</span>
                      <div className="flex-1">
                        <p className="text-[11pt] text-justify">{soal.pertanyaan || `Pertanyaan ${index + 1}`}</p>
                      </div>
                    </div>
                    <div className="flex gap-3 pl-[3.25rem] mt-1">
                      <span className="text-[11pt] w-4">1.</span>
                      <div className="flex-1 space-y-3">
                        <p className="text-[11pt] text-justify">Jawaban</p>
                        {(!soal.tipe || soal.tipe === 'image') && soal.gambar_url && (
                          <div id={`pos-img-${index}`} className="text-center my-3">
                            <img src={soal.gambar_url} alt={`Gambar 3.${index + 1}`} className="mx-auto max-w-[90%] border border-gray-300" />
                            <p className="text-[10pt] font-semibold italic mt-2 text-center">
                              Gambar 3.{index + 1} {soal.judul_gambar ? capitalizeEachWord(soal.judul_gambar) : ''}
                            </p>
                          </div>
                        )}
                        {soal.tipe === 'code' && soal.code && (
                          <div id={`pos-code-${index}`} className="text-left my-3">
                            <div className="code-block">
                              <table className="w-full border-collapse">
                                <tbody>
                                  {soal.code.split('\n').map((line, i) => (
                                    <tr key={i}>
                                      <td className="w-6 text-right pr-2 border-r border-black select-none align-top whitespace-nowrap opacity-80">{i + 1}</td>
                                      <td className="pl-3 align-top whitespace-pre-wrap break-all">{line || ' '}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            <p className="text-[10pt] font-semibold italic mt-2 text-center">
                              Kode Program 3.{index + 1} {soal.judul_gambar ? capitalizeEachWord(soal.judul_gambar) : ''}
                            </p>
                          </div>
                        )}
                        {soal.tipe === 'table' && soal.table_data && (
                          <div id={`pos-tab-${index}`} className="w-full my-4">
                            <p className="text-[10pt] font-semibold italic mb-2 text-center">
                              Tabel 3.{index + 1} {soal.judul_gambar ? capitalizeEachWord(soal.judul_gambar) : ''}
                            </p>
                            <table className="w-full border-collapse border border-black mb-4 mx-auto max-w-[95%]">
                              <tbody>
                                {soal.table_data.map((row, rI) => (
                                  <tr key={rI}>
                                    {row.map((cell, cI) => (
                                      <td key={cI} className={`border border-black px-2 py-1 text-[11pt] ${rI === 0 ? 'font-bold text-center bg-gray-100' : ''}`}>{cell}</td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                        {soal.analisis && <p className="text-[11pt] text-justify">{soal.analisis}</p>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </PageSection>
    </div>
  );
}