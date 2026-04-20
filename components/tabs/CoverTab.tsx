'use client';

import type { CoverData } from '@/lib/types';

interface CoverTabProps {
  data: CoverData;
  onChange: (data: CoverData) => void;
}

export default function CoverTab({ data, onChange }: CoverTabProps) {
  const update = (field: keyof CoverData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
        <span className="w-7 h-7 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center text-sm font-bold">1</span>
        Halaman Cover
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Mata Praktikum
          </label>
          <input
            type="text"
            value={data.mata_praktikum}
            onChange={(e) => update('mata_praktikum', e.target.value)}
            placeholder="cth: Algoritma dan Pemrograman"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Materi
          </label>
          <input
            type="text"
            value={data.materi}
            onChange={(e) => update('materi', e.target.value)}
            placeholder="cth: Perulangan (Looping)"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Hari / Tanggal
          </label>
          <input
            type="text"
            value={data.hari_tanggal}
            onChange={(e) => update('hari_tanggal', e.target.value)}
            placeholder="cth: Senin, 20 April 2026"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Tahun
          </label>
          <input
            type="text"
            value={data.tahun}
            onChange={(e) => update('tahun', e.target.value)}
            placeholder="cth: 2026"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-sm"
          />
        </div>

        <hr className="border-gray-100" />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Nama Lengkap
            <span className="text-xs text-gray-400 ml-2">(otomatis)</span>
          </label>
          <input
            type="text"
            value={data.nama}
            readOnly
            className="w-full px-4 py-2.5 border border-gray-100 rounded-xl bg-gray-50 text-gray-500 text-sm cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            NIM
            <span className="text-xs text-gray-400 ml-2">(otomatis)</span>
          </label>
          <input
            type="text"
            value={data.nim}
            readOnly
            className="w-full px-4 py-2.5 border border-gray-100 rounded-xl bg-gray-50 text-gray-500 text-sm cursor-not-allowed"
          />
        </div>
      </div>
    </div>
  );
}
