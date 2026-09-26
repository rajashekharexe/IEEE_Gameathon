// 3D Combat Enforcer Robot Entity Loader & Controller
// Loads and renders the high-detail 3D Robot model (Robot.glb + Robot.png) with Draco decompression
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

export interface EnforcerRobotEntity {
  group: THREE.Group;
  hp: number;
  maxHp: number;
  speed: number;
  shootCooldown: number;
  isAlive: boolean;
  eyeLight?: THREE.PointLight;
  muzzlePos: THREE.Vector3;
  animateWalk: (time: number, isMoving: boolean) => void;
  flashHit: () => void;
}

class EnforcerRobotFactory {
  private cachedModel: THREE.Group | null = null;
  private isPreloading = false;
  private preloadCallbacks: ((model: THREE.Group) => void)[] = [];
  private robotTexture: THREE.Texture | null = null;

  constructor() {
    this.preload();
  }

  // Preload and cache the 3D Robot model so clones are instant
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
          
          // Apply diffuse map & industrial PBR material to all mesh parts
          rawGroup.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              mesh.castShadow = true;
              mesh.receiveShadow = true;
              if (this.robotTexture) {
                mesh.material = new THREE.MeshStandardMaterial({
                  map: this.robotTexture,
                  roughness: 0.35,
                  metalness: 0.65,
                });
              }
            }
          });

          // Scale and position model so height is ~2.6m tall and pivot is at the ground
          const masterContainer = new THREE.Group();
          rawGroup.scale.setScalar(0.015);
          // Center model on Y = 0
          rawGroup.position.set(0, 0, 0);
          masterContainer.add(rawGroup);

          // Add glowing crimson visor sensor
          const eyeGeo = new THREE.BoxGeometry(0.3, 0.08, 0.12);
          const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff0033 });
          const eye = new THREE.Mesh(eyeGeo, eyeMat);
          eye.position.set(0, 2.2, 0.45);
          masterContainer.add(eye);

          const eyeLight = new THREE.PointLight(0xff0044, 3.0, 10);
          eyeLight.position.set(0, 2.2, 0.6);
          masterContainer.add(eyeLight);

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

  // Create procedural tactical combat droid (fallback if GLTF network is slow)
  private createProceduralDroid(): THREE.Group {
    const group = new THREE.Group();
    const darkChassisMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.3,
      metalness: 0.8,
    });
    const armorPlateMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.4,
      metalness: 0.6,
    });
    const redGlowMat = new THREE.MeshBasicMaterial({ color: 0xff1133 });

    // Torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.2, 0.7), armorPlateMat);
    torso.position.y = 1.6;
    torso.castShadow = true;
    group.add(torso);

    // Head
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.5, 0.5), darkChassisMat);
    head.position.y = 2.4;
    head.castShadow = true;
    group.add(head);

    // Glowing Crimson Visor
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.12, 0.1), redGlowMat);
    visor.position.set(0, 2.4, 0.28);
    group.add(visor);

    // Heavy Pulse Blaster Arm
    const cannon = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 1.4, 8), darkChassisMat);
    cannon.rotation.x = Math.PI / 2;
    cannon.position.set(0.65, 1.5, 0.6);
    cannon.castShadow = true;
    group.add(cannon);

    // Legs
    const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.1, 0.35), darkChassisMat);
    leftLeg.position.set(-0.35, 0.55, 0);
    leftLeg.castShadow = true;
    group.add(leftLeg);

    const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.1, 0.35), darkChassisMat);
    rightLeg.position.set(0.35, 0.55, 0);
    rightLeg.castShadow = true;
    group.add(rightLeg);

    return group;
  }

  // Instantiate an Enforcer Robot
  public createEnforcer(initialPos: THREE.Vector3): EnforcerRobotEntity {
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

      // When cached model loads, swap seamlessly!
      this.preloadCallbacks.push((loadedModel) => {
        container.remove(fallback);
        container.add(loadedModel);
        displayMesh = loadedModel;
      });
    }

    const muzzlePos = new THREE.Vector3();

    const flashHit = () => {
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
    };

    const animateWalk = (time: number, isMoving: boolean) => {
      if (isMoving) {
        container.position.y = Math.abs(Math.sin(time * 8)) * 0.12;
        container.rotation.z = Math.sin(time * 8) * 0.04;
      } else {
        container.position.y = 0;
        container.rotation.z = 0;
      }
    };

    return {
      group: container,
      hp: 120,
      maxHp: 120,
      speed: 4.5,
      shootCooldown: 60 + Math.random() * 60,
      isAlive: true,
      muzzlePos,
      animateWalk,
      flashHit,
    };
  }
}

export const enforcerRobotFactory = new EnforcerRobotFactory();
