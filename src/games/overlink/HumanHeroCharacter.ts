// 3D Human Hero Playable Character ("Operative Nathan")
// Primary Playable Hero for Circuit Breaker: Overlink
// Features:
// 1. Rigged 3D Photorealistic Human Model (nathan.glb) cloned via SkeletonUtils
// 2. High-Caliber KSR-29 AP Sniper Rifle held prominently in both hands
// 3. Realistic combat grip with right hand on trigger and left hand on barrel handguard
// 4. Integrated 3D Sniper Ammo magazine (sniper.glb)
// 5. Emerald tactical laser sight, optic scope reticle, muzzle flash, and kinetic recoil
// 6. Locomotion walk/run cadence & victory dance on [T] / [C]
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';

export interface HumanHeroEntity {
  group: THREE.Group;
  weaponMuzzle: THREE.Vector3;
  aimLaser: THREE.Line;
  gunGroup: THREE.Group;
  isDancing: boolean;
  animateWalk: (time: number, isMoving: boolean) => void;
  updateLaserAim: (targetPoint: THREE.Vector3) => void;
  triggerRecoil: () => void;
  flashHit: () => void;
  playVictoryDance: () => void;
  stopVictoryDance: () => void;
  toggleVictoryDance: () => void;
}

class HumanHeroFactory {
  private cachedHumanScene: THREE.Group | null = null;
  private cachedAmmoScene: THREE.Group | null = null;
  private humanAnimations: THREE.AnimationClip[] = [];
  private isPreloading = false;
  private preloadCallbacks: ((entity: HumanHeroEntity) => void)[] = [];

  constructor() {
    this.preload();
  }

  private preload() {
    if (this.isPreloading || (this.cachedHumanScene && this.cachedAmmoScene)) return;
    this.isPreloading = true;

    try {
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath('/draco/gltf/');

      const loader = new GLTFLoader();
      loader.setDRACOLoader(dracoLoader);

      // 1. Load 3D Sniper Ammo Magazine Model (sniper.glb)
      loader.load(
        '/models/gun/sniper.glb',
        (gltf) => {
          const ammoScene = gltf.scene;
          ammoScene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              mesh.castShadow = true;
              mesh.receiveShadow = true;
            }
          });
          // Scale to realistic rifle magazine size (~22cm)
          ammoScene.scale.setScalar(0.24);
          this.cachedAmmoScene = ammoScene;
          this.checkPreloadComplete();
        },
        undefined,
        (err) => {
          console.warn('Failed to load 3D Sniper Ammo model, using procedural fallback:', err);
          this.cachedAmmoScene = new THREE.Group();
          this.checkPreloadComplete();
        }
      );

      // 2. Load 3D Human Character Model (nathan.glb)
      loader.load(
        '/models/human/nathan.glb',
        (gltf) => {
          const humanScene = gltf.scene;
          humanScene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              mesh.castShadow = true;
              mesh.receiveShadow = true;
              if (mesh.material) {
                const mat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
                if ('roughness' in mat) (mat as any).roughness = 0.55;
                if ('metalness' in mat) (mat as any).metalness = 0.15;
              }
            }
          });
          this.humanAnimations = gltf.animations;
          this.cachedHumanScene = humanScene;
          this.checkPreloadComplete();
        },
        undefined,
        (err) => {
          console.warn('Failed to load 3D Nathan model, using procedural fallback:', err);
          this.cachedHumanScene = this.createProceduralHuman();
          this.checkPreloadComplete();
        }
      );
    } catch (e) {
      console.warn('Error initializing GLTF loader for Human Hero:', e);
      this.cachedAmmoScene = new THREE.Group();
      this.cachedHumanScene = this.createProceduralHuman();
      this.checkPreloadComplete();
    }
  }

  private checkPreloadComplete() {
    if (this.cachedHumanScene && this.cachedAmmoScene) {
      this.isPreloading = false;
      this.preloadCallbacks.forEach((cb) => {
        cb(this.instantiateHero());
      });
      this.preloadCallbacks = [];
    }
  }

  // Build the Complete High-Detail 3D KSR-29 AP Sniper Rifle
  public createSniperRifle(): THREE.Group {
    const gun = new THREE.Group();

    // High-tech weapon materials
    const darkChassisMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      metalness: 0.88,
      roughness: 0.22,
    });
    const carbonBarrelMat = new THREE.MeshStandardMaterial({
      color: 0x27272a,
      metalness: 0.95,
      roughness: 0.15,
    });
    const chromeAccentMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.95,
      roughness: 0.1,
    });
    const emeraldOpticMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const cyanGlowMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });

    // 1. Receiver Chassis
    const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.16, 0.65), darkChassisMat);
    receiver.position.set(0, 0, 0);
    receiver.castShadow = true;
    gun.add(receiver);

    // Cyan High-Tech Energy Indicator Strip
    const energyCell = new THREE.Mesh(new THREE.BoxGeometry(0.104, 0.04, 0.28), cyanGlowMat);
    energyCell.position.set(0, 0.02, -0.05);
    gun.add(energyCell);

    // 2. Picatinny Tactical Top Rail
    const topRail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 0.72), carbonBarrelMat);
    topRail.position.set(0, 0.09, 0.02);
    topRail.castShadow = true;
    gun.add(topRail);

    // 3. Heavy Fluted Sniper Barrel (extends forward along +Z)
    const barrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.028, 0.036, 1.15, 16),
      carbonBarrelMat
    );
    barrel.rotateX(Math.PI / 2);
    barrel.position.set(0, 0.03, 0.75);
    barrel.castShadow = true;
    gun.add(barrel);

    // Fluted Chrome Rings on Barrel
    [-0.2, 0.0, 0.2].forEach((offset) => {
      const ring = new THREE.Mesh(
        new THREE.CylinderGeometry(0.038, 0.038, 0.04, 16),
        chromeAccentMat
      );
      ring.rotateX(Math.PI / 2);
      ring.position.set(0, 0.03, 0.75 + offset);
      gun.add(ring);
    });

    // 4. Muzzle Brake & Compensator
    const muzzleBrake = new THREE.Mesh(
      new THREE.BoxGeometry(0.07, 0.07, 0.18),
      darkChassisMat
    );
    muzzleBrake.position.set(0, 0.03, 1.38);
    muzzleBrake.castShadow = true;
    gun.add(muzzleBrake);

    // 5. High-Precision Optical Scope
    const scopeTube = new THREE.Mesh(
      new THREE.CylinderGeometry(0.042, 0.042, 0.42, 16),
      darkChassisMat
    );
    scopeTube.rotateX(Math.PI / 2);
    scopeTube.position.set(0, 0.17, 0.04);
    scopeTube.castShadow = true;
    gun.add(scopeTube);

    // Front Scope Lens Bell
    const scopeBell = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.042, 0.1, 16),
      darkChassisMat
    );
    scopeBell.rotateX(Math.PI / 2);
    scopeBell.position.set(0, 0.17, 0.28);
    gun.add(scopeBell);

    // Illuminated Holographic Optic Lens
    const scopeLens = new THREE.Mesh(new THREE.CircleGeometry(0.048, 16), emeraldOpticMat);
    scopeLens.position.set(0, 0.17, 0.331);
    gun.add(scopeLens);

    // Scope Mount Rings
    [-0.1, 0.15].forEach((zPos) => {
      const mount = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.05), carbonBarrelMat);
      mount.position.set(0, 0.12, zPos);
      gun.add(mount);
    });

    // 6. Tactical Buttstock & Shoulder Rest
    const stock = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.18, 0.45), darkChassisMat);
    stock.position.set(0, -0.02, -0.48);
    stock.castShadow = true;
    gun.add(stock);

    const buttPad = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.22, 0.06), carbonBarrelMat);
    buttPad.position.set(0, -0.02, -0.71);
    gun.add(buttPad);

    // 7. Tactical Ergonomic Pistol Grip (for right hand)
    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.24, 0.12), darkChassisMat);
    grip.rotation.x = -0.32;
    grip.position.set(0, -0.16, -0.12);
    grip.castShadow = true;
    gun.add(grip);

    // 8. Folded Tactical Carbon Bipod
    const bipodBase = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 0.1), chromeAccentMat);
    bipodBase.position.set(0, -0.03, 0.65);
    gun.add(bipodBase);

    [-0.05, 0.05].forEach((xSide) => {
      const bipodLeg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.015, 0.38, 8),
        darkChassisMat
      );
      bipodLeg.rotateX(Math.PI / 2.1);
      bipodLeg.position.set(xSide, -0.06, 0.82);
      gun.add(bipodLeg);
    });

    // 9. Attach the 3D Sniper Ammo Model as the High-Capacity Magazine!
    if (this.cachedAmmoScene) {
      const mag = this.cachedAmmoScene.clone(true);
      mag.position.set(0, -0.14, 0.08);
      gun.add(mag);
    } else {
      const magFallback = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.28, 0.16),
        darkChassisMat
      );
      magFallback.position.set(0, -0.14, 0.08);
      gun.add(magFallback);
    }

    return gun;
  }

  // Create High-Tech Fallback Human Operative
  private createProceduralHuman(): THREE.Group {
    const human = new THREE.Group();
    const coatMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.7 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.9, 0.4), coatMat);
    body.position.y = 1.1;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16), skinMat);
    head.position.y = 1.8;
    human.add(body, head);
    return human;
  }

  // Instantiate the Main Playable Human Hero Character
  public createHero(): HumanHeroEntity {
    if (!this.cachedHumanScene || !this.cachedAmmoScene) {
      // Create temporary shell while assets finish loading
      const shellGroup = new THREE.Group();
      const fallbackSniper = this.createSniperRifle();
      fallbackSniper.position.set(-0.16, 1.15, 0.28);
      shellGroup.add(fallbackSniper);

      const fallbackHuman = this.createProceduralHuman();
      shellGroup.add(fallbackHuman);

      const placeholderMuzzle = new THREE.Vector3();
      const laserMat = new THREE.LineBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.85 });
      const laserGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(0, 0, 35)]);
      const laser = new THREE.Line(laserGeo, laserMat);
      shellGroup.add(laser);

      let innerDancing = false;
      const entity: HumanHeroEntity = {
        group: shellGroup,
        weaponMuzzle: placeholderMuzzle,
        aimLaser: laser,
        gunGroup: fallbackSniper,
        get isDancing() {
          return innerDancing;
        },
        set isDancing(v: boolean) {
          innerDancing = v;
        },
        animateWalk: () => {},
        updateLaserAim: () => {},
        triggerRecoil: () => {},
        flashHit: () => {},
        playVictoryDance: () => { innerDancing = true; },
        stopVictoryDance: () => { innerDancing = false; },
        toggleVictoryDance: () => { innerDancing = !innerDancing; },
      };

      this.preloadCallbacks.push((loadedEntity) => {
        // Swap shell children with loaded assets
        shellGroup.clear();
        shellGroup.add(loadedEntity.group);

        entity.weaponMuzzle = loadedEntity.weaponMuzzle;
        entity.aimLaser = loadedEntity.aimLaser;
        entity.gunGroup = loadedEntity.gunGroup;
        entity.animateWalk = loadedEntity.animateWalk;
        entity.updateLaserAim = loadedEntity.updateLaserAim;
        entity.triggerRecoil = loadedEntity.triggerRecoil;
        entity.flashHit = loadedEntity.flashHit;
        entity.playVictoryDance = loadedEntity.playVictoryDance;
        entity.stopVictoryDance = loadedEntity.stopVictoryDance;
        entity.toggleVictoryDance = loadedEntity.toggleVictoryDance;

        Object.defineProperty(entity, 'isDancing', {
          get() {
            return loadedEntity.isDancing;
          },
          set(val: boolean) {
            loadedEntity.isDancing = val;
          },
        });
      });

      return entity;
    }

    return this.instantiateHero();
  }

  private instantiateHero(): HumanHeroEntity {
    const masterGroup = new THREE.Group();

    // 1. Clone 3D Human Model using SkeletonUtils (CRUCIAL for rigged SkinnedMesh!)
    // Standard Object3D.clone() leaves bones unbound to SkinnedMesh!
    const humanScene = SkeletonUtils.clone(this.cachedHumanScene!) as THREE.Group;
    masterGroup.add(humanScene);

    // Find key upper-body arm bones for holding the sniper rifle (Nathan rig)
    const rightUpperArm = humanScene.getObjectByName('rp_nathan_animated_003_walking_upperarm_r') as THREE.Bone | null;
    const rightLowerArm = humanScene.getObjectByName('rp_nathan_animated_003_walking_lowerarm_r') as THREE.Bone | null;
    const rightHand = humanScene.getObjectByName('rp_nathan_animated_003_walking_hand_r') as THREE.Bone | null;

    const leftUpperArm = humanScene.getObjectByName('rp_nathan_animated_003_walking_upperarm_l') as THREE.Bone | null;
    const leftLowerArm = humanScene.getObjectByName('rp_nathan_animated_003_walking_lowerarm_l') as THREE.Bone | null;
    const leftHand = humanScene.getObjectByName('rp_nathan_animated_003_walking_hand_l') as THREE.Bone | null;

    const rightUpperTwist = humanScene.getObjectByName('rp_nathan_animated_003_walking_upperarm_twist_r') as THREE.Bone | null;
    const rightLowerTwist = humanScene.getObjectByName('rp_nathan_animated_003_walking_lowerarm_twist_r') as THREE.Bone | null;
    const leftUpperTwist = humanScene.getObjectByName('rp_nathan_animated_003_walking_upperarm_twist_l') as THREE.Bone | null;
    const leftLowerTwist = humanScene.getObjectByName('rp_nathan_animated_003_walking_lowerarm_twist_l') as THREE.Bone | null;

    // Set up AnimationMixer:
    // 1. In-place walk locomotion (legs, hips, pelvis, spine) - upper body kept locked in combat rifle grip
    // 2. Victory celebration mode on [T]
    let mixer: THREE.AnimationMixer | null = null;
    let walkAction: THREE.AnimationAction | null = null;

    if (this.humanAnimations.length > 0) {
      const rawClip = this.humanAnimations[0];
      mixer = new THREE.AnimationMixer(humanScene);

      // Filter out root translation (keeps Nathan stepping smoothly in-place without drifting 2.9m forward)
      // Filter out arm/hand tracks (keeps arms locked in tactical rifle grip)
      const isUpperOrRootMotion = (name: string) => {
        if (name.includes('walking_root.position')) return true;
        if (/upperarm|lowerarm|hand|twist|thumb|finger/i.test(name)) return true;
        return false;
      };
      const legTracks = rawClip.tracks.filter((t) => !isUpperOrRootMotion(t.name));
      const walkClip = new THREE.AnimationClip('WalkLocomotion', rawClip.duration, legTracks);
      walkAction = mixer.clipAction(walkClip);
      walkAction.setLoop(THREE.LoopRepeat, Infinity);
      walkAction.play();
      walkAction.timeScale = 1.0;
    }

    // 2. Build and Mount the High-Detail 3D KSR-29 AP Sniper Rifle
    const gunContainer = new THREE.Group();
    const sniperModel = this.createSniperRifle();
    // Scale to realistic sniper rifle proportions (~1.12m length)
    sniperModel.scale.setScalar(0.70);
    gunContainer.add(sniperModel);

    // Muzzle Point Light (Flashes bright emerald-amber upon firing)
    const muzzleFlashLight = new THREE.PointLight(0x34d399, 0, 14);
    muzzleFlashLight.position.set(0, 0.02, 0.98);
    gunContainer.add(muzzleFlashLight);

    // Tactical Emerald Laser Sight projecting forward from muzzle tip
    const laserMat = new THREE.LineBasicMaterial({
      color: 0x10b981,
      linewidth: 2,
      transparent: true,
      opacity: 0.9,
    });
    const laserGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, 35),
    ]);
    const aimLaser = new THREE.Line(laserGeo, laserMat);
    aimLaser.position.set(0, 0.02, 0.98);
    gunContainer.add(aimLaser);

    // Scale main character by 24% (+18-20px screen height increase as requested)
    masterGroup.scale.setScalar(1.24);

    // Position gun firmly in front of Nathan's right chest & hands (never penetrating back/shirt)
    const baseGunX = -0.15;
    const baseGunY = 1.26;
    const baseGunZ = 0.38; // Forward in front of chest so stock sits on right shoulder without penetrating
    gunContainer.position.set(baseGunX, baseGunY, baseGunZ);
    masterGroup.add(gunContainer);

    // World position of muzzle for projectiles and VFX
    const weaponMuzzle = new THREE.Vector3();

    // Recoil and dancing state
    let recoilOffset = 0;
    let flashTimer = 0;
    let isDancing = false;

    // Tactical Two-Handed Combat Arm Quaternions for Nathan Rig:
    // Right Arm: pitches down into ready firing stance with hand firmly gripping pistol grip & trigger
    const qCombatUpperR = new THREE.Quaternion(-0.06379, 0.27942, 0.67696, 0.67792);
    const qCombatLowerR = new THREE.Quaternion(0.02410, 0.28384, -0.08111, 0.95513);
    const qCombatHandR = new THREE.Quaternion(-0.68, 0.12, -0.18, 0.70).normalize();

    // Left Arm: reaches forward across chest to cradle and support the rifle handguard
    const qCombatUpperL = new THREE.Quaternion(-0.06798, -0.67839, -0.51106, 0.52344);
    const qCombatLowerL = new THREE.Quaternion(0.00269, -0.01580, -0.00163, 0.99987);
    const qCombatHandL = new THREE.Quaternion(-0.58, -0.22, 0.14, 0.77).normalize();

    // Identity quaternion for smooth twist bones
    const qIdentity = new THREE.Quaternion(0, 0, 0, 1);

    // Lock arms into tactical two-handed rifle firing grip
    const lockCombatArms = () => {
      if (rightUpperArm) rightUpperArm.quaternion.copy(qCombatUpperR);
      if (rightLowerArm) rightLowerArm.quaternion.copy(qCombatLowerR);
      if (rightHand) rightHand.quaternion.copy(qCombatHandR);
      if (rightUpperTwist) rightUpperTwist.quaternion.copy(qIdentity);
      if (rightLowerTwist) rightLowerTwist.quaternion.copy(qIdentity);

      if (leftUpperArm) leftUpperArm.quaternion.copy(qCombatUpperL);
      if (leftLowerArm) leftLowerArm.quaternion.copy(qCombatLowerL);
      if (leftHand) leftHand.quaternion.copy(qCombatHandL);
      if (leftUpperTwist) leftUpperTwist.quaternion.copy(qIdentity);
      if (leftLowerTwist) leftLowerTwist.quaternion.copy(qIdentity);
    };

    const entity: HumanHeroEntity = {
      group: masterGroup,
      weaponMuzzle,
      aimLaser,
      gunGroup: gunContainer,
      get isDancing() {
        return isDancing;
      },
      set isDancing(val: boolean) {
        isDancing = val;
      },

      playVictoryDance: () => {
        isDancing = true;
        if (walkAction) walkAction.stop();
        // Raise gun triumphantly into air in celebration
        gunContainer.position.set(-0.2, 1.88, 0.15);
        gunContainer.rotation.set(0.65, 0.2, 0.35);
        if (rightUpperArm) rightUpperArm.quaternion.set(0.2, 0.1, -0.65, 0.72).normalize();
        if (rightLowerArm) rightLowerArm.quaternion.set(0.0, 0.1, -0.2, 0.97).normalize();
      },

      stopVictoryDance: () => {
        isDancing = false;
        if (walkAction) {
          walkAction.reset();
          walkAction.play();
          walkAction.timeScale = 1.0;
        }
        gunContainer.position.set(baseGunX, baseGunY, baseGunZ);
        gunContainer.rotation.set(0, 0, 0);
        lockCombatArms();
      },

      toggleVictoryDance: () => {
        if (isDancing) {
          entity.stopVictoryDance();
        } else {
          entity.playVictoryDance();
        }
      },

      triggerRecoil: () => {
        recoilOffset = 0.18; // 18cm backward kinetic kick
        flashTimer = 0.12;
        muzzleFlashLight.intensity = 5.0;
      },

      flashHit: () => {
        humanScene.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const m = child as THREE.Mesh;
            if (Array.isArray(m.material)) {
              m.material.forEach((mat) => {
                if ('color' in mat) (mat as any).color.setHex(0xff3333);
              });
            } else if ('color' in m.material) {
              (m.material as any).color.setHex(0xff3333);
            }
          }
        });
        setTimeout(() => {
          humanScene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const m = child as THREE.Mesh;
              if (Array.isArray(m.material)) {
                m.material.forEach((mat) => {
                  if ('color' in mat) (mat as any).color.setHex(0xffffff);
                });
              } else if ('color' in m.material) {
                (m.material as any).color.setHex(0xffffff);
              }
            }
          });
        }, 120);
      },

      animateWalk: (time: number, isMoving: boolean) => {
        // 1. Advance skeletal animation mixer
        if (mixer) {
          const delta = 0.016;
          mixer.update(isDancing ? delta * 1.0 : isMoving ? delta * 1.6 : delta * 0.35);
        }

        // 2. Lock upper-body arm bones if in combat stance
        if (!isDancing) {
          lockCombatArms();
        }

        // 3. Dynamic recoil spring recovery
        if (recoilOffset > 0.001) {
          recoilOffset = THREE.MathUtils.lerp(recoilOffset, 0, 0.25);
        } else {
          recoilOffset = 0;
        }

        // 4. Muzzle flash decay
        if (flashTimer > 0) {
          flashTimer -= 0.016;
          muzzleFlashLight.intensity = Math.max(0, (flashTimer / 0.12) * 5.0);
        } else {
          muzzleFlashLight.intensity = 0;
        }

        // 5. Idle breathing & movement sway
        if (!isDancing) {
          const bobY = isMoving ? Math.sin(time * 12) * 0.03 : Math.sin(time * 2.5) * 0.008;
          const bobZ = isMoving ? Math.cos(time * 12) * 0.02 : 0;
          gunContainer.position.set(baseGunX, baseGunY + bobY, baseGunZ + bobZ - recoilOffset);
        }

        // Update world muzzle position
        muzzleFlashLight.getWorldPosition(weaponMuzzle);
      },

      updateLaserAim: (targetPoint: THREE.Vector3) => {
        if (isDancing) {
          aimLaser.visible = false;
          return;
        }
        aimLaser.visible = true;

        // Project laser sight straight forward horizontally along rifle barrel
        const localTarget = gunContainer.worldToLocal(targetPoint.clone());
        const targetDist = Math.max(10, Math.min(35, localTarget.length()));
        const laserPoints = [
          new THREE.Vector3(0, 0.02, 0.98),
          new THREE.Vector3(0, 0.02, 0.98 + targetDist),
        ];
        aimLaser.geometry.setFromPoints(laserPoints);
      },
    };

    return entity;
  }
}

export const humanHeroFactory = new HumanHeroFactory();
