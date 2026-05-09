import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase.ts';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { StandardRate } from '../types.ts';
import { Settings, Plus, Save, Trash2, IndianRupee } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function RatesManager() {
  const [rates, setRates] = useState<StandardRate[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form states
  const [material, setMaterial] = useState('Cement');
  const [price, setPrice] = useState(0);
  const [unit, setUnit] = useState('Bag');

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(collection(db, 'rates'), where('ownerId', '==', auth.currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRates(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StandardRate)));
    });
    return () => unsubscribe();
  }, [auth.currentUser]);

  const handleAddRate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    await addDoc(collection(db, 'rates'), {
      material,
      price,
      unit,
      ownerId: auth.currentUser.uid
    });
    setIsAdding(false);
    setPrice(0);
  };

  const handleUpdatePrice = async (id: string, newPrice: number) => {
    await updateDoc(doc(db, 'rates', id), { price: newPrice });
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'rates', id));
  };

  const defaultMaterials = ["Cement", "Bricks", "Sand", "Steel", "Aggregates"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            STANDARD RATES
          </h3>
          <p className="text-slate-500 text-sm">Update local material prices for accurate estimates</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-orange-500 text-white px-6 py-3 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-orange-600 transition-all shadow-lg uppercase tracking-widest text-xs"
        >
          <Plus size={18} /> New Rate
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white p-6 rounded-3xl border-2 border-orange-500 shadow-xl"
            >
              <form onSubmit={handleAddRate} className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Material</label>
                    <select 
                      value={material}
                      onChange={(e) => setMaterial(e.target.value)}
                      className="w-full bg-slate-50 border p-3 rounded-xl font-bold outline-none"
                    >
                      {defaultMaterials.map(m => <option key={m} value={m}>{m}</option>)}
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Price (₹)</label>
                    <input 
                      type="number" 
                      value={price}
                      onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-50 border p-3 rounded-xl font-bold outline-none text-2xl"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Unit (e.g., Bag, 1000 Pcs, m³)</label>
                    <input 
                      type="text" 
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full bg-slate-50 border p-3 rounded-xl font-bold outline-none"
                    />
                  </div>
                </div>
                <div className="flex gap-2 font-black uppercase tracking-widest text-xs">
                  <button type="submit" className="flex-1 bg-slate-900 text-white py-3 rounded-xl">Save Rate</button>
                  <button type="button" onClick={() => setIsAdding(false)} className="flex-1 bg-slate-100 text-slate-500 py-3 rounded-xl">Cancel</button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {rates.map((rate) => (
          <motion.div
            key={rate.id}
            layout
            className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col justify-between"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{rate.unit}</p>
                <h4 className="text-xl font-black text-slate-900 tracking-tight">{rate.material}</h4>
              </div>
              <button 
                onClick={() => handleDelete(rate.id)}
                className="text-slate-200 hover:text-red-500 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
            
            <div className="flex items-end justify-between gap-4">
              <div className="flex-1">
                <input 
                  type="number" 
                  defaultValue={rate.price}
                  onBlur={(e) => handleUpdatePrice(rate.id, parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 p-3 rounded-xl font-black text-2xl text-slate-900 outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="bg-slate-100 p-4 rounded-xl text-slate-500">
                 <IndianRupee size={20} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
