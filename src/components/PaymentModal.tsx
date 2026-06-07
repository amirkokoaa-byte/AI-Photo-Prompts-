import React, { useState } from 'react';
import { useStore } from '../store';
import { X, Send } from 'lucide-react';
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
    window.open(`https://wa.me/${settings.whatsappNumber}?text=${message}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full z-10 transition-colors">
          <X size={20} />
        </button>
        
        <div className="p-6 pt-10">
          <h2 className="text-2xl font-bold text-center mb-6">الحصول على Premium 👑</h2>
          
          {!user ? (
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">
              <h3 className="font-semibold mb-4 text-center">يجب التسجيل أولاً لإتمام الشراء</h3>
              {error && <div className="text-red-600 text-sm mb-3 bg-red-100 p-2 rounded">{error}</div>}
              <form onSubmit={handleAuth} className="flex flex-col gap-3">
                <input required type="text" placeholder="اسم المستخدم" value={username} onChange={e=>setUsername(e.target.value)} className="px-3 py-2 border rounded-lg dark:bg-slate-900 border-slate-300 dark:border-slate-700" />
                <input required type="text" placeholder="كلمة المرور" value={password} onChange={e=>setPassword(e.target.value)} className="px-3 py-2 border rounded-lg dark:bg-slate-900 border-slate-300 dark:border-slate-700" />
                <button disabled={loading} type="submit" className="bg-indigo-600 text-white py-2 rounded-lg">{loading ? 'جاري...' : (isRegister ? 'تسجيل' : 'دخول')}</button>
              </form>
              <button type="button" onClick={()=>setIsRegister(!isRegister)} className="w-full text-sm text-indigo-600 mt-3 hover:underline">
                {isRegister ? 'لديك حساب؟ سجل الدخول' : 'حساب جديد؟ سجل الان'}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-xl text-center">
                <p className="mb-2 font-medium">أهلاً بك {user.username}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">للحصول على الصلاحيات الكاملة يرجى الدفع عبر الطرق الموضحة أدناه وإرسال الإثبات عبر الواتساب.</p>
              </div>

              <div className="flex flex-col gap-3">
                {settings.instapayLink && (
                  <a href={settings.instapayLink} onClick={() => {
                        addDoc(collection(db, 'notifications'), {
                          userId: user.id, username: user.username, action: 'ضغط على رابط انستا باي', createdAt: Date.now()
                        });
                      }} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 py-3 rounded-xl font-medium hover:bg-indigo-200 transition-colors">
                    رابط انستا باي (InstaPay)
                  </a>
                )}
                {settings.walletNumber && (
                   <div onClick={() => {
                        addDoc(collection(db, 'notifications'), {
                          userId: user.id, username: user.username, action: 'شاهد رقم المحفظة', createdAt: Date.now()
                        });
                      }} className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 py-3 px-4 rounded-xl font-medium cursor-pointer">
                     <span>رقم المحفظة:</span>
                     <span className="tracking-widest text-lg">{settings.walletNumber}</span>
                   </div>
                )}
              </div>

              <button onClick={handleWhatsApp} className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold flex flex-row items-center justify-center gap-2 transition-transform active:scale-95 shadow-md">
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
