import React, { useState } from 'react';
import { Prompt } from '../types';
import { useStore } from '../store';
import { X, Copy, Check, Share2, Crown, Facebook, Twitter, Instagram, MessageCircle, Send } from 'lucide-react';

export const PromptDetailsModal = () => {
  const { selectedPromptForDetails, setSelectedPromptForDetails, user } = useStore();
  const [copied, setCopied] = useState(false);

  if (!selectedPromptForDetails) return null;

  const prompt = selectedPromptForDetails;
  
  // If premium and not allowed, shouldn't really get here but just in case
  const isPremiumLocked = prompt.isPremium && !user?.isPremium && !user?.isAdmin;

  const handleCopy = () => {
    if (isPremiumLocked) return;
    navigator.clipboard.writeText(prompt.promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareText = `شاهد هذا البرومبت الرائع: ${prompt.title}\n\n${prompt.promptText}\n\n`;
  const shareUrl = window.location.origin; // Or a specific link if we had prompt pages

  const handleShare = (platform: string) => {
    let url = '';
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(shareUrl);
    
    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case 'whatsapp':
        url = `https://api.whatsapp.com/send?text=${encodedText}${encodedUrl}`;
        break;
      case 'telegram':
        url = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
        break;
    }
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-[#0f172a]/80 backdrop-blur-sm flex items-center justify-center p-4 z-[80]">
       <div className="bg-[#1e293b] rounded-xl max-w-2xl w-full flex flex-col shadow-2xl relative max-h-[95vh] overflow-hidden border border-[#334155]">
          {/* Header */}
          <div className="p-4 border-b border-[#334155] flex justify-between items-center bg-[#0f172a]">
            <h2 className="text-xl font-bold text-[#f8fafc] max-w-[80%] truncate">{prompt.title}</h2>
            <button onClick={() => setSelectedPromptForDetails(null)} className="p-2 hover:bg-[#334155] rounded-full text-[#94a3b8] transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <div className="overflow-y-auto p-4 flex flex-col gap-6">
            {/* Image */}
            {prompt.imageUrls && prompt.imageUrls.length > 0 && (
              <div className="w-full bg-[#0f172a] rounded-lg overflow-hidden border border-[#334155] flex justify-center items-center py-2 min-h-[200px]">
                <img src={prompt.imageUrls[0]} alt={prompt.title} className="max-h-[60vh] object-contain" crossOrigin="anonymous" />
              </div>
            )}
            
            {/* Prompt Text */}
            <div className="flex flex-col gap-2">
               <h3 className="text-[#f8fafc] font-semibold text-sm">نص البرومبت:</h3>
               {isPremiumLocked ? (
                  <div className="bg-[#0f172a] border border-[#334155] p-4 rounded-lg flex flex-col items-center justify-center gap-2 text-[#94a3b8] select-none h-32 blur-sm">
                    <span className="text-sm">هذا البرومبت مدفوع، يرجى الترقية لنسخه واستخدامه.</span>
                  </div>
               ) : (
                 <div className="bg-[#0f172a] border border-[#334155] p-4 rounded-lg text-[#94a3b8] text-sm leading-relaxed" dir="ltr">
                    {prompt.promptText}
                 </div>
               )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              <button 
                onClick={handleCopy}
                disabled={isPremiumLocked}
                className={`flex-grow py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium ${
                  isPremiumLocked 
                    ? 'bg-[#334155] text-[#94a3b8] cursor-not-allowed'
                    : copied 
                      ? 'bg-green-600 text-white' 
                      : 'bg-[#6366f1] text-white hover:bg-[#6366f1]/90'
                }`}
              >
                {copied ? <><Check size={18} /> تم النسخ</> : isPremiumLocked ? <><Crown size={18} /> مدفوع</> : <><Copy size={18} /> نسخ البرومبت</>}
              </button>
              
              {!isPremiumLocked && (
                <div className="flex justify-center gap-2 flex-wrap">
                  <button onClick={() => handleShare('facebook')} className="p-3 bg-[#1877F2] text-white rounded-lg hover:bg-[#1877F2]/90 transition-colors" title="شارك على فيس بوك">
                    <Facebook size={20} />
                  </button>
                  <button onClick={() => handleShare('twitter')} className="p-3 bg-black text-white rounded-lg hover:bg-black/80 transition-colors border border-[#334155]" title="شارك على تويتر">
                    <Twitter size={20} />
                  </button>
                  <button onClick={() => handleShare('whatsapp')} className="p-3 bg-[#25D366] text-white rounded-lg hover:bg-[#25D366]/90 transition-colors" title="شارك على واتساب">
                    <MessageCircle size={20} />
                  </button>
                  <button onClick={() => handleShare('telegram')} className="p-3 bg-[#229ED9] text-white rounded-lg hover:bg-[#229ED9]/90 transition-colors" title="شارك على تليجرام">
                    <Send size={20} />
                  </button>
                </div>
              )}
            </div>
          </div>
       </div>
    </div>
  );
};
