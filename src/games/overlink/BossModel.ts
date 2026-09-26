// 3D CORE-X Mechanical Spider Boss for Circuit Breaker: Overlink
import * as THREE from 'three';

export interface BossCoreXEntity {
  group: THREE.Group;
  eyeMesh: THREE.Mesh;
  eyeLight: THREE.PointLight;
  laserBeam: THREE.Group;
  laserDir: THREE.Vector3;
  legs: { hip: THREE.Group; knee: THREE.Group }[];
  hp: number;
  maxHp: number;
  isAwake: boolean;
  animateCrawl: (time: number, isMoving: boolean) => void;
  updateLaserSweep: (time: number) => void;
  flashHit: () => void;
  dispose: () => void;
}

export class BossModelFactory {
  public createCoreX(): BossCoreXEntity {
    const group = new THREE.Group();

    // Dark titanium armor materials
    const armorMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.25,
      metalness: 0.85,
    });
    const subMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.4,
      metalness: 0.7,
    });
    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0xff0033,
      emissive: 0xff0022,
      emissiveIntensity: 2.5,
      roughness: 0.1,
    });

    // 1. Central Core Body (Chassis)
    const bodyGeo = new THREE.CylinderGeometry(2.4, 2.8, 1.8, 16);
    const body = new THREE.Mesh(bodyGeo, armorMat);
    body.position.y = 3.2;
    body.castShadow = true;
    group.add(body);

    // Armor dome on top
    const domeGeo = new THREE.SphereGeometry(2.5, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    const dome = new THREE.Mesh(domeGeo, armorMat);
    dome.position.y = 4.0;
    dome.castShadow = true;
    group.add(dome);

    // 2. Giant Glowing Red Ocular Eye
    const eyeGeo = new THREE.SphereGeometry(1.2, 16, 16);
    const eyeMesh = new THREE.Mesh(eyeGeo, eyeMat);
    eyeMesh.position.set(0, 3.4, 2.4);
    group.add(eyeMesh);

    // Eye Armor Visor Ring
    const ringGeo = new THREE.TorusGeometry(1.4, 0.2, 8, 24);
    const ring = new THREE.Mesh(ringGeo, subMat);
    ring.position.set(0, 3.4, 2.4);
    group.add(ring);

    // Powerful Red Point Light from eye
    const eyeLight = new THREE.PointLight(0xff0033, 5, 28);
    eyeLight.position.set(0, 3.4, 3.0);
    group.add(eyeLight);

    // 3. 6 Articulated Mechanical Spider Legs
    const legs: { hip: THREE.Group; knee: THREE.Group }[] = [];
    const thighGeo = new THREE.BoxGeometry(0.5, 3.0, 0.5);
    const shinGeo = new THREE.BoxGeometry(0.4, 3.6, 0.4);
    const footGeo = new THREE.ConeGeometry(0.3, 1.2, 6);

    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const hip = new THREE.Group();
      hip.position.set(Math.cos(angle) * 2.4, 3.2, Math.sin(angle) * 2.4);
      hip.rotation.y = angle;

      // Thigh extending outward & up
      const thigh = new THREE.Mesh(thighGeo, subMat);
      thigh.position.set(0, 1.2, 1.0);
      thigh.rotation.x = Math.PI / 3.2;
      thigh.castShadow = true;
      hip.add(thigh);

      // Knee joint
      const knee = new THREE.Group();
      knee.position.set(0, 2.4, 2.0);

      // Shin reaching down to the floor
      const shin = new THREE.Mesh(shinGeo, armorMat);
      shin.position.set(0, -1.8, 0.8);
      shin.rotation.x = -Math.PI / 4.5;
      shin.castShadow = true;
      knee.add(shin);

      // Sharp industrial claw / foot
      const foot = new THREE.Mesh(footGeo, subMat);
      foot.position.set(0, -3.2, 1.4);
      foot.rotation.x = Math.PI;
      knee.add(foot);

      hip.add(knee);
      group.add(hip);
      legs.push({ hip, knee });
    }

    // 4. Sweeping Red Laser Beam (Cylinder beam for volumetric presence)
    const laserGroup = new THREE.Group();
    const laserBeamGeo = new THREE.CylinderGeometry(0.12, 0.12, 32, 8);
    laserBeamGeo.rotateX(Math.PI / 2);
    const laserBeamMat = new THREE.MeshBasicMaterial({
      color: 0xff0044,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const laserBeamMesh = new THREE.Mesh(laserBeamGeo, laserBeamMat);
    laserBeamMesh.position.set(0, 0, 16); // Center of 32-unit beam
    laserGroup.add(laserBeamMesh);

    // Inner bright core line
    const coreBeamGeo = new THREE.CylinderGeometry(0.04, 0.04, 32, 6);
    coreBeamGeo.rotateX(Math.PI / 2);
    const coreBeamMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
    });
    const coreBeamMesh = new THREE.Mesh(coreBeamGeo, coreBeamMat);
    coreBeamMesh.position.set(0, 0, 16);
    laserGroup.add(coreBeamMesh);

    laserGroup.position.set(0, 3.4, 0);
    group.add(laserGroup);

    const laserDir = new THREE.Vector3();

    const animateCrawl = (time: number, isMoving: boolean) => {
      // Body breathing bob
      const bob = Math.sin(time * 3.5) * 0.18;
      body.position.y = 3.2 + bob;
      dome.position.y = 4.0 + bob;
      eyeMesh.position.y = 3.4 + bob;
      ring.position.y = 3.4 + bob;
      eyeLight.position.y = 3.4 + bob;
      laserGroup.position.y = 3.4 + bob;

      // Legs creeping gait animation
      legs.forEach((leg, idx) => {
        const offset = (idx * Math.PI) / 3;
        const wave = isMoving ? Math.sin(time * 7 + offset) : Math.sin(time * 2 + offset);
        leg.hip.rotation.z = wave * 0.3;
        leg.knee.rotation.x = -wave * 0.25;
      });
    };

    let sweepAngle = 0;
    const updateLaserSweep = (time: number) => {
      sweepAngle = time * 1.2;
      laserGroup.rotation.y = sweepAngle;
      // Direction in world coordinates
      laserDir.set(Math.sin(sweepAngle), 0, Math.cos(sweepAngle)).normalize();
    };

    let flashTimer: number | null = null;
    const flashHit = () => {
      eyeMat.emissive.setHex(0xffffff);
      eyeLight.color.setHex(0xffffff);
      if (flashTimer) clearTimeout(flashTimer);
      flashTimer = window.setTimeout(() => {
        eyeMat.emissive.setHex(0xff0022);
        eyeLight.color.setHex(0xff0033);
      }, 70);
    };

    const dispose = () => {
      if (flashTimer) clearTimeout(flashTimer);
      armorMat.dispose();
      subMat.dispose();
      eyeMat.dispose();
      laserBeamMat.dispose();
      coreBeamMat.dispose();
      bodyGeo.dispose();
      domeGeo.dispose();
      eyeGeo.dispose();
      ringGeo.dispose();
      thighGeo.dispose();
      shinGeo.dispose();
      footGeo.dispose();
      laserBeamGeo.dispose();
      coreBeamGeo.dispose();
    };

    return {
      group,
      eyeMesh,
      eyeLight,
      laserBeam: laserGroup,
      laserDir,
      legs,
      hp: 500,
      maxHp: 500,
      isAwake: false,
      animateCrawl,
      updateLaserSweep,
      flashHit,
      dispose,
    };
  }
}

export const bossFactory = new BossModelFactory();
