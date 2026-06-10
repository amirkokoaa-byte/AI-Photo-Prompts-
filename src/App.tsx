import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { Layout } from './components/Layout';
import { Login } from './components/Login';
import { CategoryView } from './components/CategoryView';
import { Settings } from './components/Settings';
import { Marquee } from './components/Marquee';
import { PromptDetailsModal } from './components/PromptDetailsModal';
import { PaymentModal } from './components/PaymentModal';
import { useStore } from './store';
import { db } from './firebase';
import { doc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';
import { Prompt, AppSettings, CustomUser } from './types';

import { Notifications } from './components/Notifications';

export default function App() {
  const { setSettings, settings, setSelectedPromptForDetails, showPremiumModal, setShowPremiumModal, setUser } = useStore();
  const [prompts, setPrompts] = useState<Prompt[]>([]);

  // Restore session
  useEffect(() => {
    const autoLogin = async () => {
      const uname = localStorage.getItem('ai_user_uname');
      const upass = localStorage.getItem('ai_user_pass');
      
      if (uname === 'admin' && upass === 'admin') {
        setUser({ id: 'admin', username: 'admin', password: 'admin', isAdmin: true, isPremium: true, createdAt: Date.now() });
        return;
      }

      if (uname && upass) {
        try {
          const q = query(collection(db, 'custom_users'), where('username', '==', uname));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const userDoc = snap.docs[0];
            const data = userDoc.data();
            if (data.password === upass) {
              setUser({
                id: userDoc.id,
                username: data.username,
                password: data.password,
                isPremium: data.isPremium || false,
                isAdmin: data.isAdmin || false,
                createdAt: data.createdAt,
              });
            } else {
              // Pass changed
              localStorage.removeItem('ai_user_uname');
              localStorage.removeItem('ai_user_pass');
            }
          }
        } catch (e) {
          console.error(e);
        }
      }
    };
    autoLogin();
  }, [setUser]);

  // Load Settings Realtime
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'app_settings', 'global'), (docSn) => {
      if (docSn.exists()) {
        setSettings(docSn.data() as AppSettings);
      }
    });
    return () => unsub();
  }, [setSettings]);

  // Load Prompts Realtime
  useEffect(() => {
    const q = query(collection(db, 'prompts'));
    const unsub = onSnapshot(q, (snapshot) => {
      const loaded: Prompt[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        let imageUrls = data.imageUrls || [];
        if (data.imageUrl && imageUrls.length === 0) {
          imageUrls = [data.imageUrl];
        }
        loaded.push({ id: doc.id, ...data, imageUrls } as Prompt);
      });
      // Sort by createdAt descending
      loaded.sort((a, b) => b.createdAt - a.createdAt);
      setPrompts(loaded);
    });
    return () => unsub();
  }, []);

  const marqueePrompts = prompts.filter(p => p.isMarquee);

  return (
    <BrowserRouter>
      <Layout>
        <PromptDetailsModal />
        {showPremiumModal && <PaymentModal onClose={() => setShowPremiumModal(false)} />}
        <Marquee prompts={marqueePrompts} onPromptClick={(p) => setSelectedPromptForDetails(p)} />
        <Routes>
          <Route path="/" element={<CategoryView prompts={prompts} />} />
          <Route path="/category/:categoryId" element={<CategoryView prompts={prompts} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/settings" element={<Settings prompts={prompts} />} />
          <Route path="/notifications" element={<Notifications />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
