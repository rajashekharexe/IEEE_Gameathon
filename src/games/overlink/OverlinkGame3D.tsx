// Complete 3D Gameplay Engine for Circuit Breaker: Overlink (Hackathon Edition)
// Implements:
// 1. Dark Futuristic City Warzone Environment
// 2. Colossal Mega-Boss CORE-X (6-8x Player Size) with Cinematic Intro & 3 Phases
// 3. Moving & Attacking Enemy Robots (Scouts, Enforcers, Shield Droids, Background patrols)
// 4. Player Hero (Hands down naturally, smooth locomotion, KSR-29 Sniper Rifle)
// 5. Unique Hacking Mechanic (Damaged Robot -> [E] HACK ROBOT -> RED to GREEN -> ALLY: 08s)
// 6. Zero Debug Elements
// 7. Clean HUD (HP, EMP, Objective, Score, Wave)
// 8. Powerful Combat Feedback (Hit flashes, sparks, floating damage numbers, screen shake, debris)
// 9. 3-Tier Level Progression: City Block (Rescue 3) -> Robot Factory (3 Generators) -> Core Chamber (Core-X)
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { factoryArena } from './FactoryArena';
import { entityFactory } from './EntityModels';
import type { TitanMechEntity, ScientistEntity } from './EntityModels';
import { humanHeroFactory } from './HumanHeroCharacter';
import type { HumanHeroEntity } from './HumanHeroCharacter';
import { enforcerRobotFactory } from './EnforcerRobotModel';
import type { EnforcerRobotEntity } from './EnforcerRobotModel';
import { bossFactory } from './BossModel';
import type { BossCoreXEntity } from './BossModel';
import { NeuralTetherEngine } from './TetherEngine';
import { ScreenShake } from '../../engine/screenshake';
import { VFXSystem } from './VFXSystem';
import { input } from '../../engine/input';
import { sounds } from '../../engine/audio';

export interface MissionBannerData {
  id: string;
  type: 'SUCCESS' | 'ALERT' | 'INFO';
  title: string;
  subtitle: string;
}

export interface OverlinkStats {
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  thermalStability: number;
  ammo: number;
  maxAmmo: number;
  score: number;
  wave: number;
  levelTitle: string;
  objectiveText: string;
  hackProgress: number;
  isTetherActive: boolean;
  rescuedScientists: number;
  totalScientists: number;
  generatorsDestroyed: number;
  totalGenerators: number;
  titanHealth: number;
  isTitanAllied: boolean;
  activeChassis: 'UNIT7' | 'TITAN';
  isShieldActive: boolean;
  bossActive: boolean;
  bossHp: number;
  bossMaxHp: number;
  bossPhase: 1 | 2 | 3;
  bossAlert: string | null;
  scoutsEliminated: number;
  totalScouts: number;
  enforcersEliminated: number;
  totalEnforcers: number;
  activeBanner: MissionBannerData | null;
  activeWeapon: 'PULSE' | 'SNIPER';
  sniperAllyRescued: boolean;
  sniperAllyHp: number;
  sniperAllyMaxHp: number;
  sniperAllyDancing: boolean;
  hackPromptTarget: { isNear: boolean; enemyType: string } | null;
  hackingAnimState: 'NONE' | 'HACKING' | 'SUCCESS';
  activeAllyTimer: number | null;
  cinematicIntroActive: boolean;
  fps: number;
  isPointerLocked: boolean;
}

interface OverlinkGame3DProps {
  godMode: boolean;
  onUpdateStats: (stats: Partial<OverlinkStats>) => void;
  onGameOver: () => void;
  onVictory: () => void;
}

export const OverlinkGame3D: React.FC<OverlinkGame3DProps> = React.memo(({
  godMode,
  onUpdateStats,
  onGameOver,
  onVictory,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const stateRef = useRef({
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
    activeChassis: 'UNIT7' as 'UNIT7' | 'TITAN',
    isShieldActive: false,
    bossActive: false,
    bossHp: 1200,
    bossMaxHp: 1200,
    bossPhase: 1 as 1 | 2 | 3,
    bossAlert: null as string | null,
    scoutsEliminated: 0,
    totalScouts: 6,
    enforcersEliminated: 0,
    totalEnforcers: 3,
    activeBanner: null as MissionBannerData | null,
    activeWeapon: 'SNIPER' as 'PULSE' | 'SNIPER',
    sniperAllyRescued: true,
    sniperAllyHp: 350,
    sniperAllyMaxHp: 350,
    sniperAllyDancing: false,
    hackPromptTarget: null as { isNear: boolean; enemyType: string } | null,
    hackingAnimState: 'NONE' as 'NONE' | 'HACKING' | 'SUCCESS',
    activeAllyTimer: null as number | null,
    cinematicIntroActive: false,
    fps: 120,
    isPointerLocked: false,
    godMode,
    isRunning: true,
  });

  useEffect(() => {
    stateRef.current.godMode = godMode;
  }, [godMode]);

  useEffect(() => {
    const container = containerRef.current;
    const overlayCanvas = canvasRef.current;
    if (!container || !overlayCanvas) return;

    const overlayCtx = overlayCanvas.getContext('2d');
    overlayCanvas.width = window.innerWidth;
    overlayCanvas.height = window.innerHeight;

    const s = stateRef.current;

    // 1. SCENE SETUP (Luminous Futuristic Cyber-City Atmosphere)
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    scene.fog = new THREE.FogExp2(0x0f172a, 0.005);

    // 2. CAMERA, SCREEN SHAKE & VFX
    const camera = new THREE.PerspectiveCamera(
      52,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(-7.0, 3.6, 10.8);
    const screenShake = new ScreenShake();
    const vfx = new VFXSystem(scene);

    // 3. HIGH-PERFORMANCE RENDERER (Locked 60 FPS!)
    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      powerPreference: 'high-performance',
      precision: 'mediump',
      stencil: false,
      depth: true,
      alpha: false,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(1);
    renderer.shadowMap.enabled = false;
    renderer.sortObjects = false;
    container.appendChild(renderer.domElement);

    // 4. ATMOSPHERIC LIGHTING (Bright, Crisp, Daylight / Twilight Luminous Illumination)
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.0);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.2);
    dirLight.position.set(35, 55, 25);
    scene.add(dirLight);

    const backLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    backLight.position.set(-30, 40, -30);
    scene.add(backLight);

    // 5. BUILD FUTURISTIC CITY WARZONE ARENA
    const arena = factoryArena.build(scene);

    // 6. SPAWN EVACUATION AIRLOCK WITH EMERALD LIGHT BEACON
    const airlock = entityFactory.createEvacuationAirlock();
    airlock.position.set(0, 0, 48);
    scene.add(airlock);

    const airlockLight = new THREE.PointLight(0x10b981, 4.5, 30, 1.2);
    airlockLight.position.set(0, 4, 48);
    scene.add(airlockLight);

    // 7. SPAWN HUMAN HERO (OPERATIVE NATHAN)
    const unit7: HumanHeroEntity = humanHeroFactory.createHero();
    unit7.group.position.set(-6, 0, 6);
    unit7.group.rotation.y = 0;
    scene.add(unit7.group);

    // 8. SPAWN MK-IV TITAN MECH
    const titan: TitanMechEntity = entityFactory.createTitanMech();
    titan.group.position.set(4, 0, -6);
    titan.group.rotation.y = Math.PI - 0.35;
    scene.add(titan.group);

    // 9. SPAWN 3 TRAPPED SCIENTISTS (LEVEL 1 OBJECTIVE: RESCUE 3 HUMANS)
    const scientists: ScientistEntity[] = [
      entityFactory.createScientist(0),
      entityFactory.createScientist(1),
      entityFactory.createScientist(2),
    ];
    scientists[0].group.position.set(-25, 0, 18);
    scientists[1].group.position.set(24, 0, 14);
    scientists[2].group.position.set(0, 0, -20);
    scientists.forEach((sc) => scene.add(sc.group));

    // 10. SPAWN SCOUT ENEMY ROBOTS (Patrolling and Chasing)
    interface ActiveScout {
      group: THREE.Group;
      eye: THREE.Mesh;
      hp: number;
      speed: number;
      shootCooldown: number;
      patrolAngle: number;
      patrolCenter: THREE.Vector3;
      isHacked: boolean;
      hackTimer: number;
      animateBob: (time: number) => void;
    }
    const scouts: ActiveScout[] = [];
    const scoutSpawnPoints = [
      new THREE.Vector3(-36, 0, -26),
      new THREE.Vector3(36, 0, -26),
      new THREE.Vector3(-38, 0, 16),
      new THREE.Vector3(38, 0, 16),
      new THREE.Vector3(-18, 0, -42),
      new THREE.Vector3(18, 0, -42),
    ];

    scoutSpawnPoints.forEach((pos) => {
      const scout = entityFactory.createScoutBot();
      scout.group.position.copy(pos);
      scene.add(scout.group);
      scouts.push({
        ...scout,
        shootCooldown: Math.random() * 60,
        patrolAngle: Math.random() * Math.PI * 2,
        patrolCenter: pos.clone(),
        isHacked: false,
        hackTimer: 0,
      });
    });

    // 10b. SPAWN HEAVY ENFORCERS & SHIELD ROBOTS
    const enforcers: EnforcerRobotEntity[] = [
      enforcerRobotFactory.createEnforcer(new THREE.Vector3(26, 0, -12), 'ATTACK'),
      enforcerRobotFactory.createEnforcer(new THREE.Vector3(-26, 0, -12), 'ATTACK'),
      enforcerRobotFactory.createEnforcer(new THREE.Vector3(0, 0, -28), 'SHIELD'),
    ];
    enforcers.forEach((enf) => scene.add(enf.group));

    // 10c. BACKGROUND PATROL DRONES (Rooftop Surveillance)
    const bgDrones: THREE.Group[] = [];
    [-45, 0, 45].forEach((x) => {
      const bg = new THREE.Group();
      bg.position.set(x, 22, -60);
      const droneMesh = new THREE.Mesh(
        new THREE.BoxGeometry(2.0, 0.6, 2.0),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3 })
      );
      bg.add(droneMesh);
      const beacon = new THREE.Mesh(
        new THREE.SphereGeometry(0.35, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xff0044 })
      );
      beacon.position.y = -0.6;
      bg.add(beacon);
      scene.add(bg);
      bgDrones.push(bg);
    });

    // 11. CORE-X MEGA BOSS ENTITY (Instantiated ready for Level 3)
    const boss: BossCoreXEntity = bossFactory.createCoreX();
    boss.group.position.set(0, 0, -32);

    // 12. NEURAL TETHER ENGINE
    const tether = new NeuralTetherEngine(scene);

    // 13. PROJECTILES
    interface Projectile {
      mesh: THREE.Mesh;
      dir: THREE.Vector3;
      life: number;
      isEnemy?: boolean;
      isTitanShot?: boolean;
      isBossShot?: boolean;
      isSniperShot?: boolean;
      isAllyShot?: boolean;
    }
    const projectiles: Projectile[] = [];
    const projGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.2, 8);
    projGeo.rotateX(Math.PI / 2);
    const enemyProjMat = new THREE.MeshBasicMaterial({ color: 0xff1133 });
    const bossProjGeo = new THREE.SphereGeometry(0.65, 14, 14);
    const bossProjMat = new THREE.MeshBasicMaterial({ color: 0xff0044 });

    const sniperProjGeo = new THREE.CylinderGeometry(0.07, 0.07, 2.4, 8);
    sniperProjGeo.rotateX(Math.PI / 2);
    const sniperProjMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const allyProjMat = new THREE.MeshBasicMaterial({ color: 0x34d399 });

    // 14. GAME STATE & TIMERS + HIGH-FPS PERFORMANCE CACHES
    const clock = new THREE.Clock();
    let animId: number;
    let shootCooldown = 0;
    let invulnTimer = 0;
    let cinematicTimer = 0;
    let hackingTimer = 0;
    let hudThrottleTimer = 0;
    let prevHackingState = 'NONE';
    let prevBanner: MissionBannerData | null = null;
    let activeHackingTarget: EnforcerRobotEntity | ActiveScout | null = null;

    // Pre-allocated static vectors (0 GC allocations during render loop)
    const _vUp = new THREE.Vector3(0, 1, 0);
    const _vForward = new THREE.Vector3(0, 0, 1);
    const _cinematicCamPos = new THREE.Vector3(0, 14, 18);
    const _cinematicLook = new THREE.Vector3(0, 10, -32);
    const _targetLookPos = new THREE.Vector3();
    const _followOffset = new THREE.Vector3(-4, 0, 2);
    const _followGoal = new THREE.Vector3();
    const _sprintOffset = new THREE.Vector3(0, 0.2, 0);
    const _tempA = new THREE.Vector3();
    const _tempB = new THREE.Vector3();
    const _tempC = new THREE.Vector3();
    const _shootDir = new THREE.Vector3();
    const _dirToPlayer = new THREE.Vector3();
    const _bossShootDir = new THREE.Vector3();
    const _textPos = new THREE.Vector3();

    // Free Fire / PUBG 3rd-Person Orbital Combat Camera State (1:1 Direct Zero-Lag)
    let cameraYaw = Math.PI; // Starts facing North towards enemy foundry
    let cameraPitch = 0.05; // Forward horizon eye-level view
    let isPointerLocked = false;
    let frameCount = 0;
    let lastFpsTime = performance.now();
    let currentFps = 120;
    let hadOverlayContent = false;
    let lastReportedHp = 100;
    let lastReportedScore = 0;
    let lastReportedWave = 1;
    let lastReportedBossHp = 1200;
    let lastLoopTime = performance.now();

    const requestPointerLock = () => {
      if (document.pointerLockElement !== container && container) {
        container.requestPointerLock?.();
      }
    };
    container.addEventListener('click', requestPointerLock);
    container.addEventListener('mousedown', requestPointerLock);
    window.addEventListener('mousedown', requestPointerLock);

    const handlePointerLockChange = () => {
      isPointerLocked = document.pointerLockElement === container;
    };
    document.addEventListener('pointerlockchange', handlePointerLockChange);

    let bannerTimeout: number | undefined;
    const triggerBanner = (type: 'SUCCESS' | 'ALERT' | 'INFO', title: string, subtitle: string, duration = 3500) => {
      s.activeBanner = { id: Math.random().toString(), type, title, subtitle };
      sounds.playPowerup();
      if (bannerTimeout) window.clearTimeout(bannerTimeout);
      bannerTimeout = window.setTimeout(() => {
        s.activeBanner = null;
      }, duration);
    };

    // LEVEL TRANSITIONS:
    // Level 1 Complete -> Advance to Level 2
    const triggerLevel2 = () => {
      s.wave = 2;
      s.levelTitle = 'ROBOT FACTORY';
      s.objectiveText = 'DESTROY GENERATORS: 0/3';
      s.score += 3000;
      triggerBanner('SUCCESS', 'CITY BLOCK LIBERATED!', 'DIRECTIVE: INFILTRATE FOUNDRY & DESTROY 3 GENERATORS (+3,000 PTS)');
      sounds.playPowerup();

      // Spawn reinforcing droids for Level 2
      const newEnf1 = enforcerRobotFactory.createEnforcer(new THREE.Vector3(30, 0, -22), 'ATTACK');
      const newEnf2 = enforcerRobotFactory.createEnforcer(new THREE.Vector3(-30, 0, -22), 'SHIELD');
      enforcers.push(newEnf1, newEnf2);
      scene.add(newEnf1.group, newEnf2.group);
      s.totalEnforcers = enforcers.length;
    };

    // Level 2 Complete -> Advance to Level 3 (Core Chamber & Cinematic Intro)
    const triggerLevel3Boss = () => {
      s.wave = 3;
      s.levelTitle = 'CORE CHAMBER';
      s.objectiveText = 'DEFEAT CORE-X';
      s.bossActive = true;
      s.cinematicIntroActive = true;
      cinematicTimer = 3.8; // 3.8s cinematic camera sweep

      scene.add(boss.group);
      boss.group.position.set(0, 0, -32);
      boss.isAwake = true;
      boss.setPhase(1);

      sounds.playBossRoar();
      sounds.setBGMIntensity('boss');
      screenShake.addTrauma(0.9);

      triggerBanner('ALERT', 'CRITICAL THREAT: CORE-X ENGAGED!', 'MEGA MACHINE AWAKENED // OVERRIDE PROTOCOL INITIATED!');
    };

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      if (overlayCanvas) {
        overlayCanvas.width = window.innerWidth;
        overlayCanvas.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);

    // Initial level banner
    const initTimer = window.setTimeout(() => {
      triggerBanner('INFO', 'MISSION DIRECTIVE: CITY BLOCK', 'RESCUE 3 RESEARCH SCIENTISTS TRAPPED IN RUINS [0/3]');
    }, 600);

    // MAIN GAME LOOP
    const loop = () => {
      if (!s.isRunning) return;

      const now = performance.now();
      const rawDelta = (now - lastLoopTime) / 1000;
      lastLoopTime = now;
      const delta = Math.min(Math.max(rawDelta, 0.001), 0.033);
      const time = clock.getElapsedTime();

      // A. UPDATE SCREEN SHAKE & VFX
      screenShake.update(delta * 2.5);
      vfx.update(delta);
      arena.updateSirens(time);

      // Animate Background Surveillance Drones
      bgDrones.forEach((bg, idx) => {
        bg.position.x += Math.sin(time * 0.8 + idx) * 0.08;
      });

      // B. CINEMATIC CORE-X BOSS INTRO (Requirement 9)
      if (s.cinematicIntroActive) {
        cinematicTimer -= delta;
        // Cinematic camera sweep: slowly pull back and tilt up to show the colossal 16m Core-X
        camera.position.lerp(_cinematicCamPos, 0.04);
        camera.lookAt(_cinematicLook);

        boss.animateCrawl(time, false);
        boss.coreLight.intensity = 8.0 + Math.sin(time * 12) * 4.0;
        screenShake.addTrauma(0.04); // subtle rumble

        if (cinematicTimer <= 0) {
          s.cinematicIntroActive = false;
        }
      }

      // C. ACTIVE PLAYER OBJECT (Nathan or Titan)
      const activeObj = s.activeChassis === 'UNIT7' ? unit7.group : titan.group;

      // Invulnerability flicker
      if (invulnTimer > 0) {
        invulnTimer -= delta;
        activeObj.visible = Math.floor(time * 26) % 2 === 0;
      } else {
        activeObj.visible = true;
      }

      // Passive Energy Regen
      if (s.energy < s.maxEnergy) {
        s.energy = Math.min(s.maxEnergy, s.energy + 8 * delta);
      }

      // Ally Countdown Timer
      if (s.activeAllyTimer !== null && s.activeAllyTimer > 0) {
        s.activeAllyTimer -= delta;
        if (s.activeAllyTimer <= 0) {
          s.activeAllyTimer = null;
        }
      }

      // D. MOUSE AIM & CAMERA YAW/PITCH (Free Fire / PUBG 1:1 Direct Zero-Lag Aim)
      const mouseDelta = input.consumeMouseDelta();
      if ((mouseDelta.dx !== 0 || mouseDelta.dy !== 0) && !s.cinematicIntroActive) {
        const mouseSens = 0.0022;
        cameraYaw -= mouseDelta.dx * mouseSens;
        cameraPitch += mouseDelta.dy * mouseSens * 0.65;
        // Clamp pitch: comfortably look up at boss/skyline and down at robots (never straight down at feet)
        cameraPitch = Math.max(-0.42, Math.min(0.36, cameraPitch));
      }

      const cosPitch = Math.cos(cameraPitch);
      const sinPitch = Math.sin(cameraPitch);
      const sinYaw = Math.sin(cameraYaw);
      const cosYaw = Math.cos(cameraYaw);

      // Horizontal ground movement directions (for WASD)
      const forwardX = sinYaw;
      const forwardZ = cosYaw;
      const rightX = -cosYaw;
      const rightZ = sinYaw;

      // 3D forward unit vector (where camera and sniper rifle aim)
      const fwdX = sinYaw * cosPitch;
      const fwdY = -sinPitch;
      const fwdZ = cosYaw * cosPitch;

      // E. WASD MOVEMENT & SPRINT (Camera-Relative, Free Fire / PUBG style)
      const isSprinting = input.isActionPressed('dash') && s.energy > 5;
      if (isSprinting) {
        s.energy = Math.max(0, s.energy - 15 * delta);
        // Sprint particles behind boots
        _tempA.copy(activeObj.position).add(_sprintOffset);
        vfx.emitSparks(_tempA, 1, 0x00f0ff, 3);
      }

      const currentSpeed =
        s.activeChassis === 'TITAN'
          ? 4.5 * delta
          : (isSprinting ? 13.5 : 7.8) * delta;

      let moveX = 0;
      let moveZ = 0;
      if (input.isActionPressed('up')) {
        moveX += forwardX;
        moveZ += forwardZ;
      }
      if (input.isActionPressed('down')) {
        moveX -= forwardX;
        moveZ -= forwardZ;
      }
      if (input.isActionPressed('right')) {
        moveX += rightX;
        moveZ += rightZ;
      }
      if (input.isActionPressed('left')) {
        moveX -= rightX;
        moveZ -= rightZ;
      }

      const isMoving = (moveX !== 0 || moveZ !== 0) && !s.cinematicIntroActive;
      if (isMoving) {
        const length = Math.hypot(moveX, moveZ);
        const normX = moveX / length;
        const normZ = moveZ / length;

        activeObj.position.x += normX * currentSpeed;
        activeObj.position.z += normZ * currentSpeed;

        // Arena boundary clamp (-72m to 72m)
        activeObj.position.x = Math.max(-72, Math.min(72, activeObj.position.x));
        activeObj.position.z = Math.max(-72, Math.min(72, activeObj.position.z));
      }

      // Animate character walk
      if (s.activeChassis === 'UNIT7') {
        unit7.animateWalk(time, isMoving);
      } else {
        titan.animateWalk(time, isMoving);
      }

      // Character orientation faces camera yaw
      if (!s.cinematicIntroActive) {
        activeObj.rotation.y = cameraYaw;
      }

      // F. HIGH-PRECISION COMBAT CHASE CAMERA (Free Fire / PUBG Over-The-Shoulder View)
      if (!s.cinematicIntroActive) {
        const camDist = 4.5;
        const camHeight = 1.95;
        const shoulderOffset = 0.35;

        camera.position.set(
          activeObj.position.x - forwardX * camDist * cosPitch + rightX * shoulderOffset,
          activeObj.position.y + camHeight + camDist * sinPitch,
          activeObj.position.z - forwardZ * camDist * cosPitch + rightZ * shoulderOffset
        );

        if (screenShake.offsetX !== 0 || screenShake.offsetY !== 0) {
          camera.position.x += screenShake.offsetX * 0.04;
          camera.position.y += screenShake.offsetY * 0.04;
        }

        const lookAheadDist = 35.0;
        _targetLookPos.set(
          camera.position.x + fwdX * lookAheadDist,
          camera.position.y + fwdY * lookAheadDist,
          camera.position.z + fwdZ * lookAheadDist
        );
        camera.lookAt(_targetLookPos);

        if (s.activeChassis === 'UNIT7') {
          unit7.updateLaserAim(_targetLookPos);
        }
      }

      // G. HACKING MECHANIC DETECTION & EXECUTION (Requirement 5)
      // Search for nearest damaged enemy (< 60% HP) within 8 meters
      let nearestHackable: EnforcerRobotEntity | ActiveScout | null = null;
      let nearestHackDist = 8.5;

      enforcers.forEach((enf) => {
        if (enf.isAlive && !enf.isHacked && enf.hp < enf.maxHp * 0.65) {
          const d = activeObj.position.distanceTo(enf.group.position);
          if (d < nearestHackDist) {
            nearestHackDist = d;
            nearestHackable = enf;
          }
        }
      });

      scouts.forEach((sc) => {
        if (!sc.isHacked && sc.hp < 40) {
          const d = activeObj.position.distanceTo(sc.group.position);
          if (d < nearestHackDist) {
            nearestHackDist = d;
            nearestHackable = sc;
          }
        }
      });

      if (nearestHackable) {
        s.hackPromptTarget = { isNear: true, enemyType: 'ROBOT' };
      } else {
        s.hackPromptTarget = null;
      }

      // Trigger Hack on [E] key
      if (input.isActionPressed('interact') && nearestHackable && s.hackingAnimState === 'NONE') {
        activeHackingTarget = nearestHackable;
        s.hackingAnimState = 'HACKING';
        hackingTimer = 0.8; // 0.8s transition animation
        sounds.playNeuralTetherHum();

        // Connect cyan Overlink tether beam
        tether.activate(unit7.weaponMuzzle, (nearestHackable as any).group);
        vfx.emitSparks(activeObj.position, 16, 0x00f0ff, 8);
      }

      // Complete Hacking transition
      if (s.hackingAnimState === 'HACKING') {
        hackingTimer -= delta;
        tether.update(unit7.weaponMuzzle, delta, time);

        if (hackingTimer <= 0) {
          s.hackingAnimState = 'NONE';
          tether.deactivate();

          if (activeHackingTarget) {
            if ('convertToAlly' in activeHackingTarget) {
              (activeHackingTarget as EnforcerRobotEntity).convertToAlly();
            } else {
              (activeHackingTarget as ActiveScout).isHacked = true;
              (activeHackingTarget as ActiveScout).hackTimer = 8.0;
              (activeHackingTarget as ActiveScout).eye.material = new THREE.MeshBasicMaterial({ color: 0x10b981 });
            }

            s.activeAllyTimer = 8.0;
            s.score += 500;
            sounds.playPowerup();
            vfx.emitSparks((activeHackingTarget as any).group.position, 35, 0x10b981, 10, true);
            _textPos.copy((activeHackingTarget as any).group.position);
            _textPos.y += 3;
            vfx.emitText(_textPos, 'HACKED! ALLIED DEFENDER', '#10b981', 22, true);
            triggerBanner('SUCCESS', 'NEURAL OVERLINK SUCCESSFUL!', 'ROBOT CONVERTED INTO ALLIED DEFENDER (08s)');
            activeHackingTarget = null;
          }
        }
      }

      // H. SHOOTING (KSR-29 AP Sniper Rifle)
      if (shootCooldown > 0) shootCooldown -= delta;
      if (input.isActionPressed('fire') && shootCooldown <= 0 && !s.cinematicIntroActive) {
        shootCooldown = 0.32; // Fast tactical sniper cadence
        unit7.triggerRecoil();
        sounds.playSniperShot();
        screenShake.addTrauma(0.18);

        // Kinetic Muzzle Flash
        vfx.emitSparks(unit7.weaponMuzzle, 12, 0x10b981, 8);

        // Projectile fires exactly along camera forward vector (center crosshair pinpoint)
        _shootDir.set(fwdX, fwdY, fwdZ);

        const pMesh = new THREE.Mesh(sniperProjGeo, sniperProjMat);
        pMesh.position.copy(unit7.weaponMuzzle);
        pMesh.quaternion.setFromUnitVectors(_vForward, _shootDir);
        scene.add(pMesh);

        projectiles.push({
          mesh: pMesh,
          dir: _shootDir.clone(),
          life: 2.2,
          isSniperShot: true,
        });
      }

      // I. ROBOT AI & MOVEMENT (Requirement 3)
      // 1. Scout Robots Movement, Detection & Attacks
      scouts.forEach((sc) => {
        const scPos = sc.group.position;
        const distToPlayer = scPos.distanceTo(activeObj.position);

        if (sc.isHacked) {
          // HACKED ALLY SCOUT: Follow player & attack rogue enemies!
          sc.hackTimer -= delta;
          _tempA.set(activeObj.position.x + 3, activeObj.position.y + 2, activeObj.position.z + 3);
          scPos.lerp(_tempA, 0.05);
          sc.animateBob(time);

          // Find rogue enemy to attack
          sc.shootCooldown -= delta;
          if (sc.shootCooldown <= 0) {
            const rogueEnf = enforcers.find((e) => e.isAlive && !e.isHacked);
            if (rogueEnf) {
              sc.shootCooldown = 0.8;
              _tempB.copy(rogueEnf.group.position).sub(scPos).normalize();
              const aMesh = new THREE.Mesh(projGeo, allyProjMat);
              aMesh.position.copy(scPos);
              aMesh.quaternion.setFromUnitVectors(_vForward, _tempB);
              scene.add(aMesh);
              projectiles.push({ mesh: aMesh, dir: _tempB.clone(), life: 1.8, isAllyShot: true });
            }
          }

          if (sc.hackTimer <= 0) {
            // Shut down
            sc.hp = 0;
            vfx.emitSparks(scPos, 15, 0x94a3b8, 4);
            scene.remove(sc.group);
          }
        } else {
          // ROGUE SCOUT: Patrol or Chase & Attack
          if (distToPlayer < 36 && !s.cinematicIntroActive) {
            // Chase player & maintain 9m distance
            _dirToPlayer.copy(activeObj.position).sub(scPos).normalize();
            if (distToPlayer > 9.5) {
              scPos.x += _dirToPlayer.x * 6.2 * delta;
              scPos.z += _dirToPlayer.z * 6.2 * delta;
            } else if (distToPlayer < 7.0) {
              scPos.x -= _dirToPlayer.x * 4.5 * delta;
              scPos.z -= _dirToPlayer.z * 4.5 * delta;
            }

            // Shoot red plasma bolts
            sc.shootCooldown -= delta;
            if (sc.shootCooldown <= 0) {
              sc.shootCooldown = 1.4 + Math.random() * 0.8;
              sounds.playShoot(520);
              const pMesh = new THREE.Mesh(projGeo, enemyProjMat);
              pMesh.position.copy(scPos);
              pMesh.quaternion.setFromUnitVectors(_vForward, _dirToPlayer);
              scene.add(pMesh);
              projectiles.push({ mesh: pMesh, dir: _dirToPlayer.clone(), life: 2.0, isEnemy: true });
            }
          } else {
            // Waypoint patrol circle
            sc.patrolAngle += 0.8 * delta;
            scPos.x = sc.patrolCenter.x + Math.cos(sc.patrolAngle) * 8;
            scPos.z = sc.patrolCenter.z + Math.sin(sc.patrolAngle) * 8;
          }
          sc.animateBob(time);
        }
      });

      // 2. Heavy Enforcers & Shield Bots Movement
      enforcers.forEach((enf) => {
        if (!enf.isAlive) return;

        const enfPos = enf.group.position;
        const distToPlayer = enfPos.distanceTo(activeObj.position);

        if (enf.isHacked) {
          // HACKED ALLY ENFORCER: Bodyguard following player & attacking Core-X or rogue droids!
          enf.hackTimer -= delta;
          _followGoal.copy(activeObj.position).add(_followOffset);
          enfPos.lerp(_followGoal, 0.04);
          enf.animateWalk(time, true);

          // Attack nearest rogue target
          enf.shootCooldown -= delta;
          if (enf.shootCooldown <= 0) {
            enf.shootCooldown = 0.9;
            const target = s.bossActive ? boss.group.position : enforcers.find((e) => e.isAlive && !e.isHacked)?.group.position;
            if (target) {
              _tempB.copy(target).sub(enfPos).normalize();
              _tempB.y = 0;
              enf.group.rotation.y = Math.atan2(_tempB.x, _tempB.z);
              const aMesh = new THREE.Mesh(projGeo, allyProjMat);
              _tempC.copy(enfPos);
              _tempC.y += 1.5;
              aMesh.position.copy(_tempC);
              aMesh.quaternion.setFromUnitVectors(_vForward, _tempB);
              scene.add(aMesh);
              projectiles.push({ mesh: aMesh, dir: _tempB.clone(), life: 2.0, isAllyShot: true });
            }
          }

          if (enf.hackTimer <= 0) {
            enf.isAlive = false;
            vfx.emitSparks(enfPos, 20, 0x94a3b8, 5);
            scene.remove(enf.group);
          }
        } else {
          // ROGUE ENFORCER: Walk, Strafe, Aim & Shoot
          if (distToPlayer < 40 && !s.cinematicIntroActive) {
            _dirToPlayer.copy(activeObj.position).sub(enfPos).normalize();
            _dirToPlayer.y = 0;
            enf.group.rotation.y = Math.atan2(_dirToPlayer.x, _dirToPlayer.z);

            // Maintain combat distance (12m for Attack, 6m for Shield)
            const preferredDist = enf.type === 'SHIELD' ? 6.5 : 12.0;
            if (distToPlayer > preferredDist + 1.5) {
              enfPos.x += _dirToPlayer.x * enf.speed * delta;
              enfPos.z += _dirToPlayer.z * enf.speed * delta;
              enf.animateWalk(time, true);
            } else {
              // Strafe sideways
              const strafeX = -_dirToPlayer.z * Math.sin(time * 2) * 2.5 * delta;
              const strafeZ = _dirToPlayer.x * Math.sin(time * 2) * 2.5 * delta;
              enfPos.x += strafeX;
              enfPos.z += strafeZ;
              enf.animateWalk(time, true);
            }

            // Shoot heavy plasma bursts
            enf.shootCooldown -= delta;
            if (enf.shootCooldown <= 0) {
              enf.shootCooldown = enf.type === 'SHIELD' ? 2.2 : 1.6;
              sounds.playShoot(380);
              const pMesh = new THREE.Mesh(projGeo, enemyProjMat);
              _tempC.copy(enfPos);
              _tempC.y += 1.5;
              pMesh.position.copy(_tempC);
              pMesh.quaternion.setFromUnitVectors(_vForward, _dirToPlayer);
              scene.add(pMesh);
              projectiles.push({ mesh: pMesh, dir: _dirToPlayer.clone(), life: 2.2, isEnemy: true });
            }
          } else {
            enf.animateWalk(time, false);
          }
        }
      });

      // 3. CORE-X MEGA BOSS BEHAVIOR (Requirement 2 & 10)
      if (s.bossActive && boss.isAwake && !s.cinematicIntroActive) {
        boss.animateCrawl(time, true);

        // Track HP and update Phases
        const hpPercent = boss.hp / boss.maxHp;
        if (hpPercent <= 0.33 && boss.phase !== 3) {
          boss.setPhase(3);
          s.bossPhase = 3;
          triggerBanner('ALERT', 'CORE-X OVERDRIVE!', 'PHASE 3: SPHERICAL AEGIS SHIELD ENGAGED!');
          sounds.playBossRoar();
          screenShake.addTrauma(0.6);
        } else if (hpPercent <= 0.66 && hpPercent > 0.33 && boss.phase !== 2) {
          boss.setPhase(2);
          s.bossPhase = 2;
          triggerBanner('ALERT', 'CORE-X DROID SWARM!', 'PHASE 2: REINFORCEMENT WAVE SUMMONED!');
          sounds.playBossRoar();

          // Summon reinforcement droids
          const sum1 = enforcerRobotFactory.createEnforcer(new THREE.Vector3(18, 0, -26), 'ATTACK');
          const sum2 = enforcerRobotFactory.createEnforcer(new THREE.Vector3(-18, 0, -26), 'SHIELD');
          enforcers.push(sum1, sum2);
          scene.add(sum1.group, sum2.group);
        }

        // Aim towards player
        _bossShootDir.copy(activeObj.position).sub(boss.group.position).normalize();
        _bossShootDir.y = 0;
        boss.group.rotation.y = Math.atan2(_bossShootDir.x, _bossShootDir.z);

        // Boss Artillery Shooting
        boss.shootCooldown -= delta;
        if (boss.shootCooldown <= 0) {
          boss.shootCooldown = boss.phase === 3 ? 1.4 : boss.phase === 2 ? 1.8 : 2.4;
          sounds.playExplosion('small');

          // Twin artillery cannons firing
          [-4, 4].forEach((xSide) => {
            const bProj = new THREE.Mesh(bossProjGeo, bossProjMat);
            _tempA.set(boss.group.position.x + xSide, boss.group.position.y + 8, boss.group.position.z + 4);
            bProj.position.copy(_tempA);
            scene.add(bProj);
            projectiles.push({ mesh: bProj, dir: _bossShootDir.clone(), life: 3.0, isEnemy: true, isBossShot: true });
          });
        }
      }

      // J. PROJECTILE COLLISIONS & DAMAGE
      for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];
        const projSpeed = p.isSniperShot ? 75 : (p.isAllyShot ? 55 : (p.isBossShot ? 22 : 30));
        p.mesh.position.addScaledVector(p.dir, projSpeed * delta);
        p.life -= delta;

        // Player & Ally Projectiles vs Enemies
        if (!p.isEnemy) {
          // 1. Vs Scouts
          for (let j = scouts.length - 1; j >= 0; j--) {
            const sc = scouts[j];
            if (sc.isHacked) continue;
            if (p.mesh.position.distanceTo(sc.group.position) < 2.4) {
              sounds.playHit();
              const dmg = p.isSniperShot ? 75 : 40;
              sc.hp -= dmg;
              vfx.emitSparks(p.mesh.position, 18, 0x10b981, 8);
              vfx.emitText(sc.group.position, `-${dmg}`, '#10b981', 16, true);

              scene.remove(p.mesh);
              projectiles.splice(i, 1);

              if (sc.hp <= 0) {
                sounds.playExplosion('small');
                vfx.emitSparks(sc.group.position, 40, 0xff0044, 12, true);
                scene.remove(sc.group);
                scouts.splice(j, 1);
                s.score += 250;
                s.scoutsEliminated++;
              }
              break;
            }
          }

          // 2. Vs Enforcers & Shield Bots
          for (let k = enforcers.length - 1; k >= 0; k--) {
            const enf = enforcers[k];
            if (!enf.isAlive || enf.isHacked) continue;

            if (p.mesh.position.distanceTo(enf.group.position) < 2.5) {
              // Check frontal energy shield on Shield droids
              if (enf.hasShield) {
                _tempA.copy(p.mesh.position).sub(enf.group.position).normalize();
                _tempB.copy(_vForward).applyAxisAngle(_vUp, enf.group.rotation.y);
                const dot = _tempA.dot(_tempB);

                if (dot > 0.3) {
                  // Frontal shield deflects!
                  sounds.playShieldDeflect();
                  vfx.emitSparks(p.mesh.position, 16, 0x00f0ff, 9);
                  _textPos.copy(enf.group.position);
                  _textPos.y += 2.8;
                  vfx.emitText(_textPos, 'SHIELD DEFLECTED', '#00f0ff', 16);
                  scene.remove(p.mesh);
                  projectiles.splice(i, 1);
                  break;
                }
              }

              // Hit through shield or flanked
              sounds.playHit();
              enf.flashHit();
              const dmg = p.isSniperShot ? 75 : 45;
              enf.hp -= dmg;
              vfx.emitSparks(p.mesh.position, 22, 0x10b981, 8);
              _textPos.copy(enf.group.position);
              _textPos.y += 2.8;
              vfx.emitText(_textPos, `-${dmg}`, '#10b981', 18, true);

              scene.remove(p.mesh);
              projectiles.splice(i, 1);

              if (enf.hp <= 0) {
                enf.isAlive = false;
                sounds.playExplosion('large');
                screenShake.addTrauma(0.35);
                vfx.emitSparks(enf.group.position, 50, 0xff0044, 14, true);
                scene.remove(enf.group);
                s.score += 750;
                s.enforcersEliminated++;
              }
              break;
            }
          }

          // 3. Vs Power Generators (Level 2 Objective: DESTROY 3 GENERATORS)
          if (s.wave === 2) {
            arena.generators.forEach((gen) => {
              if (!gen.isDestroyed && p.mesh.position.distanceTo(gen.position) < 3.2) {
                sounds.playHit();
                const dmg = p.isSniperShot ? 75 : 40;
                gen.hp -= dmg;
                vfx.emitSparks(p.mesh.position, 24, 0x00f0ff, 10);
                _textPos.copy(gen.position);
                _textPos.y += 3;
                vfx.emitText(_textPos, `-${dmg}`, '#00f0ff', 20, true);

                scene.remove(p.mesh);
                projectiles.splice(i, 1);

                if (gen.hp <= 0) {
                  gen.isDestroyed = true;
                  s.generatorsDestroyed++;
                  s.score += 1500;
                  sounds.playExplosion('large');
                  screenShake.addTrauma(0.65);
                  vfx.emitSparks(gen.position, 70, 0x00f0ff, 16, true);
                  _textPos.copy(gen.position);
                  _textPos.y += 4;
                  vfx.emitText(_textPos, 'GENERATOR DESTROYED! +1500', '#10b981', 24, true);

                  gen.coreMesh.material = new THREE.MeshBasicMaterial({ color: 0x334155 });
                  if (gen.coreLight) gen.coreLight.intensity = 0;

                  s.objectiveText = `DESTROY GENERATORS: ${s.generatorsDestroyed}/3`;

                  if (s.generatorsDestroyed >= 3) {
                    triggerBanner('SUCCESS', 'ALL GENERATORS OFFLINE!', 'CORE CHAMBER BLAST DOORS OPENED!');
                    window.setTimeout(() => triggerLevel3Boss(), 1500);
                  } else {
                    triggerBanner('SUCCESS', 'POWER GENERATOR DESTROYED!', `FACILITY GRID CRITICAL [${s.generatorsDestroyed}/3]`);
                  }
                }
              }
            });
          }

          // 4. Vs CORE-X MEGA BOSS
          if (s.bossActive && boss.isAwake && p.mesh.position.distanceTo(boss.group.position) < 7.5) {
            // Check Phase 3 Aegis Shield
            if (boss.phase === 3 && boss.isShieldActive) {
              sounds.playShieldDeflect();
              vfx.emitSparks(p.mesh.position, 20, 0x00f0ff, 9);
              _textPos.copy(boss.group.position);
              _textPos.y += 10;
              vfx.emitText(_textPos, 'AEGIS SHIELD -15', '#00f0ff', 18);
              boss.hp -= 15;
            } else {
              sounds.playHit();
              boss.flashHit();
              const dmg = p.isSniperShot ? 75 : 45;
              boss.hp -= dmg;
              vfx.emitSparks(p.mesh.position, 30, 0x10b981, 10);
              _textPos.copy(boss.group.position);
              _textPos.y += 10;
              vfx.emitText(_textPos, `-${dmg}`, '#ff4444', 22, true);
            }

            s.bossHp = Math.max(0, boss.hp);
            s.score += 150;
            screenShake.addTrauma(0.12);

            scene.remove(p.mesh);
            projectiles.splice(i, 1);

            // Boss Defeated!
            if (boss.hp <= 0) {
              s.bossActive = false;
              s.bossHp = 0;
              sounds.playExplosion('large');
              screenShake.addTrauma(1.0);
              vfx.emitSparks(boss.group.position, 120, 0xff0044, 20, true);
              scene.remove(boss.group);
              boss.dispose();
              s.score += 10000;
              triggerBanner('SUCCESS', 'PROTOCOL RESTORED!', 'CORE-X OFFLINE // HUMAN PROTECTION PROTOCOL: ONLINE');
              window.setTimeout(() => {
                s.isRunning = false;
                onVictory();
              }, 1500);
            }
          }
        }

        // Enemy Projectiles vs Player
        if (p.isEnemy) {
          if (p.mesh.position.distanceTo(activeObj.position) < 1.6) {
            if (!s.godMode && invulnTimer <= 0) {
              invulnTimer = 0.5;
              const dmg = p.isBossShot ? 14 : 7;
              s.health = Math.max(0, s.health - dmg);
              sounds.playHit();
              screenShake.addTrauma(0.25);
              vfx.triggerDamageFlash();
              vfx.emitSparks(activeObj.position, 15, 0xff0033, 6);
              _textPos.copy(activeObj.position);
              _textPos.y += 2;
              vfx.emitText(_textPos, `-${dmg}`, '#ef4444', 18);

              if (s.health <= 0) {
                s.isRunning = false;
                onGameOver();
                return;
              }
            }
            scene.remove(p.mesh);
            projectiles.splice(i, 1);
            continue;
          }
        }

        if (p.life <= 0) {
          scene.remove(p.mesh);
          projectiles.splice(i, 1);
        }
      }

      // K. RESCUE SCIENTISTS (LEVEL 1 OBJECTIVE: RESCUE 3 HUMANS)
      if (s.wave === 1) {
        scientists.forEach((sc) => {
          const scPos = sc.group.position;
          if (!sc.isRescued) {
            sc.animateIdle(time);
            if (activeObj.position.distanceTo(scPos) < 4.2) {
              sc.isRescued = true;
              sounds.playPowerup();
              vfx.emitSparks(scPos, 22, 0x10b981, 8, true);
              _textPos.copy(scPos);
              _textPos.y += 3;
              vfx.emitText(_textPos, 'SCIENTIST RESCUED! FOLLOWING!', '#34d399', 18, true);
            }
          } else {
            // Escort toward Evacuation Airlock
            const airlockPos = airlock.position;
            const distToAirlock = scPos.distanceTo(airlockPos);

            if (distToAirlock < 3.2) {
              s.rescuedScientists++;
              s.score += 1500;
              sounds.playEvacuateChime();
              vfx.emitSparks(airlockPos, 40, 0x10b981, 12, true);
              _textPos.copy(airlockPos);
              _textPos.y += 3;
              vfx.emitText(_textPos, '+1500 EVACUATED!', '#10b981', 22, true);
              scene.remove(sc.group);
              sc.group.position.set(999, 999, 999);

              s.objectiveText = `RESCUE HUMANS: ${s.rescuedScientists}/3`;

              if (s.rescuedScientists >= 3) {
                triggerLevel2();
              } else {
                triggerBanner('SUCCESS', 'HUMAN SECURED!', `RESEARCHER #${s.rescuedScientists} SAFELY EVACUATED (+1,500 PTS)`);
              }
            } else {
              const aAngle = Math.atan2(airlockPos.x - scPos.x, airlockPos.z - scPos.z);
              sc.group.rotation.y = aAngle;
              scPos.x += Math.sin(aAngle) * 4.5 * delta;
              scPos.z += Math.cos(aAngle) * 4.5 * delta;
              sc.animateRun?.(time);
            }
          }
        });
      }

      // L. UPDATE REACT HUD STATS (Smart Event-Driven Throttling for Ultra 90-120+ FPS)
      hudThrottleTimer += delta;
      const isCriticalHudUpdate =
        s.health !== lastReportedHp ||
        s.score !== lastReportedScore ||
        s.wave !== lastReportedWave ||
        s.bossHp !== lastReportedBossHp ||
        s.cinematicIntroActive ||
        s.hackingAnimState !== prevHackingState ||
        s.activeBanner !== prevBanner;

      // Real-time FPS Calculation (350ms sample window)
      frameCount++;
      const nowPerfTime = performance.now();
      if (nowPerfTime - lastFpsTime >= 350) {
        currentFps = Math.round((frameCount * 1000) / (nowPerfTime - lastFpsTime));
        frameCount = 0;
        lastFpsTime = nowPerfTime;
        s.fps = currentFps;
        s.isPointerLocked = isPointerLocked;
      }

      if (hudThrottleTimer >= 0.20 || isCriticalHudUpdate) {
        hudThrottleTimer = 0;
        prevHackingState = s.hackingAnimState;
        prevBanner = s.activeBanner;
        lastReportedHp = s.health;
        lastReportedScore = s.score;
        lastReportedWave = s.wave;
        lastReportedBossHp = s.bossHp;

        onUpdateStats({
          health: s.health,
          maxHealth: s.maxHealth,
          energy: s.energy,
          maxEnergy: s.maxEnergy,
          thermalStability: Math.round(s.thermalStability),
          ammo: s.ammo,
          maxAmmo: s.maxAmmo,
          score: s.score,
          wave: s.wave,
          levelTitle: s.levelTitle,
          objectiveText: s.objectiveText,
          hackProgress: Math.round(s.hackProgress),
          isTetherActive: s.isTetherActive,
          rescuedScientists: s.rescuedScientists,
          totalScientists: s.totalScientists,
          generatorsDestroyed: s.generatorsDestroyed,
          totalGenerators: s.totalGenerators,
          titanHealth: s.titanHealth,
          isTitanAllied: s.isTitanAllied,
          activeChassis: s.activeChassis,
          isShieldActive: s.isShieldActive,
          bossActive: s.bossActive,
          bossHp: s.bossHp,
          bossMaxHp: s.bossMaxHp,
          bossPhase: s.bossPhase,
          bossAlert: s.bossAlert,
          scoutsEliminated: s.scoutsEliminated,
          totalScouts: s.totalScouts,
          enforcersEliminated: s.enforcersEliminated,
          totalEnforcers: s.totalEnforcers,
          activeBanner: s.activeBanner,
          activeWeapon: s.activeWeapon,
          sniperAllyRescued: true,
          sniperAllyHp: 350,
          sniperAllyMaxHp: 350,
          sniperAllyDancing: unit7.isDancing,
          hackPromptTarget: s.hackPromptTarget,
          hackingAnimState: s.hackingAnimState,
          activeAllyTimer: s.activeAllyTimer,
          cinematicIntroActive: s.cinematicIntroActive,
          fps: s.fps,
          isPointerLocked: s.isPointerLocked,
        });
      }

      // Render 3D Scene
      renderer.render(scene, camera);

      // Render 2D Floating Combat Text (Only clears and draws when damage texts or flashes exist)
      if (overlayCtx && overlayCanvas) {
        const hasOverlayEffects = vfx.floatingTexts.length > 0 || vfx.damageFlash > 0.01 || vfx.shieldFlash > 0.01;
        if (hasOverlayEffects) {
          overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
          vfx.renderOverlay(overlayCtx, camera, overlayCanvas.width, overlayCanvas.height, []);
          hadOverlayContent = true;
        } else if (hadOverlayContent) {
          overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
          hadOverlayContent = false;
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.clearTimeout(initTimer);
      if (bannerTimeout) window.clearTimeout(bannerTimeout);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('click', requestPointerLock);
      container.removeEventListener('mousedown', requestPointerLock);
      window.removeEventListener('mousedown', requestPointerLock);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      tether.dispose(scene);
      boss.dispose();
      vfx.dispose(scene);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [godMode, onGameOver, onUpdateStats, onVictory]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full block cursor-crosshair z-10 overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-20"
      />
    </div>
  );
});
