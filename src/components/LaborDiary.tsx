import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase.ts';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { Site, Laborer, DailyLog } from '../types.ts';
import { Plus, UserPlus, Wallet, Calendar, CheckCircle2, XCircle, Trash2, IndianRupee, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  selectedSite: Site | null;
  onPromptSelection?: () => void;
}

export function LaborDiary({ selectedSite, onPromptSelection }: Props) {
  const [laborers, setLaborers] = useState<Laborer[]>([]);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [isAddingLaborer, setIsAddingLaborer] = useState(false);
  const [isAddingLog, setIsAddingLog] = useState<{ laborerId: string } | null>(null);

  // Form states
  const [newName, setNewName] = useState('');
  const [newWage, setNewWage] = useState(500);
  const [advanceAmount, setAdvanceAmount] = useState(0);
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (!selectedSite || !auth.currentUser) return;

    const qLaborers = query(
      collection(db, 'sites', selectedSite.id, 'laborers'),
      where('ownerId', '==', auth.currentUser.uid)
    );
    const qLogs = query(
      collection(db, 'sites', selectedSite.id, 'logs'),
      where('ownerId', '==', auth.currentUser.uid)
    );

    const unsubLaborers = onSnapshot(qLaborers, (snapshot) => {
      setLaborers(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Laborer)));
    });

    const unsubLogs = onSnapshot(qLogs, (snapshot) => {
      setLogs(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as DailyLog)));
    });

    return () => {
      unsubLaborers();
      unsubLogs();
    };
  }, [selectedSite, auth.currentUser]);

  const handleAddLaborer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSite || !auth.currentUser) return;
    await addDoc(collection(db, 'sites', selectedSite.id, 'laborers'), {
      name: newName,
      siteId: selectedSite.id,
      dailyWage: newWage,
      totalAdvances: 0,
      totalEarnings: 0,
      ownerId: auth.currentUser.uid
    });
    setNewName('');
    setIsAddingLaborer(false);
  };

  const handleAddLog = async (laborerId: string, present: boolean) => {
    if (!selectedSite || !auth.currentUser) return;
    const laborer = laborers.find(l => l.id === laborerId);
    if (!laborer) return;

    await addDoc(collection(db, 'sites', selectedSite.id, 'logs'), {
      laborerId,
      siteId: selectedSite.id,
      date: logDate,
      present,
      advanceAmount: present ? advanceAmount : 0, // Only record advance if needed or zero
      ownerId: auth.currentUser.uid
    });

    // Update laborer totals (In a real app, use a Cloud Function or transaction)
    const newEarnings = present ? laborer.totalEarnings + laborer.dailyWage : laborer.totalEarnings;
    const newAdvances = laborer.totalAdvances + advanceAmount;
    
    await updateDoc(doc(db, 'sites', selectedSite.id, 'laborers', laborerId), {
      totalEarnings: newEarnings,
      totalAdvances: newAdvances
    });

    setIsAddingLog(null);
    setAdvanceAmount(0);
  };

  const calculateBalance = (laborer: Laborer) => {
    return laborer.totalEarnings - laborer.totalAdvances;
  };

  if (!selectedSite) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
        <Users size={48} className="text-slate-300 mb-4" />
        <p className="text-slate-500 font-bold mb-4">Select a site to manage your team</p>
        <button
          onClick={onPromptSelection}
          className="bg-orange-500 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-orange-500/20 active:scale-95 transition-all text-xs uppercase tracking-widest"
        >
          SELECT OR CREATE SITE
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            TEAM DIARY 
            <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-xs font-black">{laborers.length} WORKERS</span>
          </h3>
          <p className="text-slate-500 text-sm">Attendance and wage tracking for {selectedSite.name}</p>
        </div>
        <button
          onClick={() => setIsAddingLaborer(true)}
          className="bg-orange-500 text-white px-6 py-3 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 uppercase tracking-widest text-xs"
        >
          <UserPlus size={18} /> Add Worker
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {isAddingLaborer && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white p-6 rounded-3xl border-2 border-orange-500 shadow-xl"
            >
              <form onSubmit={handleAddLaborer} className="space-y-4">
                <h4 className="font-black text-slate-900 flex items-center gap-2 uppercase tracking-wide text-sm">
                  New Worker Details
                </h4>
                <div className="space-y-3">
                  <input
                    autoFocus
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Worker Name"
                    className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl font-bold outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Daily Wage (₹)</label>
                    <input
                      type="number"
                      value={newWage}
                      onChange={(e) => setNewWage(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl font-bold outline-none focus:ring-2 focus:ring-orange-500 text-2xl"
                      step={50}
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-2 font-black uppercase tracking-widest text-xs">
                  <button type="submit" className="flex-1 bg-slate-900 text-white py-3 rounded-xl">Save</button>
                  <button type="button" onClick={() => setIsAddingLaborer(false)} className="flex-1 bg-slate-100 text-slate-500 py-3 rounded-xl">Cancel</button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {laborers.map((laborer) => {
          const balance = calculateBalance(laborer);
          const isLogging = isAddingLog?.laborerId === laborer.id;

          return (
            <motion.div
              key={laborer.id}
              layout
              className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col group overflow-hidden relative"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h4 className="text-xl font-black text-slate-900 tracking-tight">{laborer.name}</h4>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">₹{laborer.dailyWage} / DAY</p>
                </div>
                <div className={`p-3 rounded-2xl ${balance > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                  <Wallet size={20} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 bg-slate-50 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Earned</p>
                  <p className="text-lg font-black text-slate-800">₹{laborer.totalEarnings}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Advance</p>
                  <p className="text-lg font-black text-slate-800">₹{laborer.totalAdvances}</p>
                </div>
              </div>

              <div className="flex-1">
                <div className="bg-slate-900 text-white p-4 rounded-2xl mb-6">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Balance Due</p>
                  <p className="text-2xl font-black">₹{balance}</p>
                </div>
              </div>

              <div className="space-y-3">
                {isLogging ? (
                  <div className="bg-orange-50 p-4 rounded-2xl space-y-3 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-orange-800 uppercase tracking-wider">Attendance Log</span>
                      <button onClick={() => setIsAddingLog(null)} className="text-orange-300 hover:text-orange-800"><XCircle size={16} /></button>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Advance Taken Today?</label>
                      <input 
                        type="number" 
                        value={advanceAmount}
                        onChange={(e) => setAdvanceAmount(parseInt(e.target.value) || 0)}
                        placeholder="₹ Amount"
                        className="w-full bg-white border border-orange-200 p-2 rounded-lg font-bold outline-none text-orange-950"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleAddLog(laborer.id, true)}
                        className="flex-1 bg-orange-500 text-white py-2 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-md shadow-orange-500/20"
                      >Present</button>
                      <button 
                        onClick={() => handleAddLog(laborer.id, false)}
                        className="flex-1 bg-white border border-orange-200 text-orange-500 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest"
                      >Absent</button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAddingLog({ laborerId: laborer.id })}
                    className="w-full py-4 bg-slate-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                  >
                    <Calendar size={14} /> Record Entry
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
