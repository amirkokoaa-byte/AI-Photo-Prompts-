import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Prompt } from '../types';
import { useStore } from '../store';
import { Copy, Crown, LayoutList, Grip, LayoutGrid, Check } from 'lucide-react';
import { PaymentModal } from './PaymentModal';

export const CategoryView = ({ prompts }: { prompts: Prompt[] }) => {
  const { categoryId } = useParams();
  const { user, setSelectedPromptForDetails } = useStore();
  const [viewMode, setViewMode] = useState<'list' | 'grid1' | 'grid2'>('grid2');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [paymentPromptSelected, setPaymentPromptSelected] = useState<Prompt | null>(null);

  const categoryPrompts = prompts.filter(p => p.categoryId === categoryId);

  const handleCopy = (prompt: Prompt) => {
    if (prompt.isPremium && !user?.isPremium && !user?.isAdmin) {
      setPaymentPromptSelected(prompt);
      return;
    }
    navigator.clipboard.writeText(prompt.promptText);
    setCopiedId(prompt.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePromptClick = (prompt: Prompt) => {
    if (prompt.isPremium && !user?.isPremium && !user?.isAdmin) {
      setPaymentPromptSelected(prompt);
    } else {
      setSelectedPromptForDetails(prompt);
    }
  };

  return (
    <div className="p-4 flex flex-col items-center">
      {/* View Toggles */}
      <div className="flex gap-2 mb-6 bg-[#1e293b] p-1 rounded-lg border border-[#334155]">
        <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${viewMode === 'list' ? 'bg-[#6366f1] text-white' : 'text-[#94a3b8] hover:text-[#f8fafc]'}`}>طولي</button>
        <button onClick={() => setViewMode('grid1')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${viewMode === 'grid1' ? 'bg-[#6366f1] text-white' : 'text-[#94a3b8] hover:text-[#f8fafc]'}`}>مربعات</button>
        <button onClick={() => setViewMode('grid2')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${viewMode === 'grid2' ? 'bg-[#6366f1] text-white' : 'text-[#94a3b8] hover:text-[#f8fafc]'}`}>مزدوج</button>
      </div>

      {categoryPrompts.length === 0 ? (
        <div className="text-center text-[#94a3b8] py-12">لا توجد عناصر في هذا القسم بعد.</div>
      ) : (
        <div className={`w-full gap-4 ${
          viewMode === 'list' ? 'flex flex-col' : 
          viewMode === 'grid1' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid grid-cols-1 md:grid-cols-2'
        }`}>
          {categoryPrompts.map((prompt) => (
            <div key={prompt.id} className={`bg-[#1e293b] rounded-xl border border-[#334155] overflow-hidden flex ${viewMode === 'list' ? 'flex-row items-center p-3 gap-4' : 'flex-col'}`}>
              
              <div 
                className={`relative bg-[#334155] cursor-pointer group ${viewMode === 'list' ? 'w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden' : 'w-full h-[140px]'}`}
                onClick={() => handlePromptClick(prompt)}
              >
                {prompt.imageUrls && prompt.imageUrls.length > 0 ? (
                  <img src={prompt.imageUrls[0]} alt={prompt.title} className="w-full h-full object-contain transition-transform group-hover:scale-105" crossOrigin="anonymous" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#94a3b8] text-xs">لا توجد صورة</div>
                )}
                {prompt.isPremium && (
                  <div className="absolute bottom-2 left-2 bg-[#fbbf24] text-black px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 shadow-lg">
                    <span>👑 مدفوع</span>
                  </div>
                )}
              </div>

              <div className={`flex flex-col flex-grow ${viewMode === 'list' ? 'py-1' : 'p-3'}`}>
                {viewMode !== 'list' && (
                  <h3 className="font-semibold text-sm mb-1 text-[#f8fafc]">{prompt.title}</h3>
                )}
                
                {/* Obfuscate prompt text if premium and user not allowed */}
                {prompt.isPremium && !user?.isPremium && !user?.isAdmin ? (
                   <div className="text-[11px] text-[#94a3b8] mb-2 blur-sm select-none leading-relaxed h-[45px] overflow-hidden">
                     {prompt.promptText.substring(0, 50)}...
                   </div>
                ) : (
                  <div className="text-[11px] text-[#94a3b8] mb-2 leading-relaxed h-[45px] overflow-hidden break-words" dir="ltr">
                    {prompt.title && viewMode === 'list' && <div className="font-semibold text-sm mb-1 text-[#f8fafc] w-full text-right" dir="rtl">{prompt.title}</div>}
                    البرومبت: {prompt.promptText}
                  </div>
                )}
                
                <button 
                  onClick={() => handleCopy(prompt)}
                  className={`mt-auto w-full py-2 px-3 rounded-md flex items-center justify-center gap-2 transition-colors text-xs font-semibold ${
                    copiedId === prompt.id 
                    ? 'bg-green-600 text-white' 
                    : prompt.isPremium && !user?.isPremium && !user?.isAdmin
                      ? 'bg-[#fbbf24] text-black hover:bg-[#fbbf24]/90'
                      : 'bg-[#6366f1] text-white hover:bg-[#6366f1]/90'
                  }`}
                >
                  {copiedId === prompt.id ? (
                    <><Check size={14} /> تم النسخ</>
                  ) : prompt.isPremium && !user?.isPremium && !user?.isAdmin ? (
                    <><Crown size={14} /> شراء النسخة المدفوعة</>
                  ) : (
                    <>نسخ البرومبت</>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {paymentPromptSelected && (
        <PaymentModal 
          onClose={() => setPaymentPromptSelected(null)} 
        />
      )}
    </div>
  );
};
