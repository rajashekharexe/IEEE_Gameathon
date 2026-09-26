// Dark Futuristic Robot-Revolt City Environment for Circuit Breaker: Overlink
// Features: Destroyed buildings, asphalt roads, broken vehicles, metal barriers,
// containers, robot wreckage, power generators, neon signs, smoke, fire, and sparks.
import * as THREE from 'three';

export interface PowerGeneratorEntity {
  group: THREE.Group;
  hp: number;
  maxHp: number;
  isDestroyed: boolean;
  coreMesh: THREE.Mesh;
  coreLight: THREE.PointLight;
  position: THREE.Vector3;
}

export interface ArenaComponents {
  floor: THREE.Mesh;
  catwalk: THREE.Group;
  pillars: THREE.Mesh[];
  crates: THREE.Group[];
  generators: PowerGeneratorEntity[];
  sirens: { light: THREE.PointLight; mesh: THREE.Mesh; baseAngle: number }[];
  steamClouds: THREE.Mesh[];
  fireLights: THREE.PointLight[];
  updateSirens: (time: number) => void;
}

export class FactoryArenaBuilder {
  // Generate procedural dark futuristic asphalt road texture with wet cyber sheen & neon markings
  private createDarkCityFloorTexture(): THREE.CanvasTexture {
    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // 1. Dark asphalt base (Deep midnight slate)
    ctx.fillStyle = '#080d1a';
    ctx.fillRect(0, 0, size, size);

    // Subtle asphalt noise / road grit
    ctx.fillStyle = '#0f172a';
    for (let i = 0; i < 400; i++) {
      const rx = Math.random() * size;
      const ry = Math.random() * size;
      ctx.fillRect(rx, ry, Math.random() * 4 + 1, Math.random() * 4 + 1);
    }

    // 2. City Road Grid & Lane Dividers
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.8)';
    ctx.lineWidth = 4;
    const blockSize = 256;
    for (let x = 0; x < size; x += blockSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, size);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, x);
      ctx.lineTo(size, x);
      ctx.stroke();
    }

    // Yellow Dashed Highway / Road Median Lines
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 3;
    ctx.setLineDash([24, 16]);
    // Main avenue horizontal and vertical center
    ctx.beginPath();
    ctx.moveTo(0, size / 2);
    ctx.lineTo(size, size / 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(size / 2, 0);
    ctx.lineTo(size / 2, size);
    ctx.stroke();
    ctx.setLineDash([]); // reset

    // 3. Glowing Cyan Circuit Veins & Data Conduits (Embedded in road trenches)
    ctx.strokeStyle = '#0284c7';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 12;
    ctx.lineWidth = 3;

    const drawCircuit = (pts: [number, number][]) => {
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.stroke();

      const last = pts[pts.length - 1];
      ctx.fillStyle = '#00f0ff';
      ctx.beginPath();
      ctx.arc(last[0], last[1], 5, 0, Math.PI * 2);
      ctx.fill();
    };

    drawCircuit([[64, 64], [192, 64], [192, 192], [320, 192]]);
    drawCircuit([[700, 100], [850, 100], [850, 300]]);
    drawCircuit([[100, 700], [250, 700], [350, 850]]);
    drawCircuit([[700, 700], [850, 700], [850, 900]]);

    // 4. Stenciled City Road Markings & Sector Numbers
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '900 22px monospace';
    ctx.fillText('SECTOR 07 // EVAC ROUTE →', 60, size / 2 - 20);
    ctx.fillText('OMNICORP FOUNDRY DEFENSE', size / 2 + 30, size / 2 - 20);
    ctx.fillText('RESTRICTED: MACHINE CONTROL', 60, size / 2 + 40);

    // Hazard Stripes on City Borders
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(0, 0, size, 14);
    ctx.fillRect(0, size - 14, size, 14);
    ctx.fillRect(0, 0, 14, size);
    ctx.fillRect(size - 14, 0, 14, size);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(6, 6);
    return texture;
  }

  // Create High-Tech Military Cargo Crate Texture
  private createSciFiCrateTexture(isAmmo: boolean): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = isAmmo ? '#0c1424' : '#141d2e';
    ctx.fillRect(0, 0, 512, 512);

    ctx.fillStyle = '#060a12';
    ctx.fillRect(28, 40, 456, 432);

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3;
    for (let y = 60; y < 460; y += 28) {
      ctx.beginPath();
      ctx.moveTo(36, y);
      ctx.lineTo(476, y);
      ctx.stroke();
    }

    // Hazard strip
    ctx.fillStyle = '#f59e0b';
    for (let x = -20; x < 540; x += 36) {
      ctx.beginPath();
      ctx.moveTo(x, 24);
      ctx.lineTo(x + 18, 24);
      ctx.lineTo(x, 0);
      ctx.lineTo(x - 18, 0);
      ctx.closePath();
      ctx.fill();
    }

    ctx.fillStyle = '#38bdf8';
    ctx.font = '900 24px monospace';
    ctx.fillText(isAmmo ? 'MK-IV ORDNANCE // SEC-7' : 'OMNICORP CARGO CONTAINER', 40, 110);
    ctx.fillStyle = '#64748b';
    ctx.font = '700 16px monospace';
    ctx.fillText('HAZARD CLASS 4 // AUTONOMOUS', 40, 145);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  // Build the complete futuristic robot-revolt city arena
  public build(scene: THREE.Scene): ArenaComponents {
    // 1. Dark Asphalt City Warzone Floor (180m x 180m)
    const floorGeo = new THREE.PlaneGeometry(180, 180);
    const floorTexture = this.createDarkCityFloorTexture();
    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTexture,
      roughness: 0.35,
      metalness: 0.65,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // 2. Catwalk Platform Zone where Player Deploys
    const catwalk = new THREE.Group();
    const steelMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.4,
      metalness: 0.8,
    });

    const platGeo = new THREE.BoxGeometry(16, 0.05, 10);
    const platform = new THREE.Mesh(platGeo, steelMat);
    platform.position.set(-6, 0.02, 5);
    platform.receiveShadow = true;
    catwalk.add(platform);
    scene.add(catwalk);

    // 3. Destroyed Futuristic Skyscrapers & Urban Ruins (Perimeter)
    const bldgMat = new THREE.MeshStandardMaterial({
      color: 0x090f1d,
      roughness: 0.6,
      metalness: 0.5,
    });
    const rebarMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.3,
      metalness: 0.85,
    });
    const windowMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
    const brokenWindowMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });

    const buildingConfigs: { x: number; z: number; w: number; h: number; d: number; destroyed?: boolean }[] = [
      // North skyline (Behind Boss arena)
      { x: -50, z: -70, w: 26, h: 48, d: 24, destroyed: true },
      { x: -15, z: -75, w: 32, h: 62, d: 26 },
      { x: 25, z: -72, w: 28, h: 54, d: 24, destroyed: true },
      { x: 60, z: -68, w: 24, h: 42, d: 22 },
      // South skyline (Behind player start)
      { x: -45, z: 70, w: 28, h: 44, d: 22 },
      { x: 0, z: 75, w: 34, h: 58, d: 26, destroyed: true },
      { x: 45, z: 70, w: 26, h: 46, d: 22 },
      // West skyline
      { x: -75, z: -35, w: 24, h: 50, d: 28, destroyed: true },
      { x: -72, z: 5, w: 22, h: 64, d: 32 },
      { x: -74, z: 40, w: 24, h: 42, d: 26, destroyed: true },
      // East skyline
      { x: 74, z: -35, w: 24, h: 52, d: 26 },
      { x: 72, z: 5, w: 24, h: 66, d: 30, destroyed: true },
      { x: 75, z: 40, w: 22, h: 45, d: 24 },
    ];

    buildingConfigs.forEach((cfg) => {
      const bldgGroup = new THREE.Group();
      bldgGroup.position.set(cfg.x, cfg.h / 2, cfg.z);

      const mainMesh = new THREE.Mesh(new THREE.BoxGeometry(cfg.w, cfg.h, cfg.d), bldgMat);
      mainMesh.castShadow = true;
      mainMesh.receiveShadow = true;
      bldgGroup.add(mainMesh);

      // Lit windows rows on facades
      const windowRows = Math.floor(cfg.h / 5);
      for (let r = 1; r < windowRows - 1; r++) {
        const winY = -cfg.h / 2 + r * 5;
        const isFlickerRed = cfg.destroyed && r % 3 === 0;
        const winStrip = new THREE.Mesh(
          new THREE.BoxGeometry(cfg.w * 0.75, 1.2, cfg.d + 0.1),
          isFlickerRed ? brokenWindowMat : windowMat
        );
        winStrip.position.y = winY;
        bldgGroup.add(winStrip);
      }

      // If destroyed: add jagged concrete fracture and exposed steel rebars
      if (cfg.destroyed) {
        const rubble = new THREE.Mesh(new THREE.BoxGeometry(cfg.w * 0.6, 6, cfg.d * 0.5), bldgMat);
        rubble.position.set(cfg.w * 0.2, cfg.h / 2 + 2, 0);
        rubble.rotation.set(0.15, 0.2, -0.3);
        bldgGroup.add(rubble);

        for (let reb = 0; reb < 5; reb++) {
          const rebar = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 5, 6), rebarMat);
          rebar.position.set((reb - 2) * 1.5, cfg.h / 2 + 2.5, 0);
          rebar.rotation.set((Math.random() - 0.5) * 0.5, 0, (Math.random() - 0.5) * 0.7);
          bldgGroup.add(rebar);
        }
      }

      scene.add(bldgGroup);
    });

    // 4. Glowing Holographic Neon Billboard Signs on Roofs
    const createNeonSign = (text: string, colorHex: number, x: number, y: number, z: number, rotY: number) => {
      const signCanvas = document.createElement('canvas');
      signCanvas.width = 512;
      signCanvas.height = 128;
      const sctx = signCanvas.getContext('2d')!;
      sctx.fillStyle = '#050a14';
      sctx.fillRect(0, 0, 512, 128);
      sctx.strokeStyle = '#' + colorHex.toString(16).padStart(6, '0');
      sctx.lineWidth = 6;
      sctx.strokeRect(8, 8, 496, 112);
      sctx.fillStyle = '#' + colorHex.toString(16).padStart(6, '0');
      sctx.shadowColor = '#' + colorHex.toString(16).padStart(6, '0');
      sctx.shadowBlur = 18;
      sctx.font = '900 36px monospace';
      sctx.textAlign = 'center';
      sctx.fillText(text, 256, 75);

      const signTex = new THREE.CanvasTexture(signCanvas);
      const signMat = new THREE.MeshBasicMaterial({ map: signTex, side: THREE.DoubleSide });
      const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(16, 4), signMat);
      signMesh.position.set(x, y, z);
      signMesh.rotation.y = rotY;
      scene.add(signMesh);
    };

    createNeonSign('RE:VOLT — OVERRIDE PROTOCOL', 0x00f0ff, 0, 24, -62, 0);
    createNeonSign('OMNICORP FOUNDRY SEC-07', 0xf43f5e, -50, 26, -58, 0.4);
    createNeonSign('WARNING: ANOMALOUS DROID THREAT', 0xf59e0b, 50, 25, -56, -0.4);
    createNeonSign('EVACUATION CORRIDOR // SOUTH', 0x10b981, 0, 18, 62, Math.PI);

    // 5. Broken Vehicles (Wrecked armored patrol cruisers & burning transport pods)
    const vehicleMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.35,
      metalness: 0.85,
    });
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.1,
      metalness: 0.9,
    });
    const wheelMat = new THREE.MeshStandardMaterial({
      color: 0x0a0e17,
      roughness: 0.9,
    });

    const fireLights: THREE.PointLight[] = [];

    const createBrokenVehicle = (x: number, z: number, rotY: number, hasFire: boolean) => {
      const vGroup = new THREE.Group();
      vGroup.position.set(x, 0, z);
      vGroup.rotation.y = rotY;

      const chassis = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.2, 5.8), vehicleMat);
      chassis.position.y = 0.9;
      chassis.castShadow = true;
      vGroup.add(chassis);

      const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.0, 3.2), glassMat);
      cabin.position.set(0, 1.8, -0.4);
      cabin.rotation.z = 0.08;
      vGroup.add(cabin);

      [
        [-1.6, 0.5, 1.8],
        [1.6, 0.5, 1.8],
        [-1.6, 0.5, -1.8],
        [1.6, 0.5, -1.8],
      ].forEach(([wx, wy, wz]) => {
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.4, 12), wheelMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(wx, wy, wz);
        vGroup.add(wheel);
      });

      if (hasFire) {
        const fireLight = new THREE.PointLight(0xff5500, 3.5, 14);
        fireLight.position.set(0, 1.8, 1.6);
        vGroup.add(fireLight);
        fireLights.push(fireLight);

        const flameMat = new THREE.MeshBasicMaterial({ color: 0xff4400, wireframe: true });
        const flame = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.8, 6), flameMat);
        flame.position.set(0, 2.0, 1.6);
        vGroup.add(flame);
      }

      scene.add(vGroup);
    };

    createBrokenVehicle(-22, -12, 0.5, true);
    createBrokenVehicle(20, -18, -0.8, true);
    createBrokenVehicle(-28, 22, 1.2, false);
    createBrokenVehicle(26, 20, -0.3, true);
    createBrokenVehicle(-8, -32, 0.2, false);

    // 6. Metal Barricades & Road Blockades
    const barrierMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.4,
      metalness: 0.8,
    });
    const stripeMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.4,
    });

    const createMetalBarrier = (x: number, z: number, rotY: number) => {
      const bGroup = new THREE.Group();
      bGroup.position.set(x, 0, z);
      bGroup.rotation.y = rotY;

      const base = new THREE.Mesh(new THREE.BoxGeometry(4.5, 1.2, 0.8), barrierMat);
      base.position.y = 0.6;
      base.castShadow = true;
      bGroup.add(base);

      const stripe = new THREE.Mesh(new THREE.BoxGeometry(4.55, 0.35, 0.82), stripeMat);
      stripe.position.y = 0.6;
      bGroup.add(stripe);

      scene.add(bGroup);
    };

    createMetalBarrier(-14, 14, 0.2);
    createMetalBarrier(14, 14, -0.2);
    createMetalBarrier(-18, -24, 0.6);
    createMetalBarrier(18, -24, -0.6);

    // 7. Power Generators (3 Units for Level 2 Objective: DESTROY 3 GENERATORS)
    const generators: PowerGeneratorEntity[] = [];
    const genMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.3,
      metalness: 0.85,
    });
    const genCoreMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const genHazardMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b });

    const createPowerGenerator = (x: number, z: number): PowerGeneratorEntity => {
      const genGroup = new THREE.Group();
      genGroup.position.set(x, 0, z);

      const base = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.8, 1.8, 16), genMat);
      base.position.y = 0.9;
      base.castShadow = true;
      base.receiveShadow = true;
      genGroup.add(base);

      const core = new THREE.Mesh(new THREE.SphereGeometry(1.3, 16, 16), genCoreMat);
      core.position.y = 2.6;
      genGroup.add(core);

      const ringGeo = new THREE.TorusGeometry(1.8, 0.18, 8, 24);
      const ring1 = new THREE.Mesh(ringGeo, genHazardMat);
      ring1.position.y = 2.6;
      ring1.rotation.x = Math.PI / 2;
      genGroup.add(ring1);

      const ring2 = new THREE.Mesh(ringGeo, genMat);
      ring2.position.y = 2.6;
      genGroup.add(ring2);

      const chimney = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.4, 1.6, 12), genMat);
      chimney.position.y = 4.2;
      genGroup.add(chimney);

      const coreLight = new THREE.PointLight(0x00f0ff, 4.0, 18);
      coreLight.position.y = 2.6;
      genGroup.add(coreLight);

      scene.add(genGroup);

      return {
        group: genGroup,
        hp: 150,
        maxHp: 150,
        isDestroyed: false,
        coreMesh: core,
        coreLight,
        position: new THREE.Vector3(x, 2.0, z),
      };
    };

    generators.push(createPowerGenerator(-28, -2)); // West Generator
    generators.push(createPowerGenerator(28, -2));  // East Generator
    generators.push(createPowerGenerator(0, -38));  // Central Core Generator

    // 8. Heavy Industrial Cover Crates
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

    const createIndustrialCrate = (w: number, h: number, d: number, index: number) => {
      const cGroup = new THREE.Group();
      const isAmmo = index % 2 === 0;
      const box = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), isAmmo ? ammoMat : cargoMat);
      box.castShadow = true;
      box.receiveShadow = true;
      cGroup.add(box);
      return cGroup;
    };

    const crateLocations: [number, number, number, number, number, number][] = [
      [11, 1.4, 9, 3.2, 2.8, 3.2],
      [14.5, 1.2, 9, 3.0, 2.4, 3.0],
      [11, 3.8, 9, 2.8, 2.0, 2.8],
      [-11, 1.4, -5, 3.2, 2.8, 3.2],
      [-14.5, 1.2, -5, 3.0, 2.4, 3.0],
      [4, 1.8, -14, 4.0, 3.6, 3.5],
      [34, 1.6, 12, 3.5, 3.2, 3.5],
      [-34, 1.6, 14, 3.8, 3.2, 3.8],
      [-16, 1.6, 36, 4.0, 3.2, 4.0],
      [16, 1.6, 36, 4.0, 3.2, 4.0],
    ];

    crateLocations.forEach(([x, y, z, w, h, d], index) => {
      const c = createIndustrialCrate(w, h, d, index);
      c.position.set(x, y, z);
      scene.add(c);
      crates.push(c);
    });

    // 9. Heavy Overhead Structural Pillars
    const pillars: THREE.Mesh[] = [];
    const pillarGeo = new THREE.BoxGeometry(3.0, 20, 3.0);
    const pillarPositions: [number, number][] = [
      [-42, -42],
      [42, -42],
      [-42, 42],
      [42, 42],
      [-42, 0],
      [42, 0],
    ];

    pillarPositions.forEach(([x, z]) => {
      const pillar = new THREE.Mesh(pillarGeo, steelMat);
      pillar.position.set(x, 10, z);
      pillar.castShadow = true;
      pillar.receiveShadow = true;
      scene.add(pillar);
      pillars.push(pillar);
    });

    // 10. Volumetric Steam & Smoke Clouds
    const steamClouds: THREE.Mesh[] = [];
    const smokeGeo = new THREE.SphereGeometry(2.0, 10, 10);
    const smokeMat = new THREE.MeshBasicMaterial({
      color: 0x334155,
      transparent: true,
      opacity: 0.18,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });

    const steamOffsets = [
      new THREE.Vector3(-22, 2.5, -12),
      new THREE.Vector3(20, 2.5, -18),
      new THREE.Vector3(26, 2.5, 20),
      new THREE.Vector3(0, 3.0, -38),
      new THREE.Vector3(-28, 2.5, -2),
    ];

    steamOffsets.forEach((pos) => {
      const cloud = new THREE.Mesh(smokeGeo, smokeMat);
      cloud.position.copy(pos);
      scene.add(cloud);
      steamClouds.push(cloud);
    });

    // 11. Revolving Emergency Red Sirens
    const sirens: { light: THREE.PointLight; mesh: THREE.Mesh; baseAngle: number }[] = [];
    const sirenPositions: [number, number, number][] = [
      [-18, 4.0, 4],
      [11, 4.9, 9],
      [-14, 2.8, -5],
      [4, 3.8, -14],
      [28, 4.5, -2],
      [-28, 4.5, -2],
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

      const light = new THREE.PointLight(0xff0022, 3.5, 18);
      light.position.y = 0.4;
      sGroup.add(light);

      scene.add(sGroup);
      sirens.push({ light, mesh: sDome, baseAngle: idx * (Math.PI / 2) });
    });

    const updateSirens = (time: number) => {
      sirens.forEach((siren) => {
        const pulse = (Math.sin(time * 6 + siren.baseAngle) + 1) * 0.5;
        siren.light.intensity = 1.0 + pulse * 4.0;
      });

      // Drifting smoke animation
      steamClouds.forEach((cloud, idx) => {
        cloud.position.y = 2.2 + Math.sin(time * 0.8 + idx) * 0.4;
        cloud.scale.setScalar(1.0 + Math.sin(time * 0.5 + idx) * 0.3);
      });

      // Flickering fire lights
      fireLights.forEach((fl, idx) => {
        fl.intensity = 2.5 + Math.sin(time * 16 + idx * 3) * 1.5;
      });

      // Rotate generator energy coils
      generators.forEach((gen, idx) => {
        if (!gen.isDestroyed) {
          gen.coreMesh.rotation.y = time * 2.5 + idx;
          gen.coreLight.intensity = 3.5 + Math.sin(time * 8 + idx) * 1.5;
        }
      });
    };

    return {
      floor,
      catwalk,
      pillars,
      crates,
      generators,
      sirens,
      steamClouds,
      fireLights,
      updateSirens,
    };
  }
}

export const factoryArena = new FactoryArenaBuilder();
