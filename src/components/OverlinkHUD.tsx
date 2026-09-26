// Clean, Hackathon-Ready Cyberpunk HUD for Circuit Breaker: Overlink
// TOP LEFT: ❤️ HP, ⚡ EMP
// TOP CENTER: OBJECTIVE (or Boss Health Bar during Boss Fight)
// TOP RIGHT: SCORE, WAVE / LEVEL
// CENTER: [E] HACK ROBOT Prompt & HACKING ANIMATION (ROGUE -> HACKING -> ALLY)
// ALLY TIMER: ALLY: 08s
// CINEMATIC WARNING: ⚠ SYSTEM WARNING ⚠ UNKNOWN MACHINE DETECTED: CORE-X
import React from 'react';
import { Heart, Zap, Skull, AlertTriangle } from 'lucide-react';
import type { OverlinkStats } from '../games/overlink/OverlinkGame3D';

interface OverlinkHUDProps {
  stats: OverlinkStats;
  godMode: boolean;
  onOpenJudgeModal?: () => void;
}

export const OverlinkHUD: React.FC<OverlinkHUDProps> = ({ stats, godMode, onOpenJudgeModal }) => {
  return (
    <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between z-20 text-white font-mono select-none">
      {/* 1. TOP STATUS BAR */}
      <div className="flex justify-between items-start">
        {/* TOP LEFT: ❤️ HP & ⚡ EMP */}
        <div className="flex flex-col gap-2 min-w-[220px]">
          {/* Health Bar */}
          <div className="bg-slate-950/85 backdrop-blur-md border border-slate-800 p-2.5 rounded-xl shadow-xl">
            <div className="flex justify-between items-center text-xs mb-1 font-bold">
              <span className="flex items-center gap-1.5 text-rose-400">
                <Heart className="w-3.5 h-3.5 fill-rose-500" />
                HP
              </span>
              <span className="text-white tracking-wide">{Math.max(0, stats.health)}/100</span>
            </div>
            <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
              <div
                className={`h-full rounded-full transition-all duration-150 ${
                  stats.health > 50
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-400 shadow-[0_0_8px_#10b981]'
                    : stats.health > 25
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 shadow-[0_0_8px_#f59e0b]'
                    : 'bg-gradient-to-r from-rose-600 to-red-500 animate-pulse shadow-[0_0_10px_#ff0033]'
                }`}
                style={{ width: `${Math.max(0, Math.min(100, stats.health))}%` }}
              />
            </div>
          </div>

          {/* EMP Energy Bar */}
          <div className="bg-slate-950/85 backdrop-blur-md border border-slate-800 p-2.5 rounded-xl shadow-xl">
            <div className="flex justify-between items-center text-xs mb-1 font-bold">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <Zap className="w-3.5 h-3.5 fill-cyan-400" />
                EMP
              </span>
              <span className="text-cyan-300 tracking-wide">{Math.round(stats.energy)}/100</span>
            </div>
            <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-150 shadow-[0_0_8px_#00f0ff]"
                style={{ width: `${Math.max(0, Math.min(100, stats.energy))}%` }}
              />
            </div>
          </div>

          {godMode && (
            <div className="text-[10px] text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/50 w-fit">
              INVULNERABLE [GODMODE]
            </div>
          )}
        </div>

        {/* TOP CENTER: OBJECTIVE TRACKER OR BOSS HEALTH */}
        <div className="flex flex-col items-center min-w-[340px] max-w-md">
          {stats.bossActive ? (
            <div className="w-full bg-slate-950/90 backdrop-blur-md border border-rose-500/60 p-3 rounded-2xl shadow-2xl animate-in fade-in">
              <div className="flex justify-between items-center text-xs font-black tracking-wider mb-1 text-rose-400">
                <span className="flex items-center gap-1.5 animate-pulse">
                  <Skull className="w-4 h-4 text-rose-500" />
                  CORE-X // PHASE {stats.bossPhase}
                </span>
                <span className="text-rose-200">
                  {Math.max(0, stats.bossHp)} / {stats.bossMaxHp} HP
                </span>
              </div>
              <div className="w-full bg-slate-900 h-4 rounded-full overflow-hidden p-0.5 border border-rose-900 shadow-inner">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-rose-600 via-red-500 to-amber-500 transition-all duration-150 relative shadow-[0_0_12px_#ff0033]"
                  style={{ width: `${Math.max(0, (stats.bossHp / stats.bossMaxHp) * 100)}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
              </div>
              <div className="text-center text-[10px] text-rose-300/80 mt-1 font-bold uppercase tracking-widest">
                {stats.bossPhase === 1
                  ? 'ARTILLERY PROTOCOL — DODGE TWIN PLASMA'
                  : stats.bossPhase === 2
                  ? 'DROID SWARM ACTIVE — HACK ENEMY ATTACKERS'
                  : 'AEGIS SHIELD ENGAGED — FIRE WEAKPOINTS'}
              </div>
            </div>
          ) : (
            <div className="bg-slate-950/85 backdrop-blur-md border border-cyan-500/40 px-6 py-2.5 rounded-2xl shadow-2xl text-center">
              <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">
                CURRENT DIRECTIVE
              </div>
              <div className="text-base font-black text-white tracking-wide mt-0.5">
                {stats.objectiveText}
              </div>
            </div>
          )}

          {/* Floating Ally Lifetime Counter: ALLY: 08s */}
          {stats.activeAllyTimer !== null && stats.activeAllyTimer > 0 && (
            <div className="mt-2 px-4 py-1 rounded-full bg-emerald-950/90 border border-emerald-400 text-emerald-300 font-black text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.6)] animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>ALLY DRONE ACTIVE: {stats.activeAllyTimer.toFixed(1)}s</span>
            </div>
          )}
        </div>

        {/* TOP RIGHT: SCORE & LEVEL */}
        <div className="flex flex-col items-end gap-1.5 min-w-[200px]">
          <div className="bg-slate-950/85 backdrop-blur-md border border-slate-800 px-4 py-2 rounded-xl shadow-xl text-right">
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
              SCORE
            </div>
            <div className="text-2xl font-black text-cyan-400 tracking-wider">
              {stats.score.toLocaleString()}
            </div>
          </div>

          <div className="bg-slate-950/85 backdrop-blur-md border border-cyan-500/40 px-3.5 py-1.5 rounded-lg text-right shadow-lg">
            <div className="text-[10px] text-slate-400 uppercase font-bold">LEVEL {stats.wave}</div>
            <div className="text-xs font-black text-amber-300 tracking-wider">
              {stats.levelTitle}
            </div>
          </div>

          {onOpenJudgeModal && (
            <button
              onClick={onOpenJudgeModal}
              className="pointer-events-auto mt-1 px-3 py-1 bg-amber-950/80 hover:bg-amber-900 border border-amber-500/60 rounded-lg text-[10px] font-bold text-amber-300 cursor-pointer shadow-md transition-colors"
            >
              🏆 JURY DOSSIER [J]
            </button>
          )}
        </div>
      </div>

      {/* 2. CENTER INTERACTIVE HACKING PROMPT & ANIMATION */}
      <div className="flex flex-col items-center justify-center my-auto pointer-events-none">
        {/* Short Hacking Transition Animation: ROGUE ROBOT -> HACKING... -> ALLY ROBOT */}
        {stats.hackingAnimState === 'HACKING' && (
          <div className="bg-slate-950/95 border-2 border-cyan-400 rounded-2xl p-6 shadow-[0_0_40px_rgba(6,182,212,0.8)] flex flex-col items-center gap-3 animate-in zoom-in duration-200">
            <div className="text-xs text-rose-400 font-bold uppercase tracking-wider line-through">
              ROGUE ROBOT
            </div>
            <div className="text-sm text-cyan-400 font-black animate-pulse flex items-center gap-2">
              <Zap className="w-4 h-4 animate-spin text-cyan-300" />
              <span>OVERRIDING NEURAL BUS...</span>
            </div>
            <div className="text-xs text-emerald-400 font-bold uppercase tracking-widest">
              ↓ ALLIED UNIT
            </div>
          </div>
        )}

        {/* Action Prompt: [E] HACK ROBOT */}
        {stats.hackPromptTarget && stats.hackingAnimState === 'NONE' && (
          <div className="bg-slate-950/90 border border-cyan-400 px-6 py-3 rounded-2xl shadow-[0_0_25px_rgba(6,182,212,0.7)] flex flex-col items-center gap-1.5 animate-bounce">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-cyan-400 text-slate-950 font-black text-sm">
                E
              </span>
              <span className="text-sm font-black text-white tracking-wider">HACK ROBOT</span>
            </div>
            <div className="text-[10px] text-cyan-300 uppercase tracking-widest">
              OVERRIDE ROGUE DROID INTO ALLIED DEFENDER
            </div>
          </div>
        )}

        {/* Requirement 9: CINEMATIC CORE-X BOSS INTRO MODAL */}
        {stats.cinematicIntroActive && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center z-50 animate-in fade-in duration-500">
            <div className="bg-rose-950/90 border-2 border-rose-500 rounded-2xl p-8 max-w-md w-full text-center shadow-[0_0_60px_rgba(244,63,94,0.9)] space-y-4">
              <div className="flex items-center justify-center gap-2 text-rose-400 text-sm font-black tracking-widest animate-pulse">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                <span>⚠ SYSTEM WARNING ⚠</span>
                <AlertTriangle className="w-5 h-5 text-rose-500" />
              </div>

              <div className="text-xs text-slate-300 tracking-wider">UNKNOWN MACHINE DETECTED</div>

              <div className="text-5xl font-black text-white tracking-widest font-mono text-rose-500 drop-shadow-[0_0_20px_#ff0033]">
                CORE-X
              </div>

              <div className="text-sm font-black text-amber-400 tracking-widest uppercase">
                MEGA THREAT ANOMALY
              </div>

              <div className="h-0.5 bg-rose-500/50 w-full" />

              <div className="text-xs text-cyan-400 font-bold tracking-wider animate-pulse">
                OVERRIDE PROTOCOL INITIATED
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. BOTTOM CONTROLS HINT (SUBTLE & UNCLUTTERED) */}
      <div className="flex justify-between items-end text-[11px] text-slate-400">
        <div className="bg-slate-950/80 border border-slate-800 px-3.5 py-1.5 rounded-xl">
          <span className="text-slate-200 font-bold">[WASD]</span> Move &nbsp;|&nbsp;{' '}
          <span className="text-slate-200 font-bold">[SHIFT]</span> Sprint &nbsp;|&nbsp;{' '}
          <span className="text-slate-200 font-bold">[LMB]</span> Shoot &nbsp;|&nbsp;{' '}
          <span className="text-slate-200 font-bold">[E]</span> Hack
        </div>

        <div className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">
          RE:VOLT — HACKATHON EDITION
        </div>
      </div>
    </div>
  );
};
