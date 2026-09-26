// Master 3D WebGL Game Engine with Body-Swapping, Enemy Waves, Evacuation Escort, CORE-X Boss, and VFX Juice
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { factoryArena } from './FactoryArena';
import { entityFactory } from './EntityModels';
import type { Unit7Entity, TitanMechEntity, ScientistEntity } from './EntityModels';
import { bossFactory } from './BossModel';
import type { BossCoreXEntity } from './BossModel';
import { NeuralTetherEngine } from './TetherEngine';
import { ScreenShake } from '../../engine/screenshake';
import { VFXSystem } from './VFXSystem';
import type { InGameWaypoint } from './VFXSystem';
import { input } from '../../engine/input';
import { sounds } from '../../engine/audio';

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
    ammo: 24,
    maxAmmo: 60,
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

    // 1. SCENE SETUP
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060a14);
    scene.fog = new THREE.FogExp2(0x060a14, 0.016);

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

    // 4. LIGHTING (Vibrant, high-contrast, luminous sci-fi foundry)
    const ambientLight = new THREE.AmbientLight(0x1e293b, 2.4);
    scene.add(ambientLight);

    // Main overhead cyber floodlight
    const dirLight = new THREE.DirectionalLight(0x7dd3fc, 3.8);
    dirLight.position.set(20, 32, 16);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    scene.add(dirLight);

    // Warm Industrial Furnace Rim Light
    const rimLight = new THREE.DirectionalLight(0xf59e0b, 2.8);
    rimLight.position.set(-16, 22, -26);
    scene.add(rimLight);

    // Floor neon upward bounce
    const floorLight = new THREE.PointLight(0x00f0ff, 3.2, 45, 1.4);
    floorLight.position.set(0, 2.5, 0);
    scene.add(floorLight);

    // 5. BUILD FACTORY ARENA
    const arena = factoryArena.build(scene);

    // 6. SPAWN EVACUATION AIRLOCK WITH VOLUMETRIC HOLOGRAPHIC BEACON
    const airlock = entityFactory.createEvacuationAirlock();
    airlock.position.set(0, 0, 24);
    scene.add(airlock);

    const airlockLight = new THREE.PointLight(0x10b981, 4.5, 26, 1.2);
    airlockLight.position.set(0, 4, 24);
    scene.add(airlockLight);

    // Luminous emerald beam rising from the airlock into the ceiling
    const beaconGeo = new THREE.CylinderGeometry(2.2, 2.2, 16, 24, 1, true);
    const beaconMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.32,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
    beaconMesh.position.set(0, 8, 24);
    scene.add(beaconMesh);

    // 7. SPAWN UNIT-7 (PLAYER) - Positioned on catwalk facing forward
    const unit7: Unit7Entity = entityFactory.createUnit7();
    unit7.group.position.set(-5, 0, 4);
    unit7.group.rotation.y = -0.35;
    scene.add(unit7.group);

    // 8. SPAWN MK-IV TITAN MECH - Massive in central foundry facing catwalk
    const titan: TitanMechEntity = entityFactory.createTitanMech();
    titan.group.position.set(3.5, 0, -8);
    titan.group.rotation.y = Math.PI - 0.35;
    scene.add(titan.group);

    // 9. SPAWN TRAPPED SCIENTISTS - Right side behind crates
    const scientists: ScientistEntity[] = [
      entityFactory.createScientist(),
      entityFactory.createScientist(),
    ];
    scientists[0].group.position.set(9.5, 0, 7.5);
    scientists[1].group.position.set(13.2, 0, 7.5);
    scientists.forEach((sc) => scene.add(sc.group));

    // 10. SPAWN SCOUT ENEMY BOTS
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
      new THREE.Vector3(-24, 0, -20),
      new THREE.Vector3(24, 0, -20),
      new THREE.Vector3(-24, 0, 10),
      new THREE.Vector3(24, 0, 10),
    ];

    scoutSpawnPoints.forEach((pos) => {
      const scout = entityFactory.createScoutBot();
      scout.group.position.copy(pos);
      scene.add(scout.group);
      scouts.push({ ...scout, shootCooldown: Math.random() * 60 });
    });

    // 11. CORE-X BOSS ENTITY (Instantiated ready for Wave 2)
    const boss: BossCoreXEntity = bossFactory.createCoreX();
    boss.group.position.set(0, 0, -18);

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
    shockwaveMesh.position.set(0, 0.1, -18);
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

    // Raycaster for mouse
    const raycaster = new THREE.Raycaster();
    const mousePlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const mouseWorldPos = new THREE.Vector3();

    // 14. MAIN GAME LOOP
    const clock = new THREE.Clock();
    let animId: number;
    let shootCooldown = 0;
    let swapCooldown = 0;
    let camYaw = 0;
    let effectiveYaw = 0;
    let invulnTimer = 0;
    let timeSinceLastDamage = 0;
    let regenSparkTimer = 0;

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

      // Clamp within boundaries
      activeObj.position.x = Math.max(-36, Math.min(36, activeObj.position.x));
      activeObj.position.z = Math.max(-36, Math.min(36, activeObj.position.z));

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

      // H. SHOOTING
      if (shootCooldown > 0) shootCooldown -= delta;
      if (input.isActionPressed('fire') && shootCooldown <= 0) {
        if (s.activeChassis === 'UNIT7' && s.ammo > 0) {
          shootCooldown = 0.22;
          s.ammo--;
          sounds.playShoot(900);
          screenShake.addTrauma(0.04);
          vfx.emitSparks(unit7.weaponMuzzle, 4, 0x00f0ff, 4);

          const projMesh = new THREE.Mesh(projGeo, playerProjMat);
          projMesh.position.copy(unit7.weaponMuzzle);
          const shootDir = mouseWorldPos.clone().sub(unit7.weaponMuzzle).normalize();
          shootDir.y = 0;
          projMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), shootDir);
          scene.add(projMesh);
          projectiles.push({ mesh: projMesh, dir: shootDir, life: 1.5 });
        } else if (s.activeChassis === 'TITAN') {
          // TITAN HYDRAULIC SLAM CANNON
          shootCooldown = 0.45;
          sounds.playTitanCannon();
          screenShake.addTrauma(0.35);

          const spawnPos = titan.group.position.clone().add(new THREE.Vector3(0, 3.2, 1.2));
          vfx.emitSparks(spawnPos, 14, 0x38bdf8, 8);

          const projMesh = new THREE.Mesh(titanProjGeo, titanProjMat);
          projMesh.position.copy(spawnPos);
          const shootDir = mouseWorldPos.clone().sub(titan.group.position).normalize();
          shootDir.y = 0;
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
        const projSpeed = p.isTitanShot ? 28 : (p.isBossShot ? 20 : (p.isEnemy ? 24 : 38));
        p.mesh.position.addScaledVector(p.dir, projSpeed * delta);
        p.life -= delta;

        // Player / Titan Projectile vs Scouts
        if (!p.isEnemy) {
          for (let j = scouts.length - 1; j >= 0; j--) {
            const sc = scouts[j];
            if (p.mesh.position.distanceTo(sc.group.position) < (p.isTitanShot ? 2.5 : 1.2)) {
              sounds.playHit();
              const dmg = p.isTitanShot ? 50 : 25;
              sc.hp -= dmg;
              vfx.emitSparks(p.mesh.position, p.isTitanShot ? 26 : 14, 0x00f0ff, p.isTitanShot ? 10 : 6);
              vfx.emitText(sc.group.position, p.isTitanShot ? '-50 CRIT' : '-25', '#38bdf8', 16, p.isTitanShot);

              scene.remove(p.mesh);
              projectiles.splice(i, 1);

              if (sc.hp <= 0) {
                sounds.playExplosion('small');
                vfx.emitSparks(sc.group.position, 35, 0xff0044, 12, true);
                vfx.emitText(sc.group.position, '+250 DESTROYED', '#10b981', 18);
                scene.remove(sc.group);
                scouts.splice(j, 1);
                s.score += 250;
              }
              break;
            }
          }

          // Player / Titan Projectile vs CORE-X BOSS
          if (s.bossActive && boss.isAwake && p.mesh.position.distanceTo(boss.group.position) < 3.8) {
            sounds.playHit();
            boss.flashHit();
            const dmg = p.isTitanShot ? 65 : 22;
            boss.hp = Math.max(0, boss.hp - dmg);
            s.bossHp = boss.hp;
            s.score += dmg * 10;
            screenShake.addTrauma(p.isTitanShot ? 0.22 : 0.08);

            vfx.emitSparks(p.mesh.position, p.isTitanShot ? 30 : 14, 0xff0044, 9);
            vfx.emitText(boss.group.position.clone().add(new THREE.Vector3(0, 4.2, 0)), p.isTitanShot ? '-65 SLAM' : '-22', '#ff4444', 20, p.isTitanShot);

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

            // If all rescued: Transition to WAVE 2 CORE-X BOSS ENCOUNTER!
            if (s.rescuedScientists >= s.totalScientists && s.wave === 1) {
              s.wave = 2;
              s.bossActive = true;
              s.bossAlert = 'CRITICAL ALERT: CORE-X TITAN SPIDER AWAKENED!';
              scene.add(boss.group);
              boss.group.position.set(0, 0, -18);
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
      });

      // Render 3D Scene
      renderer.render(scene, camera);

      // Render 2D Floating Combat Text, Vignettes & Tactical In-Game Waypoints onto overlay canvas
      if (overlayCtx && overlayCanvas) {
        const waypoints: InGameWaypoint[] = [];

        // 1. Evacuation Airlock Waypoint
        const distToAirlock = activeObj.position.distanceTo(airlock.position);
        waypoints.push({
          pos: new THREE.Vector3(0, 3.2, 24),
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

        vfx.renderOverlay(overlayCtx, camera, overlayCanvas.width, overlayCanvas.height, waypoints);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
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
