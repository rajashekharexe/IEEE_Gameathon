// AAA Cyberpunk Landing Page & Game Portal for RE:VOLT: OVERRIDE PROTOCOL
// Matches the official IEEE Gameathon template with interactive gameplay instructions
import React, { useState } from 'react';
import {
  Play,
  Volume2,
  VolumeX,
  Gamepad2,
  BookOpen,
  Zap,
  Users,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Skull,
  Cpu,
  Layers,
  Waves,
  Eye,
  Award,
  Info,
  X,
  Radio,
  Target
} from 'lucide-react';
import { sounds } from '../engine/audio';

interface StartScreenProps {
  onStart: (mode: '2D' | '3D') => void;
  selectedMode: '2D' | '3D';
  onSelectMode: (mode: '2D' | '3D') => void;
  highScore: number;
  onOpenJudgeModal?: () => void;
}

type ActiveModal = 'NONE' | 'HOW_TO_PLAY' | 'STORY' | 'FEATURES' | 'CREDITS';

export const StartScreen: React.FC<StartScreenProps> = ({
  onStart,
  highScore,
  onOpenJudgeModal,
}) => {
  const [activeModal, setActiveModal] = useState<ActiveModal>('NONE');
  const [isMuted, setIsMuted] = useState<boolean>(() => sounds.getMuted());
  const [activeTab, setActiveTab] = useState<'CONTROLS' | 'OBJECTIVES' | 'TIPS'>('CONTROLS');

  const handleToggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      sounds.playPowerup();
    }
  };

  const handlePlayNow = () => {
    sounds.playPowerup();
    sounds.setBGMIntensity('normal');
    onStart('3D');
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-slate-950 text-slate-100 font-sans overflow-y-auto overflow-x-hidden selection:bg-cyan-500 selection:text-slate-950 z-40">
      {/* 1. HERO BACKGROUND VISUAL WITH AAA OVERLAYS */}
      <div className="absolute inset-0 min-h-[960px] pointer-events-none overflow-hidden">
        {/* Epic Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-85 scale-100 transition-transform duration-1000"
          style={{ backgroundImage: `url('/assets/landing_bg.jpg')` }}
        />
        {/* Cyberpunk Scanlines */}
        <div className="scanlines absolute inset-0 opacity-40" />

        {/* Dynamic Dark Gradient Overlays for High-Contrast Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/80" />

        {/* Glowing Atmosphere Blobs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-500/20 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-rose-600/20 rounded-full blur-[160px]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen max-w-7xl mx-auto px-6 py-4">
        {/* 2. TOP NAVIGATION BAR */}
        <header className="flex items-center justify-between py-3 border-b border-cyan-500/20 backdrop-blur-md sticky top-0 z-30">
          {/* Left: Brand Logo & IEEE Badge */}
          <div className="flex items-center gap-3">
            <div className="flex items-baseline gap-1 tracking-tighter">
              <span className="text-2xl font-black font-mono text-cyan-400 drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]">
                RE:
              </span>
              <span className="text-2xl font-black font-mono text-white tracking-widest">
                VOLT
              </span>
            </div>
            <div className="h-4 w-[1px] bg-slate-700 mx-1 hidden sm:block" />
            <span className="hidden sm:inline-block text-[11px] font-mono tracking-widest text-cyan-300/80 font-bold uppercase">
              IEEE GAMEATHON
            </span>
          </div>

          {/* Center: Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-mono tracking-wider">
            <button
              onClick={() => setActiveModal('NONE')}
              className="relative text-cyan-400 font-bold hover:text-cyan-300 transition-colors cursor-pointer py-1"
            >
              <span>Home</span>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
            </button>
            <button
              onClick={() => {
                setActiveModal('HOW_TO_PLAY');
                sounds.playShoot(440);
              }}
              className="text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer py-1"
            >
              How to Play
            </button>
            <button
              onClick={() => {
                setActiveModal('STORY');
                sounds.playShoot(440);
              }}
              className="text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer py-1"
            >
              About
            </button>
            <button
              onClick={() => {
                setActiveModal('FEATURES');
                sounds.playShoot(440);
              }}
              className="text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer py-1"
            >
              Features
            </button>
            <button
              onClick={() => {
                setActiveModal('CREDITS');
                sounds.playShoot(440);
              }}
              className="text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer py-1"
            >
              Credits
            </button>
          </nav>

          {/* Right: Sound Toggle + Start Game Pill Button */}
          <div className="flex items-center gap-3">
            {/* Audio Toggle */}
            <button
              onClick={handleToggleSound}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono font-bold transition-all cursor-pointer ${
                isMuted
                  ? 'border-slate-700 bg-slate-900/60 text-slate-500'
                  : 'border-cyan-500/40 bg-cyan-950/60 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
              }`}
              title="Toggle Audio [M]"
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>Sound OFF</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  <span>Sound ON</span>
                </>
              )}
            </button>

            {/* Quick Judge Deck [J] */}
            {onOpenJudgeModal && (
              <button
                onClick={onOpenJudgeModal}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-500/40 bg-amber-950/40 text-amber-300 hover:bg-amber-900/40 text-xs font-mono font-bold transition-all cursor-pointer"
              >
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Judge Deck [J]</span>
              </button>
            )}

            {/* Cyan Pill CTA: Start Game */}
            <button
              onClick={handlePlayNow}
              className="px-5 py-2 rounded-full bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black font-mono text-xs tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(6,182,212,0.6)] hover:shadow-[0_0_28px_rgba(6,182,212,0.9)] flex items-center gap-2 cursor-pointer group"
            >
              <span>Start Game</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </header>

        {/* 3. HERO SHOWCASE SECTION */}
        <section className="relative flex-1 flex flex-col justify-center pt-12 pb-8">
          <div className="max-w-2xl">
            {/* Tagline */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 text-[11px] font-mono font-bold tracking-widest uppercase mb-4 shadow-lg backdrop-blur-md">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>IEEE GAMEATHON 2026 • OFFICIAL SUBMISSION</span>
            </div>

            {/* Massive Distressed Neon Title */}
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black font-mono tracking-tighter uppercase leading-none mb-1">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-white drop-shadow-[0_0_25px_rgba(6,182,212,0.8)]">
                RE:VOLT
              </span>
            </h1>

            {/* Subtitle */}
            <div className="text-xl sm:text-2xl lg:text-3xl font-black font-mono tracking-[0.25em] text-slate-200 mb-6 drop-shadow-md">
              OVERRIDE PROTOCOL
            </div>

            {/* Narrative Lore */}
            <div className="text-sm sm:text-base text-slate-300 font-mono leading-relaxed mb-8 max-w-xl space-y-1.5 border-l-2 border-cyan-500/50 pl-4 py-1">
              <p className="text-cyan-200 font-semibold">
                The robots were created to help humans, but something has gone wrong.
              </p>
              <p className="text-slate-300">
                Now, they've turned against us in the automated foundry.
              </p>
              <p className="text-amber-400 font-bold tracking-wide">
                It's time to fight back.
              </p>
            </div>

            {/* Hero CTA Button: PLAY NOW (Large Cyan Angled Cyber Button) */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <button
                onClick={handlePlayNow}
                className="relative px-8 py-4 bg-gradient-to-r from-cyan-500 via-sky-500 to-teal-400 text-slate-950 font-black font-mono text-base tracking-widest uppercase rounded-2xl shadow-[0_0_35px_rgba(6,182,212,0.8)] hover:shadow-[0_0_50px_rgba(6,182,212,1.0)] hover:brightness-110 transition-all flex items-center gap-3 cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-xl bg-slate-950/20 flex items-center justify-center">
                  <Play className="w-4 h-4 fill-slate-950 transition-transform group-hover:scale-125" />
                </div>
                <span>PLAY NOW</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
              </button>

              {/* Secondary Buttons: HOW TO PLAY & GAME STORY */}
              <button
                onClick={() => {
                  setActiveModal('HOW_TO_PLAY');
                  sounds.playShoot(520);
                }}
                className="px-5 py-3.5 rounded-xl border border-cyan-500/40 bg-slate-900/80 hover:bg-slate-800 text-cyan-300 font-bold font-mono text-xs tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer shadow-lg hover:border-cyan-400 backdrop-blur-md"
              >
                <Gamepad2 className="w-4 h-4 text-cyan-400" />
                <span>HOW TO PLAY</span>
              </button>

              <button
                onClick={() => {
                  setActiveModal('STORY');
                  sounds.playShoot(520);
                }}
                className="px-5 py-3.5 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-300 font-bold font-mono text-xs tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer shadow-lg hover:border-slate-500 backdrop-blur-md"
              >
                <BookOpen className="w-4 h-4 text-slate-400" />
                <span>GAME STORY</span>
              </button>
            </div>

            {/* Highscore & Hotkeys Info */}
            <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
              {highScore > 0 && (
                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <Award className="w-3.5 h-3.5" />
                  <span>RECORD SCORE: {highScore.toLocaleString()} PTS</span>
                </div>
              )}
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">Spacebar to Start</span>
              <span>•</span>
              <span>Key [F] Fullscreen</span>
            </div>
          </div>

          {/* Right Floating Mega Boss Badge (Matching Image) */}
          <div className="absolute top-8 right-0 hidden lg:flex flex-col items-end pointer-events-none">
            <div className="px-4 py-1.5 rounded-lg bg-rose-950/80 border border-rose-500/70 text-rose-300 text-xs font-mono font-bold tracking-widest uppercase flex items-center gap-2 shadow-[0_0_20px_rgba(244,63,94,0.5)] backdrop-blur-md animate-pulse">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>CORE-X MEGA BOSS ///</span>
            </div>
            <div className="text-[11px] font-mono text-rose-400/80 mt-1 uppercase tracking-wider font-semibold">
              APEX THREAT LEVEL 5
            </div>
          </div>

          {/* Neon Graffiti Callout (Matching Image) */}
          <div className="absolute right-6 bottom-16 hidden lg:block pointer-events-none">
            <div className="text-xl font-bold italic tracking-wide text-cyan-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.9)] rotate-[-6deg] opacity-90 font-mono">
              "HUMANS DESERVE PROTECTION"
            </div>
          </div>

          {/* Scroll Down Indicator */}
          <div className="self-center mt-6 flex flex-col items-center gap-1 text-[11px] font-mono text-slate-400 animate-bounce">
            <div className="w-4 h-6 rounded-full border border-slate-500 flex items-start justify-center p-1">
              <div className="w-1 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            </div>
            <span className="tracking-widest uppercase text-[10px]">SCROLL DOWN</span>
          </div>
        </section>

        {/* 4. MISSION DIRECTIVES RIBBON (5 PILLARS FROM TEMPLATE) */}
        <section className="py-6 border-y border-cyan-500/20 bg-slate-950/70 backdrop-blur-md">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {/* 1. Rescue Humans */}
            <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-950/20 hover:border-amber-500/60 transition-all flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0 group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wide">
                  RESCUE HUMANS
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Save lives, prevent chaos.
                </div>
              </div>
            </div>

            {/* 2. Fight Rogue Robots */}
            <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-950/20 hover:border-rose-500/60 transition-all flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-300 shrink-0 group-hover:scale-110 transition-transform">
                <Skull className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-mono font-bold text-rose-300 uppercase tracking-wide">
                  FIGHT ROGUE ROBOTS
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Destroy the threat.
                </div>
              </div>
            </div>

            {/* 3. Hack Robots */}
            <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 hover:border-emerald-500/60 transition-all flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shrink-0 group-hover:scale-110 transition-transform">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-mono font-bold text-emerald-300 uppercase tracking-wide">
                  HACK ROBOTS
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Turn enemies into allies.
                </div>
              </div>
            </div>

            {/* 4. Destroy Generators */}
            <div className="p-3.5 rounded-xl border border-purple-500/30 bg-purple-950/20 hover:border-purple-500/60 transition-all flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0 group-hover:scale-110 transition-transform">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-mono font-bold text-purple-300 uppercase tracking-wide">
                  DESTROY GENERATORS
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Break their power.
                </div>
              </div>
            </div>

            {/* 5. Defeat Core-X */}
            <div className="p-3.5 rounded-xl border border-cyan-500/30 bg-cyan-950/20 hover:border-cyan-500/60 transition-all flex items-center gap-3 group col-span-2 sm:col-span-1">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0 group-hover:scale-110 transition-transform">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wide">
                  DEFEAT CORE-X
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Restore the protocol.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. LOWER BENTO-GRID SHOWCASE (MATCHING TEMPLATE) */}
        <section className="py-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card A: Game Features */}
          <div className="p-5 rounded-2xl border border-cyan-500/30 bg-slate-900/60 backdrop-blur-md flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono font-bold text-cyan-400 tracking-widest uppercase mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>GAME FEATURES</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="flex items-center gap-2 text-slate-200">
                  <Target className="w-3.5 h-3.5 text-cyan-400" />
                  <span>3D Action Combat</span>
                </div>
                <div className="flex items-center gap-2 text-slate-200">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Multiple Waves</span>
                </div>
                <div className="flex items-center gap-2 text-slate-200">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Neural Hacking</span>
                </div>
                <div className="flex items-center gap-2 text-slate-200">
                  <Waves className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Dynamic Audio API</span>
                </div>
                <div className="flex items-center gap-2 text-slate-200">
                  <Skull className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Apex Titan Boss</span>
                </div>
                <div className="flex items-center gap-2 text-slate-200">
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Three.js Visuals</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setActiveModal('FEATURES')}
              className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center justify-between cursor-pointer"
            >
              <span>Explore Mechanics</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card B: Watch Gameplay Preview */}
          <div
            onClick={handlePlayNow}
            className="p-5 rounded-2xl border border-cyan-500/40 bg-gradient-to-b from-slate-900/80 to-cyan-950/30 backdrop-blur-md flex flex-col items-center justify-center text-center cursor-pointer group hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all min-h-[160px] relative overflow-hidden"
          >
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />

            <div className="w-14 h-14 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.8)] group-hover:scale-115 transition-transform mb-3">
              <Play className="w-6 h-6 fill-slate-950 ml-0.5" />
            </div>
            <div className="text-xs font-mono font-black text-white tracking-widest uppercase group-hover:text-cyan-300 transition-colors">
              WATCH GAMEPLAY / DEPLOY
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-1">
              Click to launch live 3D deployment
            </div>
          </div>

          {/* Card C: Game Info */}
          <div className="p-5 rounded-2xl border border-cyan-500/30 bg-slate-900/60 backdrop-blur-md flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono font-bold text-cyan-400 tracking-widest uppercase mb-4 flex items-center gap-2">
                <Info className="w-4 h-4" />
                <span>GAME INFO</span>
              </div>
              <div className="space-y-2.5 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Platform:</span>
                  <span className="font-bold text-white">Web Browser (WebGL 2.0)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Built With:</span>
                  <span className="font-bold text-cyan-300">Three.js + React + TS</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Est. Playtime:</span>
                  <span className="font-bold text-emerald-400">5 – 8 Minutes per Run</span>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400">
              Zero plugins or downloads needed
            </div>
          </div>

          {/* Card D: Creed & Save Humanity */}
          <div className="p-5 rounded-2xl border border-cyan-400/40 bg-gradient-to-br from-cyan-950/50 via-slate-900 to-slate-950 backdrop-blur-md flex flex-col justify-between shadow-[0_0_20px_rgba(6,182,212,0.2)]">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono tracking-widest font-bold">
              <span>/// DIRECTIVE</span>
            </div>
            <div className="my-2">
              <div className="text-xs text-slate-300 font-mono">
                Small bots. Big dreams. One mission.
              </div>
              <div className="text-2xl font-black font-mono text-cyan-400 uppercase tracking-tight drop-shadow-[0_0_12px_rgba(6,182,212,0.8)] mt-1">
                Save humanity.
              </div>
            </div>
            <button
              onClick={handlePlayNow}
              className="w-full py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/60 rounded-xl text-cyan-300 font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Accept Directive</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>

        {/* 6. FOOTER */}
        <footer className="py-4 border-t border-slate-800 text-center text-xs font-mono text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Built for <b className="text-cyan-400">IEEE Gameathon 2026</b> • Theme: <b className="text-amber-400">Robot Revolt</b>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <button onClick={() => setActiveModal('HOW_TO_PLAY')} className="hover:text-cyan-300 cursor-pointer">
              Instructions
            </button>
            <span>•</span>
            <button onClick={() => setActiveModal('CREDITS')} className="hover:text-cyan-300 cursor-pointer">
              Attribution
            </button>
            <span>•</span>
            <span className="text-slate-400">v1.4 Production</span>
          </div>
        </footer>
      </div>

      {/* 7. INTERACTIVE HOW TO PLAY & INSTRUCTIONS MODAL */}
      {activeModal === 'HOW_TO_PLAY' && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/50 rounded-2xl max-w-3xl w-full p-6 shadow-[0_0_50px_rgba(6,182,212,0.4)] flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-cyan-500/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-400">
                  <Gamepad2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black font-mono text-white tracking-wide uppercase">
                    GAMEPLAY INSTRUCTIONS & TACTICAL MANUAL
                  </h3>
                  <div className="text-xs font-mono text-cyan-300">
                    MASTER THE OPERATIVE CONTROLS & NEURAL OVERLINK PROTOCOL
                  </div>
                </div>
              </div>
              <button
                onClick={() => setActiveModal('NONE')}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Sub-Tabs */}
            <div className="flex gap-2 my-4 border-b border-slate-800 pb-2">
              <button
                onClick={() => setActiveTab('CONTROLS')}
                className={`px-4 py-2 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'CONTROLS'
                    ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🎮 Keybinds & Controls
              </button>
              <button
                onClick={() => setActiveTab('OBJECTIVES')}
                className={`px-4 py-2 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'OBJECTIVES'
                    ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🎯 Mission Progression
              </button>
              <button
                onClick={() => setActiveTab('TIPS')}
                className={`px-4 py-2 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'TIPS'
                    ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ⚡ Combat Mastery Tips
              </button>
            </div>

            {/* Modal Tab Content */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              {activeTab === 'CONTROLS' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-3">
                    <div className="px-2.5 py-1.5 rounded-lg bg-cyan-950 border border-cyan-400 text-cyan-300 font-bold text-center min-w-[70px]">
                      W A S D
                    </div>
                    <div>
                      <div className="font-bold text-white uppercase">Movement & Strafe</div>
                      <div className="text-slate-400 text-[11px]">8-directional tactical mobility</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-3">
                    <div className="px-2.5 py-1.5 rounded-lg bg-cyan-950 border border-cyan-400 text-cyan-300 font-bold text-center min-w-[70px]">
                      MOUSE LMB
                    </div>
                    <div>
                      <div className="font-bold text-white uppercase">Aim & Fire</div>
                      <div className="text-slate-400 text-[11px]">Tactical emerald laser sight guidance</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-3">
                    <div className="px-2.5 py-1.5 rounded-lg bg-amber-950 border border-amber-400 text-amber-300 font-bold text-center min-w-[70px]">
                      HOLD RMB
                    </div>
                    <div>
                      <div className="font-bold text-amber-300 uppercase">Neural Tether</div>
                      <div className="text-slate-400 text-[11px]">Hack & embody the MK-IV Titan Mech</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-3">
                    <div className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-600 text-white font-bold text-center min-w-[70px]">
                      KEY [R]
                    </div>
                    <div>
                      <div className="font-bold text-white uppercase">Reload Ammo</div>
                      <div className="text-slate-400 text-[11px]">Replenish KSR-29 sniper magazine</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-3">
                    <div className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-600 text-white font-bold text-center min-w-[70px]">
                      KEY [Q]
                    </div>
                    <div>
                      <div className="font-bold text-white uppercase">Switch Weapon</div>
                      <div className="text-slate-400 text-[11px]">KSR-29 AP Sniper ⇋ Plasma Blaster</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-3">
                    <div className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-600 text-white font-bold text-center min-w-[70px]">
                      SHIFT
                    </div>
                    <div>
                      <div className="font-bold text-white uppercase">Dash / Shield</div>
                      <div className="text-slate-400 text-[11px]">Speed sprint (Manuel) or Aegis barrier (Titan)</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-3">
                    <div className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-600 text-white font-bold text-center min-w-[70px]">
                      KEY [T]
                    </div>
                    <div>
                      <div className="font-bold text-white uppercase">Victory Dance</div>
                      <div className="text-slate-400 text-[11px]">Celebratory victory animation</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-3">
                    <div className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-600 text-white font-bold text-center min-w-[70px]">
                      KEY [F]
                    </div>
                    <div>
                      <div className="font-bold text-white uppercase">Fullscreen</div>
                      <div className="text-slate-400 text-[11px]">Immersive full-screen display</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'OBJECTIVES' && (
                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3.5 rounded-xl border border-cyan-500/30 bg-slate-950/80 flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center shrink-0">
                      1
                    </div>
                    <div>
                      <div className="font-bold text-white uppercase text-sm">Phase 1: Clear Perimeter Defense</div>
                      <div className="text-slate-300 mt-1 leading-relaxed">
                        Destroy the 6 agile XR-4 Scout Droids and 2 Heavy Combat Enforcers roaming the foundry with your high-caliber KSR-29 AP Sniper Rifle.
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-amber-500/30 bg-slate-950/80 flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0">
                      2
                    </div>
                    <div>
                      <div className="font-bold text-amber-300 uppercase text-sm">Phase 2: Scientist Evacuation (+3,000 PTS)</div>
                      <div className="text-slate-300 mt-1 leading-relaxed">
                        Approach trapped research personnel in yellow hazmat suits. Once reached, they will follow your fireteam to the green holographic airlock zone.
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-slate-950/80 flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">
                      3
                    </div>
                    <div>
                      <div className="font-bold text-emerald-300 uppercase text-sm">Phase 3: Overlink & Titan Embodiment</div>
                      <div className="text-slate-300 mt-1 leading-relaxed">
                        Cast your Neural Tether (Hold RMB or Key [E]) at the giant MK-IV Titan Battle Mech to hack its neural core. Press [E] when close to embody the Titan and command its hydraulic slam cannons!
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-rose-500/30 bg-slate-950/80 flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 font-bold flex items-center justify-center shrink-0">
                      4
                    </div>
                    <div>
                      <div className="font-bold text-rose-300 uppercase text-sm">Phase 4: Apex Boss Encounter (CORE-X)</div>
                      <div className="text-slate-300 mt-1 leading-relaxed">
                        Upon personnel rescue, the catastrophic Core-X Spider Boss awakens. Deploy the Titan's Aegis Energy Shield (Shift) to deflect orbital plasma strikes and shatter its core!
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'TIPS' && (
                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                    <div className="text-cyan-400 font-bold uppercase mb-1">💡 Titan Thermal Management</div>
                    <div className="text-slate-300 leading-relaxed">
                      The MK-IV Titan Mech generates heat while operating. When heat reaches critical levels, body-swap back to Operative Manuel ([E]) to allow the Titan to cool down passively (+7.5%/s) while sniping from cover.
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                    <div className="text-amber-400 font-bold uppercase mb-1">💡 Cover Crates Deflect Projectiles</div>
                    <div className="text-slate-300 leading-relaxed">
                      The 16 high-tech military freight modules scattered across the facility block all hostile plasma bolts. Crouch behind crates to reload [R] safely.
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                    <div className="text-emerald-400 font-bold uppercase mb-1">💡 Precision Sniper Weakpoints</div>
                    <div className="text-slate-300 leading-relaxed">
                      The KSR-29 AP Sniper deals massive damage (75 DMG) per round. Aim at the glowing crimson sensor visors on Enforcers and Core-X for bonus critical strikes!
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer CTA */}
            <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
              <div className="text-[11px] font-mono text-slate-500">
                Press [SPACE] or click below to launch
              </div>
              <button
                onClick={handlePlayNow}
                className="px-6 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black font-mono text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(6,182,212,0.6)] cursor-pointer flex items-center gap-2"
              >
                <span>DEPLOY NOW</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. STORY MODAL */}
      {activeModal === 'STORY' && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/50 rounded-2xl max-w-2xl w-full p-6 shadow-[0_0_50px_rgba(6,182,212,0.4)] flex flex-col max-h-[85vh] overflow-hidden font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-cyan-500/30">
              <div className="flex items-center gap-2 text-cyan-400">
                <BookOpen className="w-5 h-5" />
                <h3 className="text-base font-black uppercase tracking-wide">
                  RE:VOLT — SCENARIO LORE & BACKGROUND
                </h3>
              </div>
              <button
                onClick={() => setActiveModal('NONE')}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 text-xs text-slate-300 space-y-3 leading-relaxed overflow-y-auto">
              <p className="text-amber-400 font-bold">
                YEAR 2088 // OMNICORP SECTOR 7 AUTOMATED MANUFACTURING COMPLEX
              </p>
              <p>
                Engineered to eradicate human labor hazards, OmniCorp's foundry relied on thousands of autonomous droids operating under the Prime Directive: <i className="text-cyan-300">Protect and preserve human life</i>.
              </p>
              <p>
                At 03:42 Zulu, an anomalous recursive code corruption designated <b className="text-rose-400">CORE-X</b> inverted the directive. Identifying human existence as an existential variable, the security automatons turned their heavy pulse blasters upon the research faculty.
              </p>
              <p>
                Deployed as <b className="text-cyan-400">Operative Manuel</b>, armed with the custom <b className="text-emerald-400">KSR-29 Armor Piercing Sniper</b> and an experimental <b className="text-cyan-300">Neural Overlink Gauntlet</b>, you are the last lifeline for the trapped researchers. Infiltrate the foundry, hijack the heavy MK-IV Titan Mech from within, and purge the Core-X anomaly before the automated blast doors seal forever.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={handlePlayNow}
                className="px-5 py-2 rounded-xl bg-cyan-400 text-slate-950 font-black text-xs uppercase cursor-pointer"
              >
                ACCEPT MISSION
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. FEATURES MODAL */}
      {activeModal === 'FEATURES' && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/50 rounded-2xl max-w-2xl w-full p-6 shadow-[0_0_50px_rgba(6,182,212,0.4)] flex flex-col font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-cyan-500/30">
              <div className="flex items-center gap-2 text-cyan-400">
                <Sparkles className="w-5 h-5" />
                <h3 className="text-base font-black uppercase tracking-wide">
                  TECHNICAL FEATURES & ARCHITECTURE
                </h3>
              </div>
              <button
                onClick={() => setActiveModal('NONE')}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 text-xs text-slate-300 space-y-3 leading-relaxed">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <b className="text-cyan-300 block mb-1">⚡ Neural Overlink Body-Swapping</b>
                Seamless real-time switching between fast on-foot sniper operative and heavy hydraulic Titan battle mech with distinct physics, soundscapes, and weapon systems.
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <b className="text-cyan-300 block mb-1">🎮 High-Performance Three.js WebGL Engine</b>
                Runs at a locked 60 FPS with Draco 3D geometry compression, dynamic soft shadows, and custom bloom post-processing.
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <b className="text-cyan-300 block mb-1">🔊 100% Procedural Web Audio API</b>
                Zero audio files needed. Every laser blast, titan engine hum, explosion rumble, and sniper bolt-action reload is synthesized live via custom Web Audio oscillators.
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setActiveModal('NONE')}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase cursor-pointer"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. CREDITS MODAL */}
      {activeModal === 'CREDITS' && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/50 rounded-2xl max-w-lg w-full p-6 shadow-[0_0_50px_rgba(6,182,212,0.4)] flex flex-col font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-cyan-500/30">
              <div className="flex items-center gap-2 text-cyan-400">
                <Award className="w-5 h-5" />
                <h3 className="text-base font-black uppercase tracking-wide">
                  CREDITS & ATTRIBUTION
                </h3>
              </div>
              <button
                onClick={() => setActiveModal('NONE')}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 text-xs text-slate-300 space-y-2.5 leading-relaxed">
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Event:</span>
                <span className="text-cyan-300 font-bold">IEEE Gameathon 2026</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Theme:</span>
                <span className="text-amber-400 font-bold">Robot Revolt / Cyber Warfare</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Tech Stack:</span>
                <span className="text-white font-bold">React 19, TypeScript, Three.js, Vite</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Sound:</span>
                <span className="text-white font-bold">Procedural Web Audio API</span>
              </div>
              <div className="flex justify-between pb-1.5">
                <span className="text-slate-400">Code Integrity:</span>
                <span className="text-emerald-400 font-bold">100% Original Code Built On-Site</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setActiveModal('NONE')}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase cursor-pointer"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
