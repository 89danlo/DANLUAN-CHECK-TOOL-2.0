
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { askGemini } from '../services/geminiService';
import { Send, Bot, Cpu, BookOpen, Calculator, Info, ExternalLink } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: any[];
}

const AIChatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'NÚCLEO TÉCNICO ACTIVO. Puedo realizar búsquedas en Google para normativas actualizadas.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  // Fix: Added missing 'const' declaration for scrollRef
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || loading) return;

    const userMsg = textToSend.trim();
    if (!textOverride) setInput('');
    
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const response = await askGemini(userMsg);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.text, 
        sources: response.sources 
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error en la consulta.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] bg-slate-900/40 rounded-[2.5rem] shadow-2xl border-2 border-white/10 overflow-hidden animate-fadeIn max-w-md mx-auto relative">
      <div className="bg-slate-950 p-4 flex items-center justify-between border-b-2 border-cyan-500/20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-cyan-500/10 border border-cyan-500/30 rounded-xl flex items-center justify-center text-cyan-500">
            <Cpu size={22} className="animate-pulse" />
          </div>
          <div>
            <h3 className="text-white font-black text-xs uppercase tracking-widest italic">ASISTENTE <span className="text-cyan-500">TÉCNICO</span></h3>
            <span className="text-[8px] text-slate-500 font-black tracking-[0.2em] uppercase">CONSULTA REBT Y BOE</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {messages.map((msg, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={idx} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[90%] p-4 rounded-2xl shadow-lg border ${
              msg.role === 'user' 
                ? 'bg-slate-800 border-white/10 text-white rounded-br-none' 
                : 'bg-slate-950 border-cyan-500/20 text-slate-200 rounded-tl-none text-[13px]'
            }`}>
              <div className="leading-relaxed whitespace-pre-wrap">{msg.content}</div>
              
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/5 space-y-2">
                  <p className="text-[8px] font-black text-cyan-500 uppercase tracking-widest">Fuentes encontradas:</p>
                  {msg.sources.map((chunk: any, i: number) => (
                    chunk.web && (
                      <a key={i} href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[10px] text-slate-400 hover:text-cyan-400 transition-colors">
                        <ExternalLink size={10} />
                        <span className="truncate">{chunk.web.title || chunk.web.uri}</span>
                      </a>
                    )
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))}
        {loading && <div className="p-4 bg-slate-950 border border-white/5 rounded-2xl text-[10px] text-cyan-500 font-black animate-pulse uppercase tracking-widest">Buscando información técnica...</div>}
        <div ref={scrollRef} />
      </div>

      <div className="p-4 bg-slate-950 border-t-2 border-white/5">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Consulta técnica o normativa..."
            className="flex-1 p-4 bg-slate-900 border-2 border-white/5 rounded-2xl focus:border-cyan-500/50 outline-none text-sm text-slate-200 transition-all"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="bg-cyan-600 text-white w-14 h-14 rounded-2xl flex items-center justify-center hover:bg-cyan-500 active:scale-90 transition-all"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChatbot;
