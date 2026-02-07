
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PRIMARY_MODEL, generateBreakdownReport, getAI } from '../services/geminiService';
import { Message } from '../types';
import { 
  Zap, 
  Cpu, 
  Send, 
  RotateCcw, 
  Play,
  Activity,
  FileText,
  X,
  MessageCircle,
  Mail,
  HardHat,
  ArrowDownCircle,
  ClipboardCheck,
  RefreshCw
} from 'lucide-react';

interface TroubleshootingSectionProps {
  sessionActive: boolean;
  setSessionActive: (val: boolean) => void;
  description: string;
  setDescription: (val: string) => void;
  messages: Message[];
  setMessages: (val: Message[] | ((prev: Message[]) => Message[])) => void;
  onReset: () => void;
}

const TroubleshootingSection: React.FC<TroubleshootingSectionProps> = ({
  sessionActive,
  setSessionActive,
  description,
  setDescription,
  messages,
  setMessages,
  onReset
}) => {
  const [loading, setLoading] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportText, setReportText] = useState('');
  const [generatingReport, setGeneratingReport] = useState(false);
  const [currentInput, setCurrentInput] = useState('');
  
  const chatRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sessionActive && !chatRef.current) {
      const ai = getAI();
      chatRef.current = ai.chats.create({
        model: PRIMARY_MODEL,
        config: {
          systemInstruction: `Eres un Soporte Técnico Senior. REGLA DE ORO: GUÍA PASO A PASO. Pide una medida, recibe el dato y avanza.`,
          temperature: 0.3,
        },
      });
    }
  }, [sessionActive]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const initSession = async () => {
    if (!description.trim() || loading) return;
    setLoading(true);
    
    try {
      const ai = getAI();
      const newChat = ai.chats.create({
        model: PRIMARY_MODEL,
        config: {
          systemInstruction: `Eres un Soporte Técnico para Instaladores. REGLA DE ORO: GUÍA PASO A PASO. Pide una medida y avanza.`,
          temperature: 0.3,
        },
      });

      const response = await newChat.sendMessage({ message: `SOPORTE, avería reportada: ${description}. Guíame paso a paso.` });
      
      chatRef.current = newChat;
      setMessages([{ role: 'assistant', content: response.text }]);
      setSessionActive(true);
    } catch (error: any) {
      alert("Error de conexión con la IA.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!currentInput.trim() || loading) return;
    const text = currentInput;
    setCurrentInput('');
    setLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    
    try {
      if (!chatRef.current) {
          const ai = getAI();
          chatRef.current = ai.chats.create({ model: PRIMARY_MODEL, config: { temperature: 0.3 } });
          await chatRef.current.sendMessage({ message: `REANUDANDO DIAGNÓSTICO. Contexto previo: ${messages.map(m => m.content).join(' | ')}. Nueva medida: ${text}` });
          const response = await chatRef.current.sendMessage({ message: text });
          setMessages(prev => [...prev, { role: 'assistant', content: response.text }]);
      } else {
          const response = await chatRef.current.sendMessage({ message: text });
          setMessages(prev => [...prev, { role: 'assistant', content: response.text }]);
      }
    } catch (error: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: "⚠️ Error. Por favor, reintenta enviar la medida." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleFinishAndReport = async () => {
    if (messages.length < 2 || generatingReport) return;
    setGeneratingReport(true);
    try {
      const report = await generateBreakdownReport(messages);
      setReportText(report);
      setShowReport(true);
    } catch (error) {
      alert("Error al generar informe.");
    } finally {
      setGeneratingReport(false);
    }
  };

  const resetSession = () => {
    onReset();
    setCurrentInput('');
    chatRef.current = null;
  };

  if (!sessionActive) {
    return (
      <div className="space-y-6 max-w-md mx-auto animate-fadeIn px-2">
        <div className="text-center pt-4">
          <div className="inline-block p-4 bg-fuchsia-500/10 rounded-full border border-fuchsia-500/20 mb-4 shadow-xl">
            <HardHat className="text-fuchsia-400 w-8 h-8" />
          </div>
          <h2 className="text-3xl font-black italic text-white uppercase leading-none tracking-tighter">SOPORTE <span className="text-fuchsia-400 text-glow-fuchsia">IA</span></h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] mt-2 opacity-80">ASISTENTE DE DIAGNÓSTICO</p>
        </div>

        <div className="neon-container vibrant-glass-fuchsia p-6 rounded-[2.5rem] shadow-2xl space-y-6">
          <div className="neon-glow-layer shadow-[0_0_30px_rgba(232,121,249,0.3)]"></div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-300 uppercase ml-2 tracking-widest">SÍNTOMAS REPORTADOS</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe el fallo detectado..."
              className="w-full min-h-[140px] p-5 bg-slate-900/50 border border-white/10 rounded-[2rem] focus:border-fuchsia-500/50 transition-all outline-none text-sm font-medium text-slate-200 placeholder:text-slate-600"
            />
          </div>
          <button
            onClick={initSession}
            disabled={loading || !description.trim()}
            className="w-full py-5 rounded-[2rem] font-black text-xs uppercase bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all"
          >
            {loading ? <RotateCcw className="animate-spin w-5 h-5" /> : <><Play className="fill-current w-4 h-4" /> INICIAR ANÁLISIS</>}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] max-w-md mx-auto animate-fadeIn px-2 pb-4">
      <div className="bg-slate-900/90 p-4 rounded-t-[2.5rem] border border-white/10 flex items-center justify-between shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-fuchsia-600 rounded-2xl flex items-center justify-center text-white shadow-lg relative">
            <Cpu size={20} />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"></div>
          </div>
          <div>
            <h3 className="text-white font-black text-[10px] uppercase italic leading-none">ASISTENTE ACTIVO</h3>
            <span className="text-[8px] text-green-400 font-black uppercase tracking-tighter">DIAGNÓSTICO EN CURSO</span>
          </div>
        </div>
        <div className="flex gap-2">
           <button 
              onClick={handleFinishAndReport} 
              disabled={generatingReport} 
              className="flex items-center gap-2 px-3 py-2 bg-cyan-600/20 rounded-xl text-cyan-400 border border-cyan-500/20 hover:bg-cyan-600/30 transition-all shadow-sm"
           >
              {generatingReport ? <RotateCcw size={14} className="animate-spin" /> : <ClipboardCheck size={14} />}
              <span className="text-[9px] font-black uppercase">INFORME</span>
           </button>
           <button 
              onClick={resetSession} 
              className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-slate-300 hover:bg-red-600/20 hover:text-red-400 transition-all shadow-sm"
           >
              <RefreshCw size={14} />
              <span className="text-[9px] font-black uppercase">REINICIAR</span>
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-900/30 border-x border-white/10 p-4 space-y-4 no-scrollbar backdrop-blur-sm">
        {messages.map((msg, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={idx} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[90%] p-4 rounded-2xl shadow-xl border ${
              msg.role === 'user' 
                ? 'bg-fuchsia-600/30 border-fuchsia-500/30 text-white rounded-br-none' 
                : 'bg-slate-800/80 border-white/10 text-slate-100 rounded-tl-none'
            }`}>
              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[9px] font-black text-fuchsia-400 uppercase tracking-widest opacity-80">SOPORTE TÉCNICO:</span>
                  </div>
                )}
                {msg.content}
              </div>
            </div>
          </motion.div>
        ))}
        {loading && (
          <div className="flex justify-start">
             <div className="bg-slate-800/50 border border-white/10 p-3 rounded-xl text-[10px] text-fuchsia-400 font-black uppercase tracking-widest animate-pulse">ANALIZANDO...</div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="bg-slate-900/90 p-4 rounded-b-[2.5rem] border border-white/10 flex gap-2 shadow-2xl backdrop-blur-xl">
          <input 
            placeholder="Introduce medida o respuesta..."
            className="flex-1 bg-slate-800/50 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-500/30 transition-all placeholder:text-slate-600"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            disabled={loading}
          />
          <button 
            onClick={handleSendMessage} 
            disabled={loading || !currentInput.trim()}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-lg ${
              currentInput.trim() 
                ? 'bg-fuchsia-600 text-white hover:bg-fuchsia-500 active:scale-90' 
                : 'bg-slate-800 text-slate-600 opacity-50 cursor-not-allowed'
            }`}
          >
            <Send size={20} />
          </button>
      </div>

      <AnimatePresence>
        {showReport && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl" onClick={() => setShowReport(false)} />
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-sm bg-slate-800 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl relative z-10 flex flex-col">
                <div className="p-6 bg-white text-slate-900 overflow-y-auto max-h-[60vh] text-[13px] leading-relaxed whitespace-pre-wrap font-sans shadow-inner">
                  {reportText}
                </div>
                <div className="p-4 bg-slate-950 border-t border-white/10 grid grid-cols-2 gap-3">
                   <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(reportText)}`)} className="p-3 bg-green-600 hover:bg-green-500 text-white rounded-2xl flex items-center justify-center gap-2 font-black text-[10px] uppercase shadow-md active:scale-95 transition-all"><MessageCircle size={16}/> WA</button>
                   <button onClick={() => window.open(`mailto:?subject=Informe Eléctrico&body=${encodeURIComponent(reportText)}`)} className="p-3 bg-red-600 hover:bg-red-500 text-white rounded-2xl flex items-center justify-center gap-2 font-black text-[10px] uppercase shadow-md active:scale-95 transition-all"><Mail size={16}/> EMAIL</button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TroubleshootingSection;
