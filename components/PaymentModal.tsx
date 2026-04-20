'use client';

import { Lock, CreditCard, X, Sparkles } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PaymentModal({ isOpen, onClose }: PaymentModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden animate-in">
        {/* Header gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1 rounded-lg hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold mb-1">Fitur Premium</h2>
          <p className="text-blue-100 text-sm">Buka akses unduh PDF seumur hidup</p>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-gray-900 mb-1">
              Rp25.000
            </div>
            <p className="text-gray-500 text-sm">Sekali bayar, seumur hidup</p>
          </div>

          <div className="space-y-3 mb-6">
            {[
              'Unduh Laporan Praktikum (PDF)',
              'Format A4 sesuai standar kampus',
              'Akses tanpa batas waktu',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-gray-700">
                <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
                {item}
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              // In production: redirect to payment gateway
              alert('Integrasi payment gateway akan diarahkan ke halaman pembayaran. Hubungi admin untuk informasi lebih lanjut.');
            }}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 active:scale-[0.98] shadow-lg shadow-blue-500/30"
          >
            <CreditCard className="w-5 h-5" />
            Bayar Sekarang
          </button>

          <p className="text-xs text-center text-gray-400 mt-3">
            Pembayaran aman melalui payment gateway resmi
          </p>
        </div>
      </div>
    </div>
  );
}
