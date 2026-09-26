import React, { useState, useEffect, useCallback } from 'react';
import { OverlinkGame3D } from './games/overlink/OverlinkGame3D';
import type { OverlinkStats } from './games/overlink/OverlinkGame3D';
import { OverlinkHUD } from './components/OverlinkHUD';
import { StartScreen } from './components/StartScreen';
import { GameOverModal } from './components/GameOverModal';
import { JudgeDefenseModal } from './components/JudgeDefenseModal';
import { input } from './engine/input';
import { sounds } from './engine/audio';

type GameState = 'START' | 'PLAYING' | 'GAMEOVER' | 'VICTORY';

export const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('START');
  const [godMode, setGodMode] = useState<boolean>(false);
  const [showJudgeModal, setShowJudgeModal] = useState<boolean>(false);
  const [highScore, setHighScore] = useState<number>(() => {
    return parseInt(localStorage.getItem('circuit_breaker_highscore') || '0', 10);
  });

  const [stats, setStats] = useState<OverlinkStats>({
    health: 100,
    maxHealth: 100,
    energy: 100,
    maxEnergy: 100,
    thermalStability: 100,
    ammo: 50,
    maxAmmo: 50,
    score: 0,
    wave: 1,
    levelTitle: 'CITY BLOCK',
    objectiveText: 'RESCUE HUMANS: 0/3',
    hackProgress: 0,
    isTetherActive: false,
    rescuedScientists: 0,
    totalScientists: 3,
    generatorsDestroyed: 0,
    totalGenerators: 3,
    titanHealth: 100,
    isTitanAllied: false,
    activeChassis: 'UNIT7',
    isShieldActive: false,
    bossActive: false,
    bossHp: 1200,
    bossMaxHp: 1200,
    bossPhase: 1,
    bossAlert: null,
    scoutsEliminated: 0,
    totalScouts: 6,
    enforcersEliminated: 0,
    totalEnforcers: 3,
    activeBanner: null,
    activeWeapon: 'SNIPER',
    sniperAllyRescued: true,
    sniperAllyHp: 350,
    sniperAllyMaxHp: 350,
    sniperAllyDancing: false,
    hackPromptTarget: null,
    hackingAnimState: 'NONE',
    activeAllyTimer: null,
    cinematicIntroActive: false,
  });

  // Global key bindings
  useEffect(() => {
    input.init();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyM') {
        sounds.toggleMute();
      }
      if (e.code === 'F1' || (e.code === 'KeyG' && !e.ctrlKey)) {
        setGodMode((prev) => !prev);
      }
      if (e.code === 'KeyJ') {
        setShowJudgeModal((prev) => !prev);
      }
      if (e.code === 'KeyF') {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      }
      if (e.code === 'Space' && (gameState === 'START' || gameState === 'GAMEOVER' || gameState === 'VICTORY')) {
        startGame();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      input.destroy();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameState]);

  const startGame = useCallback(() => {
    setGameState('PLAYING');
    sounds.startBGM();
  }, []);

  const handleGameOver = useCallback(() => {
    setGameState('GAMEOVER');
    sounds.stopBGM();
  }, []);

  const handleVictory = useCallback(() => {
    setGameState('VICTORY');
    sounds.stopBGM();
    sounds.playPowerup();

    setStats((prev) => {
      if (prev.score > highScore) {
        setHighScore(prev.score);
        localStorage.setItem('circuit_breaker_highscore', prev.score.toString());
      }
      return prev;
    });
  }, [highScore]);

  const handleUpdateStats = useCallback((newStats: Partial<OverlinkStats>) => {
    setStats((prev) => ({ ...prev, ...newStats }));
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* Scanline CRT overlay */}
      <div className="absolute inset-0 scanlines z-30 pointer-events-none opacity-25" />

      {/* 3D Game World */}
      {gameState === 'PLAYING' && (
        <>
          <OverlinkGame3D
            godMode={godMode}
            onUpdateStats={handleUpdateStats}
            onGameOver={handleGameOver}
            onVictory={handleVictory}
          />
          <OverlinkHUD
            stats={stats}
            godMode={godMode}
            onOpenJudgeModal={() => setShowJudgeModal(true)}
          />
        </>
      )}

      {/* Start Screen */}
      {gameState === 'START' && (
        <StartScreen
          onStart={startGame}
          selectedMode="3D"
          onSelectMode={() => {}}
          highScore={highScore}
          onOpenJudgeModal={() => setShowJudgeModal(true)}
        />
      )}

      {/* Judge Defense & Evaluation Dossier Modal */}
      <JudgeDefenseModal
        isOpen={showJudgeModal}
        onClose={() => setShowJudgeModal(false)}
      />

      {/* Game Over Screen */}
      {gameState === 'GAMEOVER' && (
        <GameOverModal
          score={stats.score}
          highScore={highScore}
          humansRescued={stats.rescuedScientists}
          totalHumans={stats.totalScientists}
          onRestart={startGame}
        />
      )}

      {/* Requirement 12: Victory Modal */}
      {gameState === 'VICTORY' && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6 z-50 text-white font-mono select-none">
          <div className="bg-slate-900 border-2 border-emerald-500/70 rounded-2xl max-w-lg w-full p-8 text-center shadow-[0_0_50px_rgba(16,185,129,0.5)]">
            <span className="inline-block px-4 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold tracking-widest uppercase mb-3 border border-emerald-500/40">
              MISSION ACCOMPLISHED
            </span>
            <h2 className="text-4xl font-black text-emerald-400 tracking-wider mb-4 drop-shadow-[0_0_15px_#10b981]">
              PROTOCOL RESTORED
            </h2>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 mb-6 space-y-3 text-left">
              <div className="flex justify-between items-center text-sm border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">APEX THREAT:</span>
                <span className="text-rose-400 font-bold">CORE-X: OFFLINE</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">HUMANS RESCUED:</span>
                <span className="text-emerald-400 font-bold">{stats.rescuedScientists} / {stats.totalScientists}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">GLOBAL DIRECTIVE:</span>
                <span className="text-cyan-300 font-bold">HUMAN PROTECTION PROTOCOL: ONLINE</span>
              </div>
              <div className="flex justify-between items-center text-sm pt-1">
                <span className="text-slate-400 font-bold">FINAL SCORE:</span>
                <span className="text-2xl font-black text-cyan-400">{stats.score.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={startGame}
              className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:brightness-110 text-slate-950 font-black text-lg tracking-wider rounded-xl transition-all shadow-xl cursor-pointer"
            >
              PLAY AGAIN (SPACE)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
