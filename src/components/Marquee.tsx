import React from 'react';
import { Prompt } from '../types';

export const Marquee = ({ prompts }: { prompts: Prompt[] }) => {
  if (!prompts || prompts.length === 0) return null;

  return (
    <div className="marquee-container w-full h-10 flex items-center">
      <div className="scrolling-wrapper w-full relative">
        <div className="scrolling-content flex gap-10 px-4 h-full items-center">
          {prompts.map((p, i) => (
             p.imageUrls[0] && (
               <div key={`${p.id}-${i}`} className="flex items-center gap-2.5 text-xs text-[#94a3b8]">
                  <div className="h-7 w-7 flex-shrink-0 bg-[#334155] rounded shadow overflow-hidden">
                    <img src={p.imageUrls[0]} alt="marquee" className="w-full h-full object-cover" crossOrigin="anonymous" />
                  </div>
                  <span>{p.title}</span>
               </div>
             )
          ))}
          {/* Duplicate for infinite effect */}
          {prompts.map((p, i) => (
             p.imageUrls[0] && (
               <div key={`dup-${p.id}-${i}`} className="flex items-center gap-2.5 text-xs text-[#94a3b8]">
                  <div className="h-7 w-7 flex-shrink-0 bg-[#334155] rounded shadow overflow-hidden">
                    <img src={p.imageUrls[0]} alt="marquee" className="w-full h-full object-cover" crossOrigin="anonymous" />
                  </div>
                  <span>{p.title}</span>
               </div>
             )
          ))}
          {prompts.map((p, i) => (
             p.imageUrls[0] && (
               <div key={`dup2-${p.id}-${i}`} className="flex items-center gap-2.5 text-xs text-[#94a3b8]">
                  <div className="h-7 w-7 flex-shrink-0 bg-[#334155] rounded shadow overflow-hidden">
                    <img src={p.imageUrls[0]} alt="marquee" className="w-full h-full object-cover" crossOrigin="anonymous" />
                  </div>
                  <span>{p.title}</span>
               </div>
             )
          ))}
        </div>
      </div>
    </div>
  );
};
