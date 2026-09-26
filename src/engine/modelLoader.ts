// High-performance 3D GLTF/GLB Model Loader with automatic caching
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

class ModelLoaderService {
  private loader = new GLTFLoader();
  private cache = new Map<string, THREE.Group>();

  // Load a model from public/assets/models/ (e.g. 'character.glb', 'car.glb', 'trees.glb')
  public load(path: string): Promise<THREE.Group> {
    return new Promise((resolve, reject) => {
      if (this.cache.has(path)) {
        // Return a clone so multiple instances can exist in the scene
        resolve(this.cache.get(path)!.clone());
        return;
      }

      this.loader.load(
        path,
        (gltf) => {
          const root = gltf.scene;

          // Enable shadow casting and receiving on all meshes inside
          root.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });

          this.cache.set(path, root);
          resolve(root.clone());
        },
        undefined,
        (error) => {
          console.error(`Failed to load model at ${path}:`, error);
          reject(error);
        }
      );
    });
  }
}

export const modelLoader = new ModelLoaderService();
