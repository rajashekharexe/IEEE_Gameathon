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
import type { InGameWaypoint } from './VFXSystem';
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
  energy: number;
  thermalStability: number;
  ammo: number;
  maxAmmo: number;
  score: number;
  wave: number;
  hackProgress: number;
  isTetherActive: boolean;
  rescuedScientists: number;
  totalScientists: number;
  titanHealth: number;
  isTitanAllied: boolean;
  activeChassis: 'UNIT7' | 'TITAN';
  isShieldActive: boolean;
  bossActive: boolean;
  bossHp: number;
  bossMaxHp: number;
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
}

interface OverlinkGame3DProps {
  godMode: boolean;
  onUpdateStats: (stats: Partial<OverlinkStats>) => void;
  onGameOver: () => void;
  onVictory: () => void;
}

export const OverlinkGame3D: React.FC<OverlinkGame3DProps> = ({
  godMode,
  onUpdateStats,
  onGameOver,
  onVictory,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const stateRef = useRef({
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
    activeChassis: 'UNIT7' as 'UNIT7' | 'TITAN',
    isShieldActive: false,
    bossActive: false,
    bossHp: 500,
    bossMaxHp: 500,
    bossAlert: null as string | null,
    scoutsEliminated: 0,
    totalScouts: 6,
    enforcersEliminated: 0,
    totalEnforcers: 2,
    activeBanner: null as MissionBannerData | null,
    activeWeapon: 'SNIPER' as 'PULSE' | 'SNIPER',
    sniperAllyRescued: true,
    sniperAllyHp: 350,
    sniperAllyMaxHp: 350,
    sniperAllyDancing: false,
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

    // 1. SCENE SETUP (Clean, Vibrant, High-Tech Futuristic Light Theme)
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf1f5f9);
    scene.fog = new THREE.FogExp2(0xe2e8f0, 0.009);

    // 2. CAMERA, SCREEN SHAKE & VFX (Cinematic Over-The-Shoulder Camera)
    const camera = new THREE.PerspectiveCamera(
      52,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    // Initial camera placement: elevated over-the-shoulder chase view
    camera.position.set(-7.0, 3.6, 10.8);
    const screenShake = new ScreenShake();
    const vfx = new VFXSystem(scene);

    // 3. RENDERER
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 4. LIGHTING (Crisp high-visibility studio daylight with vibrant cyber accents)
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.6);
    scene.add(ambientLight);

    // Main overhead cyber daylight floodlight
    const dirLight = new THREE.DirectionalLight(0xffffff, 3.4);
    dirLight.position.set(24, 38, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    scene.add(dirLight);

    // Vibrant Sky-Blue Cyber Rim Light
    const rimLight = new THREE.DirectionalLight(0xbae6fd, 2.2);
    rimLight.position.set(-20, 26, -30);
    scene.add(rimLight);

    // Floor upward electric cyan bounce
    const floorLight = new THREE.PointLight(0x0ea5e9, 2.4, 65, 1.2);
    floorLight.position.set(0, 3.0, 0);
    scene.add(floorLight);

    // 5. BUILD FACTORY ARENA
    const arena = factoryArena.build(scene);

    // 6. SPAWN EVACUATION AIRLOCK WITH VOLUMETRIC HOLOGRAPHIC BEACON (Expanded to 48m runway)
    const airlock = entityFactory.createEvacuationAirlock();
    airlock.position.set(0, 0, 48);
    scene.add(airlock);

    const airlockLight = new THREE.PointLight(0x10b981, 4.5, 30, 1.2);
    airlockLight.position.set(0, 4, 48);
    scene.add(airlockLight);

    // Luminous emerald beam rising from the airlock into the ceiling
    const beaconGeo = new THREE.CylinderGeometry(2.4, 2.4, 18, 24, 1, true);
    const beaconMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
    beaconMesh.position.set(0, 9, 48);
    scene.add(beaconMesh);

    // 7. SPAWN HUMAN HERO (MAIN PLAYABLE CHARACTER) - Operative Nathan armed with 3D KSR-29 AP Sniper Rifle
    const unit7: HumanHeroEntity = humanHeroFactory.createHero();
    unit7.group.position.set(-5, 0, 4);
    unit7.group.rotation.y = -0.35;
    scene.add(unit7.group);

    // 8. SPAWN MK-IV TITAN MECH - Massive in central foundry facing catwalk
    const titan: TitanMechEntity = entityFactory.createTitanMech();
    titan.group.position.set(3.5, 0, -8);
    titan.group.rotation.y = Math.PI - 0.35;
    scene.add(titan.group);

    // 9. SPAWN TRAPPED RESEARCH SCIENTISTS - Positioned tactically in the facility
    const scientists: ScientistEntity[] = [
      entityFactory.createScientist(),
      entityFactory.createScientist(),
    ];
    scientists[0].group.position.set(18, 0, 12);
    scientists[1].group.position.set(-22, 0, 18);
    scientists.forEach((sc) => scene.add(sc.group));

    // 10. SPAWN SCOUT ENEMY BOTS (6 hostile scouts spread across 160m warzone)
    interface ActiveScout {
      group: THREE.Group;
      eye: THREE.Mesh;
      hp: number;
      speed: number;
      shootCooldown: number;
      animateBob: (time: number) => void;
    }
    const scouts: ActiveScout[] = [];
    const scoutSpawnPoints = [
      new THREE.Vector3(-36, 0, -26),
      new THREE.Vector3(36, 0, -26),
      new THREE.Vector3(-40, 0, 16),
      new THREE.Vector3(40, 0, 16),
      new THREE.Vector3(-18, 0, -42),
      new THREE.Vector3(18, 0, -42),
    ];

    scoutSpawnPoints.forEach((pos) => {
      const scout = entityFactory.createScoutBot();
      scout.group.position.copy(pos);
      scene.add(scout.group);
      scouts.push({ ...scout, shootCooldown: Math.random() * 60 });
    });

    // 10b. SPAWN HEAVY COMBAT ENFORCERS (The 3D Robot Enemy Model)
    const enforcers: EnforcerRobotEntity[] = [
      enforcerRobotFactory.createEnforcer(new THREE.Vector3(26, 0, -14)),
      enforcerRobotFactory.createEnforcer(new THREE.Vector3(-26, 0, -14)),
    ];
    enforcers.forEach((enf) => scene.add(enf.group));

    // 11. CORE-X BOSS ENTITY (Instantiated ready for Wave 2)
    const boss: BossCoreXEntity = bossFactory.createCoreX();
    boss.group.position.set(0, 0, -28);

    // Boss Stomp Shockwave Ring
    const shockwaveGeo = new THREE.RingGeometry(0.5, 1.2, 32);
    shockwaveGeo.rotateX(-Math.PI / 2);
    const shockwaveMat = new THREE.MeshBasicMaterial({
      color: 0xff0044,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
    });
    const shockwaveMesh = new THREE.Mesh(shockwaveGeo, shockwaveMat);
    shockwaveMesh.position.set(0, 0.1, -28);
    scene.add(shockwaveMesh);

    let shockwaveActive = false;
    let shockwaveRadius = 0;
    let stompCooldown = 4.0;
    let bossShootCooldown = 2.5;
    let laserDamageSoundCooldown = 0;
    let tetherAudioCooldown = 0;

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
    }
    const projectiles: Projectile[] = [];
    const projGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.2, 8);
    projGeo.rotateX(Math.PI / 2);
    const playerProjMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const enemyProjMat = new THREE.MeshBasicMaterial({ color: 0xff1133 });
    const titanProjGeo = new THREE.SphereGeometry(0.35, 12, 12);
    const titanProjMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const bossProjGeo = new THREE.SphereGeometry(0.45, 12, 12);
    const bossProjMat = new THREE.MeshBasicMaterial({ color: 0xff0044 });

    // High-Velocity AP Sniper Projectile
    const sniperProjGeo = new THREE.CylinderGeometry(0.06, 0.06, 2.2, 8);
    sniperProjGeo.rotateX(Math.PI / 2);
    const sniperProjMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });

    // Raycaster for mouse
    const raycaster = new THREE.Raycaster();
    const mousePlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const mouseWorldPos = new THREE.Vector3();

    // 14. MAIN GAME LOOP
    const clock = new THREE.Clock();
    let animId: number;
    let shootCooldown = 0;
    let swapCooldown = 0;
    let weaponSwitchCooldown = 0;
    let allyCommandCooldown = 0;
    let camYaw = 0;
    let effectiveYaw = 0;
    let invulnTimer = 0;
    let timeSinceLastDamage = 0;
    let regenSparkTimer = 0;
    let isReloading = false;
    let reloadTimer = 0;

    // Dynamic Mission Banner Announcement System
    let bannerTimeout: number | undefined;
    const triggerBanner = (type: 'SUCCESS' | 'ALERT' | 'INFO', title: string, subtitle: string, duration = 3800) => {
      s.activeBanner = { id: Math.random().toString(), type, title, subtitle };
      sounds.playPowerup();
      if (bannerTimeout) window.clearTimeout(bannerTimeout);
      bannerTimeout = window.setTimeout(() => {
        s.activeBanner = null;
      }, duration);
    };

    const triggerWave2Boss = () => {
      if (s.wave === 1) {
        s.wave = 2;
        s.bossActive = true;
        s.bossAlert = 'CRITICAL ALERT: CORE-X TITAN SPIDER AWAKENED!';
        triggerBanner('ALERT', 'CRITICAL THREAT: CORE-X AWAKENED!', 'APEX LEVEL HOSTILE ENGAGED // USE TITAN CANNONS!');
        scene.add(boss.group);
        boss.group.position.set(0, 0, -28);
        boss.isAwake = true;
        sounds.playBossRoar();
        sounds.setBGMIntensity('boss');
        screenShake.addTrauma(0.85);
        vfx.triggerBossAlertFlash();
        vfx.emitText(boss.group.position.clone().add(new THREE.Vector3(0, 6, 0)), 'CORE-X AWAKENED!', '#ff0033', 26, true);

        window.setTimeout(() => {
          s.bossAlert = null;
        }, 4500);
      }
    };

    const initialMissionTimer = window.setTimeout(() => {
      triggerBanner('INFO', 'MISSION OBJECTIVE ACTIVE', 'CLEAR HOSTILE AIR RECON SCOUTS [0/6]');
    }, 800);

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

    const loop = () => {
      if (!s.isRunning) return;

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Update Invulnerability & Health Regen Timers
      invulnTimer = Math.max(0, invulnTimer - delta);
      timeSinceLastDamage += delta;

      // Active entity reference (Unit-7 or Titan)
      const activeObj = s.activeChassis === 'UNIT7' ? unit7.group : titan.group;

      // Dash grants temporary invulnerability
      if (input.isActionPressed('dash') && s.activeChassis === 'UNIT7') {
        invulnTimer = Math.max(invulnTimer, 0.22);
      }

      // Passive Nanite Shield Regeneration: +12 HP/sec after 3s without taking damage
      if (timeSinceLastDamage > 3.0 && s.health < 100 && s.isRunning) {
        s.health = Math.min(100, s.health + delta * 12);
        regenSparkTimer -= delta;
        if (regenSparkTimer <= 0) {
          vfx.emitSparks(activeObj.position.clone().add(new THREE.Vector3(0, 1.2, 0)), 2, 0x10b981, 2);
          regenSparkTimer = 0.35;
        }
      }

      // Visual i-frame flicker for Unit-7
      if (invulnTimer > 0 && s.activeChassis === 'UNIT7') {
        unit7.group.visible = Math.floor(time * 26) % 2 === 0;
      } else if (s.activeChassis === 'UNIT7') {
        unit7.group.visible = true;
      }

      // A. UPDATE FACTORY SIRENS & VFX
      arena.updateSirens(time);
      vfx.update(delta);

      // B. CURSOR-DRIVEN CAMERA ORBIT & ROTATION
      const mouse = input.state.mouse;
      const halfW = window.innerWidth * 0.5;
      const halfH = window.innerHeight * 0.5;
      const normX = (mouse.x - halfW) / (halfW || 1);
      const normY = (mouse.y - halfH) / (halfH || 1);

      // Consume physical mouse movements
      const mouseDelta = input.consumeMouseDelta();
      camYaw += mouseDelta.dx * 0.0035;

      // Smooth edge-panning when aiming towards the screen edges
      if (Math.abs(normX) > 0.35) {
        const panDir = Math.sign(normX);
        const panSpeed = (Math.abs(normX) - 0.35) / 0.65;
        camYaw += panDir * panSpeed * 2.2 * delta;
      }

      // Dynamic Camera Orbit directly driven by cursor position across the screen
      // Moving cursor right turns camera right; moving left turns camera left
      const targetYaw = camYaw + normX * 0.82;
      effectiveYaw = THREE.MathUtils.lerp(effectiveYaw, targetYaw, Math.min(1.0, delta * 10.0));

      // Camera direction vectors in XZ plane
      const fwdX = Math.sin(effectiveYaw);
      const fwdZ = -Math.cos(effectiveYaw);
      const rightX = Math.cos(effectiveYaw);
      const rightZ = Math.sin(effectiveYaw);

      // C. DYNAMIC PANORAMIC THIRD-PERSON CAMERA (100% UPRIGHT & ROCK-SOLID)
      screenShake.update(delta * 2.2);

      const isTitan = s.activeChassis === 'TITAN';
      const camDist = isTitan ? 12.5 : 8.5;
      const camHeight = (isTitan ? 8.2 : 5.8) - THREE.MathUtils.clamp(normY, -1.0, 1.0) * 0.8;
      const shoulderOffset = isTitan ? 1.0 : 0.6;

      // Over-the-shoulder chase view relative to current camera yaw
      const targetCamX = activeObj.position.x - fwdX * camDist - rightX * shoulderOffset;
      const targetCamZ = activeObj.position.z - fwdZ * camDist - rightZ * shoulderOffset;
      const targetCamY = activeObj.position.y + camHeight;

      const lerpFactor = Math.min(1.0, delta * 8.0);
      camera.position.x += (targetCamX - camera.position.x) * lerpFactor + screenShake.offsetX * 0.02;
      camera.position.y += (targetCamY - camera.position.y) * lerpFactor + screenShake.offsetY * 0.02;
      camera.position.z += (targetCamZ - camera.position.z) * lerpFactor;

      // Look forward along camera angle with dynamic lookahead
      const lookDist = isTitan ? 4.5 : 3.0;
      const lookTarget = new THREE.Vector3(
        activeObj.position.x + fwdX * lookDist + rightX * (normX * 1.5),
        activeObj.position.y + (isTitan ? 2.5 : 1.3),
        activeObj.position.z + fwdZ * lookDist + rightZ * (normX * 1.5)
      );

      // Enforce strictly upright camera with world up (0, 1, 0) - NEVER mutate Euler rotation.z!
      camera.up.set(0, 1, 0);
      camera.lookAt(lookTarget);

      // D. MOUSE AIM RAYCASTING
      const ndcX = (mouse.x / window.innerWidth) * 2 - 1;
      const ndcY = -(mouse.y / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);
      let hitPos = raycaster.ray.intersectPlane(mousePlane, mouseWorldPos);
      if (!hitPos) {
        hitPos = raycaster.ray.origin.clone().addScaledVector(raycaster.ray.direction, 25);
      }

      if (hitPos) {
        const targetAngle = Math.atan2(
          hitPos.x - activeObj.position.x,
          hitPos.z - activeObj.position.z
        );
        activeObj.rotation.y = targetAngle;
        if (s.activeChassis === 'UNIT7') {
          unit7.updateLaserAim(hitPos);
        }
      }

      // E. CAMERA-RELATIVE MOVEMENT (WASD)
      const currentSpeed =
        s.activeChassis === 'TITAN'
          ? 4.8 * delta
          : (input.isActionPressed('dash') ? 14 : 8) * delta;

      let inputFwd = 0;
      let inputRight = 0;
      if (input.isActionPressed('up')) inputFwd += 1;
      if (input.isActionPressed('down')) inputFwd -= 1;
      if (input.isActionPressed('right')) inputRight += 1;
      if (input.isActionPressed('left')) inputRight -= 1;

      const isMoving = inputFwd !== 0 || inputRight !== 0;
      if (isMoving) {
        const length = Math.hypot(inputFwd, inputRight);
        const normFwd = inputFwd / length;
        const normRight = inputRight / length;
        activeObj.position.x += (fwdX * normFwd + rightX * normRight) * currentSpeed;
        activeObj.position.z += (fwdZ * normFwd + rightZ * normRight) * currentSpeed;
      }

      if (s.activeChassis === 'UNIT7') {
        unit7.animateWalk(time, isMoving);
        if (s.thermalStability < 100) {
          s.thermalStability = Math.min(100, s.thermalStability + delta * 7.5);
        }
      } else {
        titan.animateWalk(time, isMoving);
        // Titan thermal countdown
        s.thermalStability = Math.max(0, s.thermalStability - delta * 3.5);
        if (s.thermalStability <= 0) {
          // Meltdown: Eject back to Unit-7 with shockwave!
          s.activeChassis = 'UNIT7';
          s.isTitanAllied = true;
          sounds.playExplosion('large');
          screenShake.addTrauma(0.5);
          vfx.emitSparks(titan.group.position, 40, 0x00f0ff, 12, true);
          vfx.emitText(titan.group.position, 'THERMAL OVERHEAT // EJECT!', '#ef4444', 20, true);
          unit7.group.position.copy(titan.group.position).add(new THREE.Vector3(2, 0, 2));
          unit7.group.visible = true;
        }
      }

      // Clamp within boundaries (160m facility bounds)
      activeObj.position.x = Math.max(-70, Math.min(70, activeObj.position.x));
      activeObj.position.z = Math.max(-70, Math.min(70, activeObj.position.z));

      // E. BODY-SWAPPING (EMBODY TITAN)
      if (swapCooldown > 0) swapCooldown -= delta;
      const distToTitan = unit7.group.position.distanceTo(titan.group.position);

      if (
        input.isActionPressed('special') &&
        s.isTitanAllied &&
        swapCooldown <= 0
      ) {
        swapCooldown = 0.8;
        if (s.activeChassis === 'UNIT7' && distToTitan < 8.0) {
          // EMBODY TITAN!
          s.activeChassis = 'TITAN';
          s.thermalStability = 100;
          unit7.group.visible = false;
          sounds.playPowerup();
          screenShake.addTrauma(0.2);
          vfx.emitSparks(titan.group.position, 25, 0x00f0ff, 8, true);
          vfx.emitText(titan.group.position, 'EMBODIED MK-IV TITAN!', '#00f0ff', 22, true);
        } else if (s.activeChassis === 'TITAN') {
          // EJECT BACK TO UNIT-7!
          s.activeChassis = 'UNIT7';
          unit7.group.position.copy(titan.group.position).add(new THREE.Vector3(2, 0, 2));
          unit7.group.visible = true;
          sounds.playDash();
          vfx.emitText(titan.group.position, 'DISENGAGED', '#94a3b8', 16);
        }
      }

      // F. NEURAL TETHER HACKING (When piloting Unit-7)
      if (s.activeChassis === 'UNIT7') {
        const isAimingAtTitan = mouseWorldPos.distanceTo(titan.group.position) < 6;
        const wantTether = input.state.mouse.rightDown;

        if (wantTether && distToTitan < 28 && isAimingAtTitan && !s.isTitanAllied) {
          if (!s.isTetherActive) {
            tether.activate(unit7.weaponMuzzle, titan.group);
            s.isTetherActive = true;
            sounds.playDash();
          }
          tether.update(unit7.weaponMuzzle, delta, time);
          s.hackProgress = tether.state.progress;

          // Tether hum sound & sparks at target
          tetherAudioCooldown -= delta;
          if (tetherAudioCooldown <= 0) {
            sounds.playNeuralTetherHum();
            vfx.emitSparks(titan.group.position.clone().add(new THREE.Vector3(0, 3, 0)), 4, 0x00f0ff, 5);
            tetherAudioCooldown = 0.14;
          }

          if (s.hackProgress >= 100 && !s.isTitanAllied) {
            s.isTitanAllied = true;
            titan.setAllied(true);
            tether.deactivate();
            s.isTetherActive = false;
            sounds.playPowerup();
            screenShake.addTrauma(0.35);
            vfx.emitSparks(titan.group.position, 45, 0x00f0ff, 12, true);
            vfx.emitText(titan.group.position.clone().add(new THREE.Vector3(0, 5, 0)), 'NEURAL OVERLINK RESTORED!', '#00f0ff', 24, true);
            s.score += 2500;
            triggerBanner('SUCCESS', 'TITAN OVERLINK RESTORED!', 'PRESS [E] TO PILOT MK-IV TITAN MECH (+2,500 PTS)');
          }
        } else {
          if (s.isTetherActive) {
            tether.deactivate();
            s.isTetherActive = false;
          }
        }
      }

      // G. TITAN SHIELD ACTIVATION
      if (s.activeChassis === 'TITAN') {
        s.isShieldActive = input.isActionPressed('dash');
        titan.aegisShield.visible = s.isShieldActive;
      } else {
        s.isShieldActive = false;
        titan.aegisShield.visible = false;
      }

      // H. WEAPON SWITCHING [Q] & ALLY COMMANDS [T]
      if (weaponSwitchCooldown > 0) weaponSwitchCooldown -= delta;
      if (allyCommandCooldown > 0) allyCommandCooldown -= delta;

      if (input.isActionPressed('switchWeapon') && s.activeChassis === 'UNIT7' && weaponSwitchCooldown <= 0) {
        weaponSwitchCooldown = 0.35;
        s.activeWeapon = s.activeWeapon === 'PULSE' ? 'SNIPER' : 'PULSE';
        sounds.playSniperReload();
        vfx.emitText(
          activeObj.position.clone().add(new THREE.Vector3(0, 2.2, 0)),
          s.activeWeapon === 'SNIPER' ? 'EQUIPPED: KSR-29 AP SNIPER' : 'EQUIPPED: PLASMA PULSE RIFLE',
          s.activeWeapon === 'SNIPER' ? '#10b981' : '#38bdf8',
          20,
          true
        );
      }

      if (input.isActionPressed('commandAlly') && allyCommandCooldown <= 0) {
        allyCommandCooldown = 0.4;
        if (s.activeChassis === 'UNIT7') {
          unit7.toggleVictoryDance();
          if (unit7.isDancing) {
            triggerBanner('SUCCESS', 'VICTORY DANCE!', 'RESISTANCE CELEBRATION PROTOCOL ACTIVE! [F] TO COMBAT');
            sounds.playPowerup();
          } else {
            triggerBanner('INFO', 'COMBAT STANCE', 'OPERATIVE NATHAN: KSR-29 AP SNIPER LOCKED ON HOSTILES');
          }
        }
      }

      // I. SHOOTING & RELOADING [R]
      if (shootCooldown > 0) shootCooldown -= delta;

      // Manual Reload Trigger on [R]
      if (input.isActionPressed('reload') && s.activeChassis === 'UNIT7' && s.ammo < s.maxAmmo && !isReloading) {
        isReloading = true;
        reloadTimer = 0.9;
        if (s.activeWeapon === 'SNIPER') {
          sounds.playSniperReload();
        } else {
          sounds.playReload();
        }
        vfx.emitText(activeObj.position.clone().add(new THREE.Vector3(0, 2.2, 0)), 'RELOADING...', '#38bdf8', 18);
      }

      // Reload Progression
      if (isReloading) {
        reloadTimer -= delta;
        if (reloadTimer <= 0) {
          s.ammo = s.maxAmmo;
          isReloading = false;
          vfx.emitText(activeObj.position.clone().add(new THREE.Vector3(0, 2.2, 0)), 'AMMO REFILLED (50/50)', '#10b981', 18);
        }
      }

      // Firing Controls
      if (input.isActionPressed('fire') && shootCooldown <= 0) {
        if (s.activeChassis === 'UNIT7') {
          if (isReloading) {
            // Can't shoot while reload in progress
          } else if (s.ammo <= 0) {
            // Auto-trigger reload on dry fire
            isReloading = true;
            reloadTimer = 0.9;
            if (s.activeWeapon === 'SNIPER') {
              sounds.playSniperReload();
            } else {
              sounds.playReload();
            }
            vfx.emitText(activeObj.position.clone().add(new THREE.Vector3(0, 2.2, 0)), 'NO AMMO // RELOADING [R]', '#ef4444', 18);
          } else if (s.activeWeapon === 'SNIPER') {
            shootCooldown = 0.72;
            s.ammo = Math.max(0, s.ammo - 2);
            sounds.playSniperShot();
            screenShake.addTrauma(0.18);
            unit7.triggerRecoil();
            vfx.emitSparks(unit7.weaponMuzzle, 10, 0x10b981, 8);

            const projMesh = new THREE.Mesh(sniperProjGeo, sniperProjMat);
            projMesh.position.copy(unit7.weaponMuzzle);
            const shootDir = mouseWorldPos.clone().sub(unit7.weaponMuzzle);
            shootDir.y = 0;
            shootDir.normalize();
            projMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), shootDir);
            scene.add(projMesh);
            projectiles.push({ mesh: projMesh, dir: shootDir, life: 2.2, isSniperShot: true });
          } else {
            shootCooldown = 0.18;
            s.ammo--;
            sounds.playShoot(900);
            screenShake.addTrauma(0.04);
            unit7.triggerRecoil();
            vfx.emitSparks(unit7.weaponMuzzle, 4, 0x00f0ff, 4);

            const projMesh = new THREE.Mesh(projGeo, playerProjMat);
            projMesh.position.copy(unit7.weaponMuzzle);
            const shootDir = mouseWorldPos.clone().sub(unit7.weaponMuzzle);
            shootDir.y = 0;
            shootDir.normalize();
            projMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), shootDir);
            scene.add(projMesh);
            projectiles.push({ mesh: projMesh, dir: shootDir, life: 1.5 });
          }
        } else if (s.activeChassis === 'TITAN') {
          // TITAN HYDRAULIC SLAM CANNON
          shootCooldown = 0.45;
          sounds.playTitanCannon();
          screenShake.addTrauma(0.35);

          const spawnPos = titan.group.position.clone().add(new THREE.Vector3(0, 3.2, 1.2));
          vfx.emitSparks(spawnPos, 14, 0x38bdf8, 8);

          const projMesh = new THREE.Mesh(titanProjGeo, titanProjMat);
          projMesh.position.copy(spawnPos);
          const shootDir = mouseWorldPos.clone().sub(titan.group.position);
          shootDir.y = 0;
          shootDir.normalize();
          projMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), shootDir);
          scene.add(projMesh);
          projectiles.push({ mesh: projMesh, dir: shootDir, life: 1.8, isTitanShot: true });
        }
      }

      // I. SCOUT ENEMY AI & SHOOTING
      scouts.forEach((scout) => {
        scout.animateBob(time);
        const scoutPos = scout.group.position;
        const targetEntity = s.activeChassis === 'UNIT7' ? unit7.group : titan.group;
        const distToPlayer = scoutPos.distanceTo(targetEntity.position);

        const angle = Math.atan2(
          targetEntity.position.x - scoutPos.x,
          targetEntity.position.z - scoutPos.z
        );
        scout.group.rotation.y = angle;

        if (distToPlayer > 8) {
          scoutPos.x += Math.sin(angle) * scout.speed * delta;
          scoutPos.z += Math.cos(angle) * scout.speed * delta;
        }

        // Scout shooting (balanced: 6-10s cooldown)
        scout.shootCooldown -= delta * 20;
        if (scout.shootCooldown <= 0) {
          scout.shootCooldown = 140 + Math.random() * 80;
          const eProj = new THREE.Mesh(projGeo, enemyProjMat);
          eProj.position.copy(scoutPos).add(new THREE.Vector3(0, 0.8, 0));
          const shootDir = new THREE.Vector3(Math.sin(angle), 0, Math.cos(angle));
          eProj.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), shootDir);
          scene.add(eProj);
          projectiles.push({ mesh: eProj, dir: shootDir, life: 2.5, isEnemy: true });
        }
      });

      // I2. HEAVY COMBAT ENFORCER DROID AI & SHOOTING (3D Robot Enemy)
      enforcers.forEach((enf) => {
        const enfPos = enf.group.position;
        const targetEntity = s.activeChassis === 'UNIT7' ? unit7.group : titan.group;
        const distToPlayer = enfPos.distanceTo(targetEntity.position);

        const angle = Math.atan2(
          targetEntity.position.x - enfPos.x,
          targetEntity.position.z - enfPos.z
        );
        enf.group.rotation.y = angle;

        if (distToPlayer > 10) {
          enfPos.x += Math.sin(angle) * enf.speed * delta;
          enfPos.z += Math.cos(angle) * enf.speed * delta;
          enf.animateWalk(time, true);
        } else {
          enf.animateWalk(time, false);
        }

        // Enforcer Heavy Plasma Blast (balanced cooldown)
        enf.shootCooldown -= delta * 20;
        if (enf.shootCooldown <= 0) {
          enf.shootCooldown = 90 + Math.random() * 50;
          sounds.playShoot(420);
          const eProj = new THREE.Mesh(projGeo, enemyProjMat);
          eProj.position.copy(enfPos).add(new THREE.Vector3(0, 1.8, 0));
          const shootDir = new THREE.Vector3(Math.sin(angle), 0, Math.cos(angle));
          eProj.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), shootDir);
          scene.add(eProj);
          projectiles.push({ mesh: eProj, dir: shootDir, life: 2.5, isEnemy: true });
        }
      });

      // J. CORE-X BOSS AI & COMBAT (WAVE 2)
      if (s.bossActive && boss.isAwake) {
        const bossPos = boss.group.position;
        const targetEntity = s.activeChassis === 'UNIT7' ? unit7.group : titan.group;
        const distToPlayer = bossPos.distanceTo(targetEntity.position);

        // Turn boss towards active target
        const bossAngle = Math.atan2(
          targetEntity.position.x - bossPos.x,
          targetEntity.position.z - bossPos.z
        );
        boss.group.rotation.y = THREE.MathUtils.lerp(boss.group.rotation.y, bossAngle, 0.05);

        // Boss creeping crawl
        const bossSpeed = 3.2 * delta;
        if (distToPlayer > 6.0) {
          bossPos.x += Math.sin(bossAngle) * bossSpeed;
          bossPos.z += Math.cos(bossAngle) * bossSpeed;
          boss.animateCrawl(time, true);
        } else {
          boss.animateCrawl(time, false);
        }

        // 1. Sweeping Red Laser Beam (Tunable balanced DPS: 7/sec)
        boss.updateLaserSweep(time);
        const toPlayer = new THREE.Vector3().subVectors(activeObj.position, bossPos);
        toPlayer.y = 0;
        const projDist = toPlayer.dot(boss.laserDir);
        if (projDist > 1.2 && projDist < 30) {
          const projectedPoint = boss.laserDir.clone().multiplyScalar(projDist);
          const perpDist = toPlayer.distanceTo(projectedPoint);
          if (perpDist < 2.0) {
            // Laser contact!
            if (s.activeChassis === 'TITAN' && s.isShieldActive) {
              // Blocked safely by Titan Aegis Shield
              sounds.playShieldDeflect();
              vfx.triggerShieldFlash();
              vfx.emitSparks(activeObj.position, 6, 0x00f0ff, 8);
            } else if (!s.godMode && invulnTimer <= 0) {
              const laserDmg = (s.activeChassis === 'TITAN' ? 3.0 : 7.0) * delta;
              s.health = Math.max(0, s.health - laserDmg);
              timeSinceLastDamage = 0;
              screenShake.addTrauma(delta * 0.15);
              vfx.triggerDamageFlash();
              vfx.emitSparks(activeObj.position, 2, 0xff0044, 4);

              laserDamageSoundCooldown -= delta;
              if (laserDamageSoundCooldown <= 0) {
                sounds.playHit();
                laserDamageSoundCooldown = 0.35;
              }
              if (s.health <= 0) {
                s.isRunning = false;
                onGameOver();
                return;
              }
            }
          }
        }

        // 2. Boss Plasma Missile Barrage (Balanced 6 dmg per missile)
        bossShootCooldown -= delta;
        if (bossShootCooldown <= 0) {
          bossShootCooldown = 3.8;
          sounds.playShoot(320);
          [-1.4, 1.4].forEach((offset) => {
            const bProjMesh = new THREE.Mesh(bossProjGeo, bossProjMat);
            bProjMesh.position.copy(bossPos).add(new THREE.Vector3(offset, 3.4, 1.5));
            const shootDir = activeObj.position.clone().sub(bProjMesh.position).normalize();
            shootDir.y = 0;
            scene.add(bProjMesh);
            projectiles.push({ mesh: bProjMesh, dir: shootDir, life: 2.5, isEnemy: true, isBossShot: true });
          });
        }

        // 3. Boss Ground Stomp Shockwave (When player is near)
        if (stompCooldown > 0) stompCooldown -= delta;
        if (distToPlayer < 9.0 && stompCooldown <= 0) {
          stompCooldown = 6.0;
          shockwaveActive = true;
          shockwaveRadius = 1.0;
          shockwaveMesh.position.copy(bossPos);
          shockwaveMesh.position.y = 0.1;
          shockwaveMat.opacity = 0.9;
          sounds.playExplosion('large');
          screenShake.addTrauma(0.55);
          vfx.emitSparks(bossPos, 35, 0xff0044, 12);
          vfx.emitText(bossPos.clone().add(new THREE.Vector3(0, 3, 0)), 'STOMP SHOCKWAVE!', '#ff0044', 20, true);
        }

        // Shockwave expansion
        if (shockwaveActive) {
          shockwaveRadius += delta * 22;
          shockwaveMesh.scale.set(shockwaveRadius, shockwaveRadius, shockwaveRadius);
          shockwaveMat.opacity = Math.max(0, 1 - shockwaveRadius / 18);

          if (Math.abs(distToPlayer - shockwaveRadius) < 1.8) {
            if (s.activeChassis === 'TITAN' && s.isShieldActive) {
              // Blocked by Titan shield
              sounds.playShieldDeflect();
              vfx.triggerShieldFlash();
            } else if (!s.godMode && invulnTimer <= 0) {
              invulnTimer = 0.7; // Shockwave grants 0.7s i-frame
              timeSinceLastDamage = 0;
              const shockDmg = s.activeChassis === 'TITAN' ? 4 : 8;
              s.health = Math.max(0, s.health - shockDmg);
              sounds.playHit();
              screenShake.addTrauma(0.3);
              vfx.triggerDamageFlash();
              vfx.emitSparks(activeObj.position, 12, 0xff0044, 6);
              vfx.emitText(activeObj.position.clone().add(new THREE.Vector3(0, 2.5, 0)), `-${shockDmg}`, '#ef4444', 20, true);
              if (s.health <= 0) {
                s.isRunning = false;
                onGameOver();
                return;
              }
            }
          }

          if (shockwaveRadius >= 18) {
            shockwaveActive = false;
            shockwaveMat.opacity = 0;
          }
        }
      }

      // K. UPDATE PROJECTILES & COLLISIONS
      for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];
        const projSpeed = p.isSniperShot ? 72 : (p.isTitanShot ? 28 : (p.isBossShot ? 20 : (p.isEnemy ? 24 : 38)));
        p.mesh.position.addScaledVector(p.dir, projSpeed * delta);
        p.life -= delta;

        // Player / Titan / Sniper Projectile vs Scouts
        if (!p.isEnemy) {
          for (let j = scouts.length - 1; j >= 0; j--) {
            const sc = scouts[j];
            const dx = p.mesh.position.x - sc.group.position.x;
            const dz = p.mesh.position.z - sc.group.position.z;
            const distXZ = Math.hypot(dx, dz);
            if (distXZ < (p.isSniperShot ? 2.5 : (p.isTitanShot ? 3.4 : 2.2))) {
              sounds.playHit();
              const dmg = p.isSniperShot ? 120 : (p.isTitanShot ? 80 : 50);
              sc.hp -= dmg;
              vfx.emitSparks(p.mesh.position, p.isSniperShot ? 30 : (p.isTitanShot ? 26 : 14), p.isSniperShot ? 0x10b981 : 0x00f0ff, p.isSniperShot ? 12 : 6);
              vfx.emitText(sc.group.position, p.isSniperShot ? '-120 AP CRIT' : (p.isTitanShot ? '-80 CRIT' : '-50'), p.isSniperShot ? '#10b981' : '#38bdf8', 16, true);

              scene.remove(p.mesh);
              projectiles.splice(i, 1);

              if (sc.hp <= 0) {
                sounds.playExplosion('small');
                vfx.emitSparks(sc.group.position, 40, 0xff0044, 12, true);
                vfx.emitText(sc.group.position, '+250 DESTROYED', '#10b981', 18);
                scene.remove(sc.group);
                scouts.splice(j, 1);
                s.score += 250;
                s.scoutsEliminated++;
                if (s.scoutsEliminated >= s.totalScouts) {
                  triggerBanner('SUCCESS', 'AIRSPACE SECURED!', 'ALL 6 HOSTILE AIR RECON SCOUTS DESTROYED (+1,000 PTS)');
                  s.score += 1000;
                  window.setTimeout(() => {
                    triggerBanner('INFO', 'NEW MISSION DIRECTIVE', 'RESCUE TRAPPED RESEARCH PERSONNEL (0/2)');
                  }, 3800);
                } else {
                  triggerBanner('INFO', 'AIR RECON INTERCEPTED', `SCOUT BOT DESTROYED [${s.scoutsEliminated}/${s.totalScouts}]`);
                }
              }
              break;
            }
          }

          // Player / Titan / Sniper Projectile vs Heavy Enforcers (3D Robot Enemy)
          for (let k = enforcers.length - 1; k >= 0; k--) {
            const enf = enforcers[k];
            const dx = p.mesh.position.x - enf.group.position.x;
            const dz = p.mesh.position.z - enf.group.position.z;
            const distXZ = Math.hypot(dx, dz);
            if (distXZ < (p.isSniperShot ? 2.6 : (p.isTitanShot ? 3.4 : 2.4))) {
              sounds.playHit();
              enf.flashHit();
              const dmg = p.isSniperShot ? 120 : (p.isTitanShot ? 80 : 50);
              enf.hp -= dmg;
              vfx.emitSparks(p.mesh.position, p.isSniperShot ? 32 : (p.isTitanShot ? 28 : 16), p.isSniperShot ? 0x10b981 : 0xff0033, 8);
              vfx.emitText(enf.group.position.clone().add(new THREE.Vector3(0, 2.8, 0)), p.isSniperShot ? '-120 AP CRIT' : `-${dmg}`, p.isSniperShot ? '#10b981' : '#ef4444', 18, p.isSniperShot);

              scene.remove(p.mesh);
              projectiles.splice(i, 1);

              if (enf.hp <= 0) {
                sounds.playExplosion('large');
                screenShake.addTrauma(0.4);
                vfx.emitSparks(enf.group.position, 45, 0xff0044, 14, true);
                vfx.emitText(enf.group.position.clone().add(new THREE.Vector3(0, 3.2, 0)), '+750 ENFORCER DESTROYED', '#10b981', 22, true);
                scene.remove(enf.group);
                enforcers.splice(k, 1);
                s.score += 750;
                s.enforcersEliminated++;
                if (s.enforcersEliminated >= s.totalEnforcers) {
                  triggerBanner('SUCCESS', 'ENFORCERS DESTROYED!', 'PERIMETER DEFENSE CLEARED (+2,000 PTS)');
                  s.score += 2000;
                  if (s.rescuedScientists >= s.totalScientists && s.wave === 1) {
                    window.setTimeout(() => triggerWave2Boss(), 1500);
                  } else {
                    window.setTimeout(() => {
                      if (!s.isTitanAllied) {
                        triggerBanner('INFO', 'DIRECTIVE: OVERLINK', 'HACK MK-IV TITAN MECH (HOLD RMB)');
                      }
                    }, 3800);
                  }
                } else {
                  triggerBanner('SUCCESS', 'ENFORCER NEUTRALIZED!', `HEAVY COMBAT DROID ELIMINATED [${s.enforcersEliminated}/${s.totalEnforcers}]`);
                }
              }
              break;
            }
          }

          // Player / Titan / Sniper Projectile vs CORE-X BOSS
          if (s.bossActive && boss.isAwake && p.mesh.position.distanceTo(boss.group.position) < 3.8) {
            sounds.playHit();
            boss.flashHit();
            const dmg = p.isSniperShot ? 95 : (p.isTitanShot ? 65 : 22);
            boss.hp = Math.max(0, boss.hp - dmg);
            s.bossHp = boss.hp;
            s.score += dmg * 10;
            screenShake.addTrauma(p.isSniperShot ? 0.25 : (p.isTitanShot ? 0.22 : 0.08));

            vfx.emitSparks(p.mesh.position, p.isSniperShot ? 32 : (p.isTitanShot ? 30 : 14), p.isSniperShot ? 0x10b981 : 0xff0044, 9);
            vfx.emitText(boss.group.position.clone().add(new THREE.Vector3(0, 4.2, 0)), p.isSniperShot ? '-95 AP PIERCE' : (p.isTitanShot ? '-65 SLAM' : '-22'), p.isSniperShot ? '#10b981' : '#ff4444', 20, true);

            scene.remove(p.mesh);
            projectiles.splice(i, 1);

            if (boss.hp <= 0) {
              // BOSS DEFEATED!
              s.bossActive = false;
              s.bossHp = 0;
              sounds.playExplosion('large');
              screenShake.addTrauma(1.0);
              vfx.emitSparks(boss.group.position, 90, 0xff0044, 16, true);
              vfx.emitText(boss.group.position.clone().add(new THREE.Vector3(0, 6, 0)), 'CORE-X OBLITERATED! +10,000', '#10b981', 28, true);
              s.score += 10000;
              scene.remove(boss.group);
              boss.dispose();
              sounds.setBGMIntensity('normal');
              triggerBanner('SUCCESS', 'FACILITY LIBERATED!', 'CORE-X DESTROYED // S-RANK VICTORY (+10,000 PTS)');

              window.setTimeout(() => {
                s.isRunning = false;
                onVictory();
              }, 1200);
            }
            continue;
          }
        }

        // Enemy Projectile vs Player / Titan
        if (p.isEnemy) {
          // Blocked by Titan Aegis Shield
          if (s.isShieldActive && p.mesh.position.distanceTo(titan.group.position) < 3.8) {
            scene.remove(p.mesh);
            projectiles.splice(i, 1);
            sounds.playShieldDeflect();
            vfx.triggerShieldFlash();
            vfx.emitSparks(p.mesh.position, 18, 0x00f0ff, 9);
            vfx.emitText(titan.group.position.clone().add(new THREE.Vector3(0, 3.5, 0)), 'SHIELD BLOCKED', '#00f0ff', 16);
            continue;
          }

          const targetHitDist = s.activeChassis === 'TITAN' ? 2.4 : 1.4;
          if (p.mesh.position.distanceTo(activeObj.position) < targetHitDist) {
            if (!s.godMode && invulnTimer <= 0) {
              invulnTimer = 0.55; // 0.55s invulnerability frames on projectile hit
              timeSinceLastDamage = 0;
              let dmg = p.isBossShot ? 6 : 3; // Scout shot only 3 dmg, Boss shot 6 dmg
              if (s.activeChassis === 'TITAN') dmg = Math.max(1, Math.round(dmg * 0.4)); // Titan armor absorbs 60%
              s.health = Math.max(0, s.health - dmg);
              sounds.playHit();
              screenShake.addTrauma(0.25);
              vfx.triggerDamageFlash();
              vfx.emitSparks(activeObj.position, 12, 0xff0033, 6);
              vfx.emitText(activeObj.position.clone().add(new THREE.Vector3(0, 2.5, 0)), `-${dmg}`, '#ef4444', 18);

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

      // L. RESCUE & EVACUATE SCIENTISTS (WAVE 1)
      scientists.forEach((sc) => {
        const scPos = sc.group.position;
        if (!sc.isRescued) {
          sc.animateIdle(time);
          if (activeObj.position.distanceTo(scPos) < 4.5) {
            sc.isRescued = true;
            sounds.playPowerup();
            vfx.emitSparks(scPos, 20, 0xf59e0b, 7, true);
            vfx.emitText(scPos.clone().add(new THREE.Vector3(0, 3, 0)), 'SCIENTIST RESCUED! FOLLOW ME!', '#fbbf24', 18);
          }
        } else {
          // Rescued: Follow towards Airlock!
          const airlockPos = airlock.position;
          const distToAirlock = scPos.distanceTo(airlockPos);

          if (distToAirlock < 3.0) {
            // Reached airlock! Evacuated!
            s.rescuedScientists++;
            s.score += 1500;
            sounds.playEvacuateChime();
            vfx.emitSparks(airlockPos, 35, 0x10b981, 10, true);
            vfx.emitText(airlockPos.clone().add(new THREE.Vector3(0, 3, 0)), '+1500 EVACUATED!', '#34d399', 22, true);
            scene.remove(sc.group);
            sc.group.position.set(999, 999, 999);

            if (s.rescuedScientists >= s.totalScientists) {
              triggerBanner('SUCCESS', 'RESCUE COMPLETE!', 'ALL PERSONNEL SAFELY EVACUATED (+3,000 PTS)');
              s.score += 3000;
              if (s.enforcersEliminated >= s.totalEnforcers && s.wave === 1) {
                window.setTimeout(() => triggerWave2Boss(), 1500);
              } else {
                window.setTimeout(() => {
                  triggerBanner('INFO', 'SECTOR THREAT ACTIVE', 'PERSONNEL EVACUATED // DESTROY REMAINING ENFORCERS');
                }, 3800);
              }
            } else {
              triggerBanner('SUCCESS', 'CIVILIAN EVACUATED!', `PERSONNEL #${s.rescuedScientists} SAFELY SECURED (+1,500 PTS)`);
            }
          } else {
            // Walk toward airlock
            const angleToAirlock = Math.atan2(airlockPos.x - scPos.x, airlockPos.z - scPos.z);
            scPos.x += Math.sin(angleToAirlock) * 4.2 * delta;
            scPos.z += Math.cos(angleToAirlock) * 4.2 * delta;
          }
        }
      });

      // M. PUSH STATS TO REACT HUD
      onUpdateStats({
        health: s.health,
        energy: s.energy,
        thermalStability: Math.round(s.thermalStability),
        ammo: s.ammo,
        maxAmmo: s.maxAmmo,
        score: s.score,
        wave: s.wave,
        hackProgress: Math.round(s.hackProgress),
        isTetherActive: s.isTetherActive,
        rescuedScientists: s.rescuedScientists,
        totalScientists: s.totalScientists,
        titanHealth: s.titanHealth,
        isTitanAllied: s.isTitanAllied,
        activeChassis: s.activeChassis,
        isShieldActive: s.isShieldActive,
        bossActive: s.bossActive,
        bossHp: s.bossHp,
        bossMaxHp: s.bossMaxHp,
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
      });

      // Render 3D Scene
      renderer.render(scene, camera);

      // Render 2D Floating Combat Text, Vignettes & Tactical In-Game Waypoints onto overlay canvas
      if (overlayCtx && overlayCanvas) {
        const waypoints: InGameWaypoint[] = [];

        // 1. Evacuation Airlock Waypoint
        const distToAirlock = activeObj.position.distanceTo(airlock.position);
        waypoints.push({
          pos: new THREE.Vector3(0, 3.2, 48),
          label: 'EVACUATION AIRLOCK',
          sublabel: `AIRLOCK PAD (${Math.round(distToAirlock)}m)`,
          color: '#10b981',
          dist: distToAirlock,
        });

        // 2. Trapped / Escorted Scientists
        scientists.forEach((sc, idx) => {
          if (sc.group.position.x < 500) {
            const dist = activeObj.position.distanceTo(sc.group.position);
            if (!sc.isRescued) {
              waypoints.push({
                pos: sc.group.position.clone().add(new THREE.Vector3(0, 2.6, 0)),
                label: `SCIENTIST #${idx + 1}`,
                sublabel: `APPROACH TO RESCUE (${Math.round(dist)}m)`,
                color: '#fbbf24',
                dist,
              });
            } else {
              waypoints.push({
                pos: sc.group.position.clone().add(new THREE.Vector3(0, 2.6, 0)),
                label: `SCIENTIST #${idx + 1} [FOLLOWING]`,
                sublabel: 'LEAD TO GREEN AIRLOCK PAD',
                color: '#34d399',
                dist,
              });
            }
          }
        });

        // 3. MK-IV Titan Mech Waypoint
        if (!s.bossActive) {
          const distTitan = activeObj.position.distanceTo(titan.group.position);
          if (!s.isTitanAllied) {
            waypoints.push({
              pos: titan.group.position.clone().add(new THREE.Vector3(0, 5.8, 0)),
              label: 'MK-IV TITAN MECH',
              sublabel: `HOLD RMB TO HACK (${Math.round(distTitan)}m)`,
              color: '#00f0ff',
              dist: distTitan,
            });
          } else if (s.activeChassis === 'UNIT7') {
            waypoints.push({
              pos: titan.group.position.clone().add(new THREE.Vector3(0, 5.8, 0)),
              label: 'MK-IV TITAN (ALLIED)',
              sublabel: distTitan < 8 ? 'PRESS [E] TO PILOT MECH!' : `GET CLOSER (${Math.round(distTitan)}m)`,
              color: '#38bdf8',
              dist: distTitan,
            });
          }
        }

        // 4. CORE-X Boss Waypoint (Wave 2)
        if (s.bossActive && boss.isAwake) {
          const distBoss = activeObj.position.distanceTo(boss.group.position);
          waypoints.push({
            pos: boss.group.position.clone().add(new THREE.Vector3(0, 5.8, 0)),
            label: 'APEX THREAT: CORE-X',
            sublabel: `${Math.max(0, Math.round(boss.hp))} HP (${Math.round(distBoss)}m)`,
            color: '#ef4444',
            dist: distBoss,
          });
        }

        // 5. Hostile Scout Enemy Waypoints (Who to fire at!)
        scouts.forEach((sc, idx) => {
          const distScout = activeObj.position.distanceTo(sc.group.position);
          if (distScout < 55) {
            waypoints.push({
              pos: sc.group.position.clone().add(new THREE.Vector3(0, 2.2, 0)),
              label: `HOSTILE SCOUT #${idx + 1}`,
              sublabel: `AIM & SHOOT [LMB] (${Math.round(distScout)}m)`,
              color: '#ef4444',
              dist: distScout,
            });
          }
        });

        // 6. Hostile Heavy Combat Enforcer Waypoints (3D Robot Enemy)
        enforcers.forEach((enf, idx) => {
          const distEnf = activeObj.position.distanceTo(enf.group.position);
          if (distEnf < 65) {
            waypoints.push({
              pos: enf.group.position.clone().add(new THREE.Vector3(0, 3.0, 0)),
              label: `HEAVY ENFORCER #${idx + 1}`,
              sublabel: `3D COMBAT DROID [${Math.max(0, enf.hp)}/120 HP] (${Math.round(distEnf)}m)`,
              color: '#f43f5e',
              dist: distEnf,
            });
          }
        });

        vfx.renderOverlay(overlayCtx, camera, overlayCanvas.width, overlayCanvas.height, waypoints);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.clearTimeout(initialMissionTimer);
      if (bannerTimeout) window.clearTimeout(bannerTimeout);
      window.removeEventListener('resize', handleResize);
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
};
