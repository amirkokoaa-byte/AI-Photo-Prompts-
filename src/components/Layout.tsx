import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../store';
import { Menu, X, Sun, Moon, Settings as SettingsIcon, LogOut, DollarSign, Phone, Bell, Home, ArrowRight } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { Notification } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const getAbsoluteUrl = (url: string) => {
  if (!url) return '#';
  if (!/^https?:\/\//i.test(url)) {
    return `https://${url}`;
  }
  return url;
};

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, settings, darkMode, toggleDarkMode, sidebarOpen, setSidebarOpen, setUser, setSelectedPromptForDetails, setShowPremiumModal } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => {
    if (user?.isAdmin) {
      const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'), limit(10));
      const unsub = onSnapshot(q, (snap) => {
        setNotifs(snap.docs.map(d => ({ id: d.id, ...d.data() } as Notification)));
      });
      return () => unsub();
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutsideNotif = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node) && showNotifs) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutsideNotif);
    return () => document.removeEventListener('mousedown', handleClickOutsideNotif);
  }, [showNotifs]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node) && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen, setSidebarOpen]);

  // Close sidebar on navigation change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname, setSidebarOpen]);

  const menuItems = [
    { path: '/', label: 'الصفحة الرئيسية' },
    { path: '/category/1', label: settings.menuTitle1 },
    { path: '/category/2', label: settings.menuTitle2 },
    { path: '/category/3', label: settings.menuTitle3 },
    { path: '/category/4', label: settings.menuTitle4 },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans" dir="rtl">
      {/* Top Bar with InstaPay & Wallet */}
      <div className="bg-[#1e293b] text-[#94a3b8] text-xs py-2 px-4 flex justify-between items-center z-50 border-b border-[#334155]">
        <div className="flex items-center gap-4">
          {settings.instapayLink && (
            <a href={getAbsoluteUrl(settings.instapayLink)} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-[#f8fafc] focus:outline-none transition-colors">
              <DollarSign size={14} className="bg-[#334155] text-white rounded-full p-0.5" />
              <span>InstaPay</span>
            </a>
          )}
          {settings.walletNumber && (
            <div className="flex items-center gap-1 relative group cursor-pointer hover:text-[#f8fafc] transition-colors">
              <Phone size={14} className="bg-[#334155] text-white rounded-full p-0.5" />
              <span>{settings.walletNumber}</span>
              <div className="absolute top-full mt-1 hidden group-hover:block bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                رقم المحفظة
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!user ? (
            <Link to="/login" className="px-3 py-1 bg-[#334155] rounded hover:bg-[#334155]/80 text-[#f8fafc] transition-colors">تسجيل الدخول</Link>
          ) : (
            <div className="flex items-center gap-3">
              <span className="font-medium text-[#f8fafc]">{user.username} {user.isPremium && <span className="text-[#fbbf24]">(Premium 👑)</span>}</span>
              <button onClick={() => setUser(null)} className="p-1 hover:bg-[#334155] rounded-full transition-colors"><LogOut size={14} /></button>
            </div>
          )}
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-[#0f172a] shadow-sm relative z-40 flex flex-col">
        {settings.bannerImageUrl && (
          <div className="w-full h-32 md:h-48 overflow-hidden object-cover relative">
            <img src={settings.bannerImageUrl} alt="Banner" className="w-full h-full object-cover" crossOrigin="anonymous" />
            <div className="absolute inset-0 bg-black/20"></div>
          </div>
        )}
        <div className="p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between bg-[#1e293b] p-3 rounded-xl border border-[#334155]">
            <div className="flex items-center gap-3">
              <button title="القائمة" onClick={(e) => { e.stopPropagation(); setSidebarOpen(!sidebarOpen); }} className="p-2 hover:bg-[#334155] rounded-lg text-[#94a3b8]">
                <Menu size={24} />
              </button>
              <button title="إغلاق" onClick={() => { setSelectedPromptForDetails(null); navigate('/'); }} className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors">
                <X size={24} />
              </button>
              <button title="رجوع" onClick={() => { setSelectedPromptForDetails(null); navigate(-1); }} className="p-2 hover:bg-[#334155] rounded-lg text-[#94a3b8] transition-colors">
                <ArrowRight size={24} />
              </button>
              <button title="تحديث / الرئيسية" onClick={() => { setSelectedPromptForDetails(null); navigate('/'); }} className="p-2 hover:bg-[#334155] rounded-lg text-[#94a3b8] transition-colors">
                <Home size={24} />
              </button>
              <Link to="/" onClick={() => setSelectedPromptForDetails(null)} className="text-xl font-bold text-[#f8fafc] ml-2 hidden sm:block">
                {settings.appName}
              </Link>
            </div>
            <div className="flex items-center gap-2">
              {(user?.isAdmin) && (
                <div className="relative" ref={notifRef}>
                  <button onClick={() => setShowNotifs(!showNotifs)} className="p-2 relative hover:bg-[#334155] rounded-lg text-[#94a3b8] transition-colors">
                    <Bell size={24} />
                    {notifs.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
                  </button>
                  {showNotifs && (
                    <div className="absolute top-full right-0 mt-2 w-72 sm:w-80 bg-[#1e293b] border border-[#334155] rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto p-4 transition-all">
                       <h3 className="font-bold text-[#f8fafc] mb-3 border-b border-[#334155] pb-2">الاشعارات</h3>
                       <div className="flex flex-col gap-2">
                         {notifs.length === 0 ? <p className="text-[#94a3b8] text-xs text-center py-4">لا توجد إشعارات</p> : notifs.map(n => (
                           <div key={n.id} className="bg-[#0f172a] p-3 rounded-lg border border-[#334155] text-xs flex flex-col gap-1">
                              <div className="font-semibold text-[#f8fafc]">المستخدم: <span className="text-[#6366f1]">{n.username}</span></div>
                              <div className="text-[#94a3b8] leading-relaxed">{n.action}</div>
                              <div className="text-[#475569] text-[10px]" dir="ltr">{new Date(n.createdAt).toLocaleString('ar-EG')}</div>
                           </div>
                         ))}
                       </div>
                    </div>
                  )}
                </div>
              )}
              {(user?.isAdmin || user?.isPremium) && (
                <Link to="/settings" onClick={() => setSelectedPromptForDetails(null)} className="p-2 hover:bg-[#334155] rounded-lg text-[#94a3b8] transition-colors">
                  <SettingsIcon size={24} />
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm transition-opacity" />
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={cn(
          "fixed top-0 bottom-0 right-0 w-64 bg-[#1e293b] border-l border-[#334155] shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col",
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="p-4 flex justify-between items-center border-b border-[#334155]">
          <h2 className="font-bold text-lg text-[#f8fafc]">الأقسام</h2>
          <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-[#334155] rounded-full text-[#94a3b8] transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="py-4 flex flex-col flex-grow overflow-y-auto">
          {menuItems.map((item, idx) => (
            <Link
              key={idx}
              to={item.path}
              className={cn(
                "px-6 py-3 transition-colors font-medium flex items-center justify-between border-r-4",
                location.pathname === item.path
                  ? "bg-[#6366f1]/10 text-[#f8fafc] border-r-[#6366f1]"
                  : "hover:bg-[#6366f1]/5 text-[#94a3b8] border-r-transparent hover:text-[#f8fafc]"
              )}
            >
              {item.label}
            </Link>
          ))}
          <button
            onClick={() => setShowPremiumModal(true)}
            className="px-6 py-3 transition-colors font-medium flex items-center justify-between border-r-4 hover:bg-[#fbbf24]/10 text-[#fbbf24] border-r-transparent hover:border-r-[#fbbf24]"
          >
            Premium 👑
          </button>
          {user?.isAdmin && (
             <Link
             to="/settings"
             className={cn(
               "px-6 py-3 transition-colors font-medium flex items-center justify-between border-r-4",
               location.pathname === '/settings'
                 ? "bg-[#6366f1]/10 text-[#f8fafc] border-r-[#6366f1]"
                 : "hover:bg-[#6366f1]/5 text-[#94a3b8] border-r-transparent hover:text-[#f8fafc]"
             )}
           >
             <div className="flex items-center gap-2">
               <SettingsIcon size={18} />
               إعدادات النظام
             </div>
           </Link>
          )}
          {user && (
            <div className="mt-auto pt-4 border-t border-[#334155] p-3 mx-4 mb-4 rounded-xl bg-[#6366f1]/10 flex flex-col gap-1 items-center justify-center text-center">
              <div className="font-bold text-[#f8fafc] flex items-center gap-1 text-sm">
                مرحباً {user.username} {user.isPremium && <span title="حساب مدفوع" className="text-[#fbbf24]">👑</span>}
              </div>
            </div>
          )}
        </div>
      </div>

      <main className="flex-grow flex flex-col relative z-0 bg-[#0f172a]">
        {children}
      </main>

      <footer className="bg-[#1e293b] py-4 text-center text-xs text-[#94a3b8] mt-auto border-t border-[#334155]">
        مع تحيات المطور <span className="font-semibold text-[#6366f1]">Amir Lamay</span> © {new Date().getFullYear()} - جميع الحقوق محفوظة
      </footer>
    </div>
  );
};
