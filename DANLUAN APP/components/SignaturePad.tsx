
import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eraser, Check, X } from 'lucide-react';

interface SignaturePadProps {
  onSave: (signature: string) => void;
  onClose: () => void;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ onSave, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Ajustar resolución del canvas para pantallas retina
    const ratio = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    ctx.scale(ratio, ratio);

    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#22d3ee'; // Cian Neón
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent | any) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      setIsDrawing(true);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const save = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      onSave(canvas.toDataURL('image/png'));
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl"
    >
      <div className="w-full max-w-sm bg-slate-900 border-2 border-cyan-500/30 rounded-[2.5rem] p-6 shadow-2xl space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="text-xs font-black text-cyan-400 uppercase tracking-[0.2em] italic">FIRMA DEL TÉCNICO</h4>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors"><X size={18} /></button>
        </div>
        
        <div className="relative bg-slate-950 rounded-3xl border border-white/5 overflow-hidden touch-none h-48 cursor-crosshair">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full h-full"
          />
          <div className="absolute inset-0 pointer-events-none border border-cyan-500/10 opacity-20 flex items-center justify-center">
             <span className="text-[10px] font-bold text-slate-800 uppercase tracking-[0.5em] select-none">ZONA DE FIRMA</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={clear}
            className="flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 text-slate-400 rounded-xl font-black text-[10px] uppercase transition-all"
          >
            <Eraser size={14} /> LIMPIAR
          </button>
          <button 
            onClick={save}
            className="flex items-center justify-center gap-2 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-black text-[10px] uppercase shadow-lg active:scale-95 transition-all"
          >
            <Check size={14} /> GUARDAR
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default SignaturePad;
