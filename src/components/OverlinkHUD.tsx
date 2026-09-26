// Exact Recreation of the Concept Art HUD for Circuit Breaker: Overlink
import React from 'react';
import { Crosshair, Zap, ShieldAlert, Radio } from 'lucide-react';
import type { OverlinkStats } from '../games/overlink/OverlinkGame3D';

interface OverlinkHUDProps {
  stats: OverlinkStats;
  godMode: boolean;
}

export const OverlinkHUD: React.FC<OverlinkHUDProps> = ({ stats, godMode }) => {
  // Circular gauge calculations for Thermal Stability
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (stats.thermalStability / 100) * circumference;

  return (
    <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between z-20 text-white font-sans select-none">
      {/* 1. TOP HEADER BAR */}
      <div className="flex justify-between items-start">
        {/* Top Left: Logo & Branding */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-400 flex items-center justify-center shadow-lg box-glow-cyan">
            <Crosshair className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <div className="text-xs tracking-widest text-cyan-400 font-bold uppercase">
              CIRCUIT BREAKER:
            </div>
            <div className="text-2xl font-black tracking-wider text-white neon-glow-cyan font-mono">
              OVERLINK
            </div>
          </div>
        </div>

        {/* Top Center: Boss / Target Status (MK-IV TITAN) */}
        <div className="flex flex-col items-center min-w-[340px]">
          <div className="flex justify-between w-full text-xs font-mono font-bold px-1 mb-1">
            <span className="text-slate-300 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
              TARGET: MK-IV TITAN
            </span>
            <span className={stats.isTitanAllied ? 'text-emerald-400' : 'text-cyan-400'}>
              {stats.isTitanAllied
                ? 'OVERRIDE COMPLETE // ALLIED'
                : stats.isTetherActive
                ? `HACK IN PROGRESS: ${stats.hackProgress}%`
                : 'HOLD RIGHT-CLICK TO HACK'}
            </span>
          </div>

          {/* Target Health & Hack Dual Bar */}
          <div className="w-full bg-slate-900/90 border border-slate-700 h-3 rounded-full overflow-hidden p-0.5 backdrop-blur-md shadow-xl">
            <div
              className={`h-full rounded-full transition-all duration-150 ${
                stats.isTitanAllied
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-400'
                  : stats.isTetherActive
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-500 animate-pulse'
                  : 'bg-gradient-to-r from-rose-600 to-amber-500'
              }`}
              style={{ width: `${stats.isTitanAllied ? 100 : Math.max(15, stats.titanHealth)}%` }}
            />
          </div>
        </div>

        {/* Top Right: Objective & Wave */}
        <div className="bg-slate-900/80 backdrop-blur-md border border-cyan-500/30 px-5 py-3 rounded-xl shadow-xl text-right min-w-[240px]">
          <div className="text-[10px] tracking-wider uppercase text-cyan-400 font-mono font-bold">
            WAVE {stats.wave}/3: RESCUE SCIENTISTS
          </div>
          <div className="text-sm font-black text-amber-300 font-mono mt-0.5">
            [IN PROGRESS: {stats.rescuedScientists}/{stats.totalScientists}]
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            SCORE: <span className="text-cyan-300 font-bold">{stats.score.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* God Mode Warning if enabled */}
      {godMode && (
        <div className="self-center inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/20 border border-amber-500/60 rounded-xl text-amber-300 text-xs font-mono font-bold animate-pulse shadow-lg backdrop-blur-md">
          <ShieldAlert className="w-4 h-4" />
          <span>JUDGE DEMO MODE ACTIVE (INVULNERABLE)</span>
        </div>
      )}

      {/* 2. BOTTOM CONTROL & STATS DOCK */}
      <div className="flex justify-between items-end">
        {/* Bottom Left: Unit-7 Health, Energy & Abilities */}
        <div className="flex flex-col gap-2 min-w-[260px]">
          <div className="text-lg font-black font-mono text-cyan-400 tracking-wider">
            Unit-7
          </div>

          {/* Health Bar */}
          <div className="bg-slate-900/85 backdrop-blur-md border border-cyan-500/30 p-2 rounded-xl">
            <div className="flex justify-between text-[11px] font-mono text-slate-300 mb-1">
              <span>HEALTH</span>
              <span className="font-bold">{stats.health}/100</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 rounded-full transition-all duration-150"
                style={{ width: `${stats.health}%` }}
              />
            </div>
          </div>

          {/* Energy Bar */}
          <div className="bg-slate-900/85 backdrop-blur-md border border-cyan-500/30 p-2 rounded-xl">
            <div className="flex justify-between text-[11px] font-mono text-slate-300 mb-1">
              <span>ENERGY</span>
              <span className="font-bold">{stats.energy}/100</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-150"
                style={{ width: `${stats.energy}%` }}
              />
            </div>
          </div>

          {/* Abilities Panel */}
          <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-xl font-mono text-xs text-slate-300 flex flex-col gap-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              ABILITIES:
            </span>
            <div className={`flex items-center gap-1.5 ${stats.isTetherActive ? 'text-cyan-300 font-bold' : 'text-slate-400'}`}>
              <Zap className={`w-3.5 h-3.5 ${stats.isTetherActive ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}`} />
              <span>NEURAL TETHER {stats.isTetherActive ? '(ACTIVE)' : '(RMB / E)'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <Crosshair className="w-3.5 h-3.5 text-slate-500" />
              <span>EMP BLAST (LMB / SPACE)</span>
            </div>
          </div>
        </div>

        {/* Bottom Center: Tactical Radar & Ammo */}
        <div className="flex items-center gap-4 bg-slate-900/85 backdrop-blur-md border border-cyan-500/40 px-6 py-3 rounded-2xl shadow-2xl">
          {/* Tactical Radar Simulation */}
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-mono tracking-widest text-slate-400 uppercase mb-1">
              TACTICAL MAP
            </span>
            <div className="w-16 h-16 rounded-full border border-cyan-500/40 bg-slate-950/80 relative flex items-center justify-center overflow-hidden">
              {/* Radar sweep line */}
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-transparent rounded-full animate-spin" />
              {/* Center blip: Player (Unit-7) */}
              <div className="w-2 h-2 rounded-full bg-cyan-400 absolute" />
              {/* Target blip: Titan */}
              <div
                className={`w-2.5 h-2.5 rounded-full absolute -top-3 ${
                  stats.isTitanAllied ? 'bg-emerald-400' : 'bg-rose-500 animate-ping'
                }`}
              />
              {/* Scientists blips */}
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 absolute right-2 bottom-3" />
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 absolute left-2 top-4" />
            </div>
          </div>

          <div className="h-10 w-px bg-slate-800" />

          {/* Ammo Counter */}
          <div className="text-center font-mono">
            <span className="text-[10px] text-slate-400 block tracking-wider">AMMO</span>
            <div className="text-3xl font-black text-white">
              {stats.ammo}<span className="text-sm text-slate-500">/{stats.maxAmmo}</span>
            </div>
          </div>
        </div>

        {/* Bottom Right: Circular Thermal Stability Meter */}
        <div className="flex flex-col items-center bg-slate-900/85 backdrop-blur-md border border-cyan-500/40 p-4 rounded-2xl shadow-2xl min-w-[150px]">
          <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase mb-1">
            THERMAL STABILITY
          </span>

          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90">
              {/* Background circle */}
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="stroke-slate-800"
                strokeWidth="6"
                fill="none"
              />
              {/* Dynamic Progress circle */}
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="stroke-cyan-400 transition-all duration-300"
                strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
              />
            </svg>

            {/* Center Percentage Display */}
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-black text-cyan-300 font-mono tracking-tight neon-glow-cyan">
                {stats.thermalStability}%
              </span>
              <span className="text-[9px] font-mono text-emerald-400 tracking-wider">
                • STABLE
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
