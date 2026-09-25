import React from 'react';
import { Play, Sparkles, Gamepad2, Layers } from 'lucide-react';

interface StartScreenProps {
  onStart: (mode: '2D' | '3D') => void;
  selectedMode: '2D' | '3D';
  onSelectMode: (mode: '2D' | '3D') => void;
  highScore: number;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  onStart,
  selectedMode,
  onSelectMode,
  highScore,
}) => {
  return (
    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 z-40 text-white">
      {/* Background Animated Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-25">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500 rounded-full blur-[140px]" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-pink-500 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-xl w-full text-center flex flex-col items-center">
        {/* Event Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold tracking-widest uppercase mb-4 shadow-lg">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>IEEE GAMEATHON 2026 • CHAMPION EDITION</span>
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-2 uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-400 to-amber-300 drop-shadow-sm">
          NEXUS SURGE
        </h1>
        <p className="text-slate-400 text-sm md:text-base max-w-md mb-8">
          A high-octane cybernetic survival engine. Real-time physics, procedural sound, and dynamic particles.
        </p>

        {/* Mode Selector */}
        <div className="grid grid-cols-2 gap-4 w-full mb-8">
          <button
            onClick={() => onSelectMode('2D')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
              selectedMode === '2D'
                ? 'bg-cyan-950/60 border-cyan-400 shadow-xl box-glow-cyan'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Gamepad2 className={`w-6 h-6 ${selectedMode === '2D' ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 uppercase font-bold">
                120 FPS
              </span>
            </div>
            <div className="font-black text-lg text-white mb-0.5">2D Vector Arena</div>
            <div className="text-xs text-slate-400">
              Neon particle engine, trauma screen shake, bullet hell swarm physics.
            </div>
          </button>

          <button
            onClick={() => onSelectMode('3D')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
              selectedMode === '3D'
                ? 'bg-purple-950/60 border-purple-400 shadow-xl box-glow-magenta'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Layers className={`w-6 h-6 ${selectedMode === '3D' ? 'text-purple-400' : 'text-slate-400'}`} />
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 uppercase font-bold">
                WebGL 3D
              </span>
            </div>
            <div className="font-black text-lg text-white mb-0.5">3D Cyber Simulator</div>
            <div className="text-xs text-slate-400">
              Three.js PBR lighting, dynamic camera, procedural 3D obstacles and physics.
            </div>
          </button>
        </div>

        {/* Start Button */}
        <button
          onClick={() => onStart(selectedMode)}
          className="w-full py-4 px-8 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:brightness-110 text-slate-950 font-black text-xl tracking-wider rounded-2xl shadow-xl hover:shadow-cyan-500/30 transition-all flex items-center justify-center gap-3 cursor-pointer group mb-6"
        >
          <Play className="w-6 h-6 fill-slate-950 transition-transform group-hover:scale-110" />
          START MISSION (SPACEBAR)
        </button>

        {/* Quick Controls Card */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-400 flex items-center justify-center gap-4 font-mono">
          <span><b className="text-cyan-400">WASD / ARROWS</b> Move</span>
          <span>•</span>
          <span><b className="text-cyan-400">SPACE / MOUSE</b> Shoot</span>
          <span>•</span>
          <span><b className="text-cyan-400">SHIFT</b> Dash</span>
          {highScore > 0 && (
            <>
              <span>•</span>
              <span className="text-amber-400">RECORD: {highScore}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
