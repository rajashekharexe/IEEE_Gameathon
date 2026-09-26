// Game Over Screen for Circuit Breaker: Overlink
// Requirement 13:
// SYSTEM FAILURE
// HUMANS RESCUED: X/3
// SCORE: XXXX
// RETRY
import React, { useEffect } from 'react';
import { RotateCcw, AlertOctagon } from 'lucide-react';
import { sounds } from '../engine/audio';

interface GameOverModalProps {
  score: number;
  highScore: number;
  humansRescued: number;
  totalHumans: number;
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  humansRescued,
  totalHumans,
  onRestart,
}) => {
  useEffect(() => {
    sounds.playGameOver();
  }, []);

  return (
    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 z-50 font-mono select-none">
      <div className="bg-slate-900 border-2 border-rose-500/70 rounded-2xl max-w-md w-full p-8 text-center shadow-[0_0_50px_rgba(244,63,94,0.6)] animate-in fade-in zoom-in duration-300">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/60 flex items-center justify-center mx-auto mb-4 text-rose-400">
          <AlertOctagon className="w-8 h-8 text-rose-500" />
        </div>

        <h2 className="text-3xl font-black text-rose-500 tracking-wider mb-1 drop-shadow-[0_0_12px_#ff0033]">
          SYSTEM FAILURE
        </h2>
        <div className="text-xs text-slate-400 uppercase tracking-widest mb-6">
          OPERATIVE NEUTRALIZED // PROTOCOL ABORTED
        </div>

        {/* Stats Grid */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 mb-6 space-y-3">
          <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-2">
            <span className="text-slate-400">HUMANS RESCUED:</span>
            <span className="font-bold text-amber-300">
              {humansRescued} / {totalHumans}
            </span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400">SCORE:</span>
            <span className="text-2xl font-black text-cyan-400">
              {score.toLocaleString()}
            </span>
          </div>
        </div>

        {/* RETRY Button */}
        <button
          onClick={onRestart}
          className="w-full py-4 px-6 bg-gradient-to-r from-rose-600 hover:from-rose-500 to-red-600 text-white font-black text-base tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(244,63,94,0.5)] flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-5 h-5" />
          <span>RETRY</span>
        </button>
      </div>
    </div>
  );
};
