import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, Trophy, Target, Flame } from 'lucide-react';
import { sounds } from '../engine/audio';

interface GameOverModalProps {
  score: number;
  highScore: number;
  enemiesDefeated: number;
  wave: number;
  isNewHigh: boolean;
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  highScore,
  enemiesDefeated,
  wave,
  isNewHigh,
  onRestart,
}) => {
  useEffect(() => {
    sounds.playGameOver();

    if (isNewHigh) {
      // Trigger celebration confetti on new personal record
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#ec4899', '#f59e0b', '#10b981'],
      });
    }
  }, [isNewHigh]);

  return (
    <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-lg flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-cyan-500/50 rounded-2xl max-w-md w-full p-6 text-center shadow-2xl box-glow-cyan animate-in fade-in zoom-in duration-300">
        {/* Banner */}
        <div className="mb-4">
          {isNewHigh ? (
            <span className="inline-block px-4 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold tracking-widest uppercase mb-2 border border-amber-500/40 animate-pulse">
              🏆 NEW HIGHSCORE RECORD!
            </span>
          ) : (
            <span className="inline-block px-4 py-1 rounded-full bg-rose-500/20 text-rose-400 text-xs font-bold tracking-widest uppercase mb-2 border border-rose-500/40">
              MISSION TERMINATED
            </span>
          )}
          <h2 className="text-4xl font-black text-white tracking-wider">GAME OVER</h2>
        </div>

        {/* Score Display */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 mb-5">
          <span className="text-xs uppercase text-slate-400 font-semibold tracking-wider block mb-1">
            FINAL SCORE
          </span>
          <div className="text-5xl font-black text-cyan-400 font-mono tracking-wider neon-glow-cyan">
            {score.toLocaleString()}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5 mb-6 text-slate-300">
          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
            <Target className="w-5 h-5 text-rose-400 mx-auto mb-1" />
            <div className="text-xs text-slate-400">Threats Cleared</div>
            <div className="text-lg font-bold font-mono text-white">{enemiesDefeated}</div>
          </div>
          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
            <Flame className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <div className="text-xs text-slate-400">Sector Wave</div>
            <div className="text-lg font-bold font-mono text-white">{wave}</div>
          </div>
          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
            <Trophy className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
            <div className="text-xs text-slate-400">All-Time Best</div>
            <div className="text-lg font-bold font-mono text-white">{highScore.toLocaleString()}</div>
          </div>
        </div>

        {/* Actions */}
        <button
          onClick={onRestart}
          className="w-full py-4 px-6 bg-gradient-to-r from-cyan-500 hover:from-cyan-400 to-blue-600 hover:to-blue-500 text-slate-950 font-black text-lg tracking-wider rounded-xl transition-all shadow-lg hover:shadow-cyan-500/25 flex items-center justify-center gap-2 group cursor-pointer"
        >
          <RotateCcw className="w-5 h-5 transition-transform group-hover:-rotate-90" />
          PLAY AGAIN (SPACE)
        </button>
      </div>
    </div>
  );
};
