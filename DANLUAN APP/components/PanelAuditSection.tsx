
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, ScanEye, RotateCcw, ShieldCheck, FileText, AlertTriangle, X, GitFork, Thermometer, Info } from 'lucide-react';
import { analyzePanelImage } from '../services/geminiService';

const PanelAuditSection: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [includeDiagram, setIncludeDiagram] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setImage(base64);
      const base64Data = base64.split(',')[1];
      startAnalysis(base64Data);
    };
    reader.readAsDataURL(file);
  };

  const startAnalysis = async (base64: string) => {
    setAnalyzing(true);
    setReport(null);
    try {
      const result = await analyzePanelImage(base64, includeDiagram);
      setReport(result);
    } catch (err) {
      setReport("Error crítico en el motor de análisis.");
    } finally {
      setAnalyzing(false);
    }
  };

  const reset = () => {
    setImage(null);
    setReport(null);
    setAnalyzing(false);
  };

  // Separar informe de esquema para renderizado especial
  const splitContent = (content: string) => {
    if (!content.includes('[ESQUEMA]')) return { report: content, diagram: null };
    const parts = content.split('[ESQUEMA]');
    return { report: parts[0], diagram: parts[1] };
  };

  const processedResult = report ? splitContent(report) : { report: null, diagram: null };

  return (
    <div className="space-y-6 max-w-md mx-auto animate-fadeIn px-2 pb-10">
      <div className="text-center pt-4">
        <div className="inline-block p-4 bg-cyan-500/10 rounded-full border border-cyan-500/20 mb-4 shadow-xl">
          <ScanEye className="text-cyan-400 w-8 h-8" />
        </div>
        <h2 className="text-3xl font-black italic text-white uppercase leading-none tracking-tighter">AUDITORÍA <span className="text-cyan-400">VISION+</span></h2>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] mt-2 opacity-80">IA TÉRMICA Y ESTRUCTURAL</p>
      </div>

      {!image ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="neon-container vibrant-glass-cyan p-10 rounded-[3rem] border-2 border-dashed border-cyan-500/30 flex flex-col items-center justify-center group cursor-pointer active:scale-95 transition-all shadow-2xl h-[300px]"
          >
            <div className="neon-glow-layer"></div>
            <div className="bg-slate-900/50 p-6 rounded-3xl mb-4 group-hover:scale-110 transition-transform border border-white/5">
              <Camera size={48} className="text-cyan-400" />
            </div>
            <p className="text-sm font-black text-white uppercase tracking-widest text-center">FOTO DEL CUADRO</p>
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleCapture} 
            />
          </div>

          <div className="bg-slate-950/50 p-4 rounded-3xl border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GitFork className={includeDiagram ? "text-cyan-400" : "text-slate-600"} size={20} />
              <div>
                <p className="text-[10px] font-black text-white uppercase leading-none">Generar Esquema Unifilar</p>
                <p className="text-[8px] text-slate-500 font-bold uppercase mt-1">Digitalización de topología</p>
              </div>
            </div>
            <button 
              onClick={() => setIncludeDiagram(!includeDiagram)}
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${includeDiagram ? 'bg-cyan-500' : 'bg-slate-800'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ${includeDiagram ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-6">
          <div className="relative rounded-[2.5rem] overflow-hidden border-2 border-cyan-500/50 shadow-2xl aspect-video bg-slate-900">
            <img src={image} className="w-full h-full object-cover" alt="Captured Panel" />
            
            {/* Capa de análisis visual térmico */}
            <AnimatePresence>
              {analyzing && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm flex flex-col items-center justify-center overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-cyan-400 shadow-[0_0_15px_#22d3ee] animate-scan-line"></div>
                  
                  {/* Animación de puntos de calor simulados */}
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute top-1/4 left-1/3 w-12 h-12 bg-red-500/30 rounded-full blur-xl"
                  ></motion.div>
                  <motion.div 
                    animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.5, 0.2] }}
                    transition={{ repeat: Infinity, duration: 1.5, delay: 0.5 }}
                    className="absolute bottom-1/3 right-1/4 w-16 h-16 bg-orange-500/30 rounded-full blur-xl"
                  ></motion.div>

                  <Thermometer className="animate-bounce text-cyan-400 w-10 h-10 mb-4" />
                  <p className="text-[10px] font-black text-white uppercase tracking-[0.3em] animate-pulse">ANALIZANDO FIRMA TÉRMICA...</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {processedResult.report && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="neon-container vibrant-glass-cyan p-6 rounded-[2.5rem] shadow-xl border-2 border-cyan-500/20">
                <div className="neon-glow-layer"></div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="text-cyan-400" size={18} />
                    <h3 className="text-sm font-black text-white uppercase italic">INFORME DE INSPECCIÓN VISION+</h3>
                  </div>
                  <button onClick={reset} className="p-2 bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors">
                    <X size={16} />
                  </button>
                </div>
                
                <div className="text-[12px] text-slate-200 leading-relaxed font-medium space-y-4 whitespace-pre-wrap max-h-[300px] overflow-y-auto no-scrollbar scroll-smooth">
                  {processedResult.report}
                </div>
              </div>

              {/* Renderizado especial del Esquema si existe */}
              {processedResult.diagram && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-slate-900/90 border-2 border-cyan-500/30 rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <GitFork size={80} className="text-cyan-500" />
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                    <h4 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em]">ESQUEMA UNIFILAR DIGITAL</h4>
                  </div>
                  <pre className="text-[11px] font-mono text-cyan-300 leading-tight overflow-x-auto no-scrollbar bg-slate-950/50 p-4 rounded-2xl border border-white/5">
                    {processedResult.diagram.trim()}
                  </pre>
                  <p className="text-[8px] text-slate-600 font-bold uppercase mt-3 text-center tracking-widest italic">TOPOLOGÍA DETECTADA POR MOTOR DE VISIÓN</p>
                </motion.div>
              )}

              <div className="flex gap-3">
                <button 
                  onClick={reset}
                  className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border border-white/10"
                >
                  NUEVO ESCANEO
                </button>
                <button 
                  onClick={() => window.print()}
                  className="flex-1 py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg"
                >
                  EXPORTAR PDF
                </button>
              </div>
            </motion.div>
          )}
        </div>
      )}

      <div className="bg-slate-900/50 p-4 rounded-3xl border border-white/5 flex gap-4 items-start shadow-inner">
        <div className="p-2 bg-amber-500/20 rounded-xl text-amber-500">
          <Info size={18} />
        </div>
        <p className="text-[9px] font-bold text-slate-400 uppercase leading-tight italic">
          LA IA DETECTA COMPONENTES Y POSIBLES PUNTOS DE CALOR BASÁNDOSE EN PATRONES VISUALES. NO SUSTITUYE EL USO DE CÁMARAS TERMOGRÁFICAS PROFESIONALES.
        </p>
      </div>

      <style>{`
        @keyframes scan-line {
          0% { top: 0; opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan-line {
          animation: scan-line 2s infinite linear;
        }
      `}</style>
    </div>
  );
};

export default PanelAuditSection;
