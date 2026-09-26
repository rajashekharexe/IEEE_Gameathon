// 3D Combat Robot Entity Loader & Controller (Attack Enforcers & Shield Droids)
// Supports: Attack droids, Shield droids with energy shields, Hacking transition (RED -> GREEN),
// Ally state with 8-second countdown timer, walking locomotion, and hit reactions.
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

export interface EnforcerRobotEntity {
  group: THREE.Group;
  type: 'ATTACK' | 'SHIELD';
  hp: number;
  maxHp: number;
  speed: number;
  shootCooldown: number;
  isAlive: boolean;
  isHacked: boolean;
  hackTimer: number;
  hasShield: boolean;
  shieldMesh?: THREE.Mesh;
  allyRing?: THREE.Mesh;
  eyeLight?: THREE.PointLight;
  visorMesh?: THREE.Mesh;
  muzzlePos: THREE.Vector3;
  patrolAngle: number;
  patrolCenter: THREE.Vector3;
  animateWalk: (time: number, isMoving: boolean) => void;
  flashHit: () => void;
  convertToAlly: () => void;
}

class EnforcerRobotFactory {
  private cachedModel: THREE.Group | null = null;
  private isPreloading = false;
  private preloadCallbacks: ((model: THREE.Group) => void)[] = [];
  private robotTexture: THREE.Texture | null = null;

  constructor() {
    this.preload();
  }

  private preload() {
    if (this.isPreloading || this.cachedModel) return;
    this.isPreloading = true;

    try {
      const texLoader = new THREE.TextureLoader();
      this.robotTexture = texLoader.load('/models/robot/Robot.png');
      this.robotTexture.colorSpace = THREE.SRGBColorSpace;

      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath('/draco/gltf/');

      const loader = new GLTFLoader();
      loader.setDRACOLoader(dracoLoader);

      loader.load(
        '/models/robot/Robot.glb',
        (gltf) => {
          const rawGroup = gltf.scene;

          rawGroup.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              mesh.castShadow = true;
              mesh.receiveShadow = true;
              if (this.robotTexture) {
                mesh.material = new THREE.MeshStandardMaterial({
                  map: this.robotTexture,
                  roughness: 0.35,
                  metalness: 0.75,
                });
              }
            }
          });

          const masterContainer = new THREE.Group();
          const initialBox = new THREE.Box3().setFromObject(rawGroup);
          const size = new THREE.Vector3();
          initialBox.getSize(size);

          const targetHeight = 2.8;
          const scaleFactor = targetHeight / (size.y || 1);
          rawGroup.scale.setScalar(scaleFactor);

          const scaledBox = new THREE.Box3().setFromObject(rawGroup);
          const scaledCenter = new THREE.Vector3();
          scaledBox.getCenter(scaledCenter);
          rawGroup.position.x = -scaledCenter.x;
          rawGroup.position.y = -scaledBox.min.y;
          rawGroup.position.z = -scaledCenter.z;
          masterContainer.add(rawGroup);

          this.cachedModel = masterContainer;
          this.isPreloading = false;
          this.preloadCallbacks.forEach((cb) => cb(masterContainer.clone()));
          this.preloadCallbacks = [];
        },
        undefined,
        (err) => {
          console.warn('Failed to load 3D Robot model, using high-tech procedural combat droid:', err);
          this.isPreloading = false;
        }
      );
    } catch (e) {
      console.warn('Draco/GLTF loader initialization error, using procedural fallback:', e);
      this.isPreloading = false;
    }
  }

  // Create procedural tactical combat droid
  private createProceduralDroid(): THREE.Group {
    const group = new THREE.Group();
    const darkChassisMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.3,
      metalness: 0.85,
    });
    const armorPlateMat = new THREE.MeshStandardMaterial({
      color: 0x374151,
      roughness: 0.35,
      metalness: 0.7,
    });

    // Torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.4, 0.8), armorPlateMat);
    torso.position.y = 1.6;
    torso.castShadow = true;
    group.add(torso);

    // Head
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.6, 0.6), darkChassisMat);
    head.position.y = 2.5;
    head.castShadow = true;
    group.add(head);

    // Arm Cannon
    const cannon = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 1.6, 8), darkChassisMat);
    cannon.rotation.x = Math.PI / 2;
    cannon.position.set(0.75, 1.5, 0.7);
    cannon.castShadow = true;
    group.add(cannon);

    // Legs
    [-0.4, 0.4].forEach((xLeg) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.2, 0.4), darkChassisMat);
      leg.position.set(xLeg, 0.6, 0);
      leg.castShadow = true;
      group.add(leg);
    });

    return group;
  }

  // Instantiate an Enforcer or Shield Robot
  public createEnforcer(initialPos: THREE.Vector3, type: 'ATTACK' | 'SHIELD' = 'ATTACK'): EnforcerRobotEntity {
    const container = new THREE.Group();
    container.position.copy(initialPos);

    let displayMesh: THREE.Group;
    if (this.cachedModel) {
      displayMesh = this.cachedModel.clone();
      container.add(displayMesh);
    } else {
      const fallback = this.createProceduralDroid();
      container.add(fallback);
      displayMesh = fallback;

      this.preloadCallbacks.push((loadedModel) => {
        container.remove(fallback);
        container.add(loadedModel);
        displayMesh = loadedModel;
      });
    }

    // Glowing Optical Visor (Red for Rogue, Green for Hacked)
    const visorGeo = new THREE.BoxGeometry(0.42, 0.12, 0.15);
    const visorMat = new THREE.MeshBasicMaterial({ color: 0xff0033 });
    const visorMesh = new THREE.Mesh(visorGeo, visorMat);
    visorMesh.position.set(0, 2.5, 0.52);
    container.add(visorMesh);

    const eyeLight = new THREE.PointLight(0xff0044, 3.5, 12);
    eyeLight.position.set(0, 2.5, 0.7);
    container.add(eyeLight);

    // Frontal Energy Shield for SHIELD Droids
    let shieldMesh: THREE.Mesh | undefined;
    const hasShield = type === 'SHIELD';
    if (hasShield) {
      const sGeo = new THREE.CylinderGeometry(1.6, 1.6, 2.4, 6, 1, true, -Math.PI / 3, (Math.PI * 2) / 3);
      const sMat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0.45,
        wireframe: true,
        side: THREE.DoubleSide,
      });
      shieldMesh = new THREE.Mesh(sGeo, sMat);
      shieldMesh.position.set(0, 1.4, 0.8);
      container.add(shieldMesh);
    }

    // Ally Holographic Ring Indicator (visible only when hacked)
    const ringGeo = new THREE.RingGeometry(1.4, 1.6, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    });
    const allyRing = new THREE.Mesh(ringGeo, ringMat);
    allyRing.rotation.x = -Math.PI / 2;
    allyRing.position.y = 0.05;
    allyRing.visible = false;
    container.add(allyRing);

    const muzzlePos = new THREE.Vector3();

    const entity: EnforcerRobotEntity = {
      group: container,
      type,
      hp: type === 'SHIELD' ? 180 : 120,
      maxHp: type === 'SHIELD' ? 180 : 120,
      speed: type === 'SHIELD' ? 3.0 : 4.5,
      shootCooldown: 40 + Math.random() * 50,
      isAlive: true,
      isHacked: false,
      hackTimer: 0,
      hasShield,
      shieldMesh,
      allyRing,
      eyeLight,
      visorMesh,
      muzzlePos,
      patrolAngle: Math.random() * Math.PI * 2,
      patrolCenter: initialPos.clone(),

      convertToAlly: () => {
        entity.isHacked = true;
        entity.hackTimer = 8.0; // 8 seconds ally lifetime

        // Turn RED -> GREEN
        visorMat.color.setHex(0x10b981);
        eyeLight.color.setHex(0x10b981);
        allyRing.visible = true;

        if (shieldMesh) {
          (shieldMesh.material as THREE.MeshBasicMaterial).color.setHex(0x10b981);
        }

        // Tint body meshes slightly green
        displayMesh.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const m = child as THREE.Mesh;
            if (m.material && 'emissive' in m.material) {
              (m.material as any).emissive = new THREE.Color(0x064e3b);
              (m.material as any).emissiveIntensity = 0.5;
            }
          }
        });
      },

      flashHit: () => {
        displayMesh.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            if (mesh.material && 'color' in mesh.material) {
              const originalColor = (mesh.material as THREE.MeshStandardMaterial).color.getHex();
              (mesh.material as THREE.MeshStandardMaterial).color.setHex(0xffffff);
              window.setTimeout(() => {
                if (mesh.material && 'color' in mesh.material) {
                  (mesh.material as THREE.MeshStandardMaterial).color.setHex(originalColor);
                }
              }, 80);
            }
          }
        });
      },

      animateWalk: (time: number, isMoving: boolean) => {
        if (!entity.isAlive) return;

        if (isMoving) {
          container.position.y = Math.abs(Math.sin(time * 8)) * 0.14;
          container.rotation.z = Math.sin(time * 8) * 0.05;
        } else {
          container.position.y = Math.sin(time * 2.5) * 0.02;
          container.rotation.z = 0;
        }

        if (shieldMesh) {
          shieldMesh.rotation.y = Math.sin(time * 3) * 0.08;
        }

        if (entity.isHacked && allyRing) {
          allyRing.rotation.z = time * 2;
        }
      },
    };

    return entity;
  }
}

export const enforcerRobotFactory = new EnforcerRobotFactory();
