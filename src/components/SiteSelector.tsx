import React, { useState, useEffect } from 'react';
import { db, auth, handleFirestoreError, OperationType } from '../firebase.ts';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { Site } from '../types.ts';
import { Plus, Check, ChevronDown } from 'lucide-react';

interface Props {
  selectedSite: Site | null;
  onSelect: (site: Site) => void;
}

export function SiteSelector({ selectedSite, onSelect }: Props) {
  const [sites, setSites] = useState<Site[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newSiteName, setNewSiteName] = useState('');

  useEffect(() => {
    if (!auth.currentUser) return;
    const path = 'sites';
    const q = query(collection(db, path), where('ownerId', '==', auth.currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const siteData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Site));
      setSites(siteData);
      if (siteData.length > 0 && !selectedSite) {
        onSelect(siteData[0]);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
    return () => unsubscribe();
  }, [auth.currentUser]);

  const handleAddSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSiteName.trim() || !auth.currentUser) return;
    const path = 'sites';
    try {
      await addDoc(collection(db, path), {
        name: newSiteName,
        location: '',
        createdAt: new Date().toISOString(),
        ownerId: auth.currentUser.uid
      });
      setNewSiteName('');
      setIsAdding(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-800 text-white px-4 py-3 rounded-xl flex items-center justify-between hover:bg-slate-700 transition-all font-bold"
      >
        <span className="truncate">{selectedSite ? selectedSite.name : 'Select Site...'}</span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 rounded-xl shadow-2xl z-50 border border-slate-700 overflow-hidden">
          <div className="max-h-60 overflow-y-auto p-2 space-y-1">
            {sites.map(site => (
              <button
                key={site.id}
                onClick={() => {
                  onSelect(site);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                  selectedSite?.id === site.id ? 'bg-orange-500 text-white' : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                {site.name}
                {selectedSite?.id === site.id && <Check size={14} />}
              </button>
            ))}
          </div>
          
          <div className="p-2 border-t border-slate-700">
            {isAdding ? (
              <form onSubmit={handleAddSite} className="space-y-2">
                <input
                  autoFocus
                  type="text"
                  value={newSiteName}
                  onChange={(e) => setNewSiteName(e.target.value)}
                  placeholder="Site Name"
                  className="w-full bg-slate-900 text-white px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-500"
                />
                <div className="flex gap-2 text-xs font-bold">
                  <button type="submit" className="flex-1 bg-orange-500 py-2 rounded-lg text-white uppercase tracking-wider">Add</button>
                  <button type="button" onClick={() => setIsAdding(false)} className="flex-1 bg-slate-700 py-2 rounded-lg text-slate-400 uppercase tracking-wider">Cancel</button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setIsAdding(true)}
                className="w-full flex items-center justify-center gap-2 py-2 text-slate-400 hover:text-white transition-all text-xs font-bold uppercase tracking-widest"
              >
                <Plus size={14} />
                New Site
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
