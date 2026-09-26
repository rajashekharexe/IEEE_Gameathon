// High-Fidelity 3D Industrial Foundry Arena for Circuit Breaker: Overlink
// Features Catwalk, Yellow Safety Railings, Overhead Gantry Cranes, Volumetric Steam & Hazard Crates
import * as THREE from 'three';

export interface ArenaComponents {
  floor: THREE.Mesh;
  catwalk: THREE.Group;
  pillars: THREE.Mesh[];
  crates: THREE.Group[];
  sirens: { light: THREE.PointLight; mesh: THREE.Mesh; baseAngle: number }[];
  steamClouds: THREE.Mesh[];
  updateSirens: (time: number) => void;
}

export class FactoryArenaBuilder {
  // Generate procedural reflective metallic floor texture with vibrant glowing cyan circuit traces
  private createCircuitFloorTexture(): THREE.CanvasTexture {
    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Clean High-Tech Porcelain Titanium Ceramic Base (Crisp, Aesthetic Light Theme)
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(0, 0, size, size);

    // Industrial grid tiles with crisp slate seams
    const tileSize = 128;
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.35)';
    ctx.lineWidth = 2;
    for (let x = 0; x < size; x += tileSize) {
      for (let y = 0; y < size; y += tileSize) {
        ctx.strokeRect(x, y, tileSize, tileSize);
        // Corner tech accents
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(x + 4, y + 4, 3, 3);
        ctx.fillRect(x + tileSize - 7, y + 4, 3, 3);
        ctx.fillRect(x + 4, y + tileSize - 7, 3, 3);
        ctx.fillRect(x + tileSize - 7, y + tileSize - 7, 3, 3);
      }
    }

    // Glowing vibrant electric cyan/blue circuit tracks
    ctx.strokeStyle = '#0284c7';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 14;
    ctx.lineWidth = 4;

    const drawCircuitPath = (points: [number, number][]) => {
      ctx.beginPath();
      ctx.moveTo(points[0][0], points[0][1]);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i][0], points[i][1]);
      }
      ctx.stroke();

      const last = points[points.length - 1];
      ctx.fillStyle = '#00f0ff';
      ctx.beginPath();
      ctx.arc(last[0], last[1], 7, 0, Math.PI * 2);
      ctx.fill();
    };

    // Interconnected cyber circuit grid across factory floor
    drawCircuitPath([[64, 128], [256, 128], [384, 256], [384, 512]]);
    drawCircuitPath([[512, 64], [512, 384], [640, 512], [896, 512]]);
    drawCircuitPath([[128, 640], [384, 640], [512, 768], [800, 768]]);
    drawCircuitPath([[768, 256], [896, 256], [960, 320], [960, 640]]);
    drawCircuitPath([[256, 512], [256, 768], [384, 896]]);
    drawCircuitPath([[640, 256], [768, 128], [896, 128]]);

    // Hazard caution borders around edges
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(0, 0, size, 12);
    ctx.fillRect(0, size - 12, size, 12);
    ctx.fillRect(0, 0, 12, size);
    ctx.fillRect(size - 12, 0, 12, size);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(8, 8);
    return texture;
  }

  // High-Detail Procedural Sci-Fi Military Cargo Crate Texture
  private createSciFiCrateTexture(isAmmo: boolean): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // 1. Dark Brushed Metal Armor Base
    ctx.fillStyle = isAmmo ? '#18202c' : '#1e293b';
    ctx.fillRect(0, 0, 512, 512);

    // 2. Corrugated / Ribbed Steel Inset Panel
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(32, 48, 448, 416);

    // Subtle brushed metal grooves
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3;
    for (let y = 64; y < 450; y += 24) {
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(472, y);
      ctx.stroke();
    }

    // 3. Diagonal Hazard Caution Borders (Top & Bottom Bands)
    const drawHazardBand = (yPos: number) => {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, yPos, 512, 28);
      ctx.fillStyle = '#f59e0b';
      for (let x = -28; x < 540; x += 36) {
        ctx.beginPath();
        ctx.moveTo(x, yPos + 28);
        ctx.lineTo(x + 18, yPos + 28);
        ctx.lineTo(x + 36, yPos);
        ctx.lineTo(x + 18, yPos);
        ctx.closePath();
        ctx.fill();
      }
    };
    drawHazardBand(10);
    drawHazardBand(474);

    // 4. Military Stencil Graphics & Cargo Decals
    ctx.fillStyle = '#38bdf8';
    ctx.font = '900 24px monospace';
    ctx.fillText(isAmmo ? 'MK-IV ORDNANCE // SEC-9' : 'OVERLINK HEAVY LOGISTICS', 48, 120);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '700 16px monospace';
    ctx.fillText(isAmmo ? 'AP 12.7mm ARMOR PIERCING' : 'CLASSIFIED HYDRAULIC CELLS', 48, 150);
    ctx.fillText('HAZARD CLASS 4 // AUTONOMOUS', 48, 175);

    // Center Warning Stencil Icon
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 4;
    ctx.strokeRect(360, 95, 90, 90);
    ctx.fillStyle = '#f59e0b';
    ctx.font = '900 42px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('!', 405, 158);
    ctx.textAlign = 'left';

    // 5. Digital Barcode & Data Matrix Tag
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(48, 380, 180, 50);
    ctx.fillStyle = '#0f172a';
    for (let bx = 56; bx < 220; bx += 8) {
      const barW = bx % 16 === 0 ? 5 : 2;
      ctx.fillRect(bx, 386, barW, 38);
    }

    // 6. Corner Heavy Rivets
    ctx.fillStyle = '#64748b';
    [
      [20, 20],
      [492, 20],
      [20, 492],
      [492, 492],
      [20, 256],
      [492, 256],
    ].forEach(([rx, ry]) => {
      ctx.beginPath();
      ctx.arc(rx, ry, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#090d16';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  // Build the complete factory arena
  public build(scene: THREE.Scene): ArenaComponents {
    // 1. Reflective Metallic Floor (160m x 160m Expansive Industrial Warzone)
    const floorGeo = new THREE.PlaneGeometry(160, 160);
    const floorTexture = this.createCircuitFloorTexture();
    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTexture,
      roughness: 0.22,
      metalness: 0.58,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // 2. Industrial Yellow Safety Catwalk (Flush diamond plate base)
    const catwalk = new THREE.Group();
    const steelMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.35,
      metalness: 0.75,
    });
    const yellowRailMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // Industrial OSHA yellow
      roughness: 0.4,
      metalness: 0.5,
    });

    // Catwalk Platform Base (Flush Diamond-Plate floor zone where Unit-7 begins)
    const platGeo = new THREE.BoxGeometry(16, 0.05, 10);
    const platform = new THREE.Mesh(platGeo, steelMat);
    platform.position.set(-6, 0.02, 5);
    platform.receiveShadow = true;
    catwalk.add(platform);
    scene.add(catwalk);

    // 3. Heavy Industrial Cover Crates (High-detail sci-fi military freight modules)
    const crates: THREE.Group[] = [];
    const ammoTexture = this.createSciFiCrateTexture(true);
    const cargoTexture = this.createSciFiCrateTexture(false);

    const ammoMat = new THREE.MeshStandardMaterial({
      map: ammoTexture,
      metalness: 0.85,
      roughness: 0.28,
    });
    const cargoMat = new THREE.MeshStandardMaterial({
      map: cargoTexture,
      metalness: 0.85,
      roughness: 0.28,
    });
    const darkFrameMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.9,
      roughness: 0.2,
    });
    const chromeHandleMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.95,
      roughness: 0.15,
    });
    const cyanLedMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const emeraldLedMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });

    const createIndustrialCrate = (w: number, h: number, d: number, index: number) => {
      const cGroup = new THREE.Group();
      const isAmmo = index % 2 === 0;

      // 1. Main Textured Armor Box
      const box = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), isAmmo ? ammoMat : cargoMat);
      box.castShadow = true;
      box.receiveShadow = true;
      cGroup.add(box);

      // 2. Heavy Perimeter Edge Armor Framing (Dark Titanium)
      const topFrame = new THREE.Mesh(new THREE.BoxGeometry(w + 0.08, 0.14, d + 0.08), darkFrameMat);
      topFrame.position.y = h / 2;
      topFrame.castShadow = true;
      cGroup.add(topFrame);

      const bottomFrame = new THREE.Mesh(new THREE.BoxGeometry(w + 0.08, 0.14, d + 0.08), darkFrameMat);
      bottomFrame.position.y = -h / 2;
      bottomFrame.castShadow = true;
      cGroup.add(bottomFrame);

      // 3. Stacking Alignment Cleats on Top Four Corners
      const cleatGeo = new THREE.BoxGeometry(0.35, 0.15, 0.35);
      [
        [w / 2 - 0.2, d / 2 - 0.2],
        [-w / 2 + 0.2, d / 2 - 0.2],
        [w / 2 - 0.2, -d / 2 + 0.2],
        [-w / 2 + 0.2, -d / 2 + 0.2],
      ].forEach(([cx, cz]) => {
        const cleat = new THREE.Mesh(cleatGeo, darkFrameMat);
        cleat.position.set(cx, h / 2 + 0.08, cz);
        cleat.castShadow = true;
        cGroup.add(cleat);
      });

      // 4. Yellow OSHA Hazard Corner Armor Brackets
      const bracketGeo = new THREE.BoxGeometry(0.25, h, 0.25);
      [
        [w / 2, d / 2],
        [-w / 2, d / 2],
        [w / 2, -d / 2],
        [-w / 2, -d / 2],
      ].forEach(([bx, bz]) => {
        const bracket = new THREE.Mesh(bracketGeo, yellowRailMat);
        bracket.position.set(bx, 0, bz);
        bracket.castShadow = true;
        cGroup.add(bracket);
      });

      // 5. Recessed Heavy Lifting Handles on Left and Right Sides
      [-w / 2 - 0.02, w / 2 + 0.02].forEach((sideX) => {
        const handleWell = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.45, 0.8), darkFrameMat);
        handleWell.position.set(sideX, 0, 0);
        cGroup.add(handleWell);

        const handleBar = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.65, 8), chromeHandleMat);
        handleBar.position.set(sideX * 1.01, 0, 0);
        cGroup.add(handleBar);
      });

      // 6. Electronic Lock Keypad & Status LED on Front & Back
      [-d / 2 - 0.03, d / 2 + 0.03].forEach((faceZ) => {
        const lockChassis = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.45, 0.06), darkFrameMat);
        lockChassis.position.set(0, 0, faceZ);
        cGroup.add(lockChassis);

        const ledSlit = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.06, 0.08), isAmmo ? cyanLedMat : emeraldLedMat);
        ledSlit.position.set(0, 0.08, faceZ);
        cGroup.add(ledSlit);
      });

      return cGroup;
    };

    const crateLocations: [number, number, number, number, number, number][] = [
      // Central foundry covers
      [11, 1.4, 9, 3.2, 2.8, 3.2],
      [14.5, 1.2, 9, 3.0, 2.4, 3.0],
      [11, 3.8, 9, 2.8, 2.0, 2.8],
      [-11, 1.4, -5, 3.2, 2.8, 3.2],
      [-14.5, 1.2, -5, 3.0, 2.4, 3.0],
      [4, 1.8, -14, 4.0, 3.6, 3.5],
      // East Sector: Power Distribution Stacks
      [32, 1.6, 12, 3.5, 3.2, 3.5],
      [36, 1.4, 15, 3.2, 2.8, 3.2],
      [32, 4.2, 12, 2.8, 2.0, 2.8],
      [28, 1.4, -20, 4.0, 2.8, 3.5],
      // West Sector: Heavy Logistics Cargo
      [-32, 1.6, 14, 3.8, 3.2, 3.8],
      [-36, 1.4, 18, 3.2, 2.8, 3.2],
      [-30, 1.5, -25, 4.5, 3.0, 4.0],
      [-38, 1.4, -22, 3.5, 2.8, 3.5],
      // South Runway: Evacuation Ramp Containers
      [-16, 1.6, 36, 4.0, 3.2, 4.0],
      [16, 1.6, 36, 4.0, 3.2, 4.0],
    ];

    crateLocations.forEach(([x, y, z, w, h, d], index) => {
      const c = createIndustrialCrate(w, h, d, index);
      c.position.set(x, y, z);
      scene.add(c);
      crates.push(c);
    });

    // 4. Overhead Gantry Crane & Steel Girders
    const girderMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.4,
      metalness: 0.75,
    });

    // Cross-ceiling I-Beams with luminous cyber light bars across 160m
    const beamGeo = new THREE.BoxGeometry(160, 1.4, 1.4);
    const neonMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const warmNeonMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
    const lightBarGeo = new THREE.BoxGeometry(140, 0.15, 0.25);

    [-36, -18, 0, 18, 36].forEach((z, i) => {
      const beam = new THREE.Mesh(beamGeo, girderMat);
      beam.position.set(0, 15, z);
      beam.castShadow = true;
      scene.add(beam);

      const lightBar = new THREE.Mesh(lightBarGeo, i % 2 === 0 ? neonMat : warmNeonMat);
      lightBar.position.set(0, 14.25, z);
      scene.add(lightBar);
    });

    // Overhead Hanging Crane Hook (like concept art)
    const cableGeo = new THREE.CylinderGeometry(0.04, 0.04, 7, 8);
    const cable = new THREE.Mesh(cableGeo, steelMat);
    cable.position.set(0, 11, -2);
    scene.add(cable);

    const hookGeo = new THREE.TorusGeometry(0.6, 0.14, 8, 16, Math.PI * 1.5);
    const hook = new THREE.Mesh(hookGeo, yellowRailMat);
    hook.position.set(0, 7.5, -2);
    hook.rotation.z = Math.PI / 2;
    scene.add(hook);

    // 5. Heavy Structural Pillars across 160m Facility
    const pillars: THREE.Mesh[] = [];
    const pillarGeo = new THREE.BoxGeometry(3.2, 16, 3.2);
    const pillarPositions: [number, number][] = [
      [-48, -48],
      [48, -48],
      [-48, 48],
      [48, 48],
      [-48, 0],
      [48, 0],
      [0, -48],
      [0, 48],
    ];

    pillarPositions.forEach(([x, z]) => {
      const pillar = new THREE.Mesh(pillarGeo, girderMat);
      pillar.position.set(x, 8, z);
      pillar.castShadow = true;
      pillar.receiveShadow = true;
      scene.add(pillar);
      pillars.push(pillar);
    });

    // 6. Volumetric Steam & Smoke Clouds (around the Titan Mech)
    const steamClouds: THREE.Mesh[] = [];
    const smokeGeo = new THREE.SphereGeometry(1.6, 12, 12);
    const smokeMat = new THREE.MeshBasicMaterial({
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const steamOffsets = [
      new THREE.Vector3(2, 0.8, -8),
      new THREE.Vector3(6, 1.2, -10),
      new THREE.Vector3(3, 1.5, -12),
      new THREE.Vector3(-1, 1.0, -9),
    ];

    steamOffsets.forEach((pos) => {
      const cloud = new THREE.Mesh(smokeGeo, smokeMat);
      cloud.position.copy(pos);
      scene.add(cloud);
      steamClouds.push(cloud);
    });

    // 7. Revolving Emergency Red Sirens (with intense red casting lights)
    const sirens: { light: THREE.PointLight; mesh: THREE.Mesh; baseAngle: number }[] = [];
    const sirenPositions: [number, number, number][] = [
      [-18, 4.0, 4],   // Mounted on left perimeter wall
      [11, 4.9, 9],    // Mounted atop stacked crate
      [-14, 2.8, -5],  // Mounted atop left crate
      [4, 3.8, -14],   // Mounted on background machinery
    ];

    const sirenBaseGeo = new THREE.CylinderGeometry(0.3, 0.35, 0.3, 12);
    const sirenDomeGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.45, 12);
    const sirenDomeMat = new THREE.MeshBasicMaterial({ color: 0xff0022 });

    sirenPositions.forEach(([x, y, z], idx) => {
      const sGroup = new THREE.Group();
      sGroup.position.set(x, y, z);

      const sBase = new THREE.Mesh(sirenBaseGeo, steelMat);
      sGroup.add(sBase);

      const sDome = new THREE.Mesh(sirenDomeGeo, sirenDomeMat);
      sDome.position.y = 0.3;
      sGroup.add(sDome);

      const light = new THREE.PointLight(0xff0022, 4.5, 18);
      light.position.y = 0.4;
      sGroup.add(light);

      scene.add(sGroup);
      sirens.push({ light, mesh: sDome, baseAngle: idx * (Math.PI / 2) });
    });

    const updateSirens = (time: number) => {
      sirens.forEach((siren) => {
        const pulse = (Math.sin(time * 6 + siren.baseAngle) + 1) * 0.5;
        siren.light.intensity = 1.5 + pulse * 4.5;
      });

      // Drifting steam animation
      steamClouds.forEach((cloud, idx) => {
        cloud.position.y = 1.0 + Math.sin(time * 0.8 + idx) * 0.4;
        cloud.scale.setScalar(1.0 + Math.sin(time * 0.5 + idx) * 0.25);
      });
    };

    return {
      floor,
      catwalk,
      pillars,
      crates,
      sirens,
      steamClouds,
      updateSirens,
    };
  }
}

export const factoryArena = new FactoryArenaBuilder();
