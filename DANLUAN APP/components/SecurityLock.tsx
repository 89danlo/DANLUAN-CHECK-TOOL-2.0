
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ShieldAlert, Cpu, Key, Fingerprint, Lock, Unlock, AlertCircle, Info } from 'lucide-react';

interface SecurityLockProps {
  onUnlock: () => void;
}

const SecurityLock: React.FC<SecurityLockProps> = ({ onUnlock }) => {
  const [installId, setInstallId] = useState('');
  const [licenseKey, setLicenseKey] = useState('');
  const [error, setError] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    // Generamos un ID único simulado para este dispositivo (En una APK real usaríamos el Android ID)
    let id = localStorage.getItem('danluan_install_id');
    if (!id) {
      id = 'DL-' + Math.random().toString(36).substring(2, 10).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
      localStorage.setItem('danluan_install_id', id);
    }
    setInstallId(id);
  }, []);

  const handleActivate = () => {
    setVerifying(true);
    setError(false);

    // LÓGICA DE VALIDACIÓN (Simulada para el ejemplo)
    // En producción, aquí harías un fetch a TU servidor enviando el installId y la licenseKey.
    // Tu servidor verificaría si esa key es válida y si ya está vinculada a otro installId.
    
    setTimeout(() => {
      // Clave de ejemplo para demostración: "DANLUAN-2025-PRO"
      if (licenseKey.toUpperCase() === 'DANLUAN-2025-PRO') {
        localStorage.setItem('danluan_activated', 'true');
        onUnlock();
      } else {
        setError(true);
        setVerifying(false);
      }
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[500] bg-slate-950 flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Fondo Tecnológico Animado */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-500/20 via-transparent to-transparent"></div>
        <div className="grid grid-cols-8 gap-4 p-4">
          {Array.from({ length: 64 }).map((_, i) => (
            <div key={i} className="h-8 border border-white/5 rounded-sm"></div>
          ))}
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10 space-y-8"
      >
        <div className="text-center space-y-2">
          <div className="inline-flex p-4 bg-cyan-500/10 rounded-3xl border border-cyan-500/30 mb-2 shadow-[0_0_30px_rgba(34,211,238,0.2)]">
            <Fingerprint size={48} className="text-cyan-400" />
          </div>
          <h1 className="text-4xl font-black italic text-white uppercase tracking-tighter">DANLUAN <span className="text-cyan-500">GATE</span></h1>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">SISTEMA DE ACTIVACIÓN PROFESIONAL</p>
        </div>

        <div className="vibrant-glass-cyan p-8 rounded-[3rem] border-2 border-cyan-500/20 shadow-2xl space-y-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">ID DE ESTE DISPOSITIVO</label>
              <div className="bg-slate-900 border border-white/10 p-4 rounded-2xl flex items-center justify-between group">
                <code className="text-[11px] font-mono text-cyan-500 font-bold">{installId}</code>
                <Cpu size={14} className="text-slate-700 group-hover:text-cyan-500 transition-colors" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">LICENCIA DE ACCESO</label>
              <div className="relative">
                <input 
                  type="text"
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  className={`w-full bg-slate-900 border-2 rounded-2xl p-4 text-center text-sm font-black text-white outline-none transition-all tracking-widest ${error ? 'border-red-500/50 text-red-400' : 'border-white/10 focus:border-cyan-500/40'}`}
                />
                <Key size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700" />
              </div>
              {error && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[9px] font-black text-red-500 uppercase text-center mt-2 tracking-widest flex items-center justify-center gap-1">
                  <ShieldAlert size={12} /> LICENCIA NO VÁLIDA O YA VINCULADA
                </motion.p>
              )}
            </div>
          </div>

          <button 
            onClick={handleActivate}
            disabled={verifying || !licenseKey}
            className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95 ${
              verifying ? 'bg-slate-800 text-slate-500' : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-900/20'
            }`}
          >
            {verifying ? (
              <><div className="w-4 h-4 border-2 border-slate-500 border-t-white rounded-full animate-spin"></div> VERIFICANDO...</>
            ) : (
              <><Lock size={16} /> ACTIVAR AHORA</>
            )}
          </button>
        </div>

        <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5 flex gap-3 items-center">
          <Info size={16} className="text-slate-600 shrink-0" />
          <p className="text-[8px] font-bold text-slate-500 uppercase leading-relaxed tracking-wider">
            AL ACTIVAR, ESTA LICENCIA QUEDARÁ VINCULADA A ESTE TERMINAL. PARA TRANSFERIRLA CONTACTE CON EL ADMINISTRADOR DE DANLUAN TOOL.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SecurityLock;
