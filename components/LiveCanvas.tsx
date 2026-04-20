'use client';

import type { FormData as LaprakFormData } from '@/lib/types';

interface LiveCanvasProps {
  data: LaprakFormData;
}

function capitalizeEachWord(str: string): string {
  if (!str) return '';
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function LiveCanvas({ data }: LiveCanvasProps) {
  const { cover, preTest, hasil, postTest } = data;

  const validPreTest = preTest.filter(s => s.pertanyaan || s.gambar_url || s.analisis);
  const validPostTest = postTest.filter(s => s.pertanyaan || s.gambar_url || s.analisis);

  const daftars = data.daftars || {
    show: false,
    pertemuan: '',
    materi: '',
    isi: [],
    gambar: [],
    tabel: [],
    kode: []
  };

  const renderDaftarPage = (title: string, items: { id: string, label: string, halaman: string }[]) => {
    if (!daftars.show || items.length === 0) return null;
    
    // Check if it's the Pertemuan Table
    if (title === 'DAFTAR PERTEMUAN PRAKTIKUM') {
      return (
        <div className="page-container section-page">
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
        </div>
      );
    }
    
    return (
      <div className="page-container section-page">
        <h2 className="font-bold text-[14pt] text-center mb-10">{title}</h2>
        <div className="flex flex-col gap-2 w-full px-4">
          {items.map(item => (
            <div key={item.id} className="flex justify-between items-end w-full">
              <span className="text-[11pt] whitespace-pre-wrap">{item.label}</span>
              <div className="flex-1 border-b-2 border-dotted border-black mx-2 mb-1 opacity-40"></div>
              <span className="text-[11pt]">{item.halaman}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div id="print-area" className="a4-paper">
      
      {/* ==================== COVER PAGE ==================== */}
      <div className="page-container cover-page">
        <div className="cover-section top-section">
          <h1 className="font-bold text-[14pt] leading-tight mt-6">LAPORAN PRAKTIKUM</h1>
          <h2 className="font-bold text-[14pt] leading-tight">({cover.mata_praktikum || 'Mata Praktikum'})</h2>
          <h3 className="font-bold text-[14pt] leading-tight mt-1">Materi</h3>
          <h4 className="font-bold text-[14pt] leading-tight">({cover.materi || 'Judul Pertemuan'})</h4>
          <p className="font-bold text-[14pt] leading-tight mt-1">({cover.hari_tanggal || 'Hari Tanggal dan Sesi Praktikum'})</p>
        </div>

        <div className="cover-section mid-section">
          <img 
            src="/uad.png" 
            alt="Logo Universitas Ahmad Dahlan" 
            className="w-[5.5cm] h-[5.5cm] object-contain mx-auto"
          />
          
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
      </div>

      {/* ==================== DAFTAR LAMPRAN ==================== */}
      {renderDaftarPage('DAFTAR ISI', daftars.isi)}
      {renderDaftarPage('DAFTAR GAMBAR', daftars.gambar)}
      {renderDaftarPage('DAFTAR TABEL', daftars.tabel)}
      {renderDaftarPage('DAFTAR KODE PROGRAM', daftars.kode)}
      {renderDaftarPage('DAFTAR PERTEMUAN PRAKTIKUM', [])}

      {/* ==================== BAB I: PRE-TEST ==================== */}
      <div className="page-container section-page">
        <div className="flex gap-4">
          <h2 className="font-bold text-[11pt] w-8">I.</h2>
          <div className="flex-1">
            <h2 className="font-bold text-[11pt] mb-4">Pre Test</h2>
            
            {data.preTestIntro && (
              <p className="text-[11pt] mb-3 text-justify indent-0">
                {data.preTestIntro}
              </p>
            )}

            <div className="space-y-4">
              {preTest.length > 0 ? (
                preTest.map((soal, index) => {
                  const letter = String.fromCharCode(65 + index); // A, B, C...
                  return (
                    <div key={soal.id} className="soal-container">
                      {/* Pertanyaan */}
                      <div className="flex gap-3 pl-4">
                        <span className="text-[11pt] w-4">{letter}.</span>
                        <div className="flex-1">
                          <p className="text-[11pt] text-justify">{soal.pertanyaan || `Pertanyaan ${index + 1}`}</p>
                        </div>
                      </div>

                      {/* Jawaban */}
                      <div className="flex gap-3 pl-[3.25rem] mt-1">
                        <span className="text-[11pt] w-4">1.</span>
                        <div className="flex-1 space-y-3">
                          <p className="text-[11pt] text-justify">Jawaban</p>
                          
                          {(!soal.tipe || soal.tipe === 'image') && soal.gambar_url && (
                            <div className="text-center my-3">
                              <img src={soal.gambar_url} alt={`Gambar I.${index + 1}`} className="mx-auto max-w-[90%] border border-gray-300" />
                              <p className="text-[10pt] font-semibold italic mt-2 text-center">
                                Gambar 1.{index + 1} {soal.judul_gambar ? capitalizeEachWord(soal.judul_gambar) : ''}
                              </p>
                            </div>
                          )}

                          {soal.tipe === 'code' && soal.code && (
                            <div className="text-left my-3">
                              <div className="code-block">
                                <table className="w-full border-collapse">
                                  <tbody>
                                    {soal.code.split('\n').map((line, i) => (
                                      <tr key={i}>
                                        <td className="w-6 text-right pr-2 border-r border-black select-none align-top whitespace-nowrap opacity-80">
                                          {i + 1}
                                        </td>
                                        <td className="pl-3 align-top whitespace-pre-wrap break-all mt-0">
                                          {line || ' '}
                                        </td>
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
                            <div className="w-full my-4">
                              <p className="text-[10pt] font-semibold italic mb-2 text-center">
                                Tabel 1.{index + 1} {soal.judul_gambar ? capitalizeEachWord(soal.judul_gambar) : ''}
                              </p>
                              <table className="w-full border-collapse border border-black mb-4 mx-auto max-w-[95%]">
                                <tbody>
                                  {soal.table_data.map((row, rI) => (
                                    <tr key={rI}>
                                      {row.map((cell, cI) => (
                                        <td key={cI} className={`border border-black px-2 py-1 text-[11pt] ${rI === 0 ? 'font-bold text-center bg-gray-100' : ''}`}>
                                          {cell}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}

                          {soal.analisis && (
                            <p className="text-[11pt] text-justify">{soal.analisis}</p>
                          )}
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
      </div>

      {/* ==================== BAB II: HASIL PRAKTIKUM ==================== */}
      <div className="page-container section-page">
        <div className="flex gap-4">
          <h2 className="font-bold text-[11pt] w-8">II.</h2>
          <div className="flex-1">
            <h2 className="font-bold text-[11pt] mb-4">Hasil Praktikum</h2>
            
            {hasil.intro && (
              <p className="text-[11pt] mb-4 text-justify">
                {hasil.intro}
              </p>
            )}

            <div className="space-y-4">
              {/* A. Alat dan Bahan */}
              <div className="flex gap-3 pl-4">
                <span className="text-[11pt] font-bold w-4">A.</span>
                <div className="flex-1">
                  <p className="text-[11pt] font-bold mb-1">Alat dan Bahan:</p>
                  <p className="text-[11pt] text-justify whitespace-pre-wrap">
                    {hasil.alat_bahan || '(Daftar perangkat lunak, hardware, atau library yang digunakan).'}
                  </p>
                </div>
              </div>

              {/* B. Langkah Kerja */}
              <div className="flex gap-3 pl-4">
                <span className="text-[11pt] font-bold w-4">B.</span>
                <div className="flex-1">
                  <p className="text-[11pt] font-bold mb-1">Langkah Kerja:</p>
                  <p className="text-[11pt] text-justify whitespace-pre-wrap">
                    {hasil.langkah_kerja || '(Ringkasan singkat prosedur yang dilakukan).'}
                  </p>
                </div>
              </div>

              {/* C. Implementasi / Screenshot */}
              <div className="flex gap-3 pl-4">
                <span className="text-[11pt] font-bold w-4">C.</span>
                <div className="flex-1">
                  <p className="text-[11pt] font-bold mb-1">Implementasi/Screenshot:</p>
                  <p className="text-[11pt] text-justify mb-3">
                    {hasil.screenshots.some(s => s.url) ? '' : 'Sematkan screenshot kode program atau hasil running di sini.'}
                  </p>
                  
                  {hasil.screenshots.map((ss, index) => 
                    (ss.tipe === 'image' && ss.url) || (ss.tipe === 'code' && ss.code) || (ss.tipe === 'table' && ss.table_data) ? (
                      <div key={ss.id} className="my-4">
                        {ss.penjelasan_atas && (
                          <p className="text-[11pt] text-justify mb-2">{ss.penjelasan_atas}</p>
                        )}
                        
                        {ss.tipe === 'table' ? (
                          <div className="w-full my-4">
                            <p className="text-[10pt] font-semibold italic mb-2 text-center">
                              Tabel 2.{index + 1} {ss.judul ? capitalizeEachWord(ss.judul) : ''}
                            </p>
                            <table className="w-full border-collapse border border-black mb-4 mx-auto max-w-[95%]">
                              <tbody>
                                {ss.table_data.map((row, rI) => (
                                  <tr key={rI}>
                                    {row.map((cell, cI) => (
                                      <td key={cI} className={`border border-black px-2 py-1 text-[11pt] ${rI === 0 ? 'font-bold text-center bg-gray-100' : ''}`}>
                                        {cell}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : ss.tipe === 'image' ? (
                          <div className="text-center">
                            <img src={ss.url} alt={`Gambar 2.${index + 1}`} className="mx-auto max-w-[90%] border border-gray-300" />
                            <p className="text-[10pt] font-semibold italic mt-2 text-center">
                              Gambar 2.{index + 1} {ss.judul ? capitalizeEachWord(ss.judul) : ''}
                            </p>
                          </div>
                        ) : (
                          <div className="text-left">
                            <div className="code-block">
                              <table className="w-full border-collapse">
                                <tbody>
                                  {ss.code.split('\n').map((line, i) => (
                                    <tr key={i}>
                                      <td className="w-6 text-right pr-2 border-r border-black select-none align-top whitespace-nowrap opacity-80">
                                        {i + 1}
                                      </td>
                                      <td className="pl-3 align-top whitespace-pre-wrap break-all">
                                        {line || ' '}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            <p className="text-[10pt] font-semibold italic mt-2 text-center">
                              Kode Program 2.{index + 1} {ss.judul ? capitalizeEachWord(ss.judul) : ''}
                            </p>
                          </div>
                        )}

                        {ss.penjelasan_bawah && (
                          <p className="text-[11pt] text-justify mt-2">{ss.penjelasan_bawah}</p>
                        )}
                      </div>
                    ) : null
                  )}
                </div>
              </div>

              {/* D. Analisis Hasil */}
              <div className="flex gap-3 pl-4">
                <span className="text-[11pt] font-bold w-4">D.</span>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-[11pt] font-bold">Analisis Hasil : </p>
                  </div>
                  <p className="text-[11pt] text-justify whitespace-pre-wrap">
                    {hasil.analisis_hasil || 'Berikan penjelasan mengenai hasil yang didapatkan. Mengapa hasilnya demikian? Apakah ada kendala saat proses berlangsung?'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== BAB III: POST-TEST ==================== */}
      <div className="page-container section-page">
        <div className="flex gap-4">
          <h2 className="font-bold text-[11pt] w-8">III.</h2>
          <div className="flex-1">
            <h2 className="font-bold text-[11pt] mb-4">Post Test</h2>
            
            {data.postTestIntro && (
              <p className="text-[11pt] mb-3 text-justify indent-0">
                {data.postTestIntro}
              </p>
            )}

            <div className="space-y-4">
              {postTest.map((soal, index) => {
                const letter = String.fromCharCode(65 + index);
                return (
                  <div key={soal.id} className="soal-container">
                    {/* Pertanyaan */}
                    <div className="flex gap-3 pl-4">
                      <span className="text-[11pt] w-4">{letter}.</span>
                      <div className="flex-1">
                        <p className="text-[11pt] text-justify">{soal.pertanyaan || `Pertanyaan ${index + 1}`}</p>
                      </div>
                    </div>

                    {/* Jawaban */}
                    <div className="flex gap-3 pl-[3.25rem] mt-1">
                      <span className="text-[11pt] w-4">1.</span>
                      <div className="flex-1 space-y-3">
                        <p className="text-[11pt] text-justify">Jawaban</p>
                        
                        {(!soal.tipe || soal.tipe === 'image') && soal.gambar_url && (
                          <div className="text-center my-3">
                            <img src={soal.gambar_url} alt={`Gambar 3.${index + 1}`} className="mx-auto max-w-[90%] border border-gray-300" />
                            <p className="text-[10pt] font-semibold italic mt-2 text-center">
                              Gambar 3.{index + 1} {soal.judul_gambar ? capitalizeEachWord(soal.judul_gambar) : ''}
                            </p>
                          </div>
                        )}

                        {soal.tipe === 'code' && soal.code && (
                          <div className="text-left my-3">
                            <div className="code-block">
                              <table className="w-full border-collapse">
                                <tbody>
                                  {soal.code.split('\n').map((line, i) => (
                                    <tr key={i}>
                                      <td className="w-6 text-right pr-2 border-r border-black select-none align-top whitespace-nowrap opacity-80">
                                        {i + 1}
                                      </td>
                                      <td className="pl-3 align-top whitespace-pre-wrap break-all mt-0">
                                        {line || ' '}
                                      </td>
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
                          <div className="w-full my-4">
                            <p className="text-[10pt] font-semibold italic mb-2 text-center">
                              Tabel 3.{index + 1} {soal.judul_gambar ? capitalizeEachWord(soal.judul_gambar) : ''}
                            </p>
                            <table className="w-full border-collapse border border-black mb-4 mx-auto max-w-[95%]">
                              <tbody>
                                {soal.table_data.map((row, rI) => (
                                  <tr key={rI}>
                                    {row.map((cell, cI) => (
                                      <td key={cI} className={`border border-black px-2 py-1 text-[11pt] ${rI === 0 ? 'font-bold text-center bg-gray-100' : ''}`}>
                                        {cell}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {soal.analisis && (
                          <p className="text-[11pt] text-justify">{soal.analisis}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
