import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { Notification } from '../types';
import { useStore } from '../store';
import { useNavigate } from 'react-router';
import { BellRing } from 'lucide-react';

export const Notifications = () => {
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const { user } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/');
      return;
    }
    const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'), limit(50));
    const unsub = onSnapshot(q, (snap) => {
      setNotifs(snap.docs.map(d => ({ id: d.id, ...d.data() } as Notification)));
    });
    return () => unsub();
  }, [user, navigate]);

  if (!user?.isAdmin) return null;

  return (
    <div className="p-4 max-w-3xl mx-auto w-full">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <BellRing className="text-indigo-600" />
        الاشعارات
      </h2>
      <div className="flex flex-col gap-3">
        {notifs.length === 0 ? (
           <p className="text-slate-500 text-center py-12 bg-white dark:bg-slate-800 rounded-xl shadow-sm">لا توجد إشعارات حتى الآن.</p>
        ) : (
          notifs.map(n => (
            <div key={n.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="font-semibold text-slate-800 dark:text-slate-200">
                المستخدم: <span className="text-indigo-600 dark:text-indigo-400">{n.username}</span>
              </div>
              <div className="text-sm mt-1 mb-2 text-slate-600 dark:text-slate-400">{n.action}</div>
              <div className="text-xs text-slate-400" dir="ltr">{new Date(n.createdAt).toLocaleString('ar-EG')}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
