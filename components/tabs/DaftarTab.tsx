'use client';

import type { DaftarData, FormData, DaftarItem } from '@/lib/types';
import { LayoutList, RefreshCcw } from 'lucide-react';

interface DaftarTabProps {
  data: FormData;
  onChange: (data: FormData) => void;
}

export default function DaftarTab({ data, onChange }: DaftarTabProps) {
  const daftars = data.daftars || {
    show: false,
    pertemuan: '',
    materi: '',
    isi: [],
    gambar: [],
    tabel: [],
    kode: []
  };

  const updateDaftars = (field: keyof DaftarData, value: any) => {
    onChange({ ...data, daftars: { ...daftars, [field]: value } });
  };

  const updateItem = (listType: 'isi' | 'gambar' | 'tabel' | 'kode', index: number, field: keyof DaftarItem, value: string) => {
    const updatedList = [...daftars[listType]];
    updatedList[index] = { ...updatedList[index], [field]: value };
    updateDaftars(listType, updatedList);
  };

  const capitalizeEachWord = (str: string): string => {
    if (!str) return '';
    return str.replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const handleGenerate = () => {
    // Fungsi pintar yang mencari elemen di layar dan mengkalkulasi posisi absolut kertasnya!
    const getPageNumber = (id: string): string => {
      const el = document.getElementById(id);
      if (!el) return '';
      const section = el.closest('.page-container');
      if (!section) return '';
      
      const startPageStr = section.getAttribute('data-start-page');
      if (!startPageStr) return '';
      
      const startPage = parseInt(startPageStr, 10);
      const elRect = el.getBoundingClientRect();
      const secRect = section.getBoundingClientRect();
      
      // Ambil posisi Y vertikal murni terhadap kontainer section-nya
      const relativeTop = elRect.top - secRect.top;
      
      // Bagi dengan tinggi standar kertas A4 (1122.5px) untuk mengetahui di segment mana dia jatuh
      const pageOffset = Math.floor(Math.max(0, relativeTop) / 1122.5);
      return (startPage + pageOffset).toString();
    };

    const getSectionPage = (id: string): string => {
      const section = document.getElementById(`section-${id}`);
      if (!section) return '';
      return section.getAttribute('data-start-page') || '';
    };

    const newGambar: DaftarItem[] = [];
    const newTabel: DaftarItem[] = [];
    const newKode: DaftarItem[] = [];

    // Pre Test (Bab 1)
    data.preTest.forEach((ss, i) => {
      const judul = ss.judul_gambar ? capitalizeEachWord(ss.judul_gambar) : '';
      if (!ss.tipe || ss.tipe === 'image') {
        if (ss.gambar_url) {
          const idStr = `pre-img-${i}`;
          newGambar.push({ id: idStr, label: `Gambar 1.${i + 1} ${judul}`.trim(), halaman: getPageNumber(idStr) });
        }
      } else if (ss.tipe === 'code') {
        if (ss.code) {
          const idStr = `pre-code-${i}`;
          newKode.push({ id: idStr, label: `Kode Program 1.${i + 1} ${judul}`.trim(), halaman: getPageNumber(idStr) });
        }
      } else if (ss.tipe === 'table') {
        if (ss.table_data) {
          const idStr = `pre-tab-${i}`;
          newTabel.push({ id: idStr, label: `Tabel 1.${i + 1} ${judul}`.trim(), halaman: getPageNumber(idStr) });
        }
      }
    });

    // Hasil Praktikum (Bab 2)
    data.hasil.screenshots.forEach((ss, i) => {
      const judul = ss.judul ? capitalizeEachWord(ss.judul) : '';
      if (ss.tipe === 'image') {
        if (ss.url) {
          const idStr = `has-img-${i}`;
          newGambar.push({ id: idStr, label: `Gambar 2.${i + 1} ${judul}`.trim(), halaman: getPageNumber(idStr) });
        }
      } else if (ss.tipe === 'code') {
         if (ss.code) {
          const idStr = `has-code-${i}`;
          newKode.push({ id: idStr, label: `Kode Program 2.${i + 1} ${judul}`.trim(), halaman: getPageNumber(idStr) });
         }
      } else if (ss.tipe === 'table') {
         if (ss.table_data) {
          const idStr = `has-tab-${i}`;
          newTabel.push({ id: idStr, label: `Tabel 2.${i + 1} ${judul}`.trim(), halaman: getPageNumber(idStr) });
         }
      }
    });

    // Post Test (Bab 3)
    data.postTest.forEach((ss, i) => {
      const judul = ss.judul_gambar ? capitalizeEachWord(ss.judul_gambar) : '';
      if (!ss.tipe || ss.tipe === 'image') {
        if (ss.gambar_url) {
          const idStr = `pos-img-${i}`;
          newGambar.push({ id: idStr, label: `Gambar 3.${i + 1} ${judul}`.trim(), halaman: getPageNumber(idStr) });
        }
      } else if (ss.tipe === 'code') {
        if (ss.code) {
          const idStr = `pos-code-${i}`;
          newKode.push({ id: idStr, label: `Kode Program 3.${i + 1} ${judul}`.trim(), halaman: getPageNumber(idStr) });
        }
      } else if (ss.tipe === 'table') {
        if (ss.table_data) {
          const idStr = `pos-tab-${i}`;
          newTabel.push({ id: idStr, label: `Tabel 3.${i + 1} ${judul}`.trim(), halaman: getPageNumber(idStr) });
        }
      }
    });

    const materiCap = data.cover.materi?.toUpperCase() || 'MATERI';

    // Daftar Isi Otomatis berdasarkan Halaman LiveCanvas!
    const newIsi: DaftarItem[] = [
      { id: 'i1', label: 'DAFTAR ISI', halaman: getSectionPage('daftar-isi') || '2' },
      { id: 'i2', label: 'DAFTAR GAMBAR', halaman: getSectionPage('daftar-gambar') || '3' },
      { id: 'i3', label: 'DAFTAR TABEL', halaman: getSectionPage('daftar-tabel') || '4' },
      { id: 'i4', label: 'DAFTAR KODE PROGRAM', halaman: getSectionPage('daftar-kode') || '5' },
      { id: 'i5', label: 'DAFTAR PERTEMUAN PRAKTIKUM', halaman: getSectionPage('daftar-pertemuan') || '6' },
      { id: 'i6', label: `PRAKTIKUM ${daftars.pertemuan}: ${materiCap}`, halaman: getSectionPage('pre-test') || '7' },
      { id: 'i7', label: 'Informasi Praktikum', halaman: getSectionPage('pre-test') || '7' },
      { id: 'i8', label: 'I.\tPre Test', halaman: getSectionPage('pre-test') || '7' },
      { id: 'i9', label: 'II.\tHasil Praktikum', halaman: getSectionPage('hasil') || '9' },
      { id: 'i10', label: '\tA. Alat dan Bahan', halaman: getSectionPage('hasil') || '9' },
      { id: 'i11', label: '\tB. Langkah Kerja', halaman: getSectionPage('hasil') || '9' },
      { id: 'i12', label: '\tC. Implementasi dan Dokumentasi', halaman: getSectionPage('hasil') || '10' },
      { id: 'i13', label: '\tD. Analisis Hasil', halaman: getSectionPage('hasil') || '10' },
      { id: 'i14', label: 'III.\tPost Test', halaman: getSectionPage('post-test') || '23' },
      { id: 'i15', label: 'Daftar Pustaka Singkat', halaman: getSectionPage('post-test') || '26' },
      { id: 'i16', label: 'Lampiran', halaman: getSectionPage('post-test') || '26' }
    ];

    onChange({
      ...data,
      daftars: {
        ...daftars,
        show: true,
        materi: materiCap,
        isi: newIsi,
        gambar: newGambar,
        tabel: newTabel,
        kode: newKode,
      }
    });
  };

  const renderListEditor = (title: string, listType: 'isi' | 'gambar' | 'tabel' | 'kode') => {
    const list = daftars[listType];
    if (list.length === 0) return null;
    return (
      <div className="mt-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">{title}</h4>
        <div className="space-y-1">
          {list.map((item, index) => (
            <div key={item.id} className="flex gap-2 items-center">
              <input
                type="text"
                value={item.label}
                onChange={(e) => updateItem(listType, index, 'label', e.target.value)}
                className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs focus:border-blue-500 outline-none w-full"
              />
              <input
                type="text"
                value={item.halaman}
                onChange={(e) => updateItem(listType, index, 'halaman', e.target.value)}
                placeholder="Hal"
                className="w-12 px-2 py-1 border border-gray-200 rounded text-xs text-center focus:border-blue-500 outline-none"
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
        <span className="w-7 h-7 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center text-sm font-bold">
          <LayoutList className="w-4 h-4" />
        </span>
        Daftar (Otomasisasi)
      </h3>

      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
        <p className="text-sm text-blue-800 mb-3">
          Sistem akan men-scan seluruh dokumen untuk membuat Daftar Isi, Gambar, Tabel, dan Kode Program secara otomatis.
        </p>

        <div className="flex items-center gap-3 mb-4">
          <label className="text-sm font-medium text-gray-700">Pertemuan Ke-</label>
          <input
            type="number"
            value={daftars.pertemuan}
            onChange={(e) => updateDaftars('pertemuan', e.target.value)}
            className="w-16 px-2 py-1 border border-gray-200 rounded text-sm text-center"
            min="1"
            max="14"
          />
        </div>

        <button
          onClick={handleGenerate}
          className="w-full flex items-center justify-center gap-2 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all shadow-sm active:scale-[0.98]"
        >
          <RefreshCcw className="w-4 h-4" />
          Generate Daftar
        </button>
      </div>

      {daftars.show && (
        <div className="bg-white border text-left border-gray-200 rounded-xl p-4">
          <label className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100 cursor-pointer">
            <input
              type="checkbox"
              checked={daftars.show}
              onChange={(e) => updateDaftars('show', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Tampilkan ke dalam Canvas Halaman</span>
          </label>
          
          <p className="text-xs text-gray-500 mb-4 bg-gray-50 p-2 rounded leading-relaxed border border-gray-200">
            <strong>✓ Berhasil!</strong> Karena keterbatasan sistem <i>HTML Print</i> bawaan yang tidak mengizinkan pendeteksian letak potong kertas dinamis, sistem kami telah mensimulasikannya via kalkulasi DOM dan mendaftarkan koordinatnya (Auto-Pagination). <br/>
            Untuk hasil pencetakan nomor halaman pojok kanan bawah yang sempurna, pastikan Anda <strong>TIDAK MENCENTANG</strong> opsi <i>"Headers and Footers"</i> pada Print Dialog!
          </p>

          {renderListEditor('Daftar Isi', 'isi')}
          {renderListEditor('Daftar Gambar', 'gambar')}
          {renderListEditor('Daftar Tabel', 'tabel')}
          {renderListEditor('Daftar Kode Program', 'kode')}

        </div>
      )}
    </div>
  );
}
