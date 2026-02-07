
import React from 'react';
import { AppSection } from '../types';
import { Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
  activeSection: AppSection;
  onSectionChange: (section: AppSection) => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeSection, 
  onSectionChange 
}) => {
  const isHome = activeSection === AppSection.HOME;

  return (
    <div className="min-h-screen flex flex-col text-slate-100 selection:bg-cyan-500/30">
      <header className="header-glass p-4 sticky top-0 z-[100] shadow-xl">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div 
              onClick={() => onSectionChange(AppSection.HOME)}
              className="flex items-center space-x-2 cursor-pointer group"
            >
              <div className="bg-gradient-to-br from-cyan-400 to-cyan-600 p-2 rounded-xl text-slate-950 font-black text-[10px] shadow-lg border border-white/20">DL</div>
              <h1 className="text-sm font-black tracking-tighter italic uppercase text-white drop-shadow-sm">DANLUAN <span className="text-cyan-400">TOOL</span></h1>
            </div>

            <AnimatePresence>
              {!isHome && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  exit={{ opacity: 0, scale: 0.8 }} 
                  className="flex items-center ml-2 pl-2 border-l border-white/20"
                >
                  <button 
                    onClick={() => onSectionChange(AppSection.HOME)} 
                    className="p-2 rounded-xl bg-white/10 border border-white/10 text-slate-200 hover:text-cyan-400 hover:bg-white/20 transition-all active:scale-90"
                  >
                    <Home size={16} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="text-[7px] font-black text-cyan-400/80 uppercase tracking-widest hidden xs:block bg-cyan-400/5 px-2 py-1 rounded-full border border-cyan-400/10">PROFESSIONAL GRADE</div>
        </div>
      </header>

      <main className="flex-1 p-4 pb-12 relative max-w-md mx-auto w-full">
        {children}
      </main>

      <footer className="p-8 text-center footer-glass mt-auto shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-4 mb-2 opacity-40">
             <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
             <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
             <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
          </div>
          <p className="text-[9px] font-black text-slate-200 uppercase tracking-[0.5em]">DANLUAN CHECK TOOL v3.2.0</p>
          <p className="text-[7px] text-cyan-400/50 font-bold uppercase tracking-widest">CLEAN TECH INTERFACE</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
