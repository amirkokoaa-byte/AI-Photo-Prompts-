import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { db } from '../firebase';
import { doc, updateDoc, collection, addDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { CustomUser, Prompt, AppSettings } from '../types';
import { Plus, Trash, Crown, Play, Edit, UploadCloud } from 'lucide-react';
import { useNavigate } from 'react-router';

export const Settings = ({ prompts }: { prompts: Prompt[] }) => {
  const { user, settings } = useStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'app' | 'prompts' | 'users'>('app');
  
  // App Settings State
  const [appForm, setAppForm] = useState<AppSettings>(settings);

  // Prompts State
  const [selCategory, setSelCategory] = useState('1');
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [editPromptData, setEditPromptData] = useState<Partial<Prompt>>({});
  
  // Users State
  const [users, setUsers] = useState<CustomUser[]>([]);

  useEffect(() => {
    if (!user || (!user.isAdmin && !user.isPremium)) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (activeTab === 'users' && user?.isAdmin) {
      loadUsers();
    }
  }, [activeTab, user]);

  const loadUsers = async () => {
    const snaps = await getDocs(collection(db, 'custom_users'));
    setUsers(snaps.docs.map(d => ({id: d.id, ...d.data()} as CustomUser)));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (base64: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        callback(reader.result as string);
         // Clear input
         e.target.value = '';
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAppSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.isAdmin) return;
    try {
      await updateDoc(doc(db, 'app_settings', 'global'), { ...appForm });
      alert('تم حفظ الإعدادات');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handlePromptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editPromptData.id) {
        // Edit
        await updateDoc(doc(db, 'prompts', editPromptData.id), {
          ...editPromptData
        });
      } else {
        // Create
        await addDoc(collection(db, 'prompts'), {
          categoryId: selCategory,
          title: editPromptData.title || '',
          promptText: editPromptData.promptText || '',
          imageUrls: editPromptData.imageUrls || [],
          isPremium: editPromptData.isPremium || false,
          isMarquee: editPromptData.isMarquee || false,
          createdAt: Date.now()
        });
      }
      setShowPromptModal(false);
      setEditPromptData({});
    } catch (err: any) {
      alert('خطأ: ' + err.message);
    }
  };

  const deletePrompt = async (id: string) => {
    if(confirm('هل تريد حذف هذا البرومبت؟')) {
      await deleteDoc(doc(db, 'prompts', id));
    }
  };

  const toggleUserPremium = async (u: CustomUser) => {
    await updateDoc(doc(db, 'custom_users', u.id), {
      isPremium: !u.isPremium
    });
    loadUsers();
  };
  
  const changeUserPassword = async (u: CustomUser) => {
    const newPass = prompt(`أدخل كلمة المرور الجديدة للمستخدم ${u.username}`, u.password);
    if(newPass) {
      await updateDoc(doc(db, 'custom_users', u.id), { password: newPass });
      loadUsers();
    }
  };

  const deleteUser = async (u: CustomUser) => {
    if(confirm(`هل أنت متأكد من حذف ${u.username}؟`)) {
      await deleteDoc(doc(db, 'custom_users', u.id));
      loadUsers();
    }
  };

  if (!user || (!user.isAdmin)) return <div className="p-4 text-center">لا توجد صلاحيات</div>;

  return (
    <div className="p-4 max-w-5xl mx-auto w-full">
      <h1 className="text-2xl font-bold mb-6">إعدادات النظام</h1>
      
      <div className="flex gap-2 mb-6 border-b dark:border-slate-700 pb-2 overflow-x-auto">
        <button onClick={() => setActiveTab('app')} className={`px-4 py-2 font-medium ${activeTab === 'app' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500'}`}>إعدادات البرنامج</button>
        <button onClick={() => setActiveTab('prompts')} className={`px-4 py-2 font-medium ${activeTab === 'prompts' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500'}`}>البرومبتات</button>
        <button onClick={() => setActiveTab('users')} className={`px-4 py-2 font-medium ${activeTab === 'users' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500'}`}>الحسابات المسجلة</button>
      </div>

      {activeTab === 'app' && (
        <form onSubmit={handleAppSubmit} className="flex flex-col gap-4 bg-[#1e293b] p-6 rounded-xl shadow-sm border border-[#334155]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div><label className="text-sm font-medium text-[#94a3b8]">اسم البرنامج</label><input className="w-full border p-2 rounded bg-[#0f172a] border-[#334155] text-[#f8fafc]" value={appForm.appName} onChange={e=>setAppForm({...appForm, appName: e.target.value})} /></div>
             <div>
               <label className="text-sm font-medium text-[#94a3b8] flex justify-between items-center mb-1">
                 <span>صورة البانر بالأعلى (رابط)</span>
                 <label className="cursor-pointer flex items-center gap-1 text-xs text-[#6366f1] hover:text-[#818cf8] transition-colors">
                   <UploadCloud size={14} /> رفع من الجهاز
                   <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, (b64) => setAppForm({...appForm, bannerImageUrl: b64}))} />
                 </label>
               </label>
               <input className="w-full border p-2 rounded bg-[#0f172a] border-[#334155] text-[#f8fafc]" value={appForm.bannerImageUrl} onChange={e=>setAppForm({...appForm, bannerImageUrl: e.target.value})} />
             </div>
             
             <div><label className="text-sm font-medium text-[#94a3b8]">اسم القسم الأول</label><input className="w-full border p-2 rounded bg-[#0f172a] border-[#334155] text-[#f8fafc]" value={appForm.menuTitle1} onChange={e=>setAppForm({...appForm, menuTitle1: e.target.value})} /></div>
             <div><label className="text-sm font-medium text-[#94a3b8]">اسم القسم الثاني</label><input className="w-full border p-2 rounded bg-[#0f172a] border-[#334155] text-[#f8fafc]" value={appForm.menuTitle2} onChange={e=>setAppForm({...appForm, menuTitle2: e.target.value})} /></div>
             <div><label className="text-sm font-medium text-[#94a3b8]">اسم القسم الثالث</label><input className="w-full border p-2 rounded bg-[#0f172a] border-[#334155] text-[#f8fafc]" value={appForm.menuTitle3} onChange={e=>setAppForm({...appForm, menuTitle3: e.target.value})} /></div>
             <div><label className="text-sm font-medium text-[#94a3b8]">اسم القسم الرابع</label><input className="w-full border p-2 rounded bg-[#0f172a] border-[#334155] text-[#f8fafc]" value={appForm.menuTitle4} onChange={e=>setAppForm({...appForm, menuTitle4: e.target.value})} /></div>
             
             <div><label className="text-sm font-medium text-[#94a3b8]">رابط انستا باي</label><input dir="ltr" className="w-full border p-2 rounded bg-[#0f172a] border-[#334155] text-[#f8fafc]" value={appForm.instapayLink} onChange={e=>setAppForm({...appForm, instapayLink: e.target.value})} /></div>
             <div><label className="text-sm font-medium text-[#94a3b8]">رقم المحفظة</label><input dir="ltr" className="w-full border p-2 rounded bg-[#0f172a] border-[#334155] text-[#f8fafc]" value={appForm.walletNumber} onChange={e=>setAppForm({...appForm, walletNumber: e.target.value})} /></div>
             <div className="md:col-span-2"><label className="text-sm font-medium text-[#94a3b8]">رقم الواتساب لاستقبال المدفوعات (بصيغة دولية)</label><input dir="ltr" className="w-full border p-2 rounded bg-[#0f172a] border-[#334155] text-[#f8fafc]" value={appForm.whatsappNumber} onChange={e=>setAppForm({...appForm, whatsappNumber: e.target.value})} /></div>
          </div>
          <button type="submit" className="bg-[#6366f1] hover:bg-[#6366f1]/90 text-white rounded-lg py-2 mt-4 font-medium transition-colors">حفظ الإعدادات</button>
        </form>
      )}

      {activeTab === 'prompts' && (
        <div className="flex flex-col gap-4">
          <div className="flex gap-4 items-end bg-[#1e293b] p-4 rounded-xl shadow-sm border border-[#334155]">
             <div className="flex-grow">
               <label className="text-sm font-medium mb-1 block text-[#94a3b8]">اختر القسم المستهدف</label>
               <select className="w-full border p-2 rounded bg-[#0f172a] border-[#334155] text-[#f8fafc]" value={selCategory} onChange={e=>setSelCategory(e.target.value)}>
                 <option value="1">{settings.menuTitle1}</option>
                 <option value="2">{settings.menuTitle2}</option>
                 <option value="3">{settings.menuTitle3}</option>
                 <option value="4">{settings.menuTitle4}</option>
               </select>
             </div>
             <button onClick={() => { setEditPromptData({}); setShowPromptModal(true); }} className="bg-[#6366f1] hover:bg-[#6366f1]/90 text-white px-4 py-2 rounded-lg flex gap-2 items-center transition-colors">
               <Plus size={18} /> برومبت جديد
             </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prompts.filter(p=>p.categoryId === selCategory).map(p => (
              <div key={p.id} className="bg-[#1e293b] p-4 rounded-xl border border-[#334155] shadow-sm flex items-center gap-4">
                 {p.imageUrls && p.imageUrls[0] && <div className="w-16 h-16 bg-[#0f172a] rounded-lg overflow-hidden border border-[#334155] flex-shrink-0"><img src={p.imageUrls[0]} alt="" className="w-full h-full object-contain" crossOrigin="anonymous"/></div>}
                 <div className="flex-grow min-w-0">
                    <h3 className="font-semibold text-[#f8fafc] truncate">{p.title}</h3>
                    <div className="flex gap-2 mt-1">
                      {p.isPremium && <span className="bg-[#fbbf24]/20 text-[#fbbf24] border border-[#fbbf24]/30 text-xs px-2 py-0.5 rounded flex items-center"><Crown size={12} className="mr-1"/>مدفوع</span>}
                      {p.isMarquee && <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs px-2 py-0.5 rounded flex items-center"><Play size={12} className="mr-1"/>متحرك</span>}
                    </div>
                 </div>
                 <div className="flex gap-2">
                   <button onClick={()=>{setEditPromptData(p); setShowPromptModal(true);}} className="text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 p-2 rounded transition-colors"><Edit size={18} /></button>
                   <button onClick={()=>deletePrompt(p.id)} className="text-red-400 bg-red-500/10 hover:bg-red-500/20 p-2 rounded transition-colors"><Trash size={18} /></button>
                 </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-[#1e293b] rounded-xl overflow-hidden shadow-sm border border-[#334155]">
          <table className="w-full text-right text-sm">
             <thead className="bg-[#0f172a] border-b border-[#334155] text-[#94a3b8]">
               <tr>
                 <th className="p-4 font-medium">اسم المستخدم</th>
                 <th className="p-4 font-medium">كلمة المرور</th>
                 <th className="p-4 font-medium">الصلاحية</th>
                 <th className="p-4 font-medium">إجراءات</th>
               </tr>
             </thead>
             <tbody>
               {users.map(u => (
                 <tr key={u.id} className="border-b border-[#334155] last:border-0">
                   <td className="p-4 font-semibold text-[#f8fafc]">{u.username}</td>
                   <td className="p-4 bg-[#0f172a] rounded select-all font-mono text-[#94a3b8] m-2" dir="ltr">{u.password}</td>
                   <td className="p-4">
                     <button onClick={()=>toggleUserPremium(u)} className={`px-2 py-1 rounded text-xs flex gap-1 items-center font-bold ${u.isPremium ? 'bg-[#fbbf24] text-black' : 'bg-[#334155] text-[#94a3b8]'}`}>
                       {u.isPremium ? 'Premium' : 'مجاني'}
                     </button>
                   </td>
                   <td className="p-4 flex gap-2">
                     <button onClick={()=>changeUserPassword(u)} className="text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 px-2 py-1 rounded text-xs flex gap-1 transition-colors"><Edit size={14} /> تعديل كلمة السر</button>
                     <button onClick={()=>deleteUser(u)} className="text-red-400 bg-red-500/10 hover:bg-red-500/20 px-2 py-1 rounded text-xs flex gap-1 transition-colors"><Trash size={14} /> حذف</button>
                   </td>
                 </tr>
               ))}
             </tbody>
          </table>
        </div>
      )}

      {/* Prompt Modal */}
      {showPromptModal && (
        <div className="fixed inset-0 bg-[#0f172a]/80 backdrop-blur-sm flex items-center justify-center p-4 z-[70] overflow-y-auto">
           <div className="bg-[#1e293b] rounded-xl max-w-lg w-full p-6 shadow-2xl relative border border-[#334155] m-auto">
              <h2 className="text-xl font-bold mb-4 text-[#f8fafc]">{editPromptData.id ? 'تعديل البرومبت' : 'إضافة برومبت'}</h2>
              <form onSubmit={handlePromptSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block text-[#94a3b8]">العنوان</label>
                  <input required className="w-full border p-2 rounded bg-[#0f172a] border-[#334155] text-[#f8fafc]" value={editPromptData.title || ''} onChange={e=>setEditPromptData({...editPromptData, title: e.target.value})} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block text-[#94a3b8]">كلمات البرومبت (الانجليزية عادة)</label>
                  <textarea required dir="ltr" rows={4} className="w-full border p-2 rounded bg-[#0f172a] border-[#334155] font-mono text-sm text-[#f8fafc]" value={editPromptData.promptText || ''} onChange={e=>setEditPromptData({...editPromptData, promptText: e.target.value})} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 flex justify-between items-center text-[#94a3b8]">
                    <span>روابط الصور (رابط واحد في كل سطر)</span>
                    <label className="cursor-pointer flex items-center gap-1 text-xs text-[#6366f1] hover:text-[#818cf8] transition-colors">
                       <UploadCloud size={14} /> إضافة صورة من الجهاز
                       <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, (b64) => {
                           const currentUrls = editPromptData.imageUrls || [];
                           setEditPromptData({...editPromptData, imageUrls: [...currentUrls, b64]});
                       })} />
                    </label>
                  </label>
                  <textarea dir="ltr" rows={3} placeholder="https://..." className="w-full border p-2 rounded bg-[#0f172a] border-[#334155] font-mono text-xs text-[#f8fafc]" 
                    value={editPromptData.imageUrls?.join('\n') || ''} 
                    onChange={e=>setEditPromptData({...editPromptData, imageUrls: e.target.value.split('\n').filter(l=>l.trim())})} 
                  />
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border p-3 rounded-lg border-[#334155] bg-[#0f172a]">
                  <label className="flex items-center gap-2 cursor-pointer relative">
                    <input type="checkbox" className="w-4 h-4 accent-[#fbbf24]" checked={editPromptData.isPremium || false} onChange={e=>setEditPromptData({...editPromptData, isPremium: e.target.checked})} />
                    <span className="font-medium text-[#fbbf24] flex items-center gap-1">برومبت مدفوع <Crown size={14} /></span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 accent-blue-500" checked={editPromptData.isMarquee || false} onChange={e=>setEditPromptData({...editPromptData, isMarquee: e.target.checked})} />
                    <span className="font-medium text-blue-400 flex items-center gap-1">شريط متحرك <Play size={14}/></span>
                  </label>
                </div>
                <div className="flex gap-2 justify-end mt-4">
                  <button type="button" onClick={()=>setShowPromptModal(false)} className="px-4 py-2 rounded bg-[#334155] hover:bg-[#334155]/80 text-[#f8fafc] transition-colors">إلغاء</button>
                  <button type="submit" className="px-4 py-2 rounded bg-[#6366f1] hover:bg-[#6366f1]/90 text-white font-medium transition-colors">حفظ</button>
                </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};
