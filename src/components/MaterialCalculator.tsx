import { useState } from 'react';
import { Site } from '../types.ts';
import { Calculator, Ruler, Layers, MoveHorizontal, RefreshCcw } from 'lucide-react';
import { motion } from 'motion/react';
import { AIAdvisor } from './AIAdvisor.tsx';

interface Props {
  selectedSite: Site | null;
  onPromptSelection?: () => void;
}

export function MaterialCalculator({ selectedSite, onPromptSelection }: Props) {
  const [length, setLength] = useState<number>(10);
  const [height, setHeight] = useState<number>(3);
  const [thickness, setThickness] = useState<number>(0.23); // 9 inch default
  const [unit, setUnit] = useState<'m' | 'ft'>('m');

  // Conversion factors
  const toMeters = (val: number) => unit === 'ft' ? val * 0.3048 : val;

  const calculate = () => {
    const l = toMeters(length);
    const h = toMeters(height);
    const t = thickness; // Thickness usually kept in meters for simplicity

    const volume = l * h * t;
    
    // Standard estimation (very rough placeholders for actual engineering formulas)
    // For 1m3 of brickwork:
    // ~500 bricks (standard 190x90x90mm)
    // ~1.2 bags of cement (1:6 ratio)
    // ~0.3 m3 of sand
    const bricks = Math.ceil(volume * 500);
    const cement = (volume * 1.25).toFixed(1);
    const sand = (volume * 0.32).toFixed(2);

    return { volume, bricks, cement, sand };
  };

  const results = calculate();

  if (!selectedSite) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
        <Calculator size={48} className="text-slate-300 mb-4" />
        <p className="text-slate-500 font-bold mb-4">Select a site to start calculations</p>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">DIMENSIONS</h3>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button 
                onClick={() => setUnit('m')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${unit === 'm' ? 'bg-white shadow-sm text-orange-600' : 'text-slate-500'}`}
              >Meters</button>
              <button 
                onClick={() => setUnit('ft')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${unit === 'ft' ? 'bg-white shadow-sm text-orange-600' : 'text-slate-500'}`}
              >Feet</button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Ruler size={14} /> Length ({unit})
              </label>
              <input 
                type="number" 
                value={length}
                onChange={(e) => setLength(parseFloat(e.target.value) || 0)}
                className="w-full text-4xl font-black p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-orange-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <MoveHorizontal size={14} /> Height ({unit})
              </label>
              <input 
                type="number" 
                value={height}
                onChange={(e) => setHeight(parseFloat(e.target.value) || 0)}
                className="w-full text-4xl font-black p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-orange-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Layers size={14} /> Wall Thickness (Meters)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[0.11, 0.23].map((t) => (
                  <button
                    key={t}
                    onClick={() => setThickness(t)}
                    className={`py-4 rounded-xl font-black text-lg border-2 transition-all ${
                      thickness === t ? 'bg-orange-500 border-orange-500 text-white' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                    }`}
                  >
                    {t === 0.11 ? '4.5"' : '9"'} ({t}m)
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
           <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl">
             <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Total Wall Volume</p>
             <h4 className="text-5xl font-black tracking-tight">{results.volume.toFixed(2)} <span className="text-xl text-slate-500">m³</span></h4>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <motion.div 
               whileHover={{ y: -5 }}
               className="bg-white p-6 rounded-3xl border-b-4 border-orange-500 shadow-sm"
             >
               <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Bricks Required</p>
               <p className="text-3xl font-black text-slate-900">{results.bricks.toLocaleString()}</p>
               <p className="text-slate-400 text-xs font-bold">Standard Size</p>
             </motion.div>

             <motion.div 
               whileHover={{ y: -5 }}
               className="bg-white p-6 rounded-3xl border-b-4 border-blue-500 shadow-sm"
             >
               <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Cement Bags</p>
               <p className="text-3xl font-black text-slate-900">{results.cement}</p>
               <p className="text-slate-400 text-xs font-bold">50KG Bags (1:6)</p>
             </motion.div>

             <motion.div 
               whileHover={{ y: -5 }}
               className="bg-white p-6 rounded-3xl border-b-4 border-yellow-500 shadow-sm col-span-full"
             >
               <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Sand Required</p>
               <p className="text-3xl font-black text-slate-900">{results.sand}</p>
               <p className="text-slate-400 text-xs font-bold">Cubic Meters (Trolleys ≈ { (parseFloat(results.sand) / 1.5).toFixed(1) })</p>
             </motion.div>
           </div>

           <div className="bg-orange-50 p-4 rounded-2xl flex items-start gap-3">
             <div className="bg-orange-100 p-2 rounded-lg text-orange-600 mt-1">
               <Calculator size={16} />
             </div>
             <div>
               <p className="text-sm text-orange-900 font-bold">Mistri's Tip</p>
               <p className="text-xs text-orange-700">Add 5% extra for wastage during handling and cutting of bricks.</p>
             </div>
           </div>

           <AIAdvisor context={`Wall: ${length}${unit} x ${height}${unit} x ${thickness}m. Materials: ${results.bricks} bricks, ${results.cement} bags cement, ${results.sand}m3 sand.`} />
        </div>
      </div>
    </div>
  );
}
