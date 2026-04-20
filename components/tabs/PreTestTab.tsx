'use client';

import type { SoalItem } from '@/lib/types';
import { createEmptySoal } from '@/lib/types';
import { Plus, Trash2, ImagePlus } from 'lucide-react';

interface PreTestTabProps {
  intro: string;
  onIntroChange: (text: string) => void;
  data: SoalItem[];
  onChange: (data: SoalItem[]) => void;
}

export default function PreTestTab({ intro, onIntroChange, data, onChange }: PreTestTabProps) {
  const updateSoal = (index: number, field: keyof SoalItem, value: string | File | null) => {
    const updated = [...data];
    if (field === 'gambar' && value instanceof File) {
      updated[index] = {
        ...updated[index],
        gambar: value,
        gambar_url: URL.createObjectURL(value),
      };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    onChange(updated);
  };

  const addSoal = () => onChange([...data, createEmptySoal()]);

  const removeSoal = (index: number) => {
    if (data.length <= 1) return;
    const updated = data.filter((_, i) => i !== index);
    onChange(updated);
  };

  const updateTableCell = (index: number, rI: number, cI: number, val: string) => {
    const updated = [...data];
    if (!updated[index].table_data) updated[index].table_data = [['', ''], ['', '']];
    const newTable = updated[index].table_data.map((r, i) =>
      i === rI ? r.map((c, j) => (j === cI ? val : c)) : r
    );
    updated[index].table_data = newTable;
    onChange(updated);
  };

  const addTableRow = (index: number) => {
    const updated = [...data];
    if (!updated[index].table_data) updated[index].table_data = [['', ''], ['', '']];
    const cols = updated[index].table_data[0]?.length || 2;
    updated[index].table_data.push(Array(cols).fill(''));
    onChange(updated);
  };

  const addTableCol = (index: number) => {
    const updated = [...data];
    if (!updated[index].table_data) updated[index].table_data = [['', ''], ['', '']];
    updated[index].table_data = updated[index].table_data.map(r => [...r, '']);
    onChange(updated);
  };

  const removeTableRow = (index: number, rI: number) => {
    const updated = [...data];
    if (!updated[index].table_data || updated[index].table_data.length <= 1) return;
    updated[index].table_data = updated[index].table_data.filter((_, i) => i !== rI);
    onChange(updated);
  };

  const removeTableCol = (index: number) => {
    const updated = [...data];
    if (!updated[index].table_data || updated[index].table_data[0].length <= 1) return;
    updated[index].table_data = updated[index].table_data.map(r => r.slice(0, -1));
    onChange(updated);
  };

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
        <span className="w-7 h-7 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center text-sm font-bold">2</span>
        Pre-Test
      </h3>

      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
        <label className="block text-xs font-medium text-gray-500 mb-1">
          Teks Pengantar <span className="text-gray-400">(Bisa dikosongkan)</span>
        </label>
        <textarea
          value={intro}
          onChange={(e) => onIntroChange(e.target.value)}
          placeholder="Teks sebelum list pertanyaan..."
          rows={2}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none text-sm resize-none"
        />
      </div>

      <div className="space-y-6">
        {data.map((soal, index) => (
          <div
            key={soal.id}
            className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3 relative group"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-600">
                Soal {index + 1}
              </span>
              {data.length > 1 && (
                <button
                  onClick={() => removeSoal(index)}
                  className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Pertanyaan
              </label>
              <textarea
                value={soal.pertanyaan}
                onChange={(e) => updateSoal(index, 'pertanyaan', e.target.value)}
                placeholder="Tuliskan pertanyaan pre-test..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none text-sm resize-none"
              />
            </div>

            <div className="pt-2 border-t border-gray-100">
              <label className="block text-xs font-semibold text-gray-600 mb-2">Jawaban (Opsional)</label>
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => updateSoal(index, 'tipe', 'image')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${(!soal.tipe || soal.tipe === 'image') ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                >
                  Gambar
                </button>
                <button
                  onClick={() => updateSoal(index, 'tipe', 'code')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${soal.tipe === 'code' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                >
                  Source Code
                </button>
                <button
                  onClick={() => updateSoal(index, 'tipe', 'table')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${soal.tipe === 'table' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                >
                  Tabel
                </button>
              </div>

              {soal.tipe === 'code' ? (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Source Code Program
                  </label>
                  <textarea
                    value={soal.code || ''}
                    onChange={(e) => updateSoal(index, 'code', e.target.value)}
                    placeholder="Paste kode program di sini..."
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono text-xs transition-all outline-none resize-none"
                  />
                </div>
              ) : soal.tipe === 'table' ? (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">
                    Data Tabel (Baris teratas = Header Border Tebal)
                  </label>
                  <div className="overflow-x-auto border border-gray-200 rounded-lg p-2 bg-white">
                    <table className="w-full text-sm text-left">
                      <tbody>
                        {soal.table_data?.map((row, rI) => (
                          <tr key={rI}>
                            {row.map((cell, cI) => (
                              <td key={cI} className="p-1 min-w-[100px] relative">
                                <input
                                  type="text"
                                  value={cell}
                                  onChange={(e) => updateTableCell(index, rI, cI, e.target.value)}
                                  className={`w-full px-2 py-1.5 border border-transparent hover:border-gray-300 focus:border-emerald-500 rounded transition-all outline-none ${rI === 0 ? 'font-bold bg-gray-50' : 'bg-transparent'}`}
                                />
                              </td>
                            ))}
                            <td className="w-8 p-1">
                              {soal.table_data.length > 1 && (
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
                      {soal.table_data?.[0]?.length > 1 && (
                        <button onClick={() => removeTableCol(index)} className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded text-xs font-semibold">- Kolom Akhir</button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Upload Screenshot
                  </label>
                  <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/50 transition-all">
                    <ImagePlus className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      {soal.gambar ? soal.gambar.name : 'Pilih gambar...'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        if (file) updateSoal(index, 'gambar', file);
                      }}
                    />
                  </label>
                  {soal.gambar_url && (
                    <img
                      src={soal.gambar_url}
                      alt="Preview"
                      className="mt-2 max-h-32 rounded-lg border border-gray-200"
                    />
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Judul Gambar <span className="text-gray-400">(opsional)</span>
              </label>
              <input
                type="text"
                value={soal.judul_gambar}
                onChange={(e) => updateSoal(index, 'judul_gambar', e.target.value)}
                placeholder="cth: Jawaban Pre-Test Nomor 1"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Analisis <span className="text-gray-400">(opsional)</span>
              </label>
              <textarea
                value={soal.analisis}
                onChange={(e) => updateSoal(index, 'analisis', e.target.value)}
                placeholder="Tuliskan analisis jawaban..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none text-sm resize-none"
              />
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addSoal}
        className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50/50 transition-all"
      >
        <Plus className="w-4 h-4" />
        Tambah Soal
      </button>
    </div>
  );
}
