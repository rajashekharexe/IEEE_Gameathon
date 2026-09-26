// Master 3D WebGL Game Component for Circuit Breaker: Overlink
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
    thermalStability: 72,
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

    // 2. CAMERA (Third-Person Cinematic Over-The-Shoulder / Isometric Angle)
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
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 120;
    dirLight.shadow.camera.left = -30;
    dirLight.shadow.camera.right = 30;
    dirLight.shadow.camera.top = 30;
    dirLight.shadow.camera.bottom = -30;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);

    // 5. BUILD FACTORY ARENA
    const arena = factoryArena.build(scene);

    // 6. SPAWN UNIT-7 (PLAYER)
    const unit7: Unit7Entity = entityFactory.createUnit7();
    unit7.group.position.set(-6, 0, 4);
    scene.add(unit7.group);

    // 7. SPAWN MK-IV TITAN MECH
    const titan: TitanMechEntity = entityFactory.createTitanMech();
    titan.group.position.set(4, 0, -10);
    scene.add(titan.group);

    // 8. SPAWN TRAPPED SCIENTISTS BEHIND CRATES
    const scientists: ScientistEntity[] = [
      entityFactory.createScientist(),
      entityFactory.createScientist(),
    ];
    scientists[0].group.position.set(11.5, 0, 9.8); // Behind crate cluster
    scientists[1].group.position.set(-11.5, 0, -4.5);
    scientists.forEach((sc) => scene.add(sc.group));

    // 9. NEURAL TETHER ENGINE
    const tether = new NeuralTetherEngine(scene);

    // 10. PROJECTILES (EMP BLASTS)
    interface Projectile {
      mesh: THREE.Mesh;
      dir: THREE.Vector3;
      life: number;
    }
    const projectiles: Projectile[] = [];
    const projGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.2, 8);
    projGeo.rotateX(Math.PI / 2);
    const projMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });

    // Raycaster for mouse-aim on floor plane
    const raycaster = new THREE.Raycaster();
    const mousePlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const mouseWorldPos = new THREE.Vector3();

    // 11. MAIN GAME LOOP
    const clock = new THREE.Clock();
    let animId: number;
    let shootCooldown = 0;

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

      // Rotate Player towards mouse aim
      if (mouseWorldPos) {
        const targetAngle = Math.atan2(
          mouseWorldPos.x - unit7.group.position.x,
          mouseWorldPos.z - unit7.group.position.z
        );
        unit7.group.rotation.y = targetAngle;
        unit7.updateLaserAim(mouseWorldPos);
      }

      // C. PLAYER MOVEMENT (WASD)
      const speed = (input.isActionPressed('dash') ? 14 : 8) * delta;
      let moveX = 0;
      let moveZ = 0;

      if (input.isActionPressed('left')) moveX -= 1;
      if (input.isActionPressed('right')) moveX += 1;
      if (input.isActionPressed('up')) moveZ -= 1;
      if (input.isActionPressed('down')) moveZ += 1;

      const isMoving = moveX !== 0 || moveZ !== 0;
      if (isMoving) {
        const length = Math.hypot(moveX, moveZ);
        unit7.group.position.x += (moveX / length) * speed;
        unit7.group.position.z += (moveZ / length) * speed;
      }
      unit7.animateWalk(time, isMoving);

      // Clamp player within arena walls
      unit7.group.position.x = Math.max(-36, Math.min(36, unit7.group.position.x));
      unit7.group.position.z = Math.max(-36, Math.min(36, unit7.group.position.z));

      // D. CAMERA FOLLOW (Smooth Cinematic Third-Person)
      const targetCamX = unit7.group.position.x;
      const targetCamZ = unit7.group.position.z + 16;
      camera.position.x += (targetCamX - camera.position.x) * 0.08;
      camera.position.z += (targetCamZ - camera.position.z) * 0.08;
      camera.position.y = 12;
      camera.lookAt(unit7.group.position.x, unit7.group.position.y + 1.2, unit7.group.position.z - 2);

      // E. NEURAL TETHER HACKING (Hold Right-Click or Press E)
      const distToTitan = unit7.group.position.distanceTo(titan.group.position);
      const isAimingAtTitan = mouseWorldPos.distanceTo(titan.group.position) < 6;
      const canTether = distToTitan < 28 && isAimingAtTitan;

      const wantTether = input.state.mouse.rightDown || input.isActionPressed('special');

      if (wantTether && canTether && !s.isTitanAllied) {
        if (!s.isTetherActive) {
          tether.activate(unit7.weaponMuzzle, titan.group);
          s.isTetherActive = true;
          sounds.playDash();
        }
        tether.update(unit7.weaponMuzzle, delta, time);
        s.hackProgress = tether.state.progress;

        // Check Hack Completion!
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

      // F. TITAN MECH AI & MOVEMENT
      if (!s.isTitanAllied) {
        // Corrupted Rogue: slowly stalk towards player
        const angleToPlayer = Math.atan2(
          unit7.group.position.x - titan.group.position.x,
          unit7.group.position.z - titan.group.position.z
        );
        titan.group.rotation.y = angleToPlayer;

        if (distToTitan > 8) {
          titan.group.position.x += Math.sin(angleToPlayer) * 3.5 * delta;
          titan.group.position.z += Math.cos(angleToPlayer) * 3.5 * delta;
          titan.animateWalk(time, true);
        } else {
          titan.animateWalk(time, false);
          // Titan attack player
          if (!s.godMode && Math.random() < 0.03) {
            s.health = Math.max(0, s.health - 12);
            sounds.playHit();
            if (s.health <= 0) {
              s.isRunning = false;
              onGameOver();
              return;
            }
          }
        }
      } else {
        // Allied Titan: follows player and guards scientists
        const angleToTarget = Math.atan2(
          unit7.group.position.x - 4 - titan.group.position.x,
          unit7.group.position.z - 4 - titan.group.position.z
        );
        titan.group.rotation.y = angleToTarget;
        titan.animateWalk(time, true);
      }

      // G. EMP BLASTER SHOOTING (Left Click / Space)
      if (shootCooldown > 0) shootCooldown -= delta;
      if (input.isActionPressed('fire') && shootCooldown <= 0 && s.ammo > 0) {
        shootCooldown = 0.22;
        s.ammo--;
        sounds.playShoot(900);

        const projMesh = new THREE.Mesh(projGeo, projMat);
        projMesh.position.copy(unit7.weaponMuzzle);
        const shootDir = mouseWorldPos.clone().sub(unit7.weaponMuzzle).normalize();
        shootDir.y = 0; // keep projectile level
        projMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), shootDir);
        scene.add(projMesh);

        projectiles.push({
          mesh: projMesh,
          dir: shootDir,
          life: 1.5,
        });
      }

      // H. UPDATE PROJECTILES
      for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];
        p.mesh.position.addScaledVector(p.dir, 40 * delta);
        p.life -= delta;

        // Hit Titan
        if (!s.isTitanAllied && p.mesh.position.distanceTo(titan.group.position) < 3.0) {
          sounds.playHit();
          scene.remove(p.mesh);
          projectiles.splice(i, 1);
          s.titanHealth = Math.max(0, s.titanHealth - 8);
          s.score += 150;
          continue;
        }

        if (p.life <= 0) {
          scene.remove(p.mesh);
          projectiles.splice(i, 1);
        }
      }

      // I. RESCUE SCIENTISTS (Walk close to them)
      scientists.forEach((sc) => {
        sc.animateIdle(time);
        if (!sc.isRescued && unit7.group.position.distanceTo(sc.group.position) < 4.0) {
          sc.isRescued = true;
          s.rescuedScientists++;
          s.score += 1000;
          sounds.playPowerup();
          // Fade scientist out (evacuated!)
          scene.remove(sc.group);

          if (s.rescuedScientists >= s.totalScientists && s.isTitanAllied) {
            s.isRunning = false;
            onVictory();
            return;
          }
        }
      });

      // J. THERMAL STABILITY COUNTDOWN
      if (s.thermalStability > 0) {
        s.thermalStability = Math.max(0, s.thermalStability - delta * 0.8);
      }

      // K. PUSH STATS TO REACT HUD
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
