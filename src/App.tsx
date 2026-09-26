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
    energy: 100,
    thermalStability: 100,
    ammo: 50,
    maxAmmo: 50,
    score: 0,
    wave: 1,
    hackProgress: 0,
    isTetherActive: false,
    rescuedScientists: 0,
    totalScientists: 2,
    titanHealth: 100,
    isTitanAllied: false,
    activeChassis: 'UNIT7',
    isShieldActive: false,
    bossActive: false,
    bossHp: 500,
    bossMaxHp: 500,
    bossAlert: null,
    scoutsEliminated: 0,
    totalScouts: 6,
    enforcersEliminated: 0,
    totalEnforcers: 2,
    activeBanner: null,
    activeWeapon: 'PULSE',
    sniperAllyRescued: false,
    sniperAllyHp: 350,
    sniperAllyMaxHp: 350,
    sniperAllyDancing: false,
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
          enemiesDefeated={stats.isTitanAllied ? 1 : 0}
          wave={stats.wave}
          isNewHigh={stats.score > highScore}
          onRestart={startGame}
        />
      )}

      {/* Victory Modal */}
      {gameState === 'VICTORY' && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6 z-50 text-white">
          <div className="bg-slate-900 border border-emerald-500/60 rounded-2xl max-w-lg w-full p-8 text-center shadow-2xl box-glow-emerald">
            <span className="inline-block px-4 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold tracking-widest uppercase mb-3 border border-emerald-500/40">
              MISSION ACCOMPLISHED
            </span>
            <h2 className="text-4xl font-black text-white tracking-wider mb-2 font-mono neon-glow-emerald">
              PROTOCOL RESTORED
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              All trapped scientists safely evacuated. MK-IV Titan neural bus hijacked.
              Apex Corrupted AI <span className="text-rose-400 font-bold">CORE-X DEFEATED</span>.
              Human Protection Protocol: <span className="text-emerald-400 font-bold">ONLINE</span>.
            </p>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 mb-6">
              <span className="text-xs uppercase text-slate-500 font-bold tracking-wider block mb-1">
                FINAL TACTICAL SCORE
              </span>
              <div className="text-5xl font-black text-cyan-400 font-mono tracking-wider neon-glow-cyan">
                {stats.score.toLocaleString()}
              </div>
            </div>

            <button
              onClick={startGame}
              className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:brightness-110 text-slate-950 font-black text-lg tracking-wider rounded-xl transition-all shadow-xl cursor-pointer"
            >
              PLAY AGAIN (SPACEBAR)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
