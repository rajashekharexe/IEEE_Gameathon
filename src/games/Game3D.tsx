import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { input } from '../engine/input';
import { sounds } from '../engine/audio';

interface Game3DProps {
  score: number;
  health: number;
  energy: number;
  wave: number;
  multiplier: number;
  godMode: boolean;
  onUpdateStats: (stats: {
    score?: number;
    health?: number;
    energy?: number;
    wave?: number;
    multiplier?: number;
    enemiesDefeated?: number;
  }) => void;
  onGameOver: () => void;
}

export const Game3D: React.FC<Game3DProps> = ({
  score,
  health,
  energy,
  wave,
  multiplier,
  godMode,
  onUpdateStats,
  onGameOver,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const stateRef = useRef({
    score,
    health,
    energy,
    wave,
    multiplier,
    godMode,
    enemiesDefeated: 0,
    isRunning: true,
  });

  useEffect(() => {
    stateRef.current.godMode = godMode;
  }, [godMode]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const s = stateRef.current;

    // 1. THREE.JS SCENE SETUP
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050714);
    scene.fog = new THREE.FogExp2(0x050714, 0.02);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 10, 16);

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 2. LIGHTING
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 1.5);
    dirLight.position.set(20, 40, 20);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // 3. CYBER GRID FLOOR
    const gridHelper = new THREE.GridHelper(200, 50, 0x06b6d4, 0x1e293b);
    gridHelper.position.y = -0.5;
    scene.add(gridHelper);

    // Ground Plane with subtle reflection
    const groundGeo = new THREE.PlaneGeometry(200, 200);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x050816,
      roughness: 0.2,
      metalness: 0.8,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.51;
    ground.receiveShadow = true;
    scene.add(ground);

    // 4. PLAYER SHIP (3D Mesh Group)
    const playerGroup = new THREE.Group();

    // Fuselage
    const bodyGeo = new THREE.ConeGeometry(1, 3, 5);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.3,
      metalness: 0.9,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.rotation.x = Math.PI / 2;
    body.castShadow = true;
    playerGroup.add(body);

    // Wings
    const wingGeo = new THREE.BoxGeometry(3.5, 0.15, 1.2);
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.2,
      metalness: 0.8,
    });
    const wings = new THREE.Mesh(wingGeo, wingMat);
    wings.position.set(0, 0, -0.2);
    wings.castShadow = true;
    playerGroup.add(wings);

    // Cockpit Glow Core
    const coreGeo = new THREE.SphereGeometry(0.45, 16, 16);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.position.set(0, 0.4, 0.2);
    playerGroup.add(core);

    // Thruster Light
    const playerLight = new THREE.PointLight(0x06b6d4, 3, 15);
    playerLight.position.set(0, 0, 1.8);
    playerGroup.add(playerLight);

    playerGroup.position.set(0, 0.5, 0);
    scene.add(playerGroup);

    // 5. OBSTACLES / SPIRES & COLLECTIBLE CORES
    const obstacles: THREE.Mesh[] = [];
    const obstacleGeo = new THREE.BoxGeometry(2, 6, 2);
    const obstacleMat = new THREE.MeshStandardMaterial({
      color: 0xec4899,
      emissive: 0x831843,
      roughness: 0.4,
      metalness: 0.7,
    });

    for (let i = 0; i < 25; i++) {
      const spire = new THREE.Mesh(obstacleGeo, obstacleMat);
      spire.position.set(
        (Math.random() - 0.5) * 80,
        2.5,
        (Math.random() - 0.5) * 80
      );
      spire.castShadow = true;
      spire.receiveShadow = true;
      scene.add(spire);
      obstacles.push(spire);
    }

    // Energy Orbs (Collectibles)
    const orbs: THREE.Mesh[] = [];
    const orbGeo = new THREE.IcosahedronGeometry(0.7, 1);
    const orbMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      roughness: 0.1,
      metalness: 0.5,
    });

    for (let i = 0; i < 15; i++) {
      const orb = new THREE.Mesh(orbGeo, orbMat);
      orb.position.set(
        (Math.random() - 0.5) * 80,
        1,
        (Math.random() - 0.5) * 80
      );
      scene.add(orb);
      orbs.push(orb);
    }

    // 6. LASER PROJECTILES (3D)
    interface Projectile3D {
      mesh: THREE.Mesh;
      dir: THREE.Vector3;
      life: number;
    }
    const projectiles: Projectile3D[] = [];
    const bulletGeo = new THREE.CylinderGeometry(0.12, 0.12, 1.5, 8);
    const bulletMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

    // 7. 3D RENDER & PHYSICS LOOP
    let animId: number;
    let fireCooldown = 0;

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    const clock = new THREE.Clock();

    const renderLoop = () => {
      if (!s.isRunning) return;
      const delta = clock.getDelta();

      // PLAYER MOVEMENT
      const speed = 18 * delta;
      let moveX = 0;
      let moveZ = 0;

      if (input.isActionPressed('left')) moveX -= speed;
      if (input.isActionPressed('right')) moveX += speed;
      if (input.isActionPressed('up')) moveZ -= speed;
      if (input.isActionPressed('down')) moveZ += speed;

      playerGroup.position.x += moveX;
      playerGroup.position.z += moveZ;

      // Banking rotation on turn
      playerGroup.rotation.z = -moveX * 1.5;
      playerGroup.rotation.x = moveZ * 0.8;

      // CAMERA FOLLOW (Smooth damping)
      const targetCamX = playerGroup.position.x;
      const targetCamZ = playerGroup.position.z + 14;
      camera.position.x += (targetCamX - camera.position.x) * 0.08;
      camera.position.z += (targetCamZ - camera.position.z) * 0.08;
      camera.position.y = 8;
      camera.lookAt(playerGroup.position.x, playerGroup.position.y + 0.5, playerGroup.position.z - 4);

      // SHOOTING (3D)
      if (fireCooldown > 0) fireCooldown -= delta;
      if (input.isActionPressed('fire') && fireCooldown <= 0) {
        fireCooldown = 0.18;
        sounds.playShoot(1000);

        const bMesh = new THREE.Mesh(bulletGeo, bulletMat);
        bMesh.position.copy(playerGroup.position);
        bMesh.position.y += 0.3;
        bMesh.rotation.x = Math.PI / 2;
        scene.add(bMesh);

        projectiles.push({
          mesh: bMesh,
          dir: new THREE.Vector3(0, 0, -1),
          life: 2.0,
        });
      }

      // UPDATE PROJECTILES
      for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];
        p.mesh.position.addScaledVector(p.dir, 45 * delta);
        p.life -= delta;

        // Check collision against obstacles
        for (let j = obstacles.length - 1; j >= 0; j--) {
          const obs = obstacles[j];
          if (p.mesh.position.distanceTo(obs.position) < 2.5) {
            sounds.playExplosion('small');
            scene.remove(obs);
            scene.remove(p.mesh);
            obstacles.splice(j, 1);
            projectiles.splice(i, 1);

            s.score += 250;
            s.enemiesDefeated++;
            break;
          }
        }

        if (p.life <= 0) {
          scene.remove(p.mesh);
          projectiles.splice(i, 1);
        }
      }

      // ROTATE ORBS & COLLISION
      orbs.forEach((orb, idx) => {
        orb.rotation.y += 2 * delta;
        orb.position.y = 1 + Math.sin(clock.getElapsedTime() * 3 + idx) * 0.3;

        // Player collection
        if (playerGroup.position.distanceTo(orb.position) < 2.0) {
          sounds.playPowerup();
          orb.position.set(
            (Math.random() - 0.5) * 80,
            1,
            (Math.random() - 0.5) * 80
          );
          s.score += 500;
          s.energy = Math.min(100, s.energy + 20);
        }
      });

      // PLAYER COLLISION WITH OBSTACLES
      obstacles.forEach((obs) => {
        if (playerGroup.position.distanceTo(obs.position) < 2.2) {
          if (!s.godMode) {
            sounds.playHit();
            s.health -= 25;
            // bounce player back
            playerGroup.position.z += 2;

            if (s.health <= 0) {
              s.isRunning = false;
              onGameOver();
            }
          }
        }
      });

      // UPDATE STATS
      onUpdateStats({
        score: s.score,
        health: s.health,
        energy: s.energy,
        wave: s.wave,
        multiplier: s.multiplier,
        enemiesDefeated: s.enemiesDefeated,
      });

      renderer.render(scene, camera);
      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [onGameOver, onUpdateStats]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full block cursor-crosshair z-10"
    />
  );
};
