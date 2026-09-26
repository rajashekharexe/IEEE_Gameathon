// Colossal Mega-Boss CORE-X for Circuit Breaker: Overlink
// 6-8x Player Scale (16m Tall, 24m Wide) Mechanical Arachnid Behemoth
// Features: Huge mechanical body, massive arms, heavy legs, giant glowing red core,
// red glowing eyes, mechanical armor, exhaust smoke, sparks, and energy shield.
import * as THREE from 'three';

export interface BossCoreXEntity {
  group: THREE.Group;
  coreMesh: THREE.Mesh;
  coreLight: THREE.PointLight;
  shieldMesh: THREE.Mesh;
  eyeMeshes: THREE.Mesh[];
  eyeLight: THREE.PointLight;
  laserBeam: THREE.Group;
  legs: { hip: THREE.Group; knee: THREE.Group; foot: THREE.Mesh }[];
  arms: { shoulder: THREE.Group; elbow: THREE.Group; cannon: THREE.Group }[];
  hp: number;
  maxHp: number;
  phase: 1 | 2 | 3;
  isAwake: boolean;
  isShieldActive: boolean;
  shootCooldown: number;
  summonCooldown: number;
  stompTimer: number;
  animateCrawl: (time: number, isMoving: boolean) => void;
  updateLaserSweep: (time: number, targetPos?: THREE.Vector3) => void;
  triggerStompShockwave: () => boolean;
  flashHit: () => void;
  setPhase: (p: 1 | 2 | 3) => void;
  dispose: () => void;
}

export class BossModelFactory {
  public createCoreX(): BossCoreXEntity {
    const group = new THREE.Group();

    // High-tech heavy armor materials
    const armorMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      roughness: 0.25,
      metalness: 0.9,
    });
    const subArmorMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.35,
      metalness: 0.75,
    });
    const jointMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.2,
      metalness: 0.95,
    });
    const coreGlowMat = new THREE.MeshBasicMaterial({
      color: 0xff0033,
    });
    const eyeMat = new THREE.MeshBasicMaterial({
      color: 0xff1744,
    });
    const cautionMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.4,
    });

    // 1. Colossal Armored Main Chassis / Thorax (8m wide, 6m tall, 10m long)
    const thoraxGeo = new THREE.CylinderGeometry(4.8, 6.2, 4.5, 12);
    const thorax = new THREE.Mesh(thoraxGeo, armorMat);
    thorax.position.y = 8.5;
    thorax.castShadow = true;
    thorax.receiveShadow = true;
    group.add(thorax);

    // Heavy Angled Carapace Roof Shield
    const carapaceGeo = new THREE.ConeGeometry(5.8, 3.2, 8);
    const carapace = new THREE.Mesh(carapaceGeo, armorMat);
    carapace.position.y = 11.2;
    carapace.rotation.y = Math.PI / 8;
    carapace.castShadow = true;
    group.add(carapace);

    // Hazard Stripes on Carapace Edges
    const stripeGeo = new THREE.BoxGeometry(7.2, 0.4, 7.2);
    const stripe = new THREE.Mesh(stripeGeo, cautionMat);
    stripe.position.y = 10.2;
    group.add(stripe);

    // 2. Giant Glowing Crimson Energy Core (3.2m diameter)
    const coreGeo = new THREE.SphereGeometry(1.6, 24, 24);
    const coreMesh = new THREE.Mesh(coreGeo, coreGlowMat);
    coreMesh.position.set(0, 8.5, 3.8);
    group.add(coreMesh);

    // Inner pulsating reactor ring
    const reactorRingGeo = new THREE.TorusGeometry(2.2, 0.25, 12, 32);
    const reactorRing = new THREE.Mesh(reactorRingGeo, jointMat);
    reactorRing.position.set(0, 8.5, 3.8);
    group.add(reactorRing);

    // Intense Red Point Light illuminating the entire city square
    const coreLight = new THREE.PointLight(0xff0033, 8.0, 50, 1.2);
    coreLight.position.set(0, 8.5, 5.0);
    group.add(coreLight);

    // 3. Quad Glowing Red Ocular Eyes
    const eyeMeshes: THREE.Mesh[] = [];
    const eyePositions = [
      new THREE.Vector3(-1.4, 10.2, 4.2),
      new THREE.Vector3(1.4, 10.2, 4.2),
      new THREE.Vector3(-0.7, 10.9, 4.0),
      new THREE.Vector3(0.7, 10.9, 4.0),
    ];

    const eyeGeo = new THREE.SphereGeometry(0.45, 12, 12);
    eyePositions.forEach((pos) => {
      const eye = new THREE.Mesh(eyeGeo, eyeMat);
      eye.position.copy(pos);
      group.add(eye);
      eyeMeshes.push(eye);
    });

    const eyeLight = new THREE.PointLight(0xff1744, 4.0, 30);
    eyeLight.position.set(0, 10.5, 5.5);
    group.add(eyeLight);

    // 4. Exhaust Smoke Stacks (Rear Carapace)
    [-2.2, 2.2].forEach((xOffset) => {
      const stack = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.8, 4.0, 8), subArmorMat);
      stack.position.set(xOffset, 12.0, -3.2);
      stack.rotation.x = -0.3;
      group.add(stack);
    });

    // 5. Dual Heavy Plasma Artillery Arms (Front Shoulders)
    const arms: { shoulder: THREE.Group; elbow: THREE.Group; cannon: THREE.Group }[] = [];
    [-4.8, 4.8].forEach((xSide) => {
      const shoulder = new THREE.Group();
      shoulder.position.set(xSide, 9.2, 2.0);

      const bicep = new THREE.Mesh(new THREE.BoxGeometry(1.6, 4.5, 1.8), subArmorMat);
      bicep.position.set(0, -1.8, 1.0);
      bicep.rotation.x = 0.4;
      bicep.castShadow = true;
      shoulder.add(bicep);

      const elbow = new THREE.Group();
      elbow.position.set(0, -3.8, 2.0);

      // Heavy Cannon Barrel
      const cannon = new THREE.Group();
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.7, 5.5, 12), jointMat);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0, 2.5);
      barrel.castShadow = true;
      cannon.add(barrel);

      // Muzzle Heat Shield
      const muzzleBrake = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 1.4, 8), armorMat);
      muzzleBrake.rotation.x = Math.PI / 2;
      muzzleBrake.position.set(0, 0, 5.2);
      cannon.add(muzzleBrake);

      elbow.add(cannon);
      shoulder.add(elbow);
      group.add(shoulder);

      arms.push({ shoulder, elbow, cannon });
    });

    // 6. 6 Massive Heavy Articulated Hydraulic Legs (Span 24m)
    const legs: { hip: THREE.Group; knee: THREE.Group; foot: THREE.Mesh }[] = [];
    const thighGeo = new THREE.BoxGeometry(1.4, 7.5, 1.6);
    const shinGeo = new THREE.BoxGeometry(1.2, 9.0, 1.2);
    const footGeo = new THREE.ConeGeometry(1.2, 2.5, 8);

    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const hip = new THREE.Group();
      hip.position.set(Math.cos(angle) * 5.2, 8.5, Math.sin(angle) * 5.2);
      hip.rotation.y = angle;

      // Heavy Thigh extending out & up
      const thigh = new THREE.Mesh(thighGeo, subArmorMat);
      thigh.position.set(0, 3.2, 2.4);
      thigh.rotation.x = Math.PI / 3.4;
      thigh.castShadow = true;
      hip.add(thigh);

      // Hydraulic Piston Cylinders
      const piston = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 5.0, 8), jointMat);
      piston.position.set(0.6, 2.8, 1.8);
      piston.rotation.x = Math.PI / 3.2;
      hip.add(piston);

      const knee = new THREE.Group();
      knee.position.set(0, 6.2, 4.8);

      // Shin reaching down to floor
      const shin = new THREE.Mesh(shinGeo, armorMat);
      shin.position.set(0, -4.5, 2.0);
      shin.rotation.x = -Math.PI / 4.2;
      shin.castShadow = true;
      knee.add(shin);

      // Spiked Foot Pad
      const foot = new THREE.Mesh(footGeo, jointMat);
      foot.position.set(0, -8.6, 3.8);
      foot.rotation.x = Math.PI;
      knee.add(foot);

      hip.add(knee);
      group.add(hip);
      legs.push({ hip, knee, foot });
    }

    // 7. Phase 3 Spherical Aegis Energy Shield
    const shieldGeo = new THREE.SphereGeometry(12.5, 32, 24);
    const shieldMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0,
      wireframe: true,
      side: THREE.DoubleSide,
    });
    const shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
    shieldMesh.position.y = 8.5;
    shieldMesh.visible = false;
    group.add(shieldMesh);

    // 8. Ocular Sweeping Laser Targeter
    const laserBeam = new THREE.Group();
    const beamGeo = new THREE.CylinderGeometry(0.08, 0.08, 45, 8);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xff0033,
      transparent: true,
      opacity: 0.8,
    });
    const beamMesh = new THREE.Mesh(beamGeo, beamMat);
    beamMesh.position.z = 22.5;
    beamMesh.rotation.x = Math.PI / 2;
    laserBeam.add(beamMesh);
    laserBeam.position.set(0, 10.5, 4.5);
    laserBeam.visible = false;
    group.add(laserBeam);

    let stompCooldown = 0;

    const entity: BossCoreXEntity = {
      group,
      coreMesh,
      coreLight,
      shieldMesh,
      eyeMeshes,
      eyeLight,
      laserBeam,
      legs,
      arms,
      hp: 1200,
      maxHp: 1200,
      phase: 1,
      isAwake: false,
      isShieldActive: false,
      shootCooldown: 2.0,
      summonCooldown: 6.0,
      stompTimer: 0,

      setPhase: (p: 1 | 2 | 3) => {
        entity.phase = p;
        if (p === 1) {
          entity.isShieldActive = false;
          shieldMesh.visible = false;
          coreLight.color.setHex(0xff0033);
        } else if (p === 2) {
          entity.isShieldActive = false;
          shieldMesh.visible = false;
          coreLight.color.setHex(0xf59e0b); // Amber heat venting
        } else if (p === 3) {
          // Overdrive! Activate Aegis Shield
          entity.isShieldActive = true;
          shieldMesh.visible = true;
          shieldMat.opacity = 0.35;
          coreLight.color.setHex(0x00f0ff); // Electric cyan shield surge
        }
      },

      flashHit: () => {
        armorMat.emissive.setHex(0xffffff);
        armorMat.emissiveIntensity = 2.0;
        setTimeout(() => {
          armorMat.emissive.setHex(0x000000);
          armorMat.emissiveIntensity = 0.0;
        }, 80);
      },

      triggerStompShockwave: () => {
        if (stompCooldown <= 0) {
          stompCooldown = 3.5;
          return true;
        }
        return false;
      },

      animateCrawl: (time: number, isMoving: boolean) => {
        if (!entity.isAwake) {
          // Dormant idle: slow deep reactor breath
          coreLight.intensity = 3.0 + Math.sin(time * 2) * 1.5;
          return;
        }

        if (stompCooldown > 0) stompCooldown -= 0.016;

        // Reactor Core Pulse
        const pulseSpeed = entity.phase === 3 ? 12 : entity.phase === 2 ? 8 : 4;
        const pulse = Math.sin(time * pulseSpeed) * 0.5 + 0.5;
        coreLight.intensity = 5.0 + pulse * 6.0;
        coreMesh.scale.setScalar(1.0 + pulse * 0.15);
        reactorRing.rotation.z = time * 2;

        // Shield Animation in Phase 3
        if (entity.isShieldActive) {
          shieldMesh.rotation.y = time * 0.5;
          shieldMesh.rotation.x = Math.sin(time * 0.8) * 0.1;
          shieldMat.opacity = 0.25 + Math.sin(time * 6) * 0.12;
        }

        // 6-Leg Hexapod Walking Gait
        const walkSpeed = (isMoving ? 3.5 : 1.2) * (entity.phase === 3 ? 1.4 : 1.0);
        legs.forEach((leg, idx) => {
          const tripPhase = idx % 2 === 0 ? 0 : Math.PI;
          const legCycle = time * walkSpeed + tripPhase + (idx * Math.PI) / 3;

          const lift = Math.max(0, Math.sin(legCycle)) * 2.2;
          const swing = Math.cos(legCycle) * 0.25;

          leg.hip.rotation.z = swing;
          leg.knee.rotation.x = -lift * 0.3;
          leg.foot.position.y = -8.6 + lift;
        });

        // Chassis bobbing
        thorax.position.y = 8.5 + Math.sin(time * walkSpeed * 2) * 0.4;
        carapace.position.y = 11.2 + Math.sin(time * walkSpeed * 2) * 0.4;

        // Arm Cannon Aiming Motion
        arms.forEach((arm, idx) => {
          const aimSway = Math.sin(time * 1.8 + idx) * 0.15;
          arm.shoulder.rotation.x = aimSway;
        });
      },

      updateLaserSweep: (time: number, targetPos?: THREE.Vector3) => {
        if (!laserBeam.visible) return;
        if (targetPos) {
          laserBeam.lookAt(targetPos);
        } else {
          laserBeam.rotation.y = Math.sin(time * 2.5) * 0.6;
        }
      },

      dispose: () => {
        group.clear();
      },
    };

    return entity;
  }
}

export const bossFactory = new BossModelFactory();
