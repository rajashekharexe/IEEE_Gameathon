// High-Fidelity 3D Industrial Foundry Arena for Circuit Breaker: Overlink
import * as THREE from 'three';

export interface ArenaComponents {
  floor: THREE.Mesh;
  pillars: THREE.Mesh[];
  crates: THREE.Mesh[];
  sirens: { light: THREE.PointLight; mesh: THREE.Mesh; baseAngle: number }[];
  updateSirens: (time: number) => void;
}

export class FactoryArenaBuilder {
  // Generate procedural reflective metallic floor texture with glowing cyan circuits
  private createCircuitFloorTexture(): THREE.CanvasTexture {
    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Dark metallic steel base with panel seams
    ctx.fillStyle = '#0a0d16';
    ctx.fillRect(0, 0, size, size);

    // Industrial grid tiles
    const tileSize = 128;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 2;
    for (let x = 0; x < size; x += tileSize) {
      for (let y = 0; y < size; y += tileSize) {
        ctx.strokeRect(x, y, tileSize, tileSize);
        // Corner bolts
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x + 4, y + 4, 3, 3);
        ctx.fillRect(x + tileSize - 7, y + 4, 3, 3);
        ctx.fillRect(x + 4, y + tileSize - 7, 3, 3);
        ctx.fillRect(x + tileSize - 7, y + tileSize - 7, 3, 3);
      }
    }

    // Glowing cyan circuit tracks (like the concept art)
    ctx.strokeStyle = '#00e5ff';
    ctx.shadowColor = '#00e5ff';
    ctx.shadowBlur = 12;
    ctx.lineWidth = 4;

    const drawCircuitPath = (points: [number, number][]) => {
      ctx.beginPath();
      ctx.moveTo(points[0][0], points[0][1]);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i][0], points[i][1]);
      }
      ctx.stroke();

      // Terminal nodes
      const last = points[points.length - 1];
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(last[0], last[1], 5, 0, Math.PI * 2);
      ctx.fill();
    };

    // Main bus lines running across factory floor
    drawCircuitPath([[64, 128], [256, 128], [384, 256], [384, 512]]);
    drawCircuitPath([[512, 64], [512, 384], [640, 512], [896, 512]]);
    drawCircuitPath([[128, 640], [384, 640], [512, 768], [800, 768]]);
    drawCircuitPath([[768, 256], [896, 256], [960, 320], [960, 640]]);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    return texture;
  }

  // Build the complete factory arena
  public build(scene: THREE.Scene): ArenaComponents {
    // 1. Reflective Metallic Floor
    const floorGeo = new THREE.PlaneGeometry(80, 80);
    const floorTexture = this.createCircuitFloorTexture();
    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTexture,
      roughness: 0.25,
      metalness: 0.85,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // 2. Heavy Industrial Pillars (with hazard yellow/black stripes)
    const pillars: THREE.Mesh[] = [];
    const pillarGeo = new THREE.BoxGeometry(2.5, 12, 2.5);
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.4,
      metalness: 0.7,
    });

    const pillarPositions: [number, number][] = [
      [-16, -16],
      [16, -16],
      [-16, 16],
      [16, 16],
    ];

    pillarPositions.forEach(([x, z]) => {
      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      pillar.position.set(x, 6, z);
      pillar.castShadow = true;
      pillar.receiveShadow = true;
      scene.add(pillar);
      pillars.push(pillar);
    });

    // 3. Reinforced Cover Crates (where scientists take cover)
    const crates: THREE.Mesh[] = [];
    const crateGeo = new THREE.BoxGeometry(3.2, 2.2, 3.2);
    const crateMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.5,
      metalness: 0.6,
    });

    const cratePositions: [number, number, number][] = [
      [10, 1.1, 8],
      [13.5, 1.1, 8],
      [10, 3.3, 8], // Stacked crate!
      [-10, 1.1, -6],
      [-13.5, 1.1, -6],
      [4, 1.1, -12],
    ];

    cratePositions.forEach(([x, y, z]) => {
      const crate = new THREE.Mesh(crateGeo, crateMat);
      crate.position.set(x, y, z);
      crate.castShadow = true;
      crate.receiveShadow = true;
      scene.add(crate);
      crates.push(crate);
    });

    // 4. Perimeter Industrial Railings & Walls
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      roughness: 0.7,
      metalness: 0.5,
    });
    const wallGeoH = new THREE.BoxGeometry(80, 8, 1);
    const wallGeoV = new THREE.BoxGeometry(1, 8, 80);

    const backWall = new THREE.Mesh(wallGeoH, wallMat);
    backWall.position.set(0, 4, -40);
    backWall.receiveShadow = true;
    scene.add(backWall);

    const leftWall = new THREE.Mesh(wallGeoV, wallMat);
    leftWall.position.set(-40, 4, 0);
    leftWall.receiveShadow = true;
    scene.add(leftWall);

    const rightWall = new THREE.Mesh(wallGeoV, wallMat);
    rightWall.position.set(40, 4, 0);
    rightWall.receiveShadow = true;
    scene.add(rightWall);

    // 5. Revolving Emergency Sirens (Crimson Red Beacons as in concept art)
    const sirens: { light: THREE.PointLight; mesh: THREE.Mesh; baseAngle: number }[] = [];
    const sirenPositions: [number, number][] = [
      [-18, -14],
      [18, -14],
      [-8, 6],
      [18, 10],
    ];

    const sirenMat = new THREE.MeshBasicMaterial({ color: 0xff1133 });
    const sirenGeo = new THREE.CylinderGeometry(0.35, 0.45, 0.6, 12);

    sirenPositions.forEach(([x, z], idx) => {
      const sirenMesh = new THREE.Mesh(sirenGeo, sirenMat);
      sirenMesh.position.set(x, 2.2, z);
      scene.add(sirenMesh);

      const light = new THREE.PointLight(0xff1133, 2.8, 22);
      light.position.set(x, 2.8, z);
      scene.add(light);

      sirens.push({ light, mesh: sirenMesh, baseAngle: idx * (Math.PI / 2) });
    });

    const updateSirens = (time: number) => {
      sirens.forEach((s) => {
        // Revolving pulse effect
        const intensity = 2.2 + Math.sin(time * 6 + s.baseAngle) * 1.4;
        s.light.intensity = intensity;
        (s.mesh.material as THREE.MeshBasicMaterial).color.setRGB(
          1.0,
          0.05 * (intensity / 3),
          0.1 * (intensity / 3)
        );
      });
    };

    return { floor, pillars, crates, sirens, updateSirens };
  }
}

export const factoryArena = new FactoryArenaBuilder();
