// 3D Human Hero Playable Character ("Operative Manuel")
// Replaces the placeholder Unit-7 robot as the main playable protagonist!
// Features:
// 1. Ultra-compressed 3D Rigged Human Model (human.glb, 1.78 MB)
// 2. High-Precision 3D KSR-29 AP Sniper Rifle (sniper.glb, 118 KB) prominently held in both hands
// 3. Two-handed tactical combat weapon stance & aim tracking toward cursor
// 4. Supersonic sniper kinetic recoil, muzzle flash lighting, and tactical laser sight
// 5. Celebration victory dance on [F]
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

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
  private cachedSniperScene: THREE.Group | null = null;
  private humanAnimations: THREE.AnimationClip[] = [];
  private isPreloading = false;
  private preloadCallbacks: ((entity: HumanHeroEntity) => void)[] = [];

  constructor() {
    this.preload();
  }

  private preload() {
    if (this.isPreloading || (this.cachedHumanScene && this.cachedSniperScene)) return;
    this.isPreloading = true;

    try {
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath('/draco/gltf/');

      const loader = new GLTFLoader();
      loader.setDRACOLoader(dracoLoader);

      // 1. Load 3D Sniper Rifle Model (sniper.glb)
      loader.load(
        '/models/gun/sniper.glb',
        (sniperGltf) => {
          const sniperScene = sniperGltf.scene;
          sniperScene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              mesh.castShadow = true;
              mesh.receiveShadow = true;
              if (mesh.material) {
                const mat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
                if ('roughness' in mat) (mat as any).roughness = 0.28;
                if ('metalness' in mat) (mat as any).metalness = 0.85;
              }
            }
          });

          // In sniper.glb, the barrel (+X) points to the right.
          // Rotating around Y by -Math.PI / 2 rotates +X into +Z (forward)!
          sniperScene.rotation.set(0, -Math.PI / 2, 0);
          sniperScene.scale.setScalar(1.2); // Stately 1.35m military sniper rifle
          this.cachedSniperScene = sniperScene;
          this.checkPreloadComplete();
        },
        undefined,
        (err) => {
          console.warn('Failed to load 3D Sniper Rifle model, using procedural fallback:', err);
          this.cachedSniperScene = this.createProceduralSniper();
          this.checkPreloadComplete();
        }
      );

      // 2. Load 3D Human Character Model (human.glb)
      loader.load(
        '/models/human/human.glb',
        (humanGltf) => {
          const humanScene = humanGltf.scene;
          humanScene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              mesh.castShadow = true;
              mesh.receiveShadow = true;
            }
          });
          this.humanAnimations = humanGltf.animations;
          this.cachedHumanScene = humanScene;
          this.checkPreloadComplete();
        },
        undefined,
        (err) => {
          console.warn('Failed to load 3D Human model, using procedural fallback:', err);
          this.cachedHumanScene = this.createProceduralHuman();
          this.checkPreloadComplete();
        }
      );
    } catch (e) {
      console.warn('Error initializing GLTF loader for Human Hero:', e);
      this.cachedSniperScene = this.createProceduralSniper();
      this.cachedHumanScene = this.createProceduralHuman();
      this.checkPreloadComplete();
    }
  }

  private checkPreloadComplete() {
    if (this.cachedHumanScene && this.cachedSniperScene) {
      this.isPreloading = false;
      this.preloadCallbacks.forEach((cb) => {
        cb(this.instantiateHero());
      });
      this.preloadCallbacks = [];
    }
  }

  // Create High-Tech Fallback Sniper Rifle (Used instantly while loading)
  public createProceduralSniper(): THREE.Group {
    const gun = new THREE.Group();
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.85, roughness: 0.25 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.15 });
    const cyanGlowMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });

    // Stock & Receiver
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.22, 0.9), darkMat);
    body.position.set(0, 0, -0.1);
    body.castShadow = true;

    // Long fluted barrel extending forward along +Z
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.25, 12), chromeMat);
    barrel.rotateX(Math.PI / 2);
    barrel.position.set(0, 0.04, 0.65);
    barrel.castShadow = true;

    // Muzzle Brake
    const muzzleBrake = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.16), darkMat);
    muzzleBrake.position.set(0, 0.04, 1.3);

    // High-Tech Optic Scope
    const scopeTube = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.42, 12), darkMat);
    scopeTube.rotateX(Math.PI / 2);
    scopeTube.position.set(0, 0.18, 0.1);

    const scopeLens = new THREE.Mesh(new THREE.CircleGeometry(0.04, 16), cyanGlowMat);
    scopeLens.position.set(0, 0.18, 0.31);

    // Magazine
    const mag = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.28, 0.18), darkMat);
    mag.position.set(0, -0.16, 0.05);

    gun.add(body, barrel, muzzleBrake, scopeTube, scopeLens, mag);
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
    if (!this.cachedHumanScene || !this.cachedSniperScene) {
      // Create temporary shell while assets finish loading
      const shellGroup = new THREE.Group();
      const fallbackSniper = this.createProceduralSniper();
      fallbackSniper.position.set(-0.18, 1.15, 0.35);
      shellGroup.add(fallbackSniper);

      const fallbackHuman = this.createProceduralHuman();
      shellGroup.add(fallbackHuman);

      const placeholderMuzzle = new THREE.Vector3();
      const laserMat = new THREE.LineBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.85 });
      const laserGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(0, 0, 35)]);
      const laser = new THREE.Line(laserGeo, laserMat);
      shellGroup.add(laser);

      const entity: HumanHeroEntity = {
        group: shellGroup,
        weaponMuzzle: placeholderMuzzle,
        aimLaser: laser,
        gunGroup: fallbackSniper,
        isDancing: false,
        animateWalk: () => {},
        updateLaserAim: () => {},
        triggerRecoil: () => {},
        flashHit: () => {},
        playVictoryDance: () => {},
        stopVictoryDance: () => {},
        toggleVictoryDance: () => {},
      };

      this.preloadCallbacks.push((loadedEntity) => {
        // Swap shell children with loaded assets
        shellGroup.clear();
        shellGroup.add(loadedEntity.group);

        entity.weaponMuzzle = loadedEntity.weaponMuzzle;
        entity.aimLaser = loadedEntity.aimLaser;
        entity.gunGroup = loadedEntity.gunGroup;
        entity.isDancing = loadedEntity.isDancing;
        entity.animateWalk = loadedEntity.animateWalk;
        entity.updateLaserAim = loadedEntity.updateLaserAim;
        entity.triggerRecoil = loadedEntity.triggerRecoil;
        entity.flashHit = loadedEntity.flashHit;
        entity.playVictoryDance = loadedEntity.playVictoryDance;
        entity.stopVictoryDance = loadedEntity.stopVictoryDance;
        entity.toggleVictoryDance = loadedEntity.toggleVictoryDance;
      });

      return entity;
    }

    return this.instantiateHero();
  }

  private instantiateHero(): HumanHeroEntity {
    const masterGroup = new THREE.Group();

    // 1. Clone 3D Human Model
    const humanScene = this.cachedHumanScene!.clone(true);
    masterGroup.add(humanScene);

    // Find upper-body arm bones for tactical gun handling
    const rightUpperArm = humanScene.getObjectByName('rp_manuel_animated_001_dancing_upperarm_r') as THREE.Bone | null;
    const rightLowerArm = humanScene.getObjectByName('rp_manuel_animated_001_dancing_lowerarm_r') as THREE.Bone | null;
    const rightHand = humanScene.getObjectByName('rp_manuel_animated_001_dancing_hand_r') as THREE.Bone | null;

    const leftUpperArm = humanScene.getObjectByName('rp_manuel_animated_001_dancing_upperarm_l') as THREE.Bone | null;
    const leftLowerArm = humanScene.getObjectByName('rp_manuel_animated_001_dancing_lowerarm_l') as THREE.Bone | null;
    const leftHand = humanScene.getObjectByName('rp_manuel_animated_001_dancing_hand_l') as THREE.Bone | null;

    // Set up AnimationMixer for locomotion and victory dance
    let mixer: THREE.AnimationMixer | null = null;
    let walkAction: THREE.AnimationAction | null = null;
    if (this.humanAnimations.length > 0) {
      mixer = new THREE.AnimationMixer(humanScene);
      walkAction = mixer.clipAction(this.humanAnimations[0]);
      walkAction.setLoop(THREE.LoopRepeat, Infinity);
      walkAction.play();
      walkAction.timeScale = 0.5; // Steady cadence
    }

    // 2. Clone and Setup 3D KSR-29 AP Sniper Rifle
    const gunContainer = new THREE.Group();
    const sniperModel = this.cachedSniperScene!.clone(true);
    gunContainer.add(sniperModel);

    // Tactical Illuminated Holographic Scope Optic Ring
    const scopeGlowMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const scopeGlow = new THREE.Mesh(new THREE.RingGeometry(0.025, 0.055, 16), scopeGlowMat);
    scopeGlow.position.set(0, 0.22, 0.15);
    gunContainer.add(scopeGlow);

    // Tactical Barrel Compensator / Suppressor (ensures high visual silhouette clarity)
    const barrelShroudMat = new THREE.MeshStandardMaterial({
      color: 0x09090b,
      metalness: 0.95,
      roughness: 0.2,
    });
    const barrelShroud = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.045, 0.55, 12),
      barrelShroudMat
    );
    barrelShroud.rotateX(Math.PI / 2);
    barrelShroud.position.set(0, 0.04, 0.65);
    gunContainer.add(barrelShroud);

    // Muzzle Point Light (Flashes bright emerald-amber upon firing)
    const muzzleFlashLight = new THREE.PointLight(0x34d399, 0, 14);
    muzzleFlashLight.position.set(0, 0.04, 0.95);
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
    aimLaser.position.set(0, 0.04, 0.95);
    gunContainer.add(aimLaser);

    // Position gun firmly in Manuel's right hands & chest
    // Manuel's right shoulder/arm is at X = -0.18 to -0.22, chest level Y = 1.15, Z = 0.32 in front
    const baseGunX = -0.18;
    const baseGunY = 1.15;
    const baseGunZ = 0.32;
    gunContainer.position.set(baseGunX, baseGunY, baseGunZ);
    masterGroup.add(gunContainer);

    // World position of muzzle for projectiles and VFX
    const weaponMuzzle = new THREE.Vector3();

    // Recoil and dancing state
    let recoilOffset = 0;
    let flashTimer = 0;
    let isDancing = false;

    // Base rest quaternions for arms
    const qCombatUpperR = new THREE.Quaternion(-0.24369, 0.56081, -0.11195, 0.78331)
      .multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0.55, 0.35, -0.25, 'XYZ')));
    const qCombatLowerR = new THREE.Quaternion(0.13198, -0.04066, 0.00505, 0.99041)
      .multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0.75, -0.2, 0.15, 'XYZ')));
    const qCombatHandR = new THREE.Quaternion(-0.58297, -0.06395, -0.17320, 0.79124)
      .multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0.2, 0.1, 0.0, 'XYZ')));

    const qCombatUpperL = new THREE.Quaternion(0.34041, 0.44008, -0.40100, 0.72777)
      .multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.45, 0.55, 0.35, 'XYZ')));
    const qCombatLowerL = new THREE.Quaternion(-0.39233, -0.00064, -0.01512, 0.91970)
      .multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.85, -0.25, 0.15, 'XYZ')));
    const qCombatHandL = new THREE.Quaternion(-0.69270, 0.03114, -0.06152, 0.71792)
      .multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0.15, 0.2, 0.0, 'XYZ')));

    // Lock arms into tactical two-handed rifle firing grip
    const lockCombatArms = () => {
      if (rightUpperArm) rightUpperArm.quaternion.copy(qCombatUpperR);
      if (rightLowerArm) rightLowerArm.quaternion.copy(qCombatLowerR);
      if (rightHand) rightHand.quaternion.copy(qCombatHandR);

      if (leftUpperArm) leftUpperArm.quaternion.copy(qCombatUpperL);
      if (leftLowerArm) leftLowerArm.quaternion.copy(qCombatLowerL);
      if (leftHand) leftHand.quaternion.copy(qCombatHandL);
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
        if (walkAction) walkAction.timeScale = 1.0;
        // Raise gun triumphantly
        gunContainer.position.set(-0.1, 1.85, 0.1);
        gunContainer.rotation.set(0.6, 0, 0.4);
      },

      stopVictoryDance: () => {
        isDancing = false;
        if (walkAction) walkAction.timeScale = 0.5;
        gunContainer.position.set(baseGunX, baseGunY, baseGunZ);
        gunContainer.rotation.set(0, 0, 0);
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

        // Laser vector in local coordinates
        const localTarget = gunContainer.worldToLocal(targetPoint.clone());
        const laserPoints = [new THREE.Vector3(0, 0.04, 0.95), localTarget];
        aimLaser.geometry.setFromPoints(laserPoints);
      },
    };

    return entity;
  }
}

export const humanHeroFactory = new HumanHeroFactory();
