'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import LiveCanvas from '@/components/LiveCanvas';
import FormPanel from '@/components/FormPanel';
import PaymentModal from '@/components/PaymentModal';
import { createInitialFormData } from '@/lib/types';
import type { FormData as LaprakFormData } from '@/lib/types';
import { Download, Lock, LogOut, GraduationCap, Crown } from 'lucide-react';

export default function DashboardPage() {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [formData, setFormData] = useState<LaprakFormData>(
    createInitialFormData('', '')
  );

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Update form data with user profile
  useEffect(() => {
    if (profile) {
      setFormData((prev) => ({
        ...prev,
        cover: {
          ...prev.cover,
          nama: profile.nama_lengkap,
          nim: profile.nim,
        },
      }));
    }
  }, [profile]);

  const isPremium = profile?.status_langganan === 'premium';

  const handleDownloadPDF = () => {
    // TODO: Kembalikan logika premium nanti jika sudah rilis berbayar
    // if (!isPremium) {
    //   setShowPaymentModal(true);
    //   return;
    // }
    window.print();
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
          <p className="text-sm text-gray-400">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-100">
      {/* Top Bar */}
      <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-5 shrink-0 no-print z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-sm font-bold text-gray-800">Auto-Laprak UAD</h1>
          {isPremium && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-full text-xs font-medium text-amber-700">
              <Crown className="w-3 h-3" />
              Premium
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all active:scale-[0.97] bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30"
          >
            <Download className="w-4 h-4" />
            Unduh PDF
          </button>

          <div className="w-px h-6 bg-gray-200" />

          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-medium text-gray-700">
                {profile?.nama_lengkap || user.email}
              </p>
              <p className="text-[10px] text-gray-400">{profile?.nim}</p>
            </div>
            <button
              onClick={signOut}
              className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Split Screen */}
      <div className="flex flex-1 overflow-hidden">
        {/* Panel Kiri — Live Canvas (60%) */}
        <div className="w-[60%] bg-gray-100 overflow-y-auto p-8 flex justify-center no-print-hide">
          <div className="a4-wrapper">
            <LiveCanvas data={formData} />
          </div>
        </div>

        {/* Divider */}
        <div className="w-px bg-gray-200 shrink-0 no-print" />

        {/* Panel Kanan — Form Workspace (40%) */}
        <div className="w-[40%] bg-white overflow-hidden no-print">
          <FormPanel data={formData} onChange={setFormData} />
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
      />
    </div>
  );
}
