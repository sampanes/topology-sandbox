import { useEffect, useRef, useState } from 'react';
import packageJson from '../../package.json';
import { TopologyCanvas } from './TopologyCanvas';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<TopologyCanvas | null>(null);
  
  const [genus, setGenus] = useState(0);
  const [activeIslandCount, setActiveIslandCount] = useState(0);
  const [tool, setTool] = useState<'brush' | 'cut'>('brush');
  const [isMorphing, setIsMorphing] = useState(false);
  const version = `v${packageJson.version}`;

  // Initialize Engine
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new TopologyCanvas(canvasRef.current);
    engineRef.current = engine;

    engine.onGenusChange = (g: number, islands: number) => {
      setGenus(g);
      setActiveIslandCount(islands);
    };

    return () => {
      if (engineRef.current) {
        engineRef.current.destroy();
      }
    };
  }, []);

  // Sync tool change
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setTool(tool === 'brush' ? 'brush' : 'cutter');
    }
  }, [tool]);

  const simplifyTopologically = async () => {
    if (engineRef.current && !isMorphing) {
      setIsMorphing(true);
      await engineRef.current.simplify();
      setIsMorphing(false);
    }
  };

  const clearCanvas = () => {
    if (engineRef.current && !isMorphing) {
      engineRef.current.clear();
    }
  };

  return (
    <div className="relative w-full h-screen bg-[#05050a] overflow-hidden font-mono select-none text-slate-100">
      {/* Blueprint Grid Background */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(26,26,46,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(26,26,46,1) 1px, transparent 1px),
            linear-gradient(rgba(26,26,46,0.6) 2px, transparent 2px),
            linear-gradient(90deg, rgba(26,26,46,0.6) 2px, transparent 2px)
          `,
          backgroundSize: '20px 20px, 20px 20px, 100px 100px, 100px 100px',
        }} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#05050a]/40 to-[#05050a]" />
      </div>

      {/* Futuristic Technical Header */}
      <div className="absolute top-0 inset-x-0 z-20 p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#64daff]/10 bg-[#05050a]/80 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href="#"
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300 transition hover:border-[#64daff]/30 hover:text-[#64daff]"
            >
              All Projects
            </a>
            <div className="w-2 h-2 rounded-full bg-[#64daff] animate-ping" />
            <span className="text-xs uppercase tracking-[0.2em] text-[#64daff]">Topological Manifold Sandbox</span>
            <span className="rounded-full border border-[#64daff]/20 bg-[#64daff]/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#9ee7ff]">
              {version}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-100 mt-1">
            Volume Sculpting & Genus Count
          </h1>
        </div>

        {/* Real-time Statistics */}
        <div className="flex gap-4 sm:gap-6 bg-slate-900/50 p-3 rounded-xl border border-[#64daff]/10">
          <div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">Genus (Holes)</div>
            <div className="text-2xl font-bold tracking-tight text-[#64daff] tabular-nums flex items-baseline gap-1">
              {genus} <span className="text-xs text-slate-400 font-normal">g</span>
            </div>
          </div>
          <div className="w-px bg-slate-800" />
          <div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">Islands</div>
            <div className="text-2xl font-bold tracking-tight text-white tabular-nums">
              {activeIslandCount}
            </div>
          </div>
        </div>
      </div>

      {/* Canvas Frame */}
      <div className="absolute inset-0 pt-32 sm:pt-24 pb-28 sm:pb-24 px-4 sm:px-6">
        <div className="relative w-full h-full border border-[#64daff]/10 rounded-2xl bg-slate-950/40 shadow-2xl backdrop-blur-sm overflow-hidden">
          <canvas id="topo-canvas" ref={canvasRef} className="w-full h-full cursor-none block touch-none" />
        </div>
      </div>

      {/* Bottom Floating Control Bar */}
      <div className="absolute bottom-6 inset-x-0 z-20 px-4 flex justify-center">
        <div className="flex flex-wrap items-center justify-center gap-3 p-3 bg-slate-900/90 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-2xl max-w-xl">
          {/* Tool Selector */}
          <div className="flex bg-slate-950/50 p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setTool('brush')}
              disabled={isMorphing}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                tool === 'brush'
                  ? 'bg-[#64daff] text-slate-950 shadow-md shadow-[#64daff]/20'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/5 disabled:opacity-50'
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              Volume Brush
            </button>

            <button
              onClick={() => setTool('cut')}
              disabled={isMorphing}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                tool === 'cut'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/5 disabled:opacity-50'
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.4 14.4 20 20M14.4 9.6 20 4M10 12l-6-6M10 12l-6 6"/><circle cx="12" cy="12" r="2"/></svg>
              Surgery Cut
            </button>
          </div>

          <div className="w-px h-6 bg-slate-800 hidden sm:block" />

          {/* Morph Simplify */}
          <button
            onClick={simplifyTopologically}
            disabled={isMorphing || !activeIslandCount}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:brightness-110 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/10 border border-indigo-400/20 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isMorphing ? 'animate-spin' : ''}><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
            Simplify Morph
          </button>

          {/* Clear Button */}
          <button
            onClick={clearCanvas}
            disabled={isMorphing}
            className="p-2.5 bg-slate-950/40 text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 rounded-xl transition-all border border-slate-800 hover:border-rose-400/20 disabled:opacity-40"
            title="Clear manifold"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          </button>
        </div>
      </div>

      {/* Descriptive Instructions Banner */}
      <div className="absolute bottom-1 inset-x-0 text-center pointer-events-none">
        <span className="text-[10px] text-slate-500 tracking-wider">
          Cursor as a 2D Disk • Continuous Tube Accumulation • Boolean Union Operations
        </span>
      </div>
    </div>
  );
}
