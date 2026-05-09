/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { auth, signInWithGoogle } from './firebase.ts';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { Calculator, Users, Camera, Settings, LogOut, Construction, Plus, ChevronRight, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MaterialCalculator } from './components/MaterialCalculator.tsx';
import { LaborDiary } from './components/LaborDiary.tsx';
import { SitePhotos } from './components/SitePhotos.tsx';
import { RatesManager } from './components/RatesManager.tsx';
import { SiteSelector } from './components/SiteSelector.tsx';
import { Site } from './types.ts';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'calc' | 'team' | 'photos' | 'rates'>('calc');
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const openSidebar = () => setIsSidebarOpen(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-orange-500"
        >
          <Construction size={48} />
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <div className="bg-orange-500 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/20">
            <Construction size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">NAMMA MISTRI</h1>
          <p className="text-slate-400 mb-10 text-lg">Your Rugged Construction Assistant</p>
          
          <button
            id="login-btn"
            onClick={signInWithGoogle}
            className="w-full py-4 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-3 hover:bg-slate-100 transition-all active:scale-95 shadow-xl"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            SIGN IN WITH GOOGLE
          </button>
        </motion.div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'calc': return <MaterialCalculator selectedSite={selectedSite} onPromptSelection={openSidebar} />;
      case 'team': return <LaborDiary selectedSite={selectedSite} onPromptSelection={openSidebar} />;
      case 'photos': return <SitePhotos selectedSite={selectedSite} onPromptSelection={openSidebar} />;
      case 'rates': return <RatesManager />;
    }
  };

  const tabs = [
    { id: 'calc', label: 'Calculator', icon: Calculator },
    { id: 'team', label: 'Labor Diary', icon: Users },
    { id: 'photos', label: 'Photos', icon: Camera },
    { id: 'rates', label: 'Rates', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-slate-900 p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Construction className="text-orange-500" size={24} />
          <span className="text-white font-black tracking-tighter">NAMMA MISTRI</span>
        </div>
        <button onClick={() => setIsSidebarOpen(true)} className="text-white p-2">
          <Menu />
        </button>
      </div>

      {/* Sidebar (Desktop & Mobile Drawer) */}
      <AnimatePresence>
        {(isSidebarOpen || window.innerWidth >= 768) && (
          <motion.aside
            initial={{ x: -288 }}
            animate={{ x: 0 }}
            exit={{ x: -288 }}
            className={`fixed md:relative top-0 left-0 bottom-0 z-50 w-72 bg-slate-900 p-6 flex flex-col shadow-2xl transition-all ${isSidebarOpen ? 'block' : 'hidden md:flex'}`}
          >
            <div className="flex items-center justify-between mb-8 md:mb-12">
              <div className="flex items-center gap-3">
                <div className="bg-orange-500 p-2 rounded-lg">
                  <Construction className="text-white" size={20} />
                </div>
                <span className="text-white font-black tracking-tighter text-xl">NAMMA MISTRI</span>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400">
                <X />
              </button>
            </div>

            <div className="flex-1 space-y-2">
              <div className="mb-6">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Active Site</label>
                <SiteSelector selectedSite={selectedSite} onSelect={setSelectedSite} />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Menu</label>
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    id={`tab-${tab.id}`}
                    onClick={() => {
                      setActiveTab(tab.id as any);
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                      activeTab === tab.id 
                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <tab.icon size={20} />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800">
              <div className="flex items-center gap-3 mb-4">
                <img src={user.photoURL || ''} alt="" className="w-10 h-10 rounded-full border-2 border-slate-700" />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold truncate text-sm">{user.displayName}</p>
                  <p className="text-slate-500 text-xs truncate">Mistri</p>
                </div>
              </div>
              <button 
                onClick={() => signOut(auth)}
                className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 font-bold transition-all"
              >
                <LogOut size={20} />
                Sign Out
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="hidden md:flex bg-white border-b border-slate-200 p-6 items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {tabs.find(t => t.id === activeTab)?.label}
            </h2>
            <p className="text-slate-500 text-sm font-medium">
              {selectedSite ? `Managing: ${selectedSite.name}` : 'Select a site to start tracking'}
            </p>
          </div>
          <div className="flex items-center gap-4">
             {/* Header actions if any */}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + (selectedSite?.id || '')}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
