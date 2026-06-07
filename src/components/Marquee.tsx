import React from 'react';
import { Prompt } from '../types';
import { Crown } from 'lucide-react';

export const Marquee = ({ prompts, onPromptClick }: { prompts: Prompt[], onPromptClick?: (prompt: Prompt) => void }) => {
  if (!prompts || prompts.length === 0) return null;

  const renderItem = (p: Prompt, keyName: string) => (
    <div key={keyName} onClick={() => onPromptClick && onPromptClick(p)} className="flex items-center gap-3 bg-[#1e293b] pr-2 pl-4 py-1.5 rounded-full border border-[#334155] shadow-sm flex-shrink-0 cursor-pointer hover:border-[#6366f1] transition-colors">
       {p.imageUrls && p.imageUrls[0] ? (
         <div className="h-10 w-10 flex-shrink-0 bg-[#0f172a] rounded-full overflow-hidden border border-[#334155]">
           <img src={p.imageUrls[0]} alt="marquee" className="w-full h-full object-contain" crossOrigin="anonymous" />
         </div>
       ) : (
         <div className="h-10 w-10 flex-shrink-0 bg-[#0f172a] rounded-full border border-[#334155]" />
       )}
       <div className="flex flex-col">
         <span className="text-sm font-semibold text-[#f8fafc]">{p.title}</span>
         {p.isPremium ? (
           <span className="text-[10px] text-[#fbbf24] font-bold flex items-center gap-1"><Crown size={10} /> مدفوع</span>
         ) : (
           <span className="text-[10px] text-green-400 font-bold">مجاني</span>
         )}
       </div>
    </div>
  );

  return (
    <div className="marquee-container w-full h-20 flex items-center py-2 bg-[#0f172a]/50">
      <div className="scrolling-wrapper w-full relative h-full">
        <div className="scrolling-content flex gap-6 px-4 h-full items-center">
          {prompts.map((p, i) => renderItem(p, `${p.id}-${i}`))}
          {/* Duplicate for infinite effect */}
          {prompts.map((p, i) => renderItem(p, `dup-${p.id}-${i}`))}
          {prompts.map((p, i) => renderItem(p, `dup2-${p.id}-${i}`))}
        </div>
      </div>
    </div>
  );
};
