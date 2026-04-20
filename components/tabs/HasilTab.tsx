'use client';

import type { HasilData, ScreenshotItem } from '@/lib/types';
import { createEmptyScreenshot } from '@/lib/types';
import { Plus, Trash2, ImagePlus } from 'lucide-react';

interface HasilTabProps {
  data: HasilData;
  onChange: (data: HasilData) => void;
}

export default function HasilTab({ data, onChange }: HasilTabProps) {
  const updateField = (field: keyof HasilData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const updateScreenshot = (index: number, field: keyof ScreenshotItem, value: string | File | null) => {
    const updated = [...data.screenshots];
    if (field === 'file' && value instanceof File) {
      updated[index] = {
        ...updated[index],
        file: value,
        url: URL.createObjectURL(value),
      };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    onChange({ ...data, screenshots: updated });
  };

  const addScreenshot = () => {
    onChange({ ...data, screenshots: [...data.screenshots, createEmptyScreenshot()] });
  };

  const removeScreenshot = (index: number) => {
    if (data.screenshots.length <= 1) return;
    const updated = data.screenshots.filter((_, i) => i !== index);
    onChange({ ...data, screenshots: updated });
  };

  const updateTableCell = (index: number, rI: number, cI: number, val: string) => {
    const updated = [...data.screenshots];
    if (!updated[index].table_data) updated[index].table_data = [['', ''], ['', '']];
    const newTable = updated[index].table_data.map((r, i) =>
      i === rI ? r.map((c, j) => (j === cI ? val : c)) : r
    );
    updated[index].table_data = newTable;
    onChange({ ...data, screenshots: updated });
  };

  const addTableRow = (index: number) => {
    const updated = [...data.screenshots];
    if (!updated[index].table_data) updated[index].table_data = [['', ''], ['', '']];
    const cols = updated[index].table_data[0]?.length || 2;
    updated[index].table_data.push(Array(cols).fill(''));
    onChange({ ...data, screenshots: updated });
  };

  const addTableCol = (index: number) => {
    const updated = [...data.screenshots];
    if (!updated[index].table_data) updated[index].table_data = [['', ''], ['', '']];
    updated[index].table_data = updated[index].table_data.map(r => [...r, '']);
    onChange({ ...data, screenshots: updated });
  };

  const removeTableRow = (index: number, rI: number) => {
    const updated = [...data.screenshots];
    if (!updated[index].table_data || updated[index].table_data.length <= 1) return;
    updated[index].table_data = updated[index].table_data.filter((_, i) => i !== rI);
    onChange({ ...data, screenshots: updated });
  };

  const removeTableCol = (index: number) => {
    const updated = [...data.screenshots];
    if (!updated[index].table_data || updated[index].table_data[0].length <= 1) return;
    updated[index].table_data = updated[index].table_data.map(r => r.slice(0, -1));
    onChange({ ...data, screenshots: updated });
  };

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
        <span className="w-7 h-7 bg-amber-100 text-amber-700 rounded-lg flex items-center justify-center text-sm font-bold">3</span>
        Hasil Praktikum
      </h3>

      <div className="space-y-4">
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-6">
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Teks Pengantar <span className="text-gray-400">(Bisa dikosongkan)</span>
          </label>
          <textarea
            value={data.intro}
            onChange={(e) => updateField('intro', e.target.value)}
            placeholder="Teks sebelum list hasil praktikum..."
            rows={2}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all outline-none text-sm resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Alat dan Bahan
          </label>
          <textarea
            value={data.alat_bahan}
            onChange={(e) => updateField('alat_bahan', e.target.value)}
            placeholder="Tuliskan alat dan bahan yang digunakan..."
            rows={4}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all outline-none text-sm resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Langkah Kerja
          </label>
          <textarea
            value={data.langkah_kerja}
            onChange={(e) => updateField('langkah_kerja', e.target.value)}
            placeholder="Tuliskan langkah kerja praktikum..."
            rows={5}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all outline-none text-sm resize-none"
          />
        </div>

        <hr className="border-gray-100" />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Screenshot Implementasi
          </label>

          <div className="space-y-4">
            {data.screenshots.map((ss, index) => (
              <div
                key={ss.id}
                className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500">
                    Implementasi {index + 1}
                  </span>
                  
                  <div className="flex gap-2">
                    <div className="flex items-center gap-1 bg-gray-200 p-1 rounded-lg">
                      <button
                        onClick={() => updateScreenshot(index, 'tipe', 'image')}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${ss.tipe === 'image' ? 'bg-white shadow-sm text-amber-700' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        Gambar
                      </button>
                      <button
                        onClick={() => updateScreenshot(index, 'tipe', 'code')}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${ss.tipe === 'code' ? 'bg-white shadow-sm text-amber-700' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        Source Code
                      </button>
                      <button
                        onClick={() => updateScreenshot(index, 'tipe', 'table')}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${ss.tipe === 'table' ? 'bg-white shadow-sm text-amber-700' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        Tabel
                      </button>
                    </div>

                    {data.screenshots.length > 1 && (
                      <button
                        onClick={() => removeScreenshot(index)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Penjelasan Sebelum {ss.tipe === 'table' ? 'Tabel' : ss.tipe === 'image' ? 'Gambar' : 'Kode'} <span className="text-gray-400">(opsional)</span>
                  </label>
                  <textarea
                    value={ss.penjelasan_atas || ''}
                    onChange={(e) => updateScreenshot(index, 'penjelasan_atas', e.target.value)}
                    placeholder="Contoh: Berikut adalah contoh antarmuka dari program login..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all outline-none text-sm resize-none"
                  />
                </div>

                {ss.tipe === 'image' ? (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Upload Screenshot
                    </label>
                    <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-amber-400 hover:bg-amber-50/50 transition-all">
                      <ImagePlus className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        {ss.file ? ss.file.name : 'Pilih gambar...'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          if (file) updateScreenshot(index, 'file', file);
                        }}
                      />
                    </label>
                    {ss.url && (
                      <img
                        src={ss.url}
                        alt="Preview"
                        className="mt-2 max-h-32 rounded-lg border border-gray-200"
                      />
                    )}
                  </div>
                ) : ss.tipe === 'table' ? (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-2">
                      Data Tabel (Baris teratas = Header Text Bold)
                    </label>
                    <div className="overflow-x-auto border border-gray-200 rounded-lg p-2 bg-white">
                      <table className="w-full text-sm text-left">
                        <tbody>
                          {ss.table_data?.map((row, rI) => (
                            <tr key={rI}>
                              {row.map((cell, cI) => (
                                <td key={cI} className="p-1 min-w-[100px] relative">
                                  <input
                                    type="text"
                                    value={cell}
                                    onChange={(e) => updateTableCell(index, rI, cI, e.target.value)}
                                    className={`w-full px-2 py-1.5 border border-transparent hover:border-gray-300 focus:border-amber-500 rounded transition-all outline-none ${rI === 0 ? 'font-bold bg-gray-50' : 'bg-transparent'}`}
                                  />
                                </td>
                              ))}
                              <td className="w-8 p-1">
                                {ss.table_data.length > 1 && (
                                  <button onClick={() => removeTableRow(index, rI)} className="p-1 text-red-400 hover:text-red-600 rounded">
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => addTableRow(index)} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded text-xs font-semibold">+ Baris</button>
                        <button onClick={() => addTableCol(index)} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded text-xs font-semibold">+ Kolom</button>
                        {ss.table_data?.[0]?.length > 1 && (
                          <button onClick={() => removeTableCol(index)} className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded text-xs font-semibold">- Kolom Akhir</button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Source Code Program
                    </label>
                    <textarea
                      value={ss.code || ''}
                      onChange={(e) => updateScreenshot(index, 'code', e.target.value)}
                      placeholder="Paste kode program di sini..."
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-mono text-xs transition-all outline-none resize-none"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Judul {ss.tipe === 'table' ? 'Tabel' : ss.tipe === 'image' ? 'Gambar' : 'Kode'} <span className="text-gray-400">(opsional)</span>
                  </label>
                  <input
                    type="text"
                    value={ss.judul}
                    onChange={(e) => updateScreenshot(index, 'judul', e.target.value)}
                    placeholder="cth: Halaman Utama Aplikasi"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Penjelasan Setelah {ss.tipe === 'table' ? 'Tabel' : ss.tipe === 'image' ? 'Gambar' : 'Kode'} <span className="text-gray-400">(opsional)</span>
                  </label>
                  <textarea
                    value={ss.penjelasan_bawah || ''}
                    onChange={(e) => updateScreenshot(index, 'penjelasan_bawah', e.target.value)}
                    placeholder="Berikan deskripsi tambahan terkait gambar..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all outline-none text-sm resize-none"
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={addScreenshot}
            className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-amber-400 hover:text-amber-600 hover:bg-amber-50/50 transition-all"
          >
            <Plus className="w-4 h-4" />
            Tambah Screenshot
          </button>
        </div>

        <hr className="border-gray-100" />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Analisis Hasil
          </label>
          <textarea
            value={data.analisis_hasil}
            onChange={(e) => updateField('analisis_hasil', e.target.value)}
            placeholder="Tuliskan analisis hasil praktikum..."
            rows={5}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all outline-none text-sm resize-none"
          />
        </div>
      </div>
    </div>
  );
}
