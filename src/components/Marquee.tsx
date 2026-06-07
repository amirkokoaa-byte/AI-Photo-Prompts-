import React from 'react';
import { Prompt } from '../types';
import { Crown } from 'lucide-react';

export const Marquee = ({ prompts, onPromptClick }: { prompts: Prompt[], onPromptClick?: (prompt: Prompt) => void }) => {
  if (!prompts || prompts.length === 0) return null;

  const renderItem = (p: Prompt, keyName: string) => (
    <div key={keyName} onClick={() => onPromptClick && onPromptClick(p)} className="flex items-center gap-3 bg-[#1e293b] p-2 rounded-xl border border-[#334155] shadow-sm flex-shrink-0 cursor-pointer hover:border-[#6366f1] hover:shadow-md hover:-translate-y-1 transition-all min-w-[220px]">
       {p.imageUrls && p.imageUrls[0] ? (
         <div className="h-16 w-16 flex-shrink-0 bg-[#0f172a] rounded-lg overflow-hidden border border-[#334155]">
           <img src={p.imageUrls[0]} alt="marquee" className="w-full h-full object-cover" crossOrigin="anonymous" />
         </div>
       ) : (
         <div className="h-16 w-16 flex-shrink-0 bg-[#0f172a] rounded-lg border border-[#334155]" />
       )}
       <div className="flex flex-col flex-grow truncate min-w-0">
         <span className="text-sm font-bold text-[#f8fafc] truncate">{p.title}</span>
         {p.isPremium ? (
           <span className="text-xs text-[#fbbf24] font-bold flex items-center gap-1 mt-1"><Crown size={12} /> مدفوع</span>
         ) : (
           <span className="text-xs text-green-400 font-bold mt-1">مجاني</span>
         )}
       </div>
    </div>
  );

  return (
    <div className="marquee-container w-full h-28 flex items-center py-2 bg-[#0f172a]/20 border-b border-[#334155]/50 overflow-hidden">
      <div className="scrolling-wrapper w-full relative h-full">
        <div className="scrolling-content gap-4 px-4 h-full items-center">
          {/* Half 1 */}
          {Array.from({ length: 5 }).map((_, repeatIndex) => (
            <React.Fragment key={`half1-${repeatIndex}`}>
              {prompts.map((p, i) => renderItem(p, `h1-${repeatIndex}-${p.id}-${i}`))}
            </React.Fragment>
          ))}
          {/* Half 2 (Identical for seamless 50% scroll) */}
          {Array.from({ length: 5 }).map((_, repeatIndex) => (
            <React.Fragment key={`half2-${repeatIndex}`}>
              {prompts.map((p, i) => renderItem(p, `h2-${repeatIndex}-${p.id}-${i}`))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
