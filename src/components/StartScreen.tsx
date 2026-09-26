// Start Screen for Circuit Breaker: Overlink
import React from 'react';
import { Play, Sparkles, Zap, Crosshair, Shield } from 'lucide-react';

interface StartScreenProps {
  onStart: (mode: '2D' | '3D') => void;
  selectedMode: '2D' | '3D';
  onSelectMode: (mode: '2D' | '3D') => void;
  highScore: number;
  onOpenJudgeModal?: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStart, highScore, onOpenJudgeModal }) => {
  return (
    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 z-40 text-white select-none">
      {/* Background Animated Gradient Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500 rounded-full blur-[140px]" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-rose-600 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-xl w-full text-center flex flex-col items-center">
        {/* IEEE Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold tracking-widest uppercase mb-3 shadow-lg">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>IEEE GAMEATHON 2026 • THEME: ROBOT REVOLT</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-1 uppercase font-mono text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-white drop-shadow-md">
          CIRCUIT BREAKER:
        </h1>
        <div className="text-3xl md:text-5xl font-black tracking-widest text-cyan-400 font-mono neon-glow-cyan mb-3">
          OVERLINK
        </div>

        {/* Narrative Tagline */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 max-w-lg mb-6 text-xs text-slate-300 leading-relaxed font-mono">
          <p className="text-amber-400 font-bold mb-1">
            "The robots were created to help humans... but something has gone wrong."
          </p>
          OmniCorp's central AI has turned the factory automatons into killers. As <b className="text-cyan-400">Unit-7</b>, project your <b className="text-cyan-400">Neural Tether</b> to hack rogue mechs from within, protect trapped human scientists, and restore the Prime Directive.
        </div>

        {/* Controls Guide */}
        <div className="grid grid-cols-3 gap-2.5 w-full mb-6 text-xs font-mono">
          <div className="bg-slate-900/80 border border-cyan-500/30 p-2.5 rounded-xl">
            <Crosshair className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
            <div className="text-slate-400 text-[10px]">MOVE & AIM</div>
            <div className="font-bold text-white">WASD + MOUSE</div>
          </div>
          <div className="bg-slate-900/80 border border-cyan-500/30 p-2.5 rounded-xl">
            <Zap className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
            <div className="text-slate-400 text-[10px]">NEURAL TETHER</div>
            <div className="font-bold text-cyan-300">RMB / KEY [E]</div>
          </div>
          <div className="bg-slate-900/80 border border-cyan-500/30 p-2.5 rounded-xl">
            <Shield className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
            <div className="text-slate-400 text-[10px]">EMP BLASTER</div>
            <div className="font-bold text-white">LMB / KEY [R]</div>
          </div>
        </div>

        {/* Action Buttons: Play + Judge Deck */}
        <div className="flex flex-col sm:flex-row gap-3 w-full mb-4">
          <button
            onClick={() => onStart('3D')}
            className="flex-1 py-4 px-6 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:brightness-110 text-slate-950 font-black text-lg tracking-wider rounded-2xl shadow-xl hover:shadow-cyan-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer group"
          >
            <Play className="w-5 h-5 fill-slate-950 transition-transform group-hover:scale-110" />
            INITIATE GAME (SPACE)
          </button>

          {onOpenJudgeModal && (
            <button
              onClick={onOpenJudgeModal}
              className="py-4 px-5 bg-slate-900/90 border border-amber-500/60 hover:border-amber-400 text-amber-300 font-bold font-mono text-xs tracking-wider rounded-2xl shadow-lg hover:bg-amber-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>🏆 JUDGE DEFENSE DECK [J]</span>
            </button>
          )}
        </div>

        {/* Bottom Hotkeys Legend */}
        <div className="text-[11px] text-slate-400 font-mono flex items-center justify-center gap-3">
          <span><b className="text-cyan-400">[F]</b> Fullscreen</span>
          <span>•</span>
          <span><b className="text-cyan-400">[M]</b> Audio Mute</span>
          {highScore > 0 && (
            <>
              <span>•</span>
              <span className="text-amber-400">BEST RECORD: {highScore}</span>
            </>
          )}
        </div>

        {/* IEEE Code Integrity & Attribution Badge */}
        <div className="text-[10px] text-slate-500 font-mono mt-3">
          Original Game Built On-Site for IEEE Gameathon • Powered by Three.js & Procedural Web Audio API
        </div>
      </div>
    </div>
  );
};
