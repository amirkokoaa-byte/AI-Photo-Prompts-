import React, { useState } from 'react';
import { useStore } from '../store';
import { X, Send, Wallet, DollarSign } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { CustomUser } from '../types';

export const PaymentModal = ({ onClose }: { onClose: () => void }) => {
  const { user, setUser, settings } = useStore();
  const [isRegister, setIsRegister] = useState(!user);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const usersRef = collection(db, 'custom_users');
      const q = query(usersRef, where('username', '==', username));
      const querySnapshot = await getDocs(q);

      if (isRegister) {
        if (!querySnapshot.empty) {
          setError('اسم المستخدم موجود بالفعل.');
        } else {
          const docRef = await addDoc(usersRef, {
            username,
            password,
            isPremium: false,
            isAdmin: false,
            createdAt: Date.now()
          });
          setUser({ id: docRef.id, username, password, isPremium: false, isAdmin: false, createdAt: Date.now() });
        }
      } else {
        if (querySnapshot.empty) {
          setError('حساب غير موجود.');
        } else {
          const userDoc = querySnapshot.docs[0];
          const userData = userDoc.data();
          if (userData.password !== password) {
            setError('كلمة المرور غير صحيحة.');
          } else {
            setUser({ id: userDoc.id, ...userData } as CustomUser);
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsApp = () => {
    if (!settings.whatsappNumber) {
      alert('لم يتم تعيين رقم واتساب للدفع.');
      return;
    }
    const message = encodeURIComponent(`مرحباً، أود تفعيل حساب Premium. اسم المستخدم الخاص بي هو: ${user?.username}`);
    let number = settings.whatsappNumber;
    if (!number.startsWith('+') && !number.startsWith('00')) {
        number = '+' + number;
    }
    window.open(`https://wa.me/${number}?text=${message}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#1e293b] text-[#f8fafc] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative border border-[#334155]" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 p-1 bg-[#334155] hover:bg-[#475569] text-[#f8fafc] rounded-full z-10 transition-colors">
          <X size={20} />
        </button>
        
        <div className="p-6 pt-10">
          <h2 className="text-2xl font-bold text-center mb-6 text-[#fbbf24]">الحصول على Premium 👑</h2>
          
          {!user ? (
            <div className="bg-[#0f172a] border border-[#334155] p-4 rounded-xl">
              <h3 className="font-semibold mb-4 text-center text-[#f8fafc]">يجب التسجيل أولاً لإتمام الشراء</h3>
              {error && <div className="text-red-400 text-sm mb-3 bg-red-400/10 border border-red-400/20 p-2 rounded">{error}</div>}
              <form onSubmit={handleAuth} className="flex flex-col gap-3">
                <input required type="text" placeholder="اسم المستخدم" value={username} onChange={e=>setUsername(e.target.value)} className="px-3 py-2 border rounded-lg bg-[#1e293b] border-[#334155] text-[#f8fafc] placeholder-[#94a3b8]" />
                <input required type="text" placeholder="كلمة المرور" value={password} onChange={e=>setPassword(e.target.value)} className="px-3 py-2 border rounded-lg bg-[#1e293b] border-[#334155] text-[#f8fafc] placeholder-[#94a3b8]" />
                <button disabled={loading} type="submit" className="bg-[#6366f1] hover:bg-[#6366f1]/90 text-white font-bold py-2 rounded-lg transition-colors">{loading ? 'جاري...' : (isRegister ? 'تسجيل' : 'دخول')}</button>
              </form>
              <button type="button" onClick={()=>setIsRegister(!isRegister)} className="w-full text-sm text-[#818cf8] mt-3 hover:underline">
                {isRegister ? 'لديك حساب؟ سجل الدخول' : 'حساب جديد؟ سجل الان'}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="bg-[#0f172a] border border-[#334155] p-4 rounded-xl text-center">
                <p className="mb-2 font-medium text-[#f8fafc]">أهلاً بك <span className="text-[#6366f1]">{user.username}</span></p>
                <p className="text-sm text-[#94a3b8]">للحصول على الصلاحيات الكاملة يرجى الدفع عبر الطرق الموضحة أدناه وإرسال الإثبات عبر الواتساب.</p>
              </div>

              <div className="flex flex-col gap-3">
                {settings.instapayLink && (
                  <a href={settings.instapayLink} onClick={() => {
                        addDoc(collection(db, 'notifications'), {
                          userId: user.id, username: user.username, action: 'ضغط على رابط انستا باي', createdAt: Date.now()
                        });
                      }} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 bg-[#6366f1]/20 border border-[#6366f1]/30 text-[#818cf8] py-3 rounded-xl font-bold hover:bg-[#6366f1]/30 transition-colors shadow-sm">
                    <DollarSign size={20} />
                    شراء عبر انستا باي (InstaPay)
                  </a>
                )}
                {settings.walletNumber && (
                   <div onClick={() => {
                        addDoc(collection(db, 'notifications'), {
                          userId: user.id, username: user.username, action: 'نسخ رقم المحفظة', createdAt: Date.now()
                        });
                        navigator.clipboard.writeText(settings.walletNumber);
                        alert("تم نسخ رقم المحفظة: " + settings.walletNumber);
                      }} className="flex items-center justify-between bg-[#334155] border border-[#475569] hover:bg-[#475569] py-3 px-4 rounded-xl font-medium cursor-pointer transition-colors shadow-sm">
                     <span className="flex items-center gap-2 text-[#e2e8f0]"><Wallet size={20} className="text-[#fbbf24]" /> المحفظة:</span>
                     <span className="tracking-widest text-lg text-[#f8fafc] font-mono" dir="ltr">{settings.walletNumber}</span>
                   </div>
                )}
              </div>

              <button onClick={handleWhatsApp} className="mt-2 w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-3 rounded-xl font-bold flex flex-row items-center justify-center gap-2 transition-transform active:scale-95 shadow-md">
                <Send size={20} />
                أرسل اسكرين للمدفوعات
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

