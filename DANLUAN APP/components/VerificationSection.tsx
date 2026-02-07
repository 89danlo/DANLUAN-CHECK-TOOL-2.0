
import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AveriaSubSection, ImpedanciaType, Manufacturer, RCDDevice, RCDResult, AislamientoResult, ImpedanciaState, ImpedanciaDevice } from '../types';
import { PROTECTION_CURVES } from '../constants';
import { readInstrumentOCR } from '../services/geminiService';
import SignaturePad from './SignaturePad';
import { 
  ShieldAlert, 
  Orbit, 
  CheckCircle,
  AlertCircle,
  ChevronDown,
  Layers,
  Power,
  PowerOff,
  Flame,
  Plus,
  Edit2,
  Zap,
  Trash2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  FileText,
  X,
  Printer,
  Mail,
  MessageCircle,
  ArrowRight,
  Droplets,
  Sun,
  Camera,
  Loader2,
  PenTool,
  BadgeCheck,
  Activity,
  Cpu
} from 'lucide-react';

interface VerificationSectionProps {
  rcdDevices: RCDDevice[];
  setRcdDevices: (val: RCDDevice[] | ((prev: RCDDevice[]) => RCDDevice[])) => void;
  aislamientoHistory: AislamientoResult[];
  setAislamientoHistory: (val: AislamientoResult[] | ((prev: AislamientoResult[]) => AislamientoResult[])) => void;
  impedanciaData: ImpedanciaState;
  setImpedanciaData: (val: ImpedanciaState | ((prev: ImpedanciaState) => ImpedanciaState)) => void;
  impedanciaMode: ImpedanciaType;
  setImpedanciaMode: React.Dispatch<React.SetStateAction<ImpedanciaType>>;
}

const VerificationSection: React.FC<VerificationSectionProps> = ({
  rcdDevices,
  setRcdDevices,
  aislamientoHistory,
  setAislamientoHistory,
  impedanciaData,
  setImpedanciaData,
  impedanciaMode,
  setImpedanciaMode
}) => {
  const [subSection, setSubSection] = useState<AveriaSubSection>(AveriaSubSection.DIFERENCIALES);
  const [showReport, setShowReport] = useState(false);

  const tabs = [
    { id: AveriaSubSection.DIFERENCIALES, label: 'RCD', icon: <ShieldAlert />, color: 'yellow' },
    { id: AveriaSubSection.AISLAMIENTO, label: 'AISLAMIENTO', icon: <Layers />, color: 'fuchsia' },
    { id: AveriaSubSection.IMPEDANCIAS, label: 'IMPEDANCIAS', icon: <Orbit />, color: 'green' },
  ];

  return (
    <div className="space-y-4 max-w-md mx-auto">
      <div className="flex items-center justify-between px-2">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-left">
          <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase leading-none drop-shadow-lg">VERIFICACIONES</h2>
        </motion.div>
        <button onClick={() => setShowReport(true)} className="p-2.5 bg-cyan-500 rounded-xl text-slate-900 border border-cyan-300 shadow-xl active:scale-90 transition-all">
          <FileText size={20} />
        </button>
      </div>
      
      <div className="flex bg-slate-800/60 p-1.5 rounded-2xl border-2 border-white/10 shadow-2xl backdrop-blur-xl">
        {tabs.map((tab) => {
          const isActive = subSection === tab.id;
          const getColorClass = () => {
            if (tab.color === 'yellow') return isActive ? 'bg-yellow-400 text-slate-900 shadow-[0_0_20px_rgba(253,224,71,0.5)]' : 'text-yellow-400/60';
            if (tab.color === 'fuchsia') return isActive ? 'bg-fuchsia-400 text-white shadow-[0_0_20px_rgba(232,121,249,0.5)]' : 'text-fuchsia-400/60';
            return isActive ? 'bg-green-500 text-slate-950 shadow-[0_0_20px_rgba(34,197,94,0.5)]' : 'text-green-500/60';
          };
          return (
            <button key={tab.id} onClick={() => setSubSection(tab.id)} className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all duration-500 relative ${getColorClass()}`}>
              <div className="relative z-10">{React.cloneElement(tab.icon as React.ReactElement<any>, { className: isActive ? "w-6 h-6" : "w-5 h-5" })}</div>
              <span className="text-[11px] font-black uppercase relative z-10 tracking-[0.05em] leading-none whitespace-nowrap">{tab.label}</span>
              {isActive && <motion.div layoutId="active-tab-glow" className="absolute inset-0 rounded-xl bg-white/5" />}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={subSection} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.2 }}>
          {subSection === AveriaSubSection.DIFERENCIALES && <DiferencialesTool devices={rcdDevices} setDevices={setRcdDevices} />}
          {subSection === AveriaSubSection.AISLAMIENTO && <AislamientoTool history={aislamientoHistory} setHistory={setAislamientoHistory} />}
          {subSection === AveriaSubSection.IMPEDANCIAS && <ImpedanciasTool mode={impedanciaMode} setMode={setImpedanciaMode} data={impedanciaData} setData={setImpedanciaData} rcdSensitivity={rcdDevices[0]?.intensity || '30'} />}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>{showReport && <ReportModal onClose={() => setShowReport(false)} rcds={rcdDevices} aislamiento={aislamientoHistory} impedancia={impedanciaData} />}</AnimatePresence>
    </div>
  );
};

// --- COMPONENTE RCD ---
const DiferencialesTool = ({ devices, setDevices }: { devices: RCDDevice[], setDevices: (val: RCDDevice[] | ((prev: RCDDevice[]) => RCDDevice[])) => void }) => {
  const [activeDeviceId, setActiveDeviceId] = useState(devices[0]?.id || '');
  const [testMode, setTestMode] = useState<'x0.5' | 'x1' | 'x5' | 'AUTO'>('x1');
  const [showInDropdown, setShowInDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeDevice = useMemo(() => devices.find(d => d.id === activeDeviceId) || devices[0], [devices, activeDeviceId]);
  
  const updateDevice = (updates: Partial<RCDDevice>) => setDevices(prev => prev.map(d => d.id === activeDevice.id ? { ...d, ...updates } : d));
  const removeDevice = (id: string) => {
    if (devices.length <= 1) return;
    const newDevices = devices.filter(d => d.id !== id);
    setDevices(newDevices);
    setActiveDeviceId(newDevices[0].id);
  };

  const updateResult = (mode: string, updates: Partial<RCDResult>) => {
    const newResults = { ...activeDevice.results, [mode]: { ...activeDevice.results[mode as keyof typeof activeDevice.results], ...updates, isTested: true } };
    setDevices(prev => prev.map(d => d.id === activeDevice.id ? { ...d, results: newResults } : d));
  };

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsCapturing(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = (event.target?.result as string).split(',')[1];
      const result = await readInstrumentOCR(base64);
      if (result) {
        if (testMode === 'AUTO') updateResult(testMode, { ma: result });
        else updateResult(testMode, { time: result });
      }
      setIsCapturing(false);
    };
    reader.readAsDataURL(file);
  };

  const currentResultData = activeDevice.results[testMode as keyof typeof activeDevice.results];
  const validation = (() => {
    if (!currentResultData.isTested) return null;
    const isSelective = activeDevice.type.includes('Selectivo');
    const timeVal = parseFloat(currentResultData.time);
    if (testMode === 'x0.5') return !currentResultData.didTrip ? { ok: true, msg: 'APTO' } : { ok: false, msg: 'NO APTO (DISPARÓ)' };
    if (!currentResultData.didTrip) return { ok: false, msg: 'NO APTO (NO SALTÓ)' };
    if (testMode === 'x1') {
      if (isSelective) return (timeVal >= 130 && timeVal <= 500) ? { ok: true, msg: 'APTO S' } : { ok: false, msg: 'FUERA RANGO S' };
      return timeVal < 300 ? { ok: true, msg: 'APTO' } : { ok: false, msg: 'LENTO (>300ms)' };
    }
    if (testMode === 'x5') {
      if (isSelective) return (timeVal >= 50 && timeVal <= 150) ? { ok: true, msg: 'APTO S' } : { ok: false, msg: 'FUERA RANGO S' };
      return timeVal < 40 ? { ok: true, msg: 'APTO' } : { ok: false, msg: 'LENTO (>40ms)' };
    }
    if (testMode === 'AUTO') {
      const ma = parseFloat(currentResultData.ma);
      const inVal = parseFloat(activeDevice.intensity);
      return (ma >= inVal * 0.5 && ma <= inVal) ? { ok: true, msg: `APTO (${ma}mA)` } : { ok: false, msg: 'FUERA RANGO mA' };
    }
    return null;
  })();

  const RCD_TYPES = ['Tipo AC', 'Tipo A', 'Tipo B', 'Tipo F', 'Selectivo (S)'];

  return (
    <div className="space-y-4">
      <div className="neon-container vibrant-glass-yellow rounded-[2rem] p-4 space-y-4 shadow-xl relative overflow-hidden transition-all duration-500">
        <div className="neon-glow-layer"></div>
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-3 overflow-hidden">
            <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400/20" />
            {isRenaming ? (
              <input autoFocus className="bg-slate-800 p-1.5 rounded-xl text-base text-white uppercase outline-none w-32 font-black border-2 border-yellow-400/50" value={activeDevice.name} onChange={(e) => setDevices(prev => prev.map(d => d.id === activeDevice.id ? { ...d, name: e.target.value.toUpperCase() } : d))} onBlur={() => setIsRenaming(false)} />
            ) : (
              <span className="text-lg font-black italic text-white truncate uppercase tracking-tight drop-shadow-sm">{activeDevice.name}</span>
            )}
          </div>
          <div className="flex gap-1.5">
            <button onClick={() => setDevices(prev => prev.map(d => d.id === activeDevice.id ? { ...d, results: { 'x0.5': { time: '', ma: '', didTrip: false, isTested: false }, 'x1': { time: '', ma: '', didTrip: true, isTested: false }, 'x5': { time: '', ma: '', didTrip: true, isTested: false }, 'AUTO': { time: '', ma: '', didTrip: true, isTested: false } } } : d))} className="p-2 bg-white/10 rounded-xl text-yellow-400 border border-white/10 active:scale-90"><RotateCcw size={14}/></button>
            <button onClick={() => setIsRenaming(true)} className="p-2 bg-white/10 rounded-xl text-yellow-400 border border-white/10 active:scale-90"><Edit2 size={14}/></button>
            <button onClick={() => removeDevice(activeDevice.id)} className="p-2 bg-red-900/40 rounded-xl text-red-400 border border-red-500/20 active:scale-90"><Trash2 size={14}/></button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="relative"><button onClick={() => setShowTypeDropdown(!showTypeDropdown)} className="w-full bg-slate-800/80 border-2 border-yellow-400/30 p-2.5 rounded-xl flex items-center justify-between text-white font-black text-xs italic">{activeDevice.type} <ChevronDown className="w-4 h-4 text-yellow-400" /></button>
            <AnimatePresence>{showTypeDropdown && (<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border-2 border-yellow-400 rounded-xl z-[100] overflow-hidden shadow-2xl">{RCD_TYPES.map(t => <button key={t} onClick={() => { setDevices(prev => prev.map(d => d.id === activeDevice.id ? { ...d, type: t } : d)); setShowTypeDropdown(false); }} className="w-full p-3 text-left text-[10px] text-white font-black uppercase hover:bg-yellow-400 hover:text-black border-b border-white/5 last:border-0">{t}</button>)}</motion.div>)}</AnimatePresence>
          </div>
          <div className="relative"><button onClick={() => setShowInDropdown(!showInDropdown)} className="w-full bg-slate-800/80 border-2 border-yellow-400/30 p-2.5 rounded-xl flex items-center justify-between text-white font-black text-xs italic">{activeDevice.intensity}mA <ChevronDown className="w-4 h-4 text-yellow-400" /></button>
            <AnimatePresence>{showInDropdown && (<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border-2 border-yellow-400 rounded-xl z-[100] overflow-hidden shadow-2xl">{['10', '30', '100', '300', '500'].map(val => <button key={val} onClick={() => { setDevices(prev => prev.map(d => d.id === activeDevice.id ? { ...d, intensity: val } : d)); setShowInDropdown(false); }} className="w-full p-3 text-left text-[10px] text-white font-black uppercase hover:bg-yellow-400 hover:text-black border-b border-white/5 last:border-0">{val}mA</button>)}</motion.div>)}</AnimatePresence>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {['x0.5', 'x1', 'x5', 'AUTO'].map((m) => (
            <button key={m} onClick={() => setTestMode(m as any)} className={`py-2 rounded-xl font-black text-[10px] border-2 transition-all shadow-sm ${testMode === m ? 'bg-yellow-400 text-slate-950 border-white' : 'bg-slate-700/50 text-yellow-100/60 border-white/10'}`}>{m}</button>
          ))}
        </div>

        <div className="relative group p-6 bg-slate-950/40 rounded-[2rem] border border-white/5 flex flex-col items-center justify-center overflow-hidden">
           <div className="absolute right-4 top-4 z-20">
              <input type="file" accept="image/*" capture="environment" ref={fileInputRef} className="hidden" onChange={handleCapture} />
              <button onClick={() => fileInputRef.current?.click()} disabled={isCapturing} className="w-10 h-10 bg-yellow-400/10 border border-yellow-400/30 rounded-xl flex items-center justify-center text-yellow-400 active:scale-90 transition-all shadow-lg">
                {isCapturing ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
              </button>
           </div>
           <p className="text-[10px] font-black text-yellow-500 uppercase tracking-widest mb-1">{testMode === 'AUTO' ? 'mA DISPARO' : 'TIEMPO (ms)'}</p>
           <input type="number" value={testMode === 'AUTO' ? currentResultData.ma : currentResultData.time} onChange={(e) => updateResult(testMode, testMode === 'AUTO' ? { ma: e.target.value } : { time: e.target.value })} className="w-full bg-transparent text-6xl font-black italic text-white text-center outline-none" placeholder="0" />
           <AnimatePresence>
              {isCapturing && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-30"><Loader2 className="animate-spin text-yellow-400 w-10 h-10 mb-2" /><p className="text-[10px] font-black text-white uppercase tracking-widest text-glow-yellow">IA LEYENDO...</p></motion.div>}
           </AnimatePresence>
        </div>

        <div className="flex gap-2">
          <button onClick={() => updateResult(testMode, { didTrip: true })} className={`flex-1 py-3 rounded-xl text-[10px] font-black border-2 transition-all ${currentResultData.didTrip ? 'bg-green-600 border-green-400 text-white shadow-lg' : 'bg-slate-800/60 text-slate-500'}`}><Power size={14}/> SALTÓ</button>
          <button onClick={() => updateResult(testMode, { didTrip: false })} className={`flex-1 py-3 rounded-xl text-[10px] font-black border-2 transition-all ${!currentResultData.didTrip ? 'bg-red-600 border-red-400 text-white shadow-lg' : 'bg-slate-800/60 text-slate-500'}`}><PowerOff size={14}/> NO SALTÓ</button>
        </div>

        {validation && <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className={`py-3 rounded-2xl flex items-center justify-center border-2 shadow-lg ${validation.ok ? 'bg-green-600 border-green-400 text-white' : 'bg-red-700 border-red-500 text-white'}`}><span className="text-base font-black italic uppercase tracking-widest leading-none">{validation.msg}</span></motion.div>}
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        {devices.map(d => (<button key={d.id} onClick={() => setActiveDeviceId(d.id)} className={`px-4 py-2 rounded-xl text-[10px] font-black whitespace-nowrap border-2 transition-all shadow-sm ${activeDeviceId === d.id ? 'bg-yellow-400 text-slate-950 border-white' : 'bg-slate-800 text-slate-400 border-white/5'}`}>{d.name}</button>))}
        <button onClick={() => setDevices([...devices, { id: Date.now().toString(), name: `RCD ${devices.length + 1}`, intensity: '30', type: 'Tipo AC', results: { 'x0.5': { time: '', ma: '', didTrip: false, isTested: false }, 'x1': { time: '', ma: '', didTrip: true, isTested: false }, 'x5': { time: '', ma: '', didTrip: true, isTested: false }, 'AUTO': { time: '', ma: '', didTrip: true, isTested: false } } }])} className="w-10 h-10 bg-green-600 hover:bg-green-500 rounded-xl flex items-center justify-center shrink-0 border-2 border-white/30 transition-all shadow-md"><Plus size={18} color="white"/></button>
      </div>
    </div>
  );
};

// --- COMPONENTE AISLAMIENTO ---
const AislamientoTool = ({ history, setHistory }: { history: AislamientoResult[], setHistory: (val: AislamientoResult[] | ((prev: AislamientoResult[]) => AislamientoResult[])) => void }) => {
  const [point, setPoint] = useState('F-N');
  const [voltage, setVoltage] = useState(500);
  const [unit, setUnit] = useState<'MΩ' | 'GΩ'>('MΩ');
  const [value, setValue] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);
  
  // Nuevo estado para gestionar múltiples PIAs en aislamiento
  const [pias, setPias] = useState<string[]>(['GENERAL']);
  const [activePia, setActivePia] = useState('GENERAL');
  const [isAddingPia, setIsAddingPia] = useState(false);
  const [newPiaName, setNewPiaName] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const addResult = () => {
    if (!value) return;
    const isValid = parseFloat(value) >= (voltage >= 500 ? 1.0 : 0.5);
    setHistory(prev => [{ 
      id: Date.now().toString(), 
      point: `${activePia}: ${point}`, // Guardamos el PIA en el punto
      voltage, 
      value, 
      unit, 
      isValid, 
      timestamp: new Date().toLocaleTimeString() 
    }, ...prev]);
    setValue('');
  };

  const addPia = () => {
    if (newPiaName.trim()) {
      const name = newPiaName.toUpperCase();
      if (!pias.includes(name)) {
        setPias([...pias, name]);
        setActivePia(name);
      }
      setNewPiaName('');
      setIsAddingPia(false);
    }
  };

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsCapturing(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = (event.target?.result as string).split(',')[1];
      const result = await readInstrumentOCR(base64);
      if (result) setValue(result);
      setIsCapturing(false);
    };
    reader.readAsDataURL(file);
  };

  const TEST_POINTS = ['F-F', 'F-N', 'F-PE', 'N-PE'];

  return (
    <div className="space-y-4">
      <div className="neon-container vibrant-glass-fuchsia rounded-[2rem] p-5 space-y-4 shadow-xl">
          <div className="neon-glow-layer"></div>
          <div className="flex justify-between items-center border-b border-white/10 pb-2">
            <div className="flex items-center gap-2"><Flame size={20} className="text-fuchsia-400" /><h3 className="text-xl font-black text-white italic uppercase leading-none">AISLAMIENTO</h3></div>
            <button onClick={() => setHistory([])} className="p-2 text-slate-500 hover:text-white transition-colors"><RotateCcw size={14}/></button>
          </div>
          
          {/* Selector de PIA para Aislamiento */}
          <div className="space-y-2">
            <label className="text-[8px] font-black text-fuchsia-400 uppercase tracking-widest ml-1">SELECCIONAR PIA / CIRCUITO</label>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {pias.map(p => (
                <button 
                  key={p} 
                  onClick={() => setActivePia(p)} 
                  className={`px-4 py-2 rounded-xl text-[10px] font-black border-2 transition-all whitespace-nowrap shadow-sm ${activePia === p ? 'bg-fuchsia-500 text-white border-white' : 'bg-slate-800 text-slate-400 border-white/5'}`}
                >
                  {p}
                </button>
              ))}
              <button 
                onClick={() => setIsAddingPia(true)}
                className="w-10 h-10 bg-white/5 text-fuchsia-400 rounded-xl flex items-center justify-center shrink-0 border-2 border-fuchsia-400/20 active:scale-95"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          <AnimatePresence>
            {isAddingPia && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex gap-2">
                <input 
                  autoFocus 
                  value={newPiaName} 
                  onChange={e => setNewPiaName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addPia()}
                  placeholder="NOMBRE PIA..." 
                  className="flex-1 bg-slate-900 border-2 border-fuchsia-500/30 rounded-xl px-4 py-2 text-xs font-black text-white outline-none" 
                />
                <button onClick={addPia} className="bg-fuchsia-600 text-white px-4 rounded-xl font-black text-[10px] uppercase">OK</button>
                <button onClick={() => setIsAddingPia(false)} className="bg-white/5 text-slate-500 px-3 rounded-xl"><X size={16}/></button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-4 gap-1 bg-slate-900/50 p-1.5 rounded-xl border border-white/5">
            {TEST_POINTS.map(p => <button key={p} onClick={() => setPoint(p)} className={`py-2 text-[10px] font-black rounded-lg transition-all ${point === p ? 'bg-fuchsia-500 text-white' : 'text-fuchsia-400/50'}`}>{p}</button>)}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col space-y-1">
              <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">TENSIÓN</label>
              <div className="flex bg-slate-900/50 p-1 rounded-lg">
                {[250, 500, 1000].map(v => <button key={v} onClick={() => setVoltage(v)} className={`flex-1 py-1.5 text-[9px] font-black rounded-md transition-all ${voltage === v ? 'bg-fuchsia-500 text-white' : 'text-fuchsia-400/50'}`}>{v}V</button>)}
              </div>
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">UNIDAD</label>
              <div className="flex bg-slate-900/50 p-1 rounded-lg">
                {['MΩ', 'GΩ'].map(u => <button key={u} onClick={() => setUnit(u as any)} className={`flex-1 py-1.5 text-[9px] font-black rounded-md transition-all ${unit === u ? 'bg-fuchsia-500 text-white' : 'text-fuchsia-400/50'}`}>{u}</button>)}
              </div>
            </div>
          </div>

          <div className="relative group p-6 bg-slate-950/40 rounded-[2rem] border border-white/5 flex flex-col items-center justify-center overflow-hidden">
              <div className="absolute right-4 top-4 z-20">
                <input type="file" accept="image/*" capture="environment" ref={fileInputRef} className="hidden" onChange={handleCapture} />
                <button onClick={() => fileInputRef.current?.click()} disabled={isCapturing} className="w-10 h-10 bg-fuchsia-400/10 border border-fuchsia-400/30 rounded-xl flex items-center justify-center text-fuchsia-400 active:scale-90 transition-all shadow-lg">
                  {isCapturing ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
                </button>
              </div>
              <p className="text-[10px] font-black text-fuchsia-400 uppercase tracking-widest mb-1">RESISTENCIA ({unit})</p>
              <input type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder="0.00" className="w-full bg-transparent text-6xl font-black italic text-white text-center outline-none" />
              <AnimatePresence>{isCapturing && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-30"><Loader2 className="animate-spin text-fuchsia-400 w-10 h-10 mb-2" /><p className="text-[10px] font-black text-white uppercase tracking-widest">IA LEYENDO...</p></motion.div>}</AnimatePresence>
          </div>

          <button onClick={addResult} className="w-full py-5 rounded-2xl text-[13px] font-black uppercase tracking-[0.2em] bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-xl border border-white/10 active:scale-95 transition-all">AÑADIR RESULTADO</button>
          
          <div className="space-y-2 mt-4 max-h-48 overflow-y-auto no-scrollbar">
            {history.map(res => (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={res.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-white uppercase leading-none">{res.point}</span>
                  <span className="text-[7px] font-bold text-slate-500 uppercase mt-1">VOLTAJE: {res.voltage}V</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-black ${res.isValid ? 'text-green-400' : 'text-red-400'}`}>{res.value}{res.unit}</span>
                  {res.isValid ? <CheckCircle2 size={14} className="text-green-400"/> : <XCircle size={14} className="text-red-400"/>}
                </div>
              </motion.div>
            ))}
          </div>
      </div>
    </div>
  );
};

// --- COMPONENTE IMPEDANCIAS ---
const ImpedanciasTool = ({ mode, setMode, data, setData, rcdSensitivity }: { mode: ImpedanciaType, setMode: (m: ImpedanciaType) => void, data: ImpedanciaState, setData: (val: ImpedanciaState | ((prev: ImpedanciaState) => ImpedanciaState)) => void, rcdSensitivity: string }) => {
  const device = data.devices[0];
  const [isCapturing, setIsCapturing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const updateDevice = (updates: Partial<ImpedanciaDevice>) => {
    setData(prev => ({ ...prev, devices: prev.devices.map((d, i) => i === 0 ? { ...d, ...updates } : d) }));
  };

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsCapturing(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = (event.target?.result as string).split(',')[1];
      const result = await readInstrumentOCR(base64);
      if (result) updateDevice(mode === ImpedanciaType.LINEA ? { lineValue: result } : { bucleValue: result });
      setIsCapturing(false);
    };
    reader.readAsDataURL(file);
  };

  const limitZ = useMemo(() => {
    if (mode === ImpedanciaType.LINEA) {
      const factor = PROTECTION_CURVES[Manufacturer.GENERIC][device.lineCurve];
      const amps = parseFloat(device.lineAmps);
      return (230 / (amps * factor)).toFixed(2);
    } else {
      const ul = data.isHumid ? 24 : 50;
      const idn = parseFloat(rcdSensitivity) / 1000;
      return (ul / idn).toFixed(2);
    }
  }, [mode, device.lineCurve, device.lineAmps, data.isHumid, rcdSensitivity]);

  const activeValue = mode === ImpedanciaType.LINEA ? device.lineValue : (device.bucleValue || '');
  const contactVoltage = useMemo(() => {
    if (mode !== ImpedanciaType.BUCLE || !device.bucleValue) return null;
    const idn = parseFloat(rcdSensitivity) / 1000;
    return (parseFloat(device.bucleValue) * idn).toFixed(1);
  }, [mode, device.bucleValue, rcdSensitivity]);

  const isValid = useMemo(() => {
    if (!activeValue) return null;
    return parseFloat(activeValue) <= parseFloat(limitZ);
  }, [activeValue, limitZ]);

  const CURVES: Array<'B' | 'C' | 'D'> = ['B', 'C', 'D'];
  const AMPS = ['6', '10', '16', '20', '25', '32', '40', '50', '63'];

  return (
    <div className="neon-container vibrant-glass-green rounded-[2rem] p-4 space-y-4 shadow-xl relative">
        <div className="neon-glow-layer"></div>
        <div className="flex bg-slate-800 border-2 border-white/10 p-1 rounded-2xl shadow-xl">
          <button onClick={() => setMode(ImpedanciaType.LINEA)} className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${mode === ImpedanciaType.LINEA ? 'bg-green-500 text-slate-900' : 'text-green-500/40'}`}>Z LÍNEA (F-N)</button>
          <button onClick={() => setMode(ImpedanciaType.BUCLE)} className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${mode === ImpedanciaType.BUCLE ? 'bg-green-500 text-slate-900' : 'text-green-500/40'}`}>Z BUCLE (F-T)</button>
        </div>

        <div className="space-y-3">
          {mode === ImpedanciaType.LINEA ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><label className="text-[8px] font-black text-slate-500 uppercase ml-1">CURVA</label>
                <div className="flex bg-slate-900/50 p-1 rounded-lg">
                  {CURVES.map(c => <button key={c} onClick={() => updateDevice({ lineCurve: c })} className={`flex-1 py-1.5 text-[10px] font-black rounded-md transition-all ${device.lineCurve === c ? 'bg-green-500 text-slate-900' : 'text-green-500/50'}`}>{c}</button>)}
                </div>
              </div>
              <div className="space-y-1"><label className="text-[8px] font-black text-slate-500 uppercase ml-1">CALIBRE (In)</label>
                <select value={device.lineAmps} onChange={(e) => updateDevice({ lineAmps: e.target.value })} className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-xs text-white font-black appearance-none outline-none">{AMPS.map(a => <option key={a} value={a}>{a}A</option>)}</select>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><label className="text-[8px] font-black text-slate-500 uppercase ml-1">ENTORNO</label>
                <div className="flex bg-slate-900/50 p-1 rounded-lg">
                   <button onClick={() => setData(prev => ({...prev, isHumid: false}))} className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-2 text-[9px] font-black transition-all ${!data.isHumid ? 'bg-green-500 text-slate-900' : 'text-green-400/40'}`}><Sun size={10}/> SECO</button>
                   <button onClick={() => setData(prev => ({...prev, isHumid: true}))} className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-2 text-[9px] font-black transition-all ${data.isHumid ? 'bg-blue-500 text-white' : 'text-blue-400/40'}`}><Droplets size={10}/> HÚMEDO</button>
                </div>
              </div>
              <div className="space-y-1"><label className="text-[8px] font-black text-slate-500 uppercase ml-1">SENSIBILIDAD</label>
                <div className="bg-slate-900 border border-white/10 rounded-lg p-2.5 text-xs text-white font-black text-center">{rcdSensitivity}mA</div>
              </div>
            </div>
          )}

          <div className="bg-slate-950/40 border-2 border-white/10 rounded-[2.5rem] p-6 text-center space-y-2 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-green-500/20 group-hover:bg-green-500/50 transition-all"></div>
            <div className="absolute right-4 top-4 z-20">
              <input type="file" accept="image/*" capture="environment" ref={fileInputRef} className="hidden" onChange={handleCapture} />
              <button onClick={() => fileInputRef.current?.click()} disabled={isCapturing} className="w-10 h-10 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center justify-center text-green-400 active:scale-90 transition-all shadow-lg hover:bg-green-500/20">
                {isCapturing ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
              </button>
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">IMPEDANCIA MEDIDA (Ω)</p>
            <input type="number" value={activeValue} onChange={(e) => updateDevice(mode === ImpedanciaType.LINEA ? { lineValue: e.target.value } : { bucleValue: e.target.value })} placeholder="0.00" className="w-full bg-transparent text-6xl font-black italic text-white text-center outline-none drop-shadow-lg" />
            <div className="pt-2 flex flex-col items-center">
               {mode === ImpedanciaType.BUCLE && contactVoltage && <div className="mb-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black"><span className="text-slate-500 uppercase">Uc: </span><span className={parseFloat(contactVoltage) > (data.isHumid ? 24 : 50) ? 'text-red-400' : 'text-green-400'}>{contactVoltage} V</span></div>}
               <div className="flex items-center gap-2"><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">LÍMITE REBT: </span><span className="text-[11px] font-black text-green-400">{limitZ} Ω</span></div>
            </div>
            <AnimatePresence>{isCapturing && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-30"><Loader2 className="animate-spin text-green-400 w-10 h-10 mb-2" /><p className="text-[10px] font-black text-white uppercase tracking-widest">IA LEYENDO...</p></motion.div>}</AnimatePresence>
          </div>

          {isValid !== null && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className={`p-4 rounded-2xl flex items-center justify-between border-2 shadow-xl ${isValid ? 'bg-green-600/20 border-green-500 text-green-400' : 'bg-red-600/20 border-red-500 text-red-400'}`}>
              <div className="flex items-center gap-3">{isValid ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
                <div>
                  <p className="text-sm font-black uppercase italic tracking-widest leading-none">{isValid ? 'APTO' : 'NO APTO'}</p>
                  <p className="text-[8px] font-bold opacity-70 uppercase mt-1">{mode === ImpedanciaType.LINEA ? (isValid ? 'PROTECCIÓN MAGNÉTICA OK' : 'Z DEMASIADO ALTA') : (isValid ? 'Uc SEGURA' : 'RIESGO POR DERIVACIÓN')}</p>
                </div>
              </div>
              <ArrowRight size={20} className="opacity-30" />
            </motion.div>
          )}
        </div>
    </div>
  );
};

// --- MODAL DE INFORME TÉCNICO PROFESIONAL (REDISEÑO GRIS CENIZA) ---
const ReportModal = ({ onClose, rcds, aislamiento, impedancia }: { onClose: () => void, rcds: RCDDevice[], aislamiento: AislamientoResult[], impedancia: ImpedanciaState }) => {
  const [signature, setSignature] = useState<string | null>(null);
  const [showSignaturePad, setShowSignaturePad] = useState(false);

  const isRcdApto = (d: RCDDevice) => {
    const s = d.results['x1'];
    if (!s.isTested || !s.didTrip) return false;
    const t = parseFloat(s.time);
    if (d.type.includes('Selectivo')) return t >= 130 && t <= 500;
    return t < 300;
  };

  const calculateZLimit = (mode: ImpedanciaType, device: ImpedanciaDevice, rcdSense: string) => {
    if (mode === ImpedanciaType.LINEA) {
      const factor = PROTECTION_CURVES[Manufacturer.GENERIC][device.lineCurve];
      return 230 / (parseFloat(device.lineAmps) * factor);
    } else {
      const ul = impedancia.isHumid ? 24 : 50;
      return ul / (parseFloat(rcdSense) / 1000);
    }
  };

  const handleSaveSignature = (sig: string) => {
    setSignature(sig);
    setShowSignaturePad(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" onClick={onClose} />
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-lg bg-slate-100 text-slate-900 rounded-[2rem] border border-white/20 shadow-2xl relative z-10 flex flex-col max-h-[95vh] overflow-hidden">
        
        {/* Header Modal (No se imprime) */}
        <div className="p-4 bg-slate-200 border-b border-slate-300 flex justify-between items-center print:hidden">
          <h3 className="text-sm font-black italic uppercase tracking-widest text-slate-600">INFORME DE VERIFICACIÓN</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><X/></button>
        </div>
        
        {/* Cuerpo del Informe (Estilo Papel Grisáceo) */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10 bg-slate-100 print:bg-white print:p-0 no-scrollbar">
          
          {/* Cabecera Informe */}
          <div className="text-center border-b-2 border-slate-200 pb-6">
            <h4 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900">DANLUAN <span className="text-cyan-700">PRO</span></h4>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] mt-1">CERTIFICADO TÉCNICO DE VERIFICACIÓN</p>
            <div className="mt-4 flex justify-center gap-4 text-[9px] font-bold text-slate-600 uppercase">
               <span>FECHA: {new Date().toLocaleDateString()}</span>
               <span>|</span>
               <span>REF: {Math.random().toString(36).substring(7).toUpperCase()}</span>
            </div>
          </div>

          {/* 01. DIFERENCIALES */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 border-l-4 border-yellow-600 pl-3">
               <ShieldAlert className="text-yellow-600" size={16} />
               <h5 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">01. PROTECCIÓN DIFERENCIAL (RCD)</h5>
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm bg-white">
              <table className="w-full text-left text-[10px]">
                <thead>
                  <tr className="bg-slate-50 uppercase text-slate-500 font-black">
                    <th className="p-3">IDENTIFICACIÓN</th>
                    <th className="p-3">SENSIB.</th>
                    <th className="p-3">T. DISPARO</th>
                    <th className="p-3">ESTADO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rcds.map(d => (
                    <tr key={d.id}>
                      <td className="p-3 font-bold text-slate-700">{d.name}</td>
                      <td className="p-3 text-slate-500">{d.intensity}mA</td>
                      <td className="p-3 text-slate-900 font-medium">{d.results['x1'].time || '--'} ms</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${isRcdApto(d) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {isRcdApto(d) ? 'APTO' : 'FALLO'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 02. AISLAMIENTO */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 border-l-4 border-fuchsia-600 pl-3">
               <Flame className="text-fuchsia-600" size={16} />
               <h5 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">02. RESISTENCIA DE AISLAMIENTO</h5>
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm bg-white">
              <table className="w-full text-left text-[10px]">
                <thead>
                  <tr className="bg-slate-50 uppercase text-slate-500 font-black">
                    <th className="p-3">PUNTO DE MEDIDA</th>
                    <th className="p-3 text-center">TENSIÓN</th>
                    <th className="p-3 text-right">VALOR</th>
                    <th className="p-3 text-center">ESTADO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {aislamiento.length > 0 ? aislamiento.map(r => (
                    <tr key={r.id}>
                      <td className="p-3 font-bold text-slate-700">{r.point}</td>
                      <td className="p-3 text-center text-slate-500">{r.voltage}V</td>
                      <td className={`p-3 text-right font-black ${r.isValid ? 'text-green-600' : 'text-red-600'}`}>{r.value} {r.unit}</td>
                      <td className="p-3 text-center">
                        {r.isValid ? <CheckCircle size={12} className="text-green-500 mx-auto"/> : <XCircle size={12} className="text-red-500 mx-auto"/>}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-[9px] text-slate-400 font-black uppercase italic bg-slate-50/50">Sin medidas de aislamiento registradas</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* 03. IMPEDANCIAS */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 border-l-4 border-green-600 pl-3">
               <Orbit className="text-green-600" size={16} />
               <h5 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">03. IMPEDANCIAS DE BUCLE Y LÍNEA</h5>
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm bg-white">
              <table className="w-full text-left text-[10px]">
                <thead>
                  <tr className="bg-slate-50 uppercase text-slate-500 font-black">
                    <th className="p-3">CIRCUITO</th>
                    <th className="p-3">Z-LÍNEA (Ω)</th>
                    <th className="p-3">Z-BUCLE (Ω)</th>
                    <th className="p-3">RESULTADO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {impedancia.devices.map(d => {
                    const zLimit = calculateZLimit(ImpedanciaType.LINEA, d, rcds[0].intensity);
                    const lineVal = parseFloat(d.lineValue);
                    const lineOk = lineVal && lineVal <= zLimit;
                    
                    return (
                      <tr key={d.id}>
                        <td className="p-3 font-bold text-slate-700">{d.name} <span className="text-[8px] text-slate-400 font-normal">({d.lineAmps}A-{d.lineCurve})</span></td>
                        <td className="p-3 font-medium text-slate-900">{d.lineValue || '--'}</td>
                        <td className="p-3 font-medium text-slate-900">{d.bucleValue || '--'}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${lineOk ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                            {lineOk ? 'APTO' : (d.lineValue ? 'ALTA' : 'PEND.')}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* VALIDACIÓN TÉCNICA */}
          <section className="space-y-6 pt-10 border-t-2 border-slate-200">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <PenTool className="text-cyan-700" size={16} />
                   <h5 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">VALIDACIÓN DEL INSTALADOR</h5>
                </div>
                {!signature && (
                  <button 
                    onClick={() => setShowSignaturePad(true)} 
                    className="text-[9px] font-black text-white uppercase tracking-widest bg-cyan-700 px-4 py-2 rounded-xl shadow-lg active:scale-95 transition-all print:hidden"
                  >
                    FIRMAR AHORA
                  </button>
                )}
             </div>

             <div className="relative min-h-[140px] border-2 border-dashed border-slate-300 rounded-3xl flex flex-col items-center justify-center bg-white shadow-inner print:border-slate-300">
                {signature ? (
                  <div className="p-4 flex flex-col items-center">
                    <img src={signature} alt="Firma" className="h-24 object-contain contrast-125 drop-shadow-sm grayscale hover:grayscale-0 transition-all" />
                    <div className="mt-4 flex items-center gap-2">
                       <BadgeCheck size={14} className="text-cyan-700" />
                       <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">DOCUMENTO VALIDADO DIGITALMENTE</span>
                    </div>
                    <button onClick={() => setSignature(null)} className="absolute top-2 right-2 p-2 text-slate-300 hover:text-red-500 transition-all print:hidden">
                       <RotateCcw size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center opacity-40">
                    <Activity size={32} className="text-slate-300 mb-2" />
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic text-center px-16 leading-relaxed">
                      LA AUSENCIA DE FIRMA INDICA QUE EL INFORME ES UN BORRADOR PRELIMINAR DE CAMPO
                    </p>
                  </div>
                )}
             </div>
          </section>

          <footer className="pt-10 text-center border-t border-slate-200">
             <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.4em]">GENERADO MEDIANTE SISTEMA INTELIGENTE DANLUAN TOOL</p>
          </footer>
        </div>

        {/* Footer Acciones (No se imprime) */}
        <div className="p-6 bg-slate-200 border-t border-slate-300 grid grid-cols-3 gap-3 print:hidden">
          <button onClick={() => window.print()} className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-center hover:bg-black active:scale-90 transition-all shadow-xl">
             <Printer size={20}/>
          </button>
          <button className="bg-green-700 text-white p-4 rounded-2xl flex items-center justify-center hover:bg-green-800 active:scale-90 transition-all shadow-xl">
             <MessageCircle size={20}/>
          </button>
          <button onClick={onClose} className="bg-white text-slate-900 p-4 rounded-2xl font-black text-[10px] uppercase border border-slate-300 hover:bg-slate-50 transition-all">
             CERRAR
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showSignaturePad && (
          <SignaturePad 
            onSave={handleSaveSignature} 
            onClose={() => setShowSignaturePad(false)} 
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default VerificationSection;
