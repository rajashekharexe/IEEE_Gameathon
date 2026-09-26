// Master 3D WebGL Game Engine with Body-Swapping, Enemy Waves, and Evacuation Escort
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { factoryArena } from './FactoryArena';
import { entityFactory } from './EntityModels';
import type { Unit7Entity, TitanMechEntity, ScientistEntity } from './EntityModels';
import { NeuralTetherEngine } from './TetherEngine';
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

  const stateRef = useRef({
    health: 82,
    energy: 64,
    thermalStability: 100,
    ammo: 24,
    maxAmmo: 60,
    score: 1250,
    wave: 1,
    hackProgress: 0,
    isTetherActive: false,
    rescuedScientists: 0,
    totalScientists: 2,
    titanHealth: 100,
    isTitanAllied: false,
    activeChassis: 'UNIT7' as 'UNIT7' | 'TITAN',
    isShieldActive: false,
    godMode,
    isRunning: true,
  });

  useEffect(() => {
    stateRef.current.godMode = godMode;
  }, [godMode]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const s = stateRef.current;

    // 1. SCENE SETUP
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060914);
    scene.fog = new THREE.FogExp2(0x060914, 0.022);

    // 2. CAMERA
    const camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 14, 18);

    // 3. RENDERER
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 4. LIGHTING
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 1.8);
    dirLight.position.set(25, 35, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    scene.add(dirLight);

    // 5. BUILD FACTORY ARENA
    const arena = factoryArena.build(scene);

    // 6. SPAWN EVACUATION AIRLOCK
    const airlock = entityFactory.createEvacuationAirlock();
    airlock.position.set(0, 0, 24);
    scene.add(airlock);

    // 7. SPAWN UNIT-7 (PLAYER)
    const unit7: Unit7Entity = entityFactory.createUnit7();
    unit7.group.position.set(-6, 0, 4);
    scene.add(unit7.group);

    // 8. SPAWN MK-IV TITAN MECH
    const titan: TitanMechEntity = entityFactory.createTitanMech();
    titan.group.position.set(4, 0, -10);
    scene.add(titan.group);

    // 9. SPAWN TRAPPED SCIENTISTS
    const scientists: ScientistEntity[] = [
      entityFactory.createScientist(),
      entityFactory.createScientist(),
    ];
    scientists[0].group.position.set(11.5, 0, 9.8);
    scientists[1].group.position.set(-11.5, 0, -4.5);
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

    // 11. NEURAL TETHER ENGINE
    const tether = new NeuralTetherEngine(scene);

    // 12. PROJECTILES
    interface Projectile {
      mesh: THREE.Mesh;
      dir: THREE.Vector3;
      life: number;
      isEnemy?: boolean;
      isTitanShot?: boolean;
    }
    const projectiles: Projectile[] = [];
    const projGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.2, 8);
    projGeo.rotateX(Math.PI / 2);
    const playerProjMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const enemyProjMat = new THREE.MeshBasicMaterial({ color: 0xff1133 });
    const titanProjGeo = new THREE.SphereGeometry(0.35, 12, 12);
    const titanProjMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

    // Raycaster for mouse
    const raycaster = new THREE.Raycaster();
    const mousePlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const mouseWorldPos = new THREE.Vector3();

    // 13. MAIN GAME LOOP
    const clock = new THREE.Clock();
    let animId: number;
    let shootCooldown = 0;
    let swapCooldown = 0;

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    const loop = () => {
      if (!s.isRunning) return;

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // A. UPDATE FACTORY SIRENS
      arena.updateSirens(time);

      // B. MOUSE AIM RAYCASTING
      const mouse = input.state.mouse;
      const ndcX = (mouse.x / window.innerWidth) * 2 - 1;
      const ndcY = -(mouse.y / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);
      raycaster.ray.intersectPlane(mousePlane, mouseWorldPos);

      // Active entity reference (Unit-7 or Titan)
      const activeObj = s.activeChassis === 'UNIT7' ? unit7.group : titan.group;

      if (mouseWorldPos) {
        const targetAngle = Math.atan2(
          mouseWorldPos.x - activeObj.position.x,
          mouseWorldPos.z - activeObj.position.z
        );
        activeObj.rotation.y = targetAngle;
        if (s.activeChassis === 'UNIT7') {
          unit7.updateLaserAim(mouseWorldPos);
        }
      }

      // C. MOVEMENT (WASD)
      const currentSpeed =
        s.activeChassis === 'TITAN'
          ? 4.8 * delta
          : (input.isActionPressed('dash') ? 14 : 8) * delta;

      let moveX = 0;
      let moveZ = 0;
      if (input.isActionPressed('left')) moveX -= 1;
      if (input.isActionPressed('right')) moveX += 1;
      if (input.isActionPressed('up')) moveZ -= 1;
      if (input.isActionPressed('down')) moveZ += 1;

      const isMoving = moveX !== 0 || moveZ !== 0;
      if (isMoving) {
        const length = Math.hypot(moveX, moveZ);
        activeObj.position.x += (moveX / length) * currentSpeed;
        activeObj.position.z += (moveZ / length) * currentSpeed;
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
          unit7.group.position.copy(titan.group.position).add(new THREE.Vector3(2, 0, 2));
          unit7.group.visible = true;
        }
      }

      // Clamp within boundaries
      activeObj.position.x = Math.max(-36, Math.min(36, activeObj.position.x));
      activeObj.position.z = Math.max(-36, Math.min(36, activeObj.position.z));

      // D. CAMERA FOLLOW
      const camTargetX = activeObj.position.x;
      const camTargetZ = activeObj.position.z + (s.activeChassis === 'TITAN' ? 20 : 16);
      camera.position.x += (camTargetX - camera.position.x) * 0.08;
      camera.position.z += (camTargetZ - camera.position.z) * 0.08;
      camera.position.y = s.activeChassis === 'TITAN' ? 15 : 12;
      camera.lookAt(activeObj.position.x, activeObj.position.y + 1.2, activeObj.position.z - 2);

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
        } else if (s.activeChassis === 'TITAN') {
          // EJECT BACK TO UNIT-7!
          s.activeChassis = 'UNIT7';
          unit7.group.position.copy(titan.group.position).add(new THREE.Vector3(2, 0, 2));
          unit7.group.visible = true;
          sounds.playDash();
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

          if (s.hackProgress >= 100 && !s.isTitanAllied) {
            s.isTitanAllied = true;
            titan.setAllied(true);
            tether.deactivate();
            s.isTetherActive = false;
            sounds.playPowerup();
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
          sounds.playExplosion('small');

          const projMesh = new THREE.Mesh(titanProjGeo, titanProjMat);
          projMesh.position.copy(titan.group.position).add(new THREE.Vector3(0, 3.2, 1.2));
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

        // Scout shooting
        scout.shootCooldown -= delta * 30;
        if (scout.shootCooldown <= 0) {
          scout.shootCooldown = 60 + Math.random() * 40;
          const eProj = new THREE.Mesh(projGeo, enemyProjMat);
          eProj.position.copy(scoutPos).add(new THREE.Vector3(0, 0.8, 0));
          const shootDir = new THREE.Vector3(Math.sin(angle), 0, Math.cos(angle));
          eProj.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), shootDir);
          scene.add(eProj);
          projectiles.push({ mesh: eProj, dir: shootDir, life: 2.0, isEnemy: true });
        }
      });

      // J. UPDATE PROJECTILES & COLLISIONS
      for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];
        p.mesh.position.addScaledVector(p.dir, (p.isTitanShot ? 28 : 38) * delta);
        p.life -= delta;

        // Player Projectile vs Scouts
        if (!p.isEnemy) {
          for (let j = scouts.length - 1; j >= 0; j--) {
            const sc = scouts[j];
            if (p.mesh.position.distanceTo(sc.group.position) < (p.isTitanShot ? 2.5 : 1.2)) {
              sounds.playHit();
              sc.hp -= p.isTitanShot ? 50 : 25;
              scene.remove(p.mesh);
              projectiles.splice(i, 1);

              if (sc.hp <= 0) {
                sounds.playExplosion('small');
                scene.remove(sc.group);
                scouts.splice(j, 1);
                s.score += 250;
              }
              break;
            }
          }
        }

        // Enemy Projectile vs Player / Titan
        if (p.isEnemy) {
          // Blocked by Titan Aegis Shield
          if (s.isShieldActive && p.mesh.position.distanceTo(titan.group.position) < 3.8) {
            scene.remove(p.mesh);
            projectiles.splice(i, 1);
            sounds.playHit();
            continue;
          }

          if (s.activeChassis === 'UNIT7' && p.mesh.position.distanceTo(unit7.group.position) < 1.4) {
            if (!s.godMode) {
              s.health = Math.max(0, s.health - 10);
              sounds.playHit();
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

      // K. RESCUE & EVACUATE SCIENTISTS
      scientists.forEach((sc) => {
        const scPos = sc.group.position;
        if (!sc.isRescued) {
          sc.animateIdle(time);
          if (activeObj.position.distanceTo(scPos) < 4.5) {
            sc.isRescued = true;
            sounds.playPowerup();
          }
        } else {
          // Rescued: Follow player towards Airlock!
          const airlockPos = airlock.position;
          const distToAirlock = scPos.distanceTo(airlockPos);

          if (distToAirlock < 3.0) {
            // Reached airlock! Evacuated!
            s.rescuedScientists++;
            s.score += 1500;
            sounds.playPowerup();
            scene.remove(sc.group);
            sc.group.position.set(999, 999, 999);

            if (s.rescuedScientists >= s.totalScientists) {
              s.isRunning = false;
              onVictory();
              return;
            }
          } else {
            // Walk toward airlock
            const angleToAirlock = Math.atan2(airlockPos.x - scPos.x, airlockPos.z - scPos.z);
            scPos.x += Math.sin(angleToAirlock) * 4.2 * delta;
            scPos.z += Math.cos(angleToAirlock) * 4.2 * delta;
          }
        }
      });

      // L. PUSH STATS TO REACT HUD
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
      });

      renderer.render(scene, camera);
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      tether.dispose(scene);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [godMode, onGameOver, onUpdateStats, onVictory]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full block cursor-crosshair z-10"
    />
  );
};
