import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase.ts';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { Site, ProgressPhoto } from '../types.ts';
import { Camera, Image as ImageIcon, Trash2, Plus, Calendar } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  selectedSite: Site | null;
  onPromptSelection?: () => void;
}

export function SitePhotos({ selectedSite, onPromptSelection }: Props) {
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [caption, setCaption] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (!selectedSite || !auth.currentUser) return;
    const q = query(
      collection(db, 'sites', selectedSite.id, 'photos'),
      where('ownerId', '==', auth.currentUser.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPhotos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProgressPhoto)));
    });
    return () => unsubscribe();
  }, [selectedSite, auth.currentUser]);

  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSite || !auth.currentUser || !imageUrl) return;
    await addDoc(collection(db, 'sites', selectedSite.id, 'photos'), {
      siteId: selectedSite.id,
      imageUrl,
      caption,
      timestamp: new Date().toISOString(),
      ownerId: auth.currentUser.uid
    });
    setImageUrl('');
    setCaption('');
    setIsAdding(false);
  };

  const handleDelete = async (id: string) => {
    if (!selectedSite) return;
    await deleteDoc(doc(db, 'sites', selectedSite.id, 'photos', id));
  };

  if (!selectedSite) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
        <Camera size={48} className="text-slate-300 mb-4" />
        <p className="text-slate-500 font-bold mb-4">Select a site to view progress photos</p>
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
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">PROGRESS GALLERY</h3>
          <p className="text-slate-500 text-sm">Visual history for {selectedSite.name}</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg uppercase tracking-widest text-xs"
        >
          <Plus size={18} /> New Photo
        </button>
      </div>

      {isAdding && (
         <motion.div 
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           className="bg-white p-6 rounded-3xl shadow-xl border border-slate-200 mb-8"
          >
           <form onSubmit={handleAddPhoto} className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Photo URL</label>
                 <input 
                   type="url" 
                   value={imageUrl}
                   onChange={(e) => setImageUrl(e.target.value)}
                   placeholder="https://images.unsplash.com/..."
                   className="w-full bg-slate-50 border p-3 rounded-xl font-bold outline-none focus:ring-2 focus:ring-orange-500"
                   required
                 />
                 <p className="text-[10px] text-slate-400 italic">Hint: Upload your photo elsewhere and paste the link here for now.</p>
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Caption / Stage</label>
                 <input 
                   type="text" 
                   value={caption}
                   onChange={(e) => setCaption(e.target.value)}
                   placeholder="e.g., Foundation Complete"
                   className="w-full bg-slate-50 border p-3 rounded-xl font-bold outline-none focus:ring-2 focus:ring-orange-500"
                 />
               </div>
             </div>
             <div className="flex gap-2 font-black uppercase tracking-widest text-xs">
                <button type="submit" className="bg-orange-500 text-white px-8 py-3 rounded-xl">Add to Gallery</button>
                <button type="button" onClick={() => setIsAdding(false)} className="bg-slate-100 text-slate-500 px-8 py-3 rounded-xl">Cancel</button>
             </div>
           </form>
         </motion.div>
      )}

      {photos.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 text-center bg-slate-100 rounded-3xl">
          <ImageIcon size={48} className="text-slate-300 mb-4" />
          <p className="text-slate-400 font-bold">No photos added yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((photo) => (
            <motion.div
              layout
              key={photo.id}
              className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 group"
            >
              <div className="relative aspect-video overflow-hidden bg-slate-200">
                <img src={photo.imageUrl} alt={photo.caption} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                <button 
                  onClick={() => handleDelete(photo.id)}
                  className="absolute top-3 right-3 bg-white/90 p-2 rounded-xl text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  <Calendar size={12} />
                  {new Date(photo.timestamp).toLocaleDateString()}
                </div>
                <h4 className="font-bold text-slate-800">{photo.caption || 'No caption'}</h4>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
