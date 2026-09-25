import React from 'react';
import { Heart, Zap, Volume2, VolumeX, Award, ShieldAlert } from 'lucide-react';

interface HUDProps {
  score: number;
  highScore: number;
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  multiplier: number;
  wave: number;
  isMuted: boolean;
  godMode: boolean;
  gameMode: '2D' | '3D';
  onToggleMute: () => void;
  onSwitchMode: (mode: '2D' | '3D') => void;
}

export const HUD: React.FC<HUDProps> = ({
  score,
  highScore,
  health,
  maxHealth,
  energy,
  maxEnergy,
  multiplier,
  wave,
  isMuted,
  godMode,
  gameMode,
  onToggleMute,
  onSwitchMode,
}) => {
  const healthPercent = Math.max(0, Math.min(100, (health / maxHealth) * 100));
  const energyPercent = Math.max(0, Math.min(100, (energy / maxEnergy) * 100));

  return (
    <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between z-20">
      {/* Top Bar */}
      <div className="flex justify-between items-start">
        {/* Left: Health & Energy */}
        <div className="flex flex-col gap-2 min-w-[240px]">
          {/* Health Bar */}
          <div className="bg-slate-900/80 backdrop-blur-md border border-cyan-500/30 p-2.5 rounded-xl shadow-lg">
            <div className="flex justify-between items-center text-xs font-semibold mb-1 text-slate-300">
              <span className="flex items-center gap-1.5 text-rose-400">
                <Heart className="w-4 h-4 fill-rose-500 text-rose-500" /> VITALITY
              </span>
              <span>{Math.ceil(health)} / {maxHealth}</span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-200 ${
                  healthPercent > 50
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-400'
                    : healthPercent > 25
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                    : 'bg-gradient-to-r from-rose-600 to-red-500 animate-pulse'
                }`}
                style={{ width: `${healthPercent}%` }}
              />
            </div>
          </div>

          {/* Energy / Shield Bar */}
          <div className="bg-slate-900/80 backdrop-blur-md border border-cyan-500/30 p-2.5 rounded-xl shadow-lg">
            <div className="flex justify-between items-center text-xs font-semibold mb-1 text-slate-300">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <Zap className="w-4 h-4 fill-cyan-400 text-cyan-400" /> ENERGY SHIELD
              </span>
              <span>{Math.ceil(energy)}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-150"
                style={{ width: `${energyPercent}%` }}
              />
            </div>
          </div>

          {/* God Mode Warning (Secret debug indicator) */}
          {godMode && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-500/50 rounded-lg text-amber-300 text-xs font-mono font-bold animate-pulse">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>GOD MODE ACTIVE (INVULNERABLE)</span>
            </div>
          )}
        </div>

        {/* Center: Wave & Multiplier */}
        <div className="flex flex-col items-center">
          <div className="bg-slate-900/80 backdrop-blur-md border border-cyan-500/40 px-6 py-2 rounded-2xl flex items-center gap-4 shadow-xl">
            <div className="text-center">
              <span className="text-[10px] tracking-widest uppercase text-cyan-400 font-bold block">SECTOR WAVE</span>
              <span className="text-2xl font-black text-white font-mono">{wave}</span>
            </div>
            {multiplier > 1 && (
              <div className="px-3 py-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg text-white font-black text-xs animate-bounce shadow-md">
                {multiplier}x COMBO!
              </div>
            )}
          </div>
        </div>

        {/* Right: Score & Settings */}
        <div className="flex flex-col items-end gap-2 pointer-events-auto">
          {/* Score Box */}
          <div className="bg-slate-900/80 backdrop-blur-md border border-cyan-500/30 px-5 py-3 rounded-xl shadow-lg text-right min-w-[180px]">
            <span className="text-[10px] tracking-wider text-slate-400 uppercase font-semibold block">TOTAL SCORE</span>
            <span className="text-3xl font-black text-cyan-300 font-mono tracking-wider neon-glow-cyan">
              {score.toLocaleString()}
            </span>
            <div className="flex items-center justify-end gap-1 text-[11px] text-amber-400 mt-0.5">
              <Award className="w-3 h-3" /> BEST: {highScore.toLocaleString()}
            </div>
          </div>

          {/* Controls: Audio & Mode Toggle */}
          <div className="flex items-center gap-2">
            {/* Mode Switcher */}
            <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 p-1 rounded-xl flex gap-1">
              <button
                onClick={() => onSwitchMode('2D')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  gameMode === '2D'
                    ? 'bg-cyan-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                2D ARENA
              </button>
              <button
                onClick={() => onSwitchMode('3D')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  gameMode === '3D'
                    ? 'bg-purple-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                3D SIMULATOR
              </button>
            </div>

            {/* Mute Button */}
            <button
              onClick={onToggleMute}
              className="p-2 bg-slate-900/80 backdrop-blur-md border border-slate-700 hover:border-cyan-500 rounded-xl text-slate-300 hover:text-cyan-400 transition-colors shadow-lg"
              title="Toggle Audio (M)"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Hint */}
      <div className="flex justify-between items-end text-xs text-slate-400 font-mono">
        <div className="bg-slate-950/70 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-800">
          <span className="text-cyan-400 font-bold">WASD / ARROWS</span> Move • <span className="text-cyan-400 font-bold">SPACE / CLICK</span> Fire • <span className="text-cyan-400 font-bold">SHIFT</span> Dash
        </div>
        <div className="text-[11px] text-slate-500">
          IEEE GAMEATHON 2026 • ENGINE v2.0
        </div>
      </div>
    </div>
  );
};
