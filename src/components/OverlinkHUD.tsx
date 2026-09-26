import React from 'react';
import { Crosshair, Zap, ShieldAlert, Radio, Shield, Cpu, Skull, AlertTriangle, CheckCircle2, Flag } from 'lucide-react';
import type { OverlinkStats } from '../games/overlink/OverlinkGame3D';

interface OverlinkHUDProps {
  stats: OverlinkStats;
  godMode: boolean;
  onOpenJudgeModal?: () => void;
}

export const OverlinkHUD: React.FC<OverlinkHUDProps> = ({ stats, godMode, onOpenJudgeModal }) => {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (stats.thermalStability / 100) * circumference;

  return (
    <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between z-20 text-white font-sans select-none">
      {/* 1. TOP HEADER BAR */}
      <div className="flex justify-between items-start">
        {/* Top Left: Logo & Active Chassis */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-400 flex items-center justify-center shadow-lg box-glow-cyan">
            <Crosshair className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <div className="text-xs tracking-widest text-cyan-400 font-bold uppercase font-mono">
              CIRCUIT BREAKER:
            </div>
            <div className="text-2xl font-black tracking-wider text-white neon-glow-cyan font-mono">
              OVERLINK
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900/90 border border-slate-700 text-[10px] font-mono">
                <Cpu className="w-3 h-3 text-cyan-400" />
                <span className="text-slate-400">OPERATIVE:</span>
                <span className={stats.activeChassis === 'TITAN' ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                  {stats.activeChassis === 'TITAN' ? 'MK-IV TITAN (PILOTING)' : 'OPERATIVE MANUEL (KSR-29 AP SNIPER)'}
                </span>
              </div>
              {onOpenJudgeModal && (
                <button
                  onClick={onOpenJudgeModal}
                  className="pointer-events-auto inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950/80 hover:bg-amber-900/90 border border-amber-500/50 text-[10px] font-mono text-amber-300 font-bold cursor-pointer transition-colors shadow-lg"
                >
                  <span>🏆 JURY DECK [J]</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Top Center: Boss / Target Status */}
        <div className="flex flex-col items-center min-w-[360px]">
          {stats.bossActive ? (
            <>
              <div className="flex justify-between w-full text-xs font-mono font-bold px-1 mb-1">
                <span className="text-rose-400 flex items-center gap-1.5 animate-pulse">
                  <Skull className="w-4 h-4 text-rose-500" />
                  APEX THREAT: CORE-X TITAN SPIDER
                </span>
                <span className="text-rose-300 font-mono font-black">
                  {Math.max(0, stats.bossHp)} / {stats.bossMaxHp} HP
                </span>
              </div>

              {/* Boss HP Bar */}
              <div className="w-full bg-slate-950/90 border border-rose-500/60 h-3.5 rounded-full overflow-hidden p-0.5 backdrop-blur-md shadow-2xl">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-rose-600 via-red-500 to-amber-500 transition-all duration-150 relative shadow-[0_0_12px_#ff0033]"
                  style={{ width: `${Math.max(0, (stats.bossHp / stats.bossMaxHp) * 100)}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between w-full text-xs font-mono font-bold px-1 mb-1">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                  TARGET: MK-IV TITAN
                </span>
                <span className={stats.isTitanAllied ? 'text-emerald-400' : 'text-cyan-400'}>
                  {stats.activeChassis === 'TITAN'
                    ? 'EMBODIED // PILOTING MECH'
                    : stats.isTitanAllied
                    ? 'OVERRIDE COMPLETE // PRESS [E] TO EMBODY'
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
            </>
          )}
        </div>

        {/* Top Right: Interactive Tactical Mission Directives */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-cyan-500/40 p-3.5 rounded-xl shadow-2xl min-w-[280px] max-w-[320px]">
          <div className="flex justify-between items-center pb-1.5 border-b border-slate-800 mb-2">
            <span className="text-[10px] tracking-wider uppercase text-cyan-400 font-mono font-bold">
              {stats.wave === 1 ? 'MISSION PROTOCOL (PHASE 1)' : 'FINAL PROTOCOL (PHASE 2)'}
            </span>
            <span className="text-[11px] font-mono text-cyan-300 font-bold">
              SCORE: {stats.score.toLocaleString()}
            </span>
          </div>

          <div className="space-y-1.5 text-xs font-mono">
            {stats.wave === 1 ? (
              <>
                {/* 1. Neutralize Air Recon Scouts */}
                <div className={`flex items-center gap-2 ${stats.scoutsEliminated >= stats.totalScouts ? 'text-emerald-400 line-through' : 'text-amber-300 font-bold'}`}>
                  <span>{stats.scoutsEliminated >= stats.totalScouts ? '✓' : '1.'}</span>
                  <span>Clear Air Scouts [{stats.scoutsEliminated}/{stats.totalScouts}]</span>
                </div>

                {/* 2. Rescue Scientists */}
                <div className={`flex items-center gap-2 ${stats.rescuedScientists >= stats.totalScientists ? 'text-emerald-400 line-through' : stats.scoutsEliminated >= stats.totalScouts ? 'text-cyan-300 font-bold' : 'text-slate-400'}`}>
                  <span>{stats.rescuedScientists >= stats.totalScientists ? '✓' : '2.'}</span>
                  <span>Rescue Scientists [{stats.rescuedScientists}/{stats.totalScientists}]</span>
                </div>

                {/* 3. Neutralize 3D Heavy Combat Enforcers */}
                <div className={`flex items-center gap-2 ${stats.enforcersEliminated >= stats.totalEnforcers ? 'text-emerald-400 line-through' : (stats.rescuedScientists >= stats.totalScientists || stats.enforcersEliminated > 0) ? 'text-rose-400 font-bold animate-pulse' : 'text-slate-400'}`}>
                  <span>{stats.enforcersEliminated >= stats.totalEnforcers ? '✓' : '3.'}</span>
                  <span>Destroy 3D Enforcers [{stats.enforcersEliminated}/{stats.totalEnforcers}]</span>
                </div>

                {/* 4. Hack & Pilot MK-IV Titan */}
                <div className={`flex items-center gap-2 ${stats.activeChassis === 'TITAN' ? 'text-emerald-400 font-bold' : stats.isTitanAllied ? 'text-amber-300 animate-pulse font-bold' : 'text-cyan-400'}`}>
                  <span>{stats.isTitanAllied ? '✓' : '4.'}</span>
                  <span>{stats.activeChassis === 'TITAN' ? 'Piloting MK-IV Titan!' : stats.isTitanAllied ? 'Titan Overridden! Press [E] to Pilot' : 'Hack MK-IV Titan (Hold RMB)'}</span>
                </div>
              </>
            ) : (
              <>
                <div className="text-emerald-400 flex items-center gap-2">
                  <span>✓</span>
                  <span>Sector Cleared & Fireteam Armed</span>
                </div>
                <div className="text-rose-400 font-bold flex items-center gap-2 animate-pulse">
                  <span>🚨</span>
                  <span>DESTROY APEX CORE-X TITAN SPIDER</span>
                </div>
                <div className="text-slate-400 text-[11px] pl-6">
                  {stats.activeChassis === 'TITAN' ? 'Use Hydraulic Slam Cannon (LMB) & Aegis Shield (Shift)' : 'Tip: Embody Titan Mech ([E]) or use AP Sniper ([Q])!'}
                </div>
              </>
            )}
          </div>


        </div>
      </div>

      {/* Center Dynamic Mission Banners & Alerts */}
      <div className="self-center flex flex-col items-center gap-3 my-auto pointer-events-none">
        {/* Dynamic Mission Progression Banner */}
        {stats.activeBanner && (
          <div className="flex flex-col items-center animate-bounce">
            <div
              className={`px-8 py-4 rounded-2xl backdrop-blur-xl border flex items-center gap-4 shadow-2xl transition-all duration-300 ${
                stats.activeBanner.type === 'SUCCESS'
                  ? 'bg-emerald-950/95 border-emerald-400 text-emerald-100 shadow-[0_0_40px_rgba(16,185,129,0.7)]'
                  : stats.activeBanner.type === 'ALERT'
                  ? 'bg-rose-950/95 border-rose-500 text-rose-100 shadow-[0_0_40px_rgba(244,63,94,0.7)]'
                  : 'bg-cyan-950/95 border-cyan-400 text-cyan-100 shadow-[0_0_40px_rgba(6,182,212,0.7)]'
              }`}
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-lg ${
                  stats.activeBanner.type === 'SUCCESS'
                    ? 'bg-emerald-500/25 text-emerald-300'
                    : stats.activeBanner.type === 'ALERT'
                    ? 'bg-rose-500/25 text-rose-300 animate-pulse'
                    : 'bg-cyan-500/25 text-cyan-300'
                }`}
              >
                {stats.activeBanner.type === 'SUCCESS' ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : stats.activeBanner.type === 'ALERT' ? (
                  <AlertTriangle className="w-6 h-6" />
                ) : (
                  <Flag className="w-6 h-6" />
                )}
              </div>
              <div>
                <div className="text-[11px] font-mono font-bold tracking-widest uppercase opacity-85">
                  {stats.activeBanner.title}
                </div>
                <div className="text-lg font-mono font-black tracking-wide">
                  {stats.activeBanner.subtitle}
                </div>
              </div>
            </div>
          </div>
        )}

        {godMode && (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/20 border border-amber-500/60 rounded-xl text-amber-300 text-xs font-mono font-bold animate-pulse shadow-lg backdrop-blur-md">
            <ShieldAlert className="w-4 h-4" />
            <span>JUDGE DEMO MODE ACTIVE (INVULNERABLE)</span>
          </div>
        )}
        {stats.bossAlert && (
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-xl bg-rose-950/90 border border-rose-500 text-rose-200 text-sm font-mono font-black animate-pulse shadow-2xl tracking-wider">
            <AlertTriangle className="w-5 h-5 text-rose-400 animate-bounce" />
            <span>{stats.bossAlert}</span>
          </div>
        )}
        {stats.isTitanAllied && stats.activeChassis === 'UNIT7' && !stats.bossActive && (
          <div className="px-4 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-400 text-cyan-300 text-xs font-mono font-bold animate-bounce shadow-lg">
            ⚡ TITAN OVERRIDDEN! GET CLOSE & PRESS [E] TO EMBODY!
          </div>
        )}
      </div>

      {/* 2. BOTTOM CONTROL & STATS DOCK */}
      <div className="flex justify-between items-end gap-4">
        {/* Bottom Left: Health, Energy & Abilities */}
        <div className="flex flex-col gap-2 min-w-[260px]">
          <div className="text-lg font-black font-mono text-cyan-400 tracking-wider">
            {stats.activeChassis === 'TITAN' ? 'MK-IV TITAN' : 'OPERATIVE MANUEL'}
          </div>

          {/* Health Bar */}
          <div className="bg-slate-900/85 backdrop-blur-md border border-cyan-500/30 p-2 rounded-xl">
            <div className="flex justify-between text-[11px] font-mono text-slate-300 mb-1">
              <span>{stats.activeChassis === 'TITAN' ? 'ARMOR INTEGRITY' : 'HEALTH'}</span>
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
              ACTIVE LOADOUT:
            </span>
            {stats.activeChassis === 'TITAN' ? (
              <>
                <div className={`flex items-center gap-1.5 ${stats.isShieldActive ? 'text-cyan-300 font-bold' : 'text-slate-400'}`}>
                  <Shield className="w-3.5 h-3.5 text-cyan-400" />
                  <span>AEGIS RIOT SHIELD {stats.isShieldActive ? '(ACTIVE)' : '(HOLD SHIFT)'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-300">
                  <Zap className="w-3.5 h-3.5" />
                  <span>HYDRAULIC SLAM CANNON (LMB)</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
                    <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
                    <span>WEAPON [Q]: {stats.activeWeapon === 'SNIPER' ? 'KSR-29 AP SNIPER' : 'PULSE RIFLE'}</span>
                  </div>
                  <span className={`text-[10px] px-1 py-0.5 rounded font-mono ${stats.activeWeapon === 'SNIPER' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' : 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'}`}>
                    {stats.activeWeapon === 'SNIPER' ? '120 AP DMG' : '50 DMG'}
                  </span>
                </div>
                <div className={`flex items-center gap-1.5 ${stats.isTetherActive ? 'text-cyan-300 font-bold' : 'text-slate-400'}`}>
                  <Zap className={`w-3.5 h-3.5 ${stats.isTetherActive ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}`} />
                  <span>NEURAL TETHER {stats.isTetherActive ? '(ACTIVE)' : '(RMB / E)'}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Bottom Center: Quick Controls Cheat-Sheet & Tactical Radar */}
        <div className="flex flex-col items-center gap-2">
          {/* Quick Controls Cheat-Sheet */}
          <div className="flex items-center gap-2 bg-slate-950/85 backdrop-blur-md border border-cyan-500/40 px-4 py-1.5 rounded-xl text-[10px] font-mono text-slate-300 shadow-xl">
            <div><span className="text-cyan-400 font-bold bg-slate-800 px-1 py-0.5 rounded">WASD</span> Move</div>
            <div><span className="text-cyan-400 font-bold bg-slate-800 px-1 py-0.5 rounded">LMB</span> Shoot</div>
            <div><span className="text-emerald-400 font-bold bg-slate-800 px-1 py-0.5 rounded">Q</span> Weapon</div>
            <div><span className="text-cyan-400 font-bold bg-slate-800 px-1 py-0.5 rounded">R</span> Reload</div>
            <div><span className="text-cyan-400 font-bold bg-slate-800 px-1 py-0.5 rounded">RMB</span> Hack</div>
            <div><span className="text-amber-400 font-bold bg-slate-800 px-1 py-0.5 rounded">E</span> Pilot Mech</div>
            <div><span className="text-emerald-400 font-bold bg-slate-800 px-1 py-0.5 rounded">T</span> Victory Dance</div>
            <div><span className="text-cyan-400 font-bold bg-slate-800 px-1 py-0.5 rounded">F</span> Fullscreen</div>
            <div><span className="text-cyan-400 font-bold bg-slate-800 px-1 py-0.5 rounded">Shift</span> Dash/Shield</div>
            <div><span className="text-amber-400 font-bold bg-slate-800 px-1 py-0.5 rounded">F1/G</span> God Mode</div>
            {onOpenJudgeModal && (
              <div>
                <button
                  onClick={onOpenJudgeModal}
                  className="pointer-events-auto text-amber-300 font-bold bg-amber-950/80 hover:bg-amber-900 border border-amber-500/50 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                >
                  J Jury Deck
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 bg-slate-900/85 backdrop-blur-md border border-cyan-500/40 px-6 py-2.5 rounded-2xl shadow-2xl">
            {/* Tactical Radar Simulation */}
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-mono tracking-widest text-slate-400 uppercase mb-1">
                TACTICAL RADAR
              </span>
              <div className="w-14 h-14 rounded-full border border-cyan-500/40 bg-slate-950/80 relative flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-transparent rounded-full animate-spin" />
                <div className="w-2 h-2 rounded-full bg-cyan-400 absolute" />
                {stats.bossActive ? (
                  <div className="w-3.5 h-3.5 rounded-full bg-rose-600 border border-white absolute -top-3 animate-ping shadow-[0_0_8px_#ff0033]" />
                ) : (
                  <div
                    className={`w-2.5 h-2.5 rounded-full absolute -top-2.5 ${
                      stats.isTitanAllied ? 'bg-emerald-400' : 'bg-rose-500 animate-ping'
                    }`}
                  />
                )}
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 absolute right-2 bottom-2" />
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute left-2 bottom-1" />
              </div>
            </div>

            <div className="h-10 w-px bg-slate-800" />

            {/* Ammo Counter with Reload Key Hint */}
            <div className="text-center font-mono">
              <span className="text-[10px] text-slate-400 block tracking-wider">AMMO [R]</span>
              <div className={`text-2xl font-black ${stats.ammo <= 10 ? 'text-amber-400 animate-pulse' : 'text-white'}`}>
                {stats.ammo}<span className="text-xs text-slate-500">/{stats.maxAmmo}</span>
              </div>
              {stats.ammo <= 10 && (
                <span className="text-[9px] text-amber-400 block font-bold tracking-tight">
                  RELOAD [R]
                </span>
              )}
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
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="stroke-slate-800"
                strokeWidth="6"
                fill="none"
              />
              <circle
                cx="48"
                cy="48"
                r={radius}
                className={`transition-all duration-300 ${
                  stats.thermalStability > 40
                    ? 'stroke-cyan-400'
                    : stats.thermalStability > 20
                    ? 'stroke-amber-400'
                    : 'stroke-rose-500 animate-pulse'
                }`}
                strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
              />
            </svg>

            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-black text-cyan-300 font-mono tracking-tight neon-glow-cyan">
                {stats.thermalStability}%
              </span>
              <span className={`text-[9px] font-mono tracking-wider ${
                stats.thermalStability > 40 ? 'text-emerald-400' : 'text-rose-400 font-bold'
              }`}>
                {stats.thermalStability > 40 ? '• STABLE' : '• OVERHEAT'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
