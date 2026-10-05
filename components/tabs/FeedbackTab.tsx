'use client';

interface FeedbackTabProps {
  value: string;
  onChange: (text: string) => void;
}

export default function FeedbackTab({ value, onChange }: FeedbackTabProps) {
  return (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
        <span className="w-7 h-7 bg-rose-100 text-rose-700 rounded-lg flex items-center justify-center text-sm font-bold">5</span>
        Feedback
      </h3>

      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
        <label className="block text-xs font-medium text-gray-500 mb-1">
          Feedback Praktikum <span className="text-gray-400">(satu paragraf, bisa dikosongkan)</span>
        </label>
        <textarea
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Tuliskan kesan, pesan, atau masukan untuk praktikum ini..."
          rows={6}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all outline-none text-sm resize-y"
        />
      </div>
    </div>
  );
}