'use client';

import { useState } from 'react';
import type { FormData as LaprakFormData } from '@/lib/types';
import CoverTab from '@/components/tabs/CoverTab';
import PreTestTab from '@/components/tabs/PreTestTab';
import HasilTab from '@/components/tabs/HasilTab';
import PostTestTab from '@/components/tabs/PostTestTab';
import DaftarTab from '@/components/tabs/DaftarTab';
import { BookOpen, FlaskConical, BarChart3, ClipboardCheck, LayoutList } from 'lucide-react';

interface FormPanelProps {
  data: LaprakFormData;
  onChange: (data: LaprakFormData) => void;
}

const tabs = [
  { id: 'cover', label: 'Cover', icon: BookOpen, color: 'blue' },
  { id: 'daftar', label: 'Daftar', icon: LayoutList, color: 'cyan' },
  { id: 'pretest', label: 'Pre-Test', icon: FlaskConical, color: 'emerald' },
  { id: 'hasil', label: 'Hasil', icon: BarChart3, color: 'amber' },
  { id: 'posttest', label: 'Post-Test', icon: ClipboardCheck, color: 'purple' },
] as const;

type TabId = typeof tabs[number]['id'];

const tabColors: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-700 border-blue-500',
  cyan: 'bg-cyan-50 text-cyan-700 border-cyan-500',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-500',
  amber: 'bg-amber-50 text-amber-700 border-amber-500',
  purple: 'bg-purple-50 text-purple-700 border-purple-500',
};

const tabInactiveColors: Record<string, string> = {
  blue: 'hover:bg-blue-50/50 hover:text-blue-600',
  cyan: 'hover:bg-cyan-50/50 hover:text-cyan-600',
  emerald: 'hover:bg-emerald-50/50 hover:text-emerald-600',
  amber: 'hover:bg-amber-50/50 hover:text-amber-600',
  purple: 'hover:bg-purple-50/50 hover:text-purple-600',
};

export default function FormPanel({ data, onChange }: FormPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>('cover');

  return (
    <div className="h-full flex flex-col">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-100 px-2 pt-2 gap-1 shrink-0">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg border-b-2 transition-all ${
                isActive
                  ? tabColors[tab.color]
                  : `border-transparent text-gray-400 ${tabInactiveColors[tab.color]}`
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {activeTab === 'cover' && (
          <CoverTab
            data={data.cover}
            onChange={(cover) => onChange({ ...data, cover })}
          />
        )}
        {activeTab === 'daftar' && (
          <DaftarTab
            data={data}
            onChange={onChange}
          />
        )}
        {activeTab === 'pretest' && (
          <PreTestTab
            intro={data.preTestIntro}
            onIntroChange={(text) => onChange({ ...data, preTestIntro: text })}
            data={data.preTest}
            onChange={(preTest) => onChange({ ...data, preTest })}
          />
        )}
        {activeTab === 'hasil' && (
          <HasilTab
            data={data.hasil}
            onChange={(hasil) => onChange({ ...data, hasil })}
          />
        )}
        {activeTab === 'posttest' && (
          <PostTestTab
            intro={data.postTestIntro}
            onIntroChange={(text) => onChange({ ...data, postTestIntro: text })}
            data={data.postTest}
            onChange={(postTest) => onChange({ ...data, postTest })}
          />
        )}
      </div>
    </div>
  );
}
