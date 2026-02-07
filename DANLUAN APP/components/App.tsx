
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import VerificationSection from './components/VerificationSection';
import ConduitCalculator from './components/ConduitCalculator';
import TroubleshootingSection from './components/TroubleshootingSection';
import AIChatbot from './components/AIChatbot';
import { AppSection, ImpedanciaType, Manufacturer, Project, RCDDevice, AislamientoResult, ImpedanciaState, Message } from './types';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, Ruler, Zap, Bot, ArrowRight, Plus, FolderOpen, Trash2, Calendar, User, UserPlus, AlertTriangle, ShieldCheck, ZapOff } from 'lucide-react';

const INITIAL_RCD: RCDDevice[] = [{ id: '1', name: 'RCD PRINCIPAL', intensity: '30', type: 'Tipo AC', results: { 'x0.5': { time: '', ma: '', didTrip: false, isTested: false }, 'x1': { time: '', ma: '', didTrip: true, isTested: false }, 'x5': { time: '', ma: '', didTrip: true, isTested: false }, 'AUTO': { time: '', ma: '', didTrip: true, isTested: false } } }];
const INITIAL_IMPEDANCIA: ImpedanciaState = { devices: [{ id: '1', name: 'PIA 1', lineValue: '', lineCurve: 'C', lineAmps: '16', manufacturer: Manufacturer.GENERIC }], bucleRa: '', bucleVc: '', isHumid: false };

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<AppSection>(AppSection.HOME);
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem('danluan_projects');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const [standaloneData, setStandaloneData] = useState<Omit<Project, 'id' | 'clientName' | 'date' | 'lastUpdate'>>(() => {
    try {
      const saved = localStorage.getItem('danluan_standalone');
      return saved ? JSON.parse(saved) : {
        rcdDevices: INITIAL_RCD,
        aislamientoHistory: [],
        impedanciaData: INITIAL_IMPEDANCIA,
        troubleshootingMessages: [],
        troubleshootingDescription: '',
        isTroubleshootingActive: false
      };
    } catch (e) {
      return {
        rcdDevices: INITIAL_RCD,
        aislamientoHistory: [],
        impedanciaData: INITIAL_IMPEDANCIA,
        troubleshootingMessages: [],
        troubleshootingDescription: '',
        isTroubleshootingActive: false
      };
    }
  });
  
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [impedanciaMode, setImpedanciaMode] = useState<ImpedanciaType>(ImpedanciaType.LINEA);

  useEffect(() => { localStorage.setItem('danluan_projects', JSON.stringify(projects)); }, [projects]);
  useEffect(() => { localStorage.setItem('danluan_standalone', JSON.stringify(standaloneData)); }, [standaloneData]);

  const activeProject = projects.find(p => p.id === activeProjectId) || null;

  const createProject = (name: string) => {
    const newProject: Project = {
      id: Date.now().toString(),
      clientName: name.toUpperCase(),
      date: new Date().toLocaleDateString(),
      lastUpdate: new Date().toLocaleString(),
      rcdDevices: INITIAL_RCD,
      aislamientoHistory: [],
      impedanciaData: INITIAL_IMPEDANCIA,
      troubleshootingMessages: [],
      troubleshootingDescription: '',
      isTroubleshootingActive: false
    };
    setProjects(prev => [newProject, ...prev]);
    setActiveProjectId(newProject.id);
    setActiveSection(AppSection.HOME);
  };

  const updateData = (updates: Partial<Project>) => {
    if (activeProjectId) {
      setProjects(prev => prev.map(p => 
        p.id === activeProjectId ? { ...p, ...updates, lastUpdate: new Date().toLocaleString() } : p
      ));
    } else {
      setStandaloneData(prev => ({ ...prev, ...updates }));
    }
  };

  const executeDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    setProjects(prev => prev.filter(p => p.id !== id));
    if (activeProjectId === id) setActiveProjectId(null);
    setConfirmDeleteId(null);
  };

  const menuItems = [
    { id: AppSection.VERIFICATIONS, label: 'Verificaciones Eléctricas', desc: 'RCD, Aislamiento, Impedancias', icon: <ClipboardList size={28} />, class: 'vibrant-glass-yellow' },
    { id: AppSection.TROUBLESHOOTING, label: 'Diagnóstico con IA', desc: 'Análisis de Averías Avanzado', icon: <Zap size={28} />, class: 'vibrant-glass-fuchsia' },
    { id: AppSection.CALCULATOR, label: 'Cálculo de Tubo', desc: 'Diámetro según REBT', icon: <Ruler size={28} />, class: 'vibrant-glass-cyan' },
    { id: AppSection.CHAT, label: 'Asistente Normativo', desc: 'Consultas REBT y BOE', icon: <Bot size={28} />, class: 'vibrant-glass-green' },
  ];

  const currentData = activeProject || standaloneData;

  const renderContent = () => {
    switch (activeSection) {
      case AppSection.HOME:
        return (
          <div className="space-y-6 animate-fadeIn px-2">
            <div className="text-center pt-2">
              <h2 className="text-5xl font-black italic text-white uppercase tracking-tighter leading-none">DANLUAN</h2>
              <div className="flex items-center justify-center gap-2 mt-2">
                  <div className="h-px w-8 bg-cyan-500/50"></div>
                  <p className="text-cyan-400 text-[10px] font-black uppercase tracking-[0.5em]">CHECK TOOL PRO</p>
                  <div className="h-px w-8 bg-cyan-500/50"></div>
              </div>
            </div>

            <div className={`frost-card border-l-4 rounded-3xl p-4 flex justify-between items-center transition-all ${activeProjectId ? 'border-l-cyan-500' : 'border-l-yellow-500 bg-yellow-500/5'}`}>
              <div className="flex items-center gap-4">
                 <div className={`w-10 h-10 border rounded-xl flex items-center justify-center shadow-lg transition-all ${activeProjectId ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400' : 'bg-yellow-500/20 border-yellow-500/30 text-yellow-500'}`}>
                    {activeProjectId ? <User size={20}/> : <ZapOff size={20} />}
                 </div>
                 <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">TRABAJO ACTUAL</p>
                    <h4 className="text-sm font-black text-white uppercase italic tracking-tight">
                      {activeProject?.clientName || 'HERRAMIENTA RÁPIDA'}
                    </h4>
                 </div>
              </div>
              <button onClick={() => setActiveSection(AppSection.PROJECTS)} className="p-2 bg-white/5 rounded-xl border border-white/10 text-slate-400 hover:text-cyan-400 transition-all">
                <FolderOpen size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 pb-12">
              {menuItems.map((item, idx) => (
                <motion.button 
                  key={item.id} 
                  initial={{ opacity: 0, y: 15 }} 
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }} 
                  onClick={() => setActiveSection(item.id)}
                  className={`neon-container ${item.class} w-full p-6 rounded-[2.5rem] flex items-center justify-between group active:scale-[0.98] transition-all border-2`}
                >
                  <div className="neon-glow-layer"></div>
                  <div className="flex items-center gap-5">
                    <div className="p-4 bg-slate-900/50 rounded-2xl border border-white/10 text-white shadow-xl">{item.icon}</div>
                    <div className="text-left">
                      <h3 className="text-lg font-black text-white uppercase italic tracking-tight leading-none mb-1">{item.label}</h3>
                      <p className="text-[9px] text-slate-200 font-bold uppercase tracking-widest opacity-70">{item.desc}</p>
                    </div>
                  </div>
                  <ArrowRight size={20} className="text-white/30 group-hover:text-white transition-all" />
                </motion.button>
              ))}
            </div>
          </div>
        );
      case AppSection.PROJECTS:
        return (
          <div className="space-y-6 animate-fadeIn px-2">
            <div className="text-center pt-2">
              <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter">PROYECTOS</h2>
              <p className="text-cyan-400 text-[10px] font-black uppercase tracking-[0.4em] mt-1 italic">SISTEMA DE ARCHIVOS</p>
            </div>

            <div className="frost-card rounded-[2.5rem] p-6 text-center border-2 border-white/10">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">AÑADIR NUEVO CLIENTE</p>
              <div className="flex gap-2">
                <input id="new-project-name" placeholder="CLIENTE..." className="flex-1 glass-input rounded-2xl px-4 py-3 text-sm text-white font-black outline-none placeholder:text-slate-600" />
                <button onClick={() => { const el = document.getElementById('new-project-name') as HTMLInputElement; if (el.value.trim()) { createProject(el.value); el.value = ''; } }} className="w-12 h-12 bg-cyan-600 text-white rounded-xl flex items-center justify-center active:scale-90 transition-all shadow-lg border border-white/10">
                  <Plus size={24} />
                </button>
              </div>
            </div>

            <div className="space-y-3 max-h-[50vh] overflow-y-auto no-scrollbar pr-1">
              {projects.map(p => (
                <div key={p.id} className="relative group flex items-center gap-3">
                  <button onClick={() => { setActiveProjectId(p.id); setActiveSection(AppSection.HOME); }} className={`flex-1 p-4 rounded-[2.2rem] border-2 flex items-center gap-4 text-left transition-all ${activeProjectId === p.id ? 'bg-cyan-600/20 border-cyan-400' : 'bg-white/5 border-white/10 hover:border-white/30'}`}>
                    <div className="p-3 bg-slate-800 rounded-xl text-slate-400"><FolderOpen size={18} /></div>
                    <div className="truncate flex-1">
                      <h3 className="text-sm font-black text-white uppercase italic truncate">{p.clientName}</h3>
                      <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">{p.date}</p>
                    </div>
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); if (confirmDeleteId === p.id) executeDelete(p.id, e); else setConfirmDeleteId(p.id); }} className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${confirmDeleteId === p.id ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-800 text-slate-500 hover:text-red-400'}`}>
                    {confirmDeleteId === p.id ? <AlertTriangle size={20} /> : <Trash2 size={20} />}
                  </button>
                </div>
              ))}
            </div>
            
            <button onClick={() => setActiveSection(AppSection.HOME)} className="w-full py-5 bg-white/5 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-white/10 hover:bg-white/10 transition-all mt-4">VOLVER AL MENÚ</button>
          </div>
        );
      case AppSection.VERIFICATIONS: 
        return (
          <VerificationSection 
            rcdDevices={currentData.rcdDevices} setRcdDevices={(val) => updateData({ rcdDevices: typeof val === 'function' ? (val as any)(currentData.rcdDevices) : val })} 
            aislamientoHistory={currentData.aislamientoHistory} setAislamientoHistory={(val) => updateData({ aislamientoHistory: typeof val === 'function' ? (val as any)(currentData.aislamientoHistory) : val })} 
            impedanciaData={currentData.impedanciaData} setImpedanciaData={(val) => updateData({ impedanciaData: typeof val === 'function' ? (val as any)(currentData.impedanciaData) : val })} 
            impedanciaMode={impedanciaMode} setImpedanciaMode={setImpedanciaMode} 
          />
        );
      case AppSection.CALCULATOR: return <ConduitCalculator />;
      case AppSection.TROUBLESHOOTING: 
        return (
          <TroubleshootingSection 
            sessionActive={currentData.isTroubleshootingActive} setSessionActive={(val) => updateData({ isTroubleshootingActive: val })}
            description={currentData.troubleshootingDescription} setDescription={(val) => updateData({ troubleshootingDescription: val })}
            messages={currentData.troubleshootingMessages} setMessages={(val) => updateData({ troubleshootingMessages: typeof val === 'function' ? (val as any)(currentData.troubleshootingMessages) : val })}
            onReset={() => updateData({ isTroubleshootingActive: false, troubleshootingDescription: '', troubleshootingMessages: [] })}
          />
        );
      case AppSection.CHAT: return <AIChatbot />;
      default: return null;
    }
  };

  return (
    <Layout activeSection={activeSection} onSectionChange={setActiveSection}>
      <div className="max-w-md mx-auto relative">{renderContent()}</div>
    </Layout>
  );
};

export default App;
