// Human Sniper Ally Entity Loader & Controller ("Specialist Manuel")
// Features:
// 1. Ultra-compressed 3D Rigged Human Model (human.glb, 1.78 MB) with skeletal rig and animation mixer
// 2. High-Precision 3D Sniper Rifle (sniper.glb, 112 KB) attached to right hand
// 3. Autonomous AI targeting with emerald tactical laser sight & muzzle flashes
// 4. Heavy armor-piercing kinetic rounds (75 DMG) against scouts, enforcers, and bosses
// 5. Dynamic victory dancing animation celebration
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { sounds } from '../../engine/audio';

export interface HumanSniperEntity {
  group: THREE.Group;
  hp: number;
  maxHp: number;
  isRescued: boolean;
  isAlive: boolean;
  name: string;
  shootCooldown: number;
  isDancing: boolean;
  targetPos: THREE.Vector3 | null;
  muzzlePos: THREE.Vector3;
  update: (
    delta: number,
    playerPos: THREE.Vector3,
    enemies: Array<{ group: THREE.Object3D; hp: number; isAlive: boolean }>,
    vfx?: any
  ) => { fired: boolean; targetHit?: any };
  playVictoryDance: () => void;
  stopVictoryDance: () => void;
  flashHit: () => void;
}

class HumanSniperFactory {
  private cachedHumanScene: THREE.Group | null = null;
  private cachedSniperScene: THREE.Group | null = null;
  private humanAnimations: THREE.AnimationClip[] = [];
  private isPreloading = false;
  private preloadCallbacks: ((entity: HumanSniperEntity) => void)[] = [];

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

      // Load Sniper Rifle
      loader.load(
        '/models/gun/sniper.glb',
        (sniperGltf) => {
          const sniperScene = sniperGltf.scene;
          sniperScene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              mesh.castShadow = true;
              mesh.receiveShadow = true;
            }
          });
          // Sniper model scale is metric (~1.1m long)
          sniperScene.scale.setScalar(0.9);
          this.cachedSniperScene = sniperScene;
          this.checkPreloadComplete();
        },
        undefined,
        (err) => {
          console.warn('Failed to load 3D Sniper Rifle model:', err);
          this.cachedSniperScene = this.createFallbackSniper();
          this.checkPreloadComplete();
        }
      );

      // Load 3D Human Model
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
          console.warn('Failed to load 3D Human model:', err);
          this.cachedHumanScene = this.createFallbackHuman();
          this.checkPreloadComplete();
        }
      );
    } catch (e) {
      console.warn('GLTFLoader error for Human Sniper Ally:', e);
      this.cachedSniperScene = this.createFallbackSniper();
      this.cachedHumanScene = this.createFallbackHuman();
      this.checkPreloadComplete();
    }
  }

  private checkPreloadComplete() {
    if (this.cachedHumanScene && this.cachedSniperScene) {
      this.isPreloading = false;
      this.preloadCallbacks.forEach((cb) => {
        cb(this.instantiateEntity());
      });
      this.preloadCallbacks = [];
    }
  }

  // Fallback procedural sniper if GLB fails to fetch
  public createFallbackSniper(): THREE.Group {
    const gun = new THREE.Group();
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, metalness: 0.9, roughness: 0.2 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 });
    const stock = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.2, 0.9), darkMat);
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.1, 8), chromeMat);
    barrel.rotateX(Math.PI / 2);
    barrel.position.set(0, 0.05, 0.5);
    const scope = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.35, 8), darkMat);
    scope.rotateX(Math.PI / 2);
    scope.position.set(0, 0.16, 0.1);
    gun.add(stock, barrel, scope);
    return gun;
  }

  // Fallback procedural human if GLB fails to fetch
  private createFallbackHuman(): THREE.Group {
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

  // Create an active instance of the Human Sniper Ally
  public createHumanSniper(initialPos: THREE.Vector3): HumanSniperEntity {
    if (!this.cachedHumanScene || !this.cachedSniperScene) {
      // If still preloading, return an entity immediately with temporary container
      const placeholderGroup = new THREE.Group();
      placeholderGroup.position.copy(initialPos);

      const entity: HumanSniperEntity = {
        group: placeholderGroup,
        hp: 300,
        maxHp: 300,
        isRescued: false,
        isAlive: true,
        name: 'Specialist Manuel',
        shootCooldown: 1.5,
        isDancing: false,
        targetPos: null,
        muzzlePos: new THREE.Vector3(),
        update: () => ({ fired: false }),
        playVictoryDance: () => {},
        stopVictoryDance: () => {},
        flashHit: () => {},
      };

      this.preloadCallbacks.push((loadedEntity) => {
        placeholderGroup.add(loadedEntity.group);
        // Copy initialized controllers over
        entity.update = loadedEntity.update;
        entity.playVictoryDance = loadedEntity.playVictoryDance;
        entity.stopVictoryDance = loadedEntity.stopVictoryDance;
        entity.flashHit = loadedEntity.flashHit;
      });

      return entity;
    }

    return this.instantiateEntity(initialPos);
  }

  private instantiateEntity(initialPos?: THREE.Vector3): HumanSniperEntity {
    const masterGroup = new THREE.Group();
    if (initialPos) masterGroup.position.copy(initialPos);

    // Clone the human scene
    const humanScene = this.cachedHumanScene!.clone(true);
    masterGroup.add(humanScene);

    // Clone sniper scene
    const sniperScene = this.cachedSniperScene!.clone(true);

    // Set up AnimationMixer
    let mixer: THREE.AnimationMixer | null = null;
    let danceAction: THREE.AnimationAction | null = null;
    if (this.humanAnimations.length > 0) {
      mixer = new THREE.AnimationMixer(humanScene);
      danceAction = mixer.clipAction(this.humanAnimations[0]);
      danceAction.setLoop(THREE.LoopRepeat, Infinity);
      danceAction.play();
    }

    // Attach sniper to right hand bone
    let rightHand: THREE.Object3D | null = null;
    humanScene.traverse((child) => {
      if (child.name.includes('hand_r') || child.name.includes('Hand_R') || child.name.includes('RightHand')) {
        rightHand = child;
      }
    });

    const gunMount = new THREE.Group();
    // Rotate & position gun to fit naturally in right hand pointing forward
    sniperScene.position.set(0.05, 0.05, 0.15);
    sniperScene.rotation.set(0, Math.PI, 0); // Face forward along arm aim
    gunMount.add(sniperScene);

    if (rightHand) {
      (rightHand as THREE.Object3D).add(gunMount);
    } else {
      // If bone not found, mount to torso/shoulder
      gunMount.position.set(0.35, 1.25, 0.3);
      masterGroup.add(gunMount);
    }

    // Laser Sight Beam (Tactical Green / Cyan)
    const laserMat = new THREE.LineBasicMaterial({
      color: 0x10b981,
      linewidth: 2,
      transparent: true,
      opacity: 0.85,
    });
    const laserGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, 30),
    ]);
    const laserSight = new THREE.Line(laserGeo, laserMat);
    laserSight.visible = false;
    gunMount.add(laserSight);

    // Muzzle Flash PointLight
    const muzzleFlash = new THREE.PointLight(0x34d399, 0, 8);
    muzzleFlash.position.set(0, 0.05, 1.2);
    gunMount.add(muzzleFlash);

    // Ally Status Beacon / Marker above head
    const beaconGeo = new THREE.OctahedronGeometry(0.25);
    const beaconMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      wireframe: true,
    });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.set(0, 2.25, 0);
    masterGroup.add(beacon);

    const beaconLight = new THREE.PointLight(0x10b981, 1.5, 6);
    beaconLight.position.set(0, 2.25, 0);
    masterGroup.add(beaconLight);

    // Entity state
    let hp = 350;
    const maxHp = 350;
    let isRescued = false;
    let isAlive = true;
    let shootCooldown = 1.0;
    let isDancing = false;
    let muzzleTimer = 0;
    let beaconRot = 0;
    const currentMuzzlePos = new THREE.Vector3();

    const entity: HumanSniperEntity = {
      group: masterGroup,
      hp,
      maxHp,
      isRescued,
      isAlive,
      name: 'Specialist Manuel',
      shootCooldown,
      isDancing,
      targetPos: null,
      muzzlePos: currentMuzzlePos,

      playVictoryDance: () => {
        entity.isDancing = true;
        if (danceAction) {
          danceAction.timeScale = 1.0;
          danceAction.play();
        }
      },

      stopVictoryDance: () => {
        entity.isDancing = false;
        if (danceAction) {
          danceAction.timeScale = 0.35; // gentle idle
        }
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

      update: (delta, playerPos, enemies, vfx) => {
        if (!isAlive) return { fired: false };

        // 1. Update Skeletal Animation
        if (mixer) {
          mixer.update(delta * (entity.isDancing ? 1.0 : 0.4));
        }

        // 2. Animate Beacon
        beaconRot += delta * 2.0;
        beacon.rotation.y = beaconRot;
        beacon.position.y = 2.25 + Math.sin(beaconRot * 2) * 0.08;

        // 3. Update Muzzle Flash decay
        if (muzzleTimer > 0) {
          muzzleTimer -= delta;
          muzzleFlash.intensity = Math.max(0, (muzzleTimer / 0.1) * 4.0);
        } else {
          muzzleFlash.intensity = 0;
        }

        // Get world position of sniper muzzle
        gunMount.getWorldPosition(currentMuzzlePos);
        currentMuzzlePos.y += 0.1;

        // If not rescued yet, wait for player proximity
        if (!entity.isRescued) {
          beacon.material = new THREE.MeshBasicMaterial({ color: 0xf59e0b, wireframe: true });
          beaconLight.color.setHex(0xf59e0b);
          laserSight.visible = false;
          return { fired: false };
        }

        // Rescued & Active! Beacon turns bright Emerald
        beacon.material = new THREE.MeshBasicMaterial({ color: 0x10b981, wireframe: true });
        beaconLight.color.setHex(0x10b981);

        // 4. Movement: Follow player within a tactical flanking radius (5 to 8 meters)
        const distToPlayer = masterGroup.position.distanceTo(playerPos);
        if (distToPlayer > 8.0 && !entity.isDancing) {
          const moveDir = new THREE.Vector3().subVectors(playerPos, masterGroup.position).normalize();
          masterGroup.position.addScaledVector(moveDir, delta * 5.5);
          // Look towards movement
          const targetAngle = Math.atan2(moveDir.x, moveDir.z);
          masterGroup.rotation.y = THREE.MathUtils.lerp(masterGroup.rotation.y, targetAngle, delta * 6.0);
        }

        // 5. Combat AI & Sniper Targeting
        // Find nearest living enemy within 45m range
        let nearestEnemy: any = null;
        let minDist = 45.0;

        for (const enemy of enemies) {
          if (!enemy.isAlive || enemy.hp <= 0) continue;
          const d = masterGroup.position.distanceTo(enemy.group.position);
          if (d < minDist) {
            minDist = d;
            nearestEnemy = enemy;
          }
        }

        let shotFired = false;
        let hitTarget: any = null;

        if (nearestEnemy && !entity.isDancing) {
          const enemyPos = nearestEnemy.group.position.clone();
          enemyPos.y += 1.2; // Aim at chest/center of mass

          // Face the target
          const aimAngle = Math.atan2(
            enemyPos.x - masterGroup.position.x,
            enemyPos.z - masterGroup.position.z
          );
          masterGroup.rotation.y = THREE.MathUtils.lerp(masterGroup.rotation.y, aimAngle, delta * 8.0);

          // Update Laser Sight
          laserSight.visible = true;
          const laserDir = new THREE.Vector3().subVectors(enemyPos, currentMuzzlePos);
          const laserLength = laserDir.length();
          laserSight.scale.set(1, 1, laserLength / 30);
          gunMount.lookAt(enemyPos);

          // Fire sniper shot on cooldown
          shootCooldown -= delta;
          if (shootCooldown <= 0) {
            shootCooldown = 1.8 + Math.random() * 0.4; // High-caliber cadence
            shotFired = true;
            hitTarget = nearestEnemy;

            // Trigger sniper audio
            sounds.playSniperShot();

            // Muzzle flash
            muzzleTimer = 0.12;
            muzzleFlash.intensity = 5.0;

            // Deal heavy kinetic armor-piercing damage (75 DMG)
            nearestEnemy.hp -= 75;
            if (nearestEnemy.hp <= 0) {
              nearestEnemy.isAlive = false;
            }

            // Visual effects
            if (vfx) {
              vfx.emitSparks(enemyPos, 25, 0x10b981, 14, true);
              vfx.emitText(enemyPos.clone().add(new THREE.Vector3(0, 2.2, 0)), '-75 AP SNIPER!', '#10b981', 24, true);
            }
          }
        } else {
          laserSight.visible = false;
          shootCooldown = Math.max(0.5, shootCooldown - delta);
        }

        return { fired: shotFired, targetHit: hitTarget };
      },
    };

    return entity;
  }
}

export const humanSniperFactory = new HumanSniperFactory();
