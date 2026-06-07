import React, { useEffect, useRef } from 'react';
import { useStore } from '../store';
import { Menu, X, Sun, Moon, Settings as SettingsIcon, LogOut, DollarSign, Phone, Bell } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, settings, darkMode, toggleDarkMode, sidebarOpen, setSidebarOpen, setUser } = useStore();
  const location = useLocation();
  const sidebarRef = useRef<HTMLDivElement>(null);

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
            <a href={settings.instapayLink} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-[#f8fafc] focus:outline-none transition-colors">
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
      <header className="bg-[#0f172a] shadow-sm sticky top-0 z-40">
        {settings.bannerImageUrl && (
          <div className="w-full h-32 md:h-48 overflow-hidden object-cover relative">
            <img src={settings.bannerImageUrl} alt="Banner" className="w-full h-full object-cover" crossOrigin="anonymous" />
            <div className="absolute inset-0 bg-black/20"></div>
          </div>
        )}
        <div className="p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between bg-[#1e293b] p-3 rounded-xl border border-[#334155]">
            <div className="flex items-center gap-3">
              <button onClick={(e) => { e.stopPropagation(); setSidebarOpen(!sidebarOpen); }} className="p-2 hover:bg-[#334155] rounded-lg text-[#94a3b8]">
                <Menu size={24} />
              </button>
              <Link to="/" className="text-xl font-bold text-[#f8fafc] ml-2">
                {settings.appName}
              </Link>
            </div>
            <div className="flex items-center gap-2">
              {(user?.isAdmin) && (
                <Link to="/notifications" className="p-2 relative hover:bg-[#334155] rounded-lg text-[#94a3b8] transition-colors">
                  <Bell size={24} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </Link>
              )}
              {(user?.isAdmin || user?.isPremium) && (
                <Link to="/settings" className="p-2 hover:bg-[#334155] rounded-lg text-[#94a3b8] transition-colors">
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
          {user?.isAdmin && (
             <Link
             to="/settings"
             className={cn(
               "px-6 py-3 transition-colors font-medium flex items-center justify-between mt-auto border-r-4",
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
