import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { Layout } from './components/Layout';
import { Login } from './components/Login';
import { CategoryView } from './components/CategoryView';
import { Settings } from './components/Settings';
import { Marquee } from './components/Marquee';
import { useStore } from './store';
import { db } from './firebase';
import { doc, onSnapshot, collection, query, where } from 'firebase/firestore';
import { Prompt, AppSettings } from './types';

import { Notifications } from './components/Notifications';

export default function App() {
  const { setSettings, settings } = useStore();
  const [prompts, setPrompts] = useState<Prompt[]>([]);

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
        loaded.push({ id: doc.id, ...doc.data() } as Prompt);
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
        <Marquee prompts={marqueePrompts} />
        <Routes>
          <Route path="/" element={<Navigate to="/category/1" replace />} />
          <Route path="/category/:categoryId" element={<CategoryView prompts={prompts} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/settings" element={<Settings prompts={prompts} />} />
          <Route path="/notifications" element={<Notifications />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
