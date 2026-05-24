'use client';

import type { JawabanItem, SoalItem } from '@/lib/types';
import { createEmptyJawabanItem, createEmptySoal } from '@/lib/types';
import { FileCode2, ImagePlus, Plus, Table2, Trash2 } from 'lucide-react';

interface PostTestTabProps {
  intro: string;
  onIntroChange: (text: string) => void;
  data: SoalItem[];
  onChange: (data: SoalItem[]) => void;
}

type AnswerType = JawabanItem['tipe'];

function legacyJawabanItems(soal: SoalItem): JawabanItem[] {
  if (soal.jawaban_items && soal.jawaban_items.length > 0) {
    return soal.jawaban_items;
  }

  if ((!soal.tipe || soal.tipe === 'image') && soal.list_gambar && soal.list_gambar.length > 0) {
    return soal.list_gambar.map((gbr) => ({
      id: gbr.id,
      tipe: 'image',
      file: gbr.file,
      url: gbr.url,
      code: '',
      table_data: [['Header 1', 'Header 2'], ['Data 1', 'Data 2']],
      judul: gbr.nama,
      penjelasan: gbr.penjelasan,
    }));
  }

  if ((!soal.tipe || soal.tipe === 'image') && (soal.gambar_url || soal.gambar)) {
    return [{
      id: soal.id,
      tipe: 'image',
      file: soal.gambar,
      url: soal.gambar_url,
      code: '',
      table_data: [['Header 1', 'Header 2'], ['Data 1', 'Data 2']],
      judul: soal.judul_gambar,
      penjelasan: '',
    }];
  }

  if (soal.tipe === 'code' && soal.code) {
    return [{
      id: soal.id,
      tipe: 'code',
      file: null,
      url: '',
      code: soal.code,
      table_data: [['Header 1', 'Header 2'], ['Data 1', 'Data 2']],
      judul: soal.judul_gambar,
      penjelasan: '',
    }];
  }

  if (soal.tipe === 'table' && soal.table_data) {
    return [{
      id: soal.id,
      tipe: 'table',
      file: null,
      url: '',
      code: '',
      table_data: soal.table_data,
      judul: soal.judul_gambar,
      penjelasan: '',
    }];
  }

  return soal.jawaban_items || [];
}

export default function PostTestTab({ intro, onIntroChange, data, onChange }: PostTestTabProps) {
  const updateSoal = (index: number, field: keyof SoalItem, value: string | File | null | JawabanItem[]) => {
    const updated = [...data];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const addSoal = () => onChange([...data, createEmptySoal()]);

  const removeSoal = (index: number) => {
    if (data.length <= 1) return;
    onChange(data.filter((_, i) => i !== index));
  };

  const setJawabanItems = (soalIndex: number, items: JawabanItem[]) => {
    updateSoal(soalIndex, 'jawaban_items', items);
  };

  const addJawabanItem = (soalIndex: number, tipe: AnswerType) => {
    const items = legacyJawabanItems(data[soalIndex]);
    setJawabanItems(soalIndex, [...items, createEmptyJawabanItem(tipe)]);
  };

  const removeJawabanItem = (soalIndex: number, itemIndex: number) => {
    const items = legacyJawabanItems(data[soalIndex]).filter((_, i) => i !== itemIndex);
    setJawabanItems(soalIndex, items);
  };

  const updateJawabanItem = (
    soalIndex: number,
    itemIndex: number,
    field: keyof JawabanItem,
    value: string | File | null | string[][],
  ) => {
    const items = legacyJawabanItems(data[soalIndex]).map((item) => ({ ...item }));

    if (field === 'file' && value instanceof File) {
      items[itemIndex] = {
        ...items[itemIndex],
        file: value,
        url: URL.createObjectURL(value),
      };
    } else {
      items[itemIndex] = { ...items[itemIndex], [field]: value };
    }

    setJawabanItems(soalIndex, items);
  };

  const updateTableCell = (soalIndex: number, itemIndex: number, rowIndex: number, colIndex: number, value: string) => {
    const items = legacyJawabanItems(data[soalIndex]).map((item) => ({ ...item }));
    const table = items[itemIndex].table_data || [['', ''], ['', '']];
    items[itemIndex].table_data = table.map((row, rI) =>
      rI === rowIndex ? row.map((cell, cI) => (cI === colIndex ? value : cell)) : row,
    );
    setJawabanItems(soalIndex, items);
  };

  const addTableRow = (soalIndex: number, itemIndex: number) => {
    const items = legacyJawabanItems(data[soalIndex]).map((item) => ({ ...item }));
    const table = items[itemIndex].table_data || [['', ''], ['', '']];
    const cols = table[0]?.length || 2;
    items[itemIndex].table_data = [...table, Array(cols).fill('')];
    setJawabanItems(soalIndex, items);
  };

  const addTableCol = (soalIndex: number, itemIndex: number) => {
    const items = legacyJawabanItems(data[soalIndex]).map((item) => ({ ...item }));
    const table = items[itemIndex].table_data || [['', ''], ['', '']];
    items[itemIndex].table_data = table.map((row) => [...row, '']);
    setJawabanItems(soalIndex, items);
  };

  const removeTableRow = (soalIndex: number, itemIndex: number, rowIndex: number) => {
    const items = legacyJawabanItems(data[soalIndex]).map((item) => ({ ...item }));
    const table = items[itemIndex].table_data || [];
    if (table.length <= 1) return;
    items[itemIndex].table_data = table.filter((_, i) => i !== rowIndex);
    setJawabanItems(soalIndex, items);
  };

  const removeTableCol = (soalIndex: number, itemIndex: number) => {
    const items = legacyJawabanItems(data[soalIndex]).map((item) => ({ ...item }));
    const table = items[itemIndex].table_data || [];
    if (!table[0] || table[0].length <= 1) return;
    items[itemIndex].table_data = table.map((row) => row.slice(0, -1));
    setJawabanItems(soalIndex, items);
  };

  const renderJawabanItem = (soalIndex: number, item: JawabanItem, itemIndex: number) => (
    <div key={item.id} className="border border-gray-200 rounded-xl bg-white p-4 space-y-3 relative group/item">
      <button
        onClick={() => removeJawabanItem(soalIndex, itemIndex)}
        className="absolute top-3 right-3 p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors opacity-0 group-hover/item:opacity-100"
        title="Hapus jawaban"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg w-max pr-9">
        {(['image', 'code', 'table'] as const).map((tipe) => (
          <button
            key={tipe}
            onClick={() => updateJawabanItem(soalIndex, itemIndex, 'tipe', tipe)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              item.tipe === tipe ? 'bg-white shadow-sm text-purple-700' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tipe === 'image' && <ImagePlus className="w-3.5 h-3.5" />}
            {tipe === 'code' && <FileCode2 className="w-3.5 h-3.5" />}
            {tipe === 'table' && <Table2 className="w-3.5 h-3.5" />}
            {tipe === 'image' ? 'Gambar' : tipe === 'code' ? 'Source Code' : 'Tabel'}
          </button>
        ))}
      </div>

      {item.tipe === 'image' && (
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <label className="flex items-center justify-center w-24 h-24 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-purple-400 hover:bg-purple-50/50 transition-all shrink-0">
              {item.url ? (
                <img src={item.url} alt="Preview" className="w-full h-full object-cover rounded-md" />
              ) : (
                <ImagePlus className="w-6 h-6 text-gray-400" />
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0] || null;
                  if (file) updateJawabanItem(soalIndex, itemIndex, 'file', file);
                }}
              />
            </label>

            <div className="flex-1">
              <label className="block text-[10px] font-medium text-gray-500 mb-1">Judul Gambar</label>
              <input
                type="text"
                value={item.judul}
                onChange={(event) => updateJawabanItem(soalIndex, itemIndex, 'judul', event.target.value)}
                placeholder="cth: Tampilan Login"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-medium text-gray-500 mb-1">Penjelasan Gambar</label>
            <textarea
              value={item.penjelasan}
              onChange={(event) => updateJawabanItem(soalIndex, itemIndex, 'penjelasan', event.target.value)}
              placeholder="Tuliskan penjelasan gambar dengan lebih lengkap di sini..."
              rows={5}
              className="w-full min-h-32 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none text-sm resize-y"
            />
          </div>
        </div>
      )}

      {item.tipe === 'code' && (
        <div className="space-y-3">
          <div>
            <label className="block text-[10px] font-medium text-gray-500 mb-1">Judul Kode</label>
            <input
              type="text"
              value={item.judul}
              onChange={(event) => updateJawabanItem(soalIndex, itemIndex, 'judul', event.target.value)}
              placeholder="cth: Program Login"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none text-xs"
            />
          </div>
          <textarea
            value={item.code}
            onChange={(event) => updateJawabanItem(soalIndex, itemIndex, 'code', event.target.value)}
            placeholder="Paste source code di sini..."
            rows={8}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-mono text-xs transition-all outline-none resize-y"
          />
        </div>
      )}

      {item.tipe === 'table' && (
        <div className="space-y-3">
          <div>
            <label className="block text-[10px] font-medium text-gray-500 mb-1">Judul Tabel</label>
            <input
              type="text"
              value={item.judul}
              onChange={(event) => updateJawabanItem(soalIndex, itemIndex, 'judul', event.target.value)}
              placeholder="cth: Hasil Pengujian"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none text-xs"
            />
          </div>

          <div className="overflow-x-auto border border-gray-200 rounded-lg p-2 bg-gray-50">
            <table className="w-full text-sm text-left">
              <tbody>
                {item.table_data.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, colIndex) => (
                      <td key={colIndex} className="p-1 min-w-[100px]">
                        <input
                          type="text"
                          value={cell}
                          onChange={(event) => updateTableCell(soalIndex, itemIndex, rowIndex, colIndex, event.target.value)}
                          className={`w-full px-2 py-1.5 border border-transparent hover:border-gray-300 focus:border-purple-500 rounded transition-all outline-none ${
                            rowIndex === 0 ? 'font-bold bg-white' : 'bg-transparent'
                          }`}
                        />
                      </td>
                    ))}
                    <td className="w-8 p-1">
                      {item.table_data.length > 1 && (
                        <button onClick={() => removeTableRow(soalIndex, itemIndex, rowIndex)} className="p-1 text-red-400 hover:text-red-600 rounded">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex gap-2 mt-2">
              <button onClick={() => addTableRow(soalIndex, itemIndex)} className="px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-600 rounded text-xs font-semibold">+ Baris</button>
              <button onClick={() => addTableCol(soalIndex, itemIndex)} className="px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-600 rounded text-xs font-semibold">+ Kolom</button>
              {item.table_data[0]?.length > 1 && (
                <button onClick={() => removeTableCol(soalIndex, itemIndex)} className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded text-xs font-semibold">- Kolom Akhir</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
        <span className="w-7 h-7 bg-purple-100 text-purple-700 rounded-lg flex items-center justify-center text-sm font-bold">4</span>
        Post-Test
      </h3>

      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
        <label className="block text-xs font-medium text-gray-500 mb-1">
          Teks Pengantar <span className="text-gray-400">(Bisa dikosongkan)</span>
        </label>
        <textarea
          value={intro}
          onChange={(event) => onIntroChange(event.target.value)}
          placeholder="Teks sebelum list pertanyaan..."
          rows={2}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none text-sm resize-none"
        />
      </div>

      <div className="space-y-6">
        {data.map((soal, index) => {
          const jawabanItems = legacyJawabanItems(soal);

          return (
            <div key={soal.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3 relative group">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-600">Soal {index + 1}</span>
                {data.length > 1 && (
                  <button
                    onClick={() => removeSoal(index)}
                    className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                    title="Hapus soal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Pertanyaan</label>
                <textarea
                  value={soal.pertanyaan}
                  onChange={(event) => updateSoal(index, 'pertanyaan', event.target.value)}
                  placeholder="Tuliskan pertanyaan post-test..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none text-sm resize-none"
                />
              </div>

              <div className="pt-2 border-t border-gray-100 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <label className="block text-xs font-semibold text-gray-600">Jawaban</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => addJawabanItem(index, 'image')}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold transition-colors"
                    >
                      <ImagePlus className="w-3.5 h-3.5" />
                      Gambar
                    </button>
                    <button
                      onClick={() => addJawabanItem(index, 'code')}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold transition-colors"
                    >
                      <FileCode2 className="w-3.5 h-3.5" />
                      Source Code
                    </button>
                    <button
                      onClick={() => addJawabanItem(index, 'table')}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold transition-colors"
                    >
                      <Table2 className="w-3.5 h-3.5" />
                      Tabel
                    </button>
                  </div>
                </div>

                {jawabanItems.length === 0 ? (
                  <p className="text-xs text-gray-400 italic border border-dashed border-gray-200 rounded-xl p-4 text-center bg-white">
                    Belum ada jawaban. Tambahkan gambar, source code, atau tabel.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {jawabanItems.map((item, itemIndex) => renderJawabanItem(index, item, itemIndex))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Analisis <span className="text-gray-400">(opsional)</span>
                </label>
                <textarea
                  value={soal.analisis}
                  onChange={(event) => updateSoal(index, 'analisis', event.target.value)}
                  placeholder="Tuliskan analisis jawaban..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none text-sm resize-y"
                />
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={addSoal}
        className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50/50 transition-all"
      >
        <Plus className="w-4 h-4" />
        Tambah Soal
      </button>
    </div>
  );
}
