
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CABLE_SIZES } from '../constants';
import { 
  CableData, 
  InstallationType, 
  TubeBranch, 
  InsulationType, 
  CableFormat, 
  TubeManufacturer,
  CableManufacturer
} from '../types';
import { 
  Trash2, 
  Plus, 
  RotateCcw,
  Settings2,
  Layers,
  ChevronDown,
  Cable as CableIcon
} from 'lucide-react';

// --- BASE DE DATOS TÉCNICA REBT ESPAÑA ---
interface TubeModel {
  name: string;
  branch: TubeBranch;
  manufacturers: TubeManufacturer[];
}

const TUBE_MODELS: TubeModel[] = [
  { 
    name: 'Corrugado PVC (320N)', 
    branch: TubeBranch.CORRUGADO, 
    manufacturers: [TubeManufacturer.AISCAN, TubeManufacturer.SOLERA, TubeManufacturer.REVI, TubeManufacturer.GAESTOPAS, TubeManufacturer.GEWISS, TubeManufacturer.EVIA, TubeManufacturer.FAMATEL] 
  },
  { 
    name: 'Corrugado Reforzado (750N)', 
    branch: TubeBranch.CORRUGADO, 
    manufacturers: [TubeManufacturer.AISCAN, TubeManufacturer.REVI, TubeManufacturer.PEMSA, TubeManufacturer.COURANT, TubeManufacturer.CANALPLAST, TubeManufacturer.FAMATEL] 
  },
  { 
    name: 'Corrugado LSZH', 
    branch: TubeBranch.CORRUGADO, 
    manufacturers: [TubeManufacturer.AISCAN, TubeManufacturer.REVI, TubeManufacturer.GAESTOPAS, TubeManufacturer.SIMON, TubeManufacturer.COURANT, TubeManufacturer.DIETZEL] 
  },
  { 
    name: 'Rígido PVC Enchufable', 
    branch: TubeBranch.RIGIDO, 
    manufacturers: [TubeManufacturer.AISCAN, TubeManufacturer.SOLERA, TubeManufacturer.REVI, TubeManufacturer.GEWISS, TubeManufacturer.EVIA, TubeManufacturer.FAMATEL] 
  },
  { 
    name: 'Rígido PVC Roscable', 
    branch: TubeBranch.RIGIDO, 
    manufacturers: [TubeManufacturer.AISCAN, TubeManufacturer.PEMSA, TubeManufacturer.HELLERMANNTYTON, TubeManufacturer.CANALPLAST, TubeManufacturer.ADEE] 
  },
  { 
    name: 'Rígido LSZH (1250N)', 
    branch: TubeBranch.RIGIDO, 
    manufacturers: [TubeManufacturer.AISCAN, TubeManufacturer.PEMSA, TubeManufacturer.INTERFLEX, TubeManufacturer.SIMON, TubeManufacturer.UNEX, TubeManufacturer.DIETZEL] 
  },
  { 
    name: 'Rígido Metálico', 
    branch: TubeBranch.RIGIDO, 
    manufacturers: [TubeManufacturer.PEMSA, TubeManufacturer.BASOR, TubeManufacturer.INTERFLEX, TubeManufacturer.GAESTOPAS, TubeManufacturer.LEGRAND, TubeManufacturer.OBO] 
  }
];

const TUBE_INTERNAL_DB: Record<TubeBranch, Record<number, number>> = {
  [TubeBranch.CORRUGADO]: { 16: 10.7, 20: 14.1, 25: 18.3, 32: 25.3, 40: 32.2, 50: 41.0, 63: 52.0 },
  [TubeBranch.RIGIDO]: { 16: 13.0, 20: 16.9, 25: 21.4, 32: 27.8, 40: 35.4, 50: 44.3, 63: 56.0 }
};

const UNIPOLAR_EXT_DIAM: Record<number, number> = {
  1.5: 3.0, 2.5: 3.6, 4: 4.2, 6: 4.8, 10: 6.2, 16: 7.4, 25: 9.1, 35: 10.4, 50: 12.3, 70: 14.1
};

const METRIC_OPTIONS = [16, 20, 25, 32, 40, 50, 63];

const ConduitCalculator: React.FC = () => {
  const [installType, setInstallType] = useState<InstallationType>(InstallationType.EMPOTRADA);
  const [tubeBranch, setTubeBranch] = useState<TubeBranch>(TubeBranch.CORRUGADO);
  const [tubeModel, setTubeModel] = useState<string>('');
  const [tubeMan, setTubeMan] = useState<TubeManufacturer>(TubeManufacturer.GENERIC);
  const [cables, setCables] = useState<CableData[]>([]);

  useEffect(() => {
    const models = TUBE_MODELS.filter(m => m.branch === tubeBranch);
    if (models.length > 0) setTubeModel(models[0].name);
  }, [tubeBranch]);

  useEffect(() => {
    const model = TUBE_MODELS.find(m => m.name === tubeModel);
    if (model) setTubeMan(model.manufacturers[0] || TubeManufacturer.GENERIC);
  }, [tubeModel]);

  const addCable = () => {
    setCables(prev => [...prev, { 
      id: Math.random().toString(), gauge: 2.5, count: 1, innerCount: 3,
      insulation: InsulationType.PVC, format: CableFormat.UNIPOLAR,
      manufacturer: CableManufacturer.GENERIC
    }]);
  };

  const updateCable = (id: string, updates: Partial<CableData>) => {
    setCables(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const removeCable = (id: string) => setCables(prev => prev.filter(c => c.id !== id));
  const resetAll = () => setCables([]);

  const result = useMemo(() => {
    if (cables.length === 0) return null;
    let totalOccupiedArea = 0;
    cables.forEach(c => {
      let dExt = UNIPOLAR_EXT_DIAM[c.gauge] || 3.6;
      if (c.format === CableFormat.MANGUERA) {
        dExt = (UNIPOLAR_EXT_DIAM[c.gauge] * (1 + 0.414 * Math.sqrt(c.innerCount)) * 1.15);
      }
      totalOccupiedArea += ((Math.PI * Math.pow(dExt, 2)) / 4) * c.count;
    });

    let multiplier = 2.5; 
    if (installType === InstallationType.EMPOTRADA) multiplier = 3.0;
    if (installType === InstallationType.AEREA) multiplier = 4.0;

    const dIntRequired = Math.sqrt((4 * (totalOccupiedArea * multiplier)) / Math.PI);
    const activeCatalog = TUBE_INTERNAL_DB[tubeBranch];
    const recommendedMetric = METRIC_OPTIONS.find(m => activeCatalog[m] >= dIntRequired) || 63;
    
    return {
      metric: recommendedMetric,
      dMin: dIntRequired.toFixed(2),
      dReal: activeCatalog[recommendedMetric].toFixed(1),
      multiplier,
      isOk: activeCatalog[recommendedMetric] >= dIntRequired
    };
  }, [cables, installType, tubeBranch]);

  return (
    <div className="space-y-4 max-w-md mx-auto pb-12 animate-fadeIn px-2">
      <div className="text-center">
        <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter">DANLUAN <span className="text-amber-500">CHECK</span></h2>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] italic mt-1 leading-none">CÁLCULO DE CANALIZACIONES</p>
      </div>

      {/* 1. SELECCIÓN DE CANALIZACIÓN */}
      <section className="bg-slate-950 border border-white/10 rounded-[2rem] p-4 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <div className="flex items-center gap-2">
            <Settings2 size={16} className="text-amber-500" />
            <span className="text-[12px] font-black text-white uppercase tracking-widest">CANALIZACIÓN</span>
          </div>
          <button onClick={resetAll} className="p-1 hover:bg-white/5 text-slate-500 rounded-lg transition-colors"><RotateCcw size={16} /></button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-500 uppercase ml-1 tracking-widest">INSTALACIÓN</label>
            <div className="relative">
              <select value={installType} onChange={(e) => setInstallType(e.target.value as InstallationType)} className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-[12px] text-white font-black appearance-none outline-none focus:border-amber-500/30 transition-all">
                {Object.values(InstallationType).map(v => <option key={v} value={v}>{v}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500 w-3 h-3 pointer-events-none" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-500 uppercase ml-1 tracking-widest">RAMA</label>
            <div className="relative">
              <select value={tubeBranch} onChange={(e) => setTubeBranch(e.target.value as TubeBranch)} className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-[12px] text-white font-black appearance-none outline-none focus:border-amber-500/30 transition-all">
                {Object.values(TubeBranch).map(v => <option key={v} value={v}>{v}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500 w-3 h-3 pointer-events-none" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-500 uppercase ml-1 tracking-widest">MODELO TUBO</label>
            <div className="relative">
              <select value={tubeModel} onChange={(e) => setTubeModel(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-[12px] text-white font-black appearance-none outline-none focus:border-amber-500/30 transition-all">
                {TUBE_MODELS.filter(m => m.branch === tubeBranch).map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500 w-3 h-3 pointer-events-none" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-500 uppercase ml-1 tracking-widest">FABRICANTE</label>
            <div className="relative">
              <select value={tubeMan} onChange={(e) => setTubeMan(e.target.value as TubeManufacturer)} className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-[12px] text-white font-black appearance-none outline-none focus:border-amber-500/30 transition-all">
                {TUBE_MODELS.find(m => m.name === tubeModel)?.manufacturers.map(m => <option key={m} value={m}>{m}</option>)}
                <option value={TubeManufacturer.GENERIC}>Genérico</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500 w-3 h-3 pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. CONDUCTORES */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
                <Layers size={16} className="text-amber-500" />
                <span className="text-[12px] font-black text-white uppercase tracking-widest">CONDUCTORES</span>
            </div>
            <button onClick={addCable} className="flex items-center gap-2 bg-amber-500/20 text-amber-400 px-4 py-2 rounded-xl border border-amber-500/30 active:scale-95 transition-all">
                <Plus size={16} />
                <span className="text-[10px] font-black uppercase tracking-wider">AÑADIR</span>
            </button>
        </div>

        <div className="space-y-2">
            <AnimatePresence>
                {cables.map(cable => (
                    <motion.div key={cable.id} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 5 }}
                        className="bg-slate-950 border border-white/5 rounded-2xl p-3 flex items-center gap-3 shadow-md"
                    >
                        <div className="flex-1 grid grid-cols-4 gap-2 items-center">
                            <div className="flex flex-col">
                              <span className="text-[8px] font-black text-slate-600 uppercase ml-1 mb-1">FORMATO</span>
                              <select value={cable.format} onChange={(e) => updateCable(cable.id, { format: e.target.value as CableFormat })}
                                  className="bg-slate-900 text-[12px] font-black text-white p-2 rounded-lg border-0 outline-none"
                              >
                                  <option value={CableFormat.UNIPOLAR}>Uni.</option>
                                  <option value={CableFormat.MANGUERA}>Mang.</option>
                              </select>
                            </div>
                            
                            <div className="flex flex-col">
                              <span className="text-[8px] font-black text-slate-600 uppercase ml-1 mb-1">SECCIÓN</span>
                              <select value={cable.gauge} onChange={(e) => updateCable(cable.id, { gauge: Number(e.target.value) })}
                                  className="bg-slate-900 text-[12px] font-black text-white p-2 rounded-lg border-0 outline-none text-center"
                              >
                                  {CABLE_SIZES.map(s => <option key={s} value={s}>{s}mm²</option>)}
                              </select>
                            </div>

                            <div className="flex flex-col">
                              <span className="text-[8px] font-black text-slate-600 uppercase ml-1 mb-1">CANT.</span>
                              <div className="flex items-center bg-slate-900 rounded-lg p-2 border border-white/5">
                                  <input type="number" value={cable.count} onChange={(e) => updateCable(cable.id, { count: parseInt(e.target.value) || 1 })}
                                      className="w-full bg-transparent text-[13px] font-black text-white text-center outline-none"
                                  />
                              </div>
                            </div>

                            {cable.format === CableFormat.MANGUERA ? (
                              <div className="flex flex-col">
                                <span className="text-[8px] font-black text-amber-500 uppercase ml-1 mb-1">HILOS</span>
                                <div className="flex items-center bg-slate-900 rounded-lg p-2 border border-amber-500/20">
                                    <input type="number" value={cable.innerCount} onChange={(e) => updateCable(cable.id, { innerCount: parseInt(e.target.value) || 1 })}
                                        className="w-full bg-transparent text-[13px] font-black text-white text-center outline-none"
                                    />
                                </div>
                              </div>
                            ) : (
                                <div className="text-[10px] font-black text-slate-700 text-center uppercase pt-5 tracking-tighter italic">ESTÁNDAR</div>
                            )}
                        </div>
                        <button onClick={() => removeCable(cable.id)} className="p-2 text-red-500/40 hover:text-red-500 active:scale-75 transition-colors mt-4"><Trash2 size={16} /></button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
      </section>

      {/* PANEL RESULTADO FINAL */}
      {result ? (
        <div className="vibrant-glass-amber rounded-[2.5rem] p-6 text-white relative overflow-hidden shadow-2xl animate-fadeIn border-2">
            <div className="scanline"></div>
            <div className="flex flex-col items-center">
                <div className="flex items-center gap-4 mb-2">
                    <span className="text-xl text-amber-400 font-light italic">Ø</span>
                    <h2 className="text-8xl font-black italic tracking-tighter leading-none drop-shadow-xl">{result.metric}</h2>
                    <div className="flex flex-col items-start">
                        <span className="text-xs font-black text-amber-500 uppercase tracking-widest">METRICA</span>
                        <div className={`mt-1 py-1 px-2 rounded-full text-[8px] font-black uppercase ${result.isOk ? 'bg-green-500/20 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.2)]' : 'bg-red-500/20 text-red-400'}`}>
                            {result.isOk ? 'CUMPLE OK' : 'NO CUMPLE'}
                        </div>
                    </div>
                </div>

                <div className="w-full grid grid-cols-2 gap-3 mt-2">
                    <div className="bg-slate-950/40 p-4 rounded-2xl border border-white/5 text-center">
                        <p className="text-[8px] font-black text-slate-500 uppercase mb-1 tracking-widest">Ø INT. REQUERIDO</p>
                        <p className="text-2xl font-black">{result.dMin} <span className="text-[12px] text-slate-600">mm</span></p>
                    </div>
                    <div className="bg-slate-950/40 p-4 rounded-2xl border border-white/5 text-center">
                        <p className="text-[8px] font-black text-slate-500 uppercase mb-1 tracking-widest">Ø INT. REAL ({tubeMan})</p>
                        <p className="text-2xl font-black">{result.dReal} <span className="text-[12px] text-slate-600">mm</span></p>
                    </div>
                </div>
                <p className="text-[8px] font-bold text-slate-700 uppercase italic mt-4 tracking-wider">NORMATIVA ITC-BT-21 - FACTOR X{result.multiplier}</p>
            </div>
        </div>
      ) : (
        <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-amber-500/10 rounded-[2.5rem] opacity-30 group hover:opacity-100 transition-all cursor-pointer" onClick={addCable}>
            <CableIcon size={40} className="text-slate-700 mb-2" />
            <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">AÑADE CONDUCTORES PARA CALCULAR</p>
        </div>
      )}
    </div>
  );
};

export default ConduitCalculator;
