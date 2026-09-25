import React, { useState, useEffect, useCallback } from 'react';
import { HUD } from './components/HUD';
import { StartScreen } from './components/StartScreen';
import { GameOverModal } from './components/GameOverModal';
import { Game2D } from './games/Game2D';
import { Game3D } from './games/Game3D';
import { input } from './engine/input';
import { sounds } from './engine/audio';

type GameState = 'START' | 'PLAYING' | 'GAMEOVER';
type GameMode = '2D' | '3D';

export const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('START');
  const [gameMode, setGameMode] = useState<GameMode>('2D');
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    return parseInt(localStorage.getItem('ieee_gameathon_highscore') || '0', 10);
  });
  const [health, setHealth] = useState<number>(100);
  const [energy, setEnergy] = useState<number>(100);
  const [wave, setWave] = useState<number>(1);
  const [multiplier, setMultiplier] = useState<number>(1);
  const [enemiesDefeated, setEnemiesDefeated] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [godMode, setGodMode] = useState<boolean>(false);
  const [isNewHigh, setIsNewHigh] = useState<boolean>(false);

  // Initialize Input and Audio Engine
  useEffect(() => {
    input.init();

    // God mode callback
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyM') {
        const muted = sounds.toggleMute();
        setIsMuted(muted);
      }
      if (e.code === 'F1' || (e.code === 'KeyG' && !e.ctrlKey)) {
        setGodMode((prev) => !prev);
      }
      if (e.code === 'KeyF') {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      }
      if (e.code === 'Space' && (gameState === 'START' || gameState === 'GAMEOVER')) {
        startGame(gameMode);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      input.destroy();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameState, gameMode]);

  // Start / Restart Game
  const startGame = useCallback((mode: GameMode = gameMode) => {
    setGameMode(mode);
    setScore(0);
    setHealth(100);
    setEnergy(100);
    setWave(1);
    setMultiplier(1);
    setEnemiesDefeated(0);
    setIsNewHigh(false);
    setGameState('PLAYING');
    sounds.startBGM();
  }, [gameMode]);

  // Handle Game Over
  const handleGameOver = useCallback(() => {
    setGameState('GAMEOVER');
    sounds.stopBGM();

    setScore((finalScore) => {
      if (finalScore > highScore) {
        setHighScore(finalScore);
        setIsNewHigh(true);
        localStorage.setItem('ieee_gameathon_highscore', finalScore.toString());
      }
      return finalScore;
    });
  }, [highScore]);

  // Update Game Stats from 60 FPS loop
  const handleUpdateStats = useCallback(
    (stats: {
      score?: number;
      health?: number;
      energy?: number;
      wave?: number;
      multiplier?: number;
      enemiesDefeated?: number;
    }) => {
      if (stats.score !== undefined) setScore(stats.score);
      if (stats.health !== undefined) setHealth(stats.health);
      if (stats.energy !== undefined) setEnergy(stats.energy);
      if (stats.wave !== undefined) setWave(stats.wave);
      if (stats.multiplier !== undefined) setMultiplier(stats.multiplier);
      if (stats.enemiesDefeated !== undefined) setEnemiesDefeated(stats.enemiesDefeated);
    },
    []
  );

  const toggleMute = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* Scanline CRT Arcade Overlay */}
      <div className="absolute inset-0 scanlines z-30 pointer-events-none opacity-40" />

      {/* Active Game Canvas / Viewport */}
      {gameState === 'PLAYING' && (
        <>
          {gameMode === '2D' ? (
            <Game2D
              score={score}
              health={health}
              energy={energy}
              wave={wave}
              multiplier={multiplier}
              godMode={godMode}
              onUpdateStats={handleUpdateStats}
              onGameOver={handleGameOver}
            />
          ) : (
            <Game3D
              score={score}
              health={health}
              energy={energy}
              wave={wave}
              multiplier={multiplier}
              godMode={godMode}
              onUpdateStats={handleUpdateStats}
              onGameOver={handleGameOver}
            />
          )}

          {/* Dynamic In-Game HUD */}
          <HUD
            score={score}
            highScore={highScore}
            health={health}
            maxHealth={100}
            energy={energy}
            maxEnergy={100}
            multiplier={multiplier}
            wave={wave}
            isMuted={isMuted}
            godMode={godMode}
            gameMode={gameMode}
            onToggleMute={toggleMute}
            onSwitchMode={(mode) => setGameMode(mode)}
          />
        </>
      )}

      {/* Start Screen */}
      {gameState === 'START' && (
        <StartScreen
          onStart={startGame}
          selectedMode={gameMode}
          onSelectMode={setGameMode}
          highScore={highScore}
        />
      )}

      {/* Game Over Screen */}
      {gameState === 'GAMEOVER' && (
        <GameOverModal
          score={score}
          highScore={highScore}
          enemiesDefeated={enemiesDefeated}
          wave={wave}
          isNewHigh={isNewHigh}
          onRestart={() => startGame(gameMode)}
        />
      )}
    </div>
  );
};

export default App;
