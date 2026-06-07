import React, { useState } from 'react';
import { useStore } from '../store';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router';
import { CustomUser } from '../types';

export const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setUser } = useStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (username.trim() === 'admin' && password === 'admin') {
      const adminUser: CustomUser = {
        id: 'admin',
        username: 'admin',
        password: 'admin', // Storing locally in memory
        isAdmin: true,
        isPremium: true,
        createdAt: Date.now()
      };
      setUser(adminUser);
      if (rememberMe) {
        localStorage.setItem('ai_user_uname', 'admin');
        localStorage.setItem('ai_user_pass', 'admin');
      } else {
        localStorage.removeItem('ai_user_uname');
        localStorage.removeItem('ai_user_pass');
      }
      navigate('/');
      return;
    }

    try {
      const usersRef = collection(db, 'custom_users');
      const q = query(usersRef, where('username', '==', username));
      const querySnapshot = await getDocs(q);

      if (isRegister) {
        if (!querySnapshot.empty) {
          setError('اسم المستخدم موجود بالفعل. الرجاء اختيار اسم اخر.');
        } else {
          // Register
          const docRef = await addDoc(usersRef, {
            username,
            password,
            isPremium: false,
            isAdmin: false,
            createdAt: Date.now()
          });
          const newUser: CustomUser = {
            id: docRef.id,
            username,
            password,
            isPremium: false,
            isAdmin: false,
            createdAt: Date.now()
          };
          setUser(newUser);
          navigate('/');
        }
      } else {
        // Login
        if (querySnapshot.empty) {
          setError('لم يتم العثور على حساب بهذا الاسم.');
        } else {
          const userDoc = querySnapshot.docs[0];
          const userData = userDoc.data();
          if (userData.password !== password) {
            setError('كلمة المرور غير صحيحة.');
          } else {
            const loggedInUser: CustomUser = {
              id: userDoc.id,
              username: userData.username,
              password: userData.password,
              isPremium: userData.isPremium || false,
              isAdmin: userData.isAdmin || false,
              createdAt: userData.createdAt,
            };
            setUser(loggedInUser);
            if (rememberMe) {
              localStorage.setItem('ai_user_uname', userData.username);
              localStorage.setItem('ai_user_pass', userData.password);
            } else {
              localStorage.removeItem('ai_user_uname');
              localStorage.removeItem('ai_user_pass');
            }
            // "يظهر عند تسجيل الدخول شاشه اشعار صغير يختفي بعد 2 ثانيه انتا الان premium"
            if (loggedInUser.isPremium) {
              alert('أنت الآن Premium'); // Simple alert or custom toast
            }
            navigate('/');
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'حدث خطأ. يرجى المحاولة مرة اخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center p-4 bg-[#0f172a]">
      <div className="bg-[#1e293b] p-8 rounded-xl shadow-xl w-full max-w-md border border-[#334155]">
        <h2 className="text-2xl font-bold mb-6 text-center text-[#f8fafc]">{isRegister ? 'تسجيل حساب جديد' : 'تسجيل الدخول'}</h2>
        {error && <div className="bg-red-500/10 text-red-400 p-3 rounded mb-4 text-sm border border-red-500/20">{error}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-[#94a3b8]">اسم المستخدم</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-2 border border-[#334155] rounded-lg focus:ring-2 focus:ring-[#6366f1] bg-[#0f172a] text-[#f8fafc] outline-none transition-shadow"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-[#94a3b8]">كلمة المرور</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-[#334155] rounded-lg focus:ring-2 focus:ring-[#6366f1] bg-[#0f172a] text-[#f8fafc] outline-none transition-shadow"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-[#334155] bg-[#0f172a] text-[#6366f1] accent-[#6366f1]"
            />
            <label htmlFor="remember" className="text-sm text-[#94a3b8] cursor-pointer">
              حفظ بيانات الدخول
            </label>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#6366f1] hover:bg-[#6366f1]/90 text-white font-medium py-2.5 rounded-lg transition-colors mt-2"
          >
            {loading ? 'الرجاء الانتظار...' : (isRegister ? 'تسجيل' : 'دخول')}
          </button>
        </form>
        <div className="mt-4 text-center">
          <button 
            type="button" 
            onClick={() => setIsRegister(!isRegister)}
            className="text-sm text-[#94a3b8] hover:text-[#f8fafc] transition-colors"
          >
            {isRegister ? 'لديك حساب بالفعل؟ تسجيل الدخول' : 'ليس لديك حساب؟ سجل الان'}
          </button>
        </div>
      </div>
    </div>
  );
};
