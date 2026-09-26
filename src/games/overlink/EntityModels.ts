// High-Fidelity 3D Entity Models for Circuit Breaker: Overlink
// Unit-7 Cyber-Droid, MK-IV Titan Battle Mech, Yellow Hazmat Scientists, and Scout Bots
import * as THREE from 'three';

export interface Unit7Entity {
  group: THREE.Group;
  aimLaser: THREE.Line;
  leftLegPivot: THREE.Group;
  rightLegPivot: THREE.Group;
  leftArmPivot: THREE.Group;
  rightArmPivot: THREE.Group;
  weaponMuzzle: THREE.Vector3;
  animateWalk: (time: number, isMoving: boolean) => void;
  updateLaserAim: (targetPoint: THREE.Vector3) => void;
}

export interface TitanMechEntity {
  group: THREE.Group;
  visorMesh: THREE.Mesh;
  visorLight: THREE.PointLight;
  leftLegPivot: THREE.Group;
  rightLegPivot: THREE.Group;
  leftArmPivot: THREE.Group;
  rightArmPivot: THREE.Group;
  chestCore: THREE.Mesh;
  chestLight: THREE.PointLight;
  aegisShield: THREE.Mesh;
  setAllied: (isAllied: boolean) => void;
  animateWalk: (time: number, isMoving: boolean) => void;
}

export interface ScientistEntity {
  group: THREE.Group;
  isRescued: boolean;
  animateIdle: (time: number) => void;
  animateRun?: (time: number) => void;
}

export class EntityModelFactory {
  // 1. UNIT-7 (SLEEK BLUE CYBERNETIC ANDROID SOLDIER)
  public createUnit7(): Unit7Entity {
    const group = new THREE.Group();

    // High-tech cyber materials
    const blueArmorMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Cobalt cyber blue
      roughness: 0.25,
      metalness: 0.85,
    });
    const darkUnderMat = new THREE.MeshStandardMaterial({
      color: 0x090d16, // Matte carbon fiber black
      roughness: 0.5,
      metalness: 0.4,
    });
    const cyanGlowMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00f0ff,
      emissiveIntensity: 3.0,
      roughness: 0.1,
    });

    // A. Torso & Armor Plating
    const torsoGroup = new THREE.Group();
    // Inner torso
    const innerTorsoGeo = new THREE.BoxGeometry(0.7, 1.0, 0.45);
    const innerTorso = new THREE.Mesh(innerTorsoGeo, darkUnderMat);
    innerTorso.position.y = 1.35;
    innerTorso.castShadow = true;
    torsoGroup.add(innerTorso);

    // Blue Chest Armor Plate
    const chestPlateGeo = new THREE.BoxGeometry(0.78, 0.55, 0.2);
    const chestPlate = new THREE.Mesh(chestPlateGeo, blueArmorMat);
    chestPlate.position.set(0, 1.55, 0.18);
    chestPlate.castShadow = true;
    torsoGroup.add(chestPlate);

    // Glowing Chest Arc Reactor
    const reactorGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.08, 16);
    reactorGeo.rotateX(Math.PI / 2);
    const reactor = new THREE.Mesh(reactorGeo, cyanGlowMat);
    reactor.position.set(0, 1.55, 0.28);
    torsoGroup.add(reactor);

    // Spine power conduits on back
    const spineGeo = new THREE.BoxGeometry(0.12, 0.7, 0.1);
    const spine = new THREE.Mesh(spineGeo, cyanGlowMat);
    spine.position.set(0, 1.35, -0.22);
    torsoGroup.add(spine);

    // Dual Shoulder Thruster Fins (emit cyan glow)
    const finGeo = new THREE.BoxGeometry(0.08, 0.35, 0.2);
    const leftFin = new THREE.Mesh(finGeo, blueArmorMat);
    leftFin.position.set(-0.32, 1.7, -0.2);
    leftFin.rotation.z = -Math.PI / 8;
    torsoGroup.add(leftFin);

    const rightFin = new THREE.Mesh(finGeo, blueArmorMat);
    rightFin.position.set(0.32, 1.7, -0.2);
    rightFin.rotation.z = Math.PI / 8;
    torsoGroup.add(rightFin);

    group.add(torsoGroup);

    // B. Aerodynamic Cyber Helmet with Glowing Cyan Visor
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 2.05, 0);

    const helmetGeo = new THREE.SphereGeometry(0.28, 16, 16);
    helmetGeo.scale(0.85, 1.0, 0.95);
    const helmet = new THREE.Mesh(helmetGeo, blueArmorMat);
    helmet.castShadow = true;
    headGroup.add(helmet);

    // Faceplate (Dark)
    const faceGeo = new THREE.BoxGeometry(0.32, 0.25, 0.2);
    const face = new THREE.Mesh(faceGeo, darkUnderMat);
    face.position.set(0, -0.05, 0.15);
    headGroup.add(face);

    // Glowing Cyan Visor Slit
    const visorGeo = new THREE.BoxGeometry(0.36, 0.08, 0.08);
    const visor = new THREE.Mesh(visorGeo, cyanGlowMat);
    visor.position.set(0, 0.04, 0.24);
    headGroup.add(visor);

    group.add(headGroup);

    // C. Articulated Arms (Holding Scoped Pulse Rifle)
    const leftArmPivot = new THREE.Group();
    leftArmPivot.position.set(-0.48, 1.75, 0);

    // Shoulder Pad
    const pauldronGeo = new THREE.BoxGeometry(0.32, 0.25, 0.32);
    const leftPauldron = new THREE.Mesh(pauldronGeo, blueArmorMat);
    leftPauldron.position.set(0, 0, 0);
    leftArmPivot.add(leftPauldron);

    // Upper & Forearm angled holding rifle foregrip
    const armGeo = new THREE.BoxGeometry(0.18, 0.7, 0.18);
    const leftArm = new THREE.Mesh(armGeo, darkUnderMat);
    leftArm.position.set(0.08, -0.35, 0.2);
    leftArm.rotation.x = Math.PI / 4;
    leftArm.rotation.y = -Math.PI / 6;
    leftArm.castShadow = true;
    leftArmPivot.add(leftArm);
    group.add(leftArmPivot);

    // Right Arm (Holding rifle stock)
    const rightArmPivot = new THREE.Group();
    rightArmPivot.position.set(0.48, 1.75, 0);

    const rightPauldron = new THREE.Mesh(pauldronGeo, blueArmorMat);
    rightPauldron.position.set(0, 0, 0);
    rightArmPivot.add(rightPauldron);

    const rightArm = new THREE.Mesh(armGeo, darkUnderMat);
    rightArm.position.set(-0.08, -0.32, 0.15);
    rightArm.rotation.x = Math.PI / 3.5;
    rightArm.rotation.y = Math.PI / 8;
    rightArm.castShadow = true;
    rightArmPivot.add(rightArm);

    // Scoped Pulse Rifle
    const rifleGroup = new THREE.Group();
    rifleGroup.position.set(0.05, -0.45, 0.5);

    // Rifle Receiver
    const receiverGeo = new THREE.BoxGeometry(0.14, 0.22, 1.1);
    const receiver = new THREE.Mesh(receiverGeo, darkUnderMat);
    rifleGroup.add(receiver);

    // Barrel
    const barrelGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.6, 8);
    barrelGeo.rotateX(Math.PI / 2);
    const barrel = new THREE.Mesh(barrelGeo, blueArmorMat);
    barrel.position.set(0, 0.02, 0.7);
    rifleGroup.add(barrel);

    // Glowing Muzzle Ring
    const muzzleGeo = new THREE.TorusGeometry(0.06, 0.02, 8, 16);
    const muzzle = new THREE.Mesh(muzzleGeo, cyanGlowMat);
    muzzle.position.set(0, 0.02, 1.0);
    rifleGroup.add(muzzle);

    // Scope
    const scopeGeo = new THREE.BoxGeometry(0.08, 0.08, 0.35);
    const scope = new THREE.Mesh(scopeGeo, cyanGlowMat);
    scope.position.set(0, 0.15, 0.05);
    rifleGroup.add(scope);

    rightArmPivot.add(rifleGroup);
    group.add(rightArmPivot);

    // D. Articulated Legs
    const legGeo = new THREE.BoxGeometry(0.24, 0.85, 0.24);
    const bootGeo = new THREE.BoxGeometry(0.26, 0.3, 0.42);

    const leftLegPivot = new THREE.Group();
    leftLegPivot.position.set(-0.24, 0.85, 0);
    const leftLeg = new THREE.Mesh(legGeo, darkUnderMat);
    leftLeg.position.y = -0.4;
    leftLeg.castShadow = true;
    leftLegPivot.add(leftLeg);

    const leftThighPlate = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.4, 0.28), blueArmorMat);
    leftThighPlate.position.set(0, -0.2, 0.02);
    leftLegPivot.add(leftThighPlate);

    const leftBoot = new THREE.Mesh(bootGeo, blueArmorMat);
    leftBoot.position.set(0, -0.75, 0.08);
    leftBoot.castShadow = true;
    leftLegPivot.add(leftBoot);
    group.add(leftLegPivot);

    const rightLegPivot = new THREE.Group();
    rightLegPivot.position.set(0.24, 0.85, 0);
    const rightLeg = new THREE.Mesh(legGeo, darkUnderMat);
    rightLeg.position.y = -0.4;
    rightLeg.castShadow = true;
    rightLegPivot.add(rightLeg);

    const rightThighPlate = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.4, 0.28), blueArmorMat);
    rightThighPlate.position.set(0, -0.2, 0.02);
    rightLegPivot.add(rightThighPlate);

    const rightBoot = new THREE.Mesh(bootGeo, blueArmorMat);
    rightBoot.position.set(0, -0.75, 0.08);
    rightBoot.castShadow = true;
    rightLegPivot.add(rightBoot);
    group.add(rightLegPivot);

    // E. Aim Laser Line (Subtle tactical cyan targeting laser)
    const laserMat = new THREE.LineBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.65,
    });
    const laserGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0.53, 1.3, 1.5),
      new THREE.Vector3(0.53, 1.3, 30),
    ]);
    const aimLaser = new THREE.Line(laserGeo, laserMat);
    aimLaser.frustumCulled = false;
    group.add(aimLaser);

    const weaponMuzzle = new THREE.Vector3();

    const animateWalk = (time: number, isMoving: boolean) => {
      if (isMoving) {
        const angle = Math.sin(time * 12) * 0.55;
        leftLegPivot.rotation.x = angle;
        rightLegPivot.rotation.x = -angle;
        // Torso subtle breathing bob
        torsoGroup.position.y = Math.abs(Math.sin(time * 12)) * 0.08;
      } else {
        leftLegPivot.rotation.x = 0;
        rightLegPivot.rotation.x = 0;
        torsoGroup.position.y = 0;
      }
    };

    const updateLaserAim = (targetPoint: THREE.Vector3) => {
      const muzzleLocal = new THREE.Vector3(0.53, 1.3, 1.5);
      muzzleLocal.applyMatrix4(group.matrixWorld);
      weaponMuzzle.copy(muzzleLocal);

      const points = [
        new THREE.Vector3(0.53, 1.3, 1.5),
        group.worldToLocal(targetPoint.clone()),
      ];
      aimLaser.geometry.setFromPoints(points);
    };

    return {
      group,
      aimLaser,
      leftLegPivot,
      rightLegPivot,
      leftArmPivot,
      rightArmPivot,
      weaponMuzzle,
      animateWalk,
      updateLaserAim,
    };
  }

  // 2. MK-IV TITAN MECH (MASSIVE 8-METER BIPEDAL WAR MECH LIKE CONCEPT ART)
  public createTitanMech(): TitanMechEntity {
    const group = new THREE.Group();

    // Heavy military weathered armor materials
    const darkChassisMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.45,
      metalness: 0.85,
    });
    const titaniumPlatesMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.3,
      metalness: 0.9,
    });
    const hazardMat = new THREE.MeshStandardMaterial({
      color: 0xca8a04,
      roughness: 0.5,
      metalness: 0.6,
    });

    // Ocular Visor Material (Starts Red, turns Cyan when overridden)
    const visorMat = new THREE.MeshStandardMaterial({
      color: 0xff1133,
      emissive: 0xff0022,
      emissiveIntensity: 3.5,
      roughness: 0.1,
    });

    // Chest Core Material (The glowing reactor targeted by Neural Tether!)
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00e5ff,
      emissiveIntensity: 4.0,
      roughness: 0.1,
    });

    // A. Main Heavy Torso
    const torsoGroup = new THREE.Group();
    torsoGroup.position.y = 4.2;

    // Heavy Central Frame
    const mainChestGeo = new THREE.BoxGeometry(3.6, 2.8, 2.4);
    const mainChest = new THREE.Mesh(mainChestGeo, darkChassisMat);
    mainChest.castShadow = true;
    torsoGroup.add(mainChest);

    // Front Chest Armor Bevels (Heavy Angular Plate)
    const frontPlateGeo = new THREE.CylinderGeometry(1.8, 2.2, 2.4, 6);
    frontPlateGeo.rotateX(Math.PI / 2);
    const frontPlate = new THREE.Mesh(frontPlateGeo, titaniumPlatesMat);
    frontPlate.position.set(0, 0.2, 0.6);
    frontPlate.scale.set(1.0, 0.7, 0.5);
    frontPlate.castShadow = true;
    torsoGroup.add(frontPlate);

    // Massive Glowing Cyan Chest Reactor Core (Where the tether attaches!)
    const coreGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.3, 24);
    coreGeo.rotateX(Math.PI / 2);
    const chestCore = new THREE.Mesh(coreGeo, coreMat);
    chestCore.position.set(0, 0.35, 1.35);
    torsoGroup.add(chestCore);

    // Real-time Cyan Point Light from chest core illuminating the foundry
    const chestLight = new THREE.PointLight(0x00f0ff, 4.0, 16);
    chestLight.position.set(0, 0.35, 1.6);
    torsoGroup.add(chestLight);

    // Core Containment Armor Ring
    const coreRingGeo = new THREE.TorusGeometry(0.7, 0.12, 8, 24);
    const coreRing = new THREE.Mesh(coreRingGeo, titaniumPlatesMat);
    coreRing.position.set(0, 0.35, 1.32);
    torsoGroup.add(coreRing);

    // B. Armored Mech Head with Horizontal Visor
    const headGeo = new THREE.BoxGeometry(1.6, 1.0, 1.4);
    const head = new THREE.Mesh(headGeo, darkChassisMat);
    head.position.set(0, 1.8, 0.4);
    head.castShadow = true;
    torsoGroup.add(head);

    // Horizontal Crimson Ocular Visor Slit
    const visorGeo = new THREE.BoxGeometry(1.2, 0.22, 0.3);
    const visorMesh = new THREE.Mesh(visorGeo, visorMat);
    visorMesh.position.set(0, 1.85, 1.05);
    torsoGroup.add(visorMesh);

    const visorLight = new THREE.PointLight(0xff1133, 4.0, 14);
    visorLight.position.set(0, 1.85, 1.4);
    torsoGroup.add(visorLight);

    // C. Dual Overhead Shoulder Exhaust Stacks
    const stackGeo = new THREE.CylinderGeometry(0.35, 0.45, 1.8, 12);
    const leftStack = new THREE.Mesh(stackGeo, titaniumPlatesMat);
    leftStack.position.set(-1.4, 2.0, -0.9);
    leftStack.rotation.x = -Math.PI / 6;
    leftStack.castShadow = true;
    torsoGroup.add(leftStack);

    const rightStack = new THREE.Mesh(stackGeo, titaniumPlatesMat);
    rightStack.position.set(1.4, 2.0, -0.9);
    rightStack.rotation.x = -Math.PI / 6;
    rightStack.castShadow = true;
    torsoGroup.add(rightStack);

    // Hazard Yellow Shoulder Decals
    const chevronGeo = new THREE.BoxGeometry(0.35, 0.12, 0.65);
    const leftChevron = new THREE.Mesh(chevronGeo, hazardMat);
    leftChevron.position.set(-1.4, 2.4, -0.2);
    torsoGroup.add(leftChevron);
    const rightChevron = new THREE.Mesh(chevronGeo, hazardMat);
    rightChevron.position.set(1.4, 2.4, -0.2);
    torsoGroup.add(rightChevron);

    group.add(torsoGroup);

    // D. Massive Articulated Hydraulic Arms with Rotary Cannons
    const shoulderGeo = new THREE.SphereGeometry(0.75, 16, 16);
    const armSegmentGeo = new THREE.BoxGeometry(0.85, 2.0, 0.85);
    const forearmGeo = new THREE.BoxGeometry(1.0, 2.2, 1.0);
    const cannonBarrelGeo = new THREE.CylinderGeometry(0.12, 0.12, 2.4, 8);
    cannonBarrelGeo.rotateX(Math.PI / 2);

    // Left Arm Pivot
    const leftArmPivot = new THREE.Group();
    leftArmPivot.position.set(-2.5, 4.8, 0);

    const leftShoulder = new THREE.Mesh(shoulderGeo, titaniumPlatesMat);
    leftArmPivot.add(leftShoulder);

    const leftUpperArm = new THREE.Mesh(armSegmentGeo, darkChassisMat);
    leftUpperArm.position.set(-0.2, -1.0, 0);
    leftUpperArm.castShadow = true;
    leftArmPivot.add(leftUpperArm);

    const leftForearm = new THREE.Mesh(forearmGeo, titaniumPlatesMat);
    leftForearm.position.set(-0.2, -2.4, 0.6);
    leftForearm.rotation.x = Math.PI / 6;
    leftForearm.castShadow = true;
    leftArmPivot.add(leftForearm);

    // Hydraulic Slam Cannon mounted on right arm
    const rightArmPivot = new THREE.Group();
    rightArmPivot.position.set(2.5, 4.8, 0);

    const rightShoulder = new THREE.Mesh(shoulderGeo, titaniumPlatesMat);
    rightArmPivot.add(rightShoulder);

    const rightUpperArm = new THREE.Mesh(armSegmentGeo, darkChassisMat);
    rightUpperArm.position.set(0.2, -1.0, 0);
    rightUpperArm.castShadow = true;
    rightArmPivot.add(rightUpperArm);

    const rightForearm = new THREE.Mesh(forearmGeo, titaniumPlatesMat);
    rightForearm.position.set(0.2, -2.4, 0.6);
    rightForearm.rotation.x = Math.PI / 6;
    rightForearm.castShadow = true;

    // Dual Heavy Cannons on Forearm
    const barrelL = new THREE.Mesh(cannonBarrelGeo, darkChassisMat);
    barrelL.position.set(-0.3, -0.2, 1.2);
    rightForearm.add(barrelL);
    const barrelR = new THREE.Mesh(cannonBarrelGeo, darkChassisMat);
    barrelR.position.set(0.3, -0.2, 1.2);
    rightForearm.add(barrelR);

    rightArmPivot.add(rightForearm);

    group.add(leftArmPivot);
    group.add(rightArmPivot);

    // E. Heavy Hydraulic Bipedal Walker Legs
    const thighGeo = new THREE.BoxGeometry(0.9, 2.2, 0.9);
    const kneePistonGeo = new THREE.CylinderGeometry(0.18, 0.18, 1.4, 8);
    const shinGeo = new THREE.BoxGeometry(1.0, 2.6, 1.0);
    const footGeo = new THREE.BoxGeometry(1.6, 0.5, 2.2);

    // Left Leg
    const leftLegPivot = new THREE.Group();
    leftLegPivot.position.set(-1.3, 2.8, 0);

    const leftThigh = new THREE.Mesh(thighGeo, darkChassisMat);
    leftThigh.position.y = -1.0;
    leftThigh.castShadow = true;
    leftLegPivot.add(leftThigh);

    const leftPiston = new THREE.Mesh(kneePistonGeo, titaniumPlatesMat);
    leftPiston.position.set(0, -1.8, -0.4);
    leftLegPivot.add(leftPiston);

    const leftShin = new THREE.Mesh(shinGeo, titaniumPlatesMat);
    leftShin.position.set(0, -2.4, 0.2);
    leftShin.castShadow = true;
    leftLegPivot.add(leftShin);

    const leftFoot = new THREE.Mesh(footGeo, darkChassisMat);
    leftFoot.position.set(0, -3.7, 0.5);
    leftFoot.castShadow = true;
    leftLegPivot.add(leftFoot);

    group.add(leftLegPivot);

    // Right Leg
    const rightLegPivot = new THREE.Group();
    rightLegPivot.position.set(1.3, 2.8, 0);

    const rightThigh = new THREE.Mesh(thighGeo, darkChassisMat);
    rightThigh.position.y = -1.0;
    rightThigh.castShadow = true;
    rightLegPivot.add(rightThigh);

    const rightPiston = new THREE.Mesh(kneePistonGeo, titaniumPlatesMat);
    rightPiston.position.set(0, -1.8, -0.4);
    rightLegPivot.add(rightPiston);

    const rightShin = new THREE.Mesh(shinGeo, titaniumPlatesMat);
    rightShin.position.set(0, -2.4, 0.2);
    rightShin.castShadow = true;
    rightLegPivot.add(rightShin);

    const rightFoot = new THREE.Mesh(footGeo, darkChassisMat);
    rightFoot.position.set(0, -3.7, 0.5);
    rightFoot.castShadow = true;
    rightLegPivot.add(rightFoot);

    group.add(rightLegPivot);

    // F. Deployable Aegis Riot Energy Shield (Cyan Hexagonal Barrier)
    const shieldGeo = new THREE.CylinderGeometry(3.6, 3.6, 0.1, 6);
    shieldGeo.rotateX(Math.PI / 2);
    const shieldMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00f0ff,
      emissiveIntensity: 2.2,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide,
    });
    const aegisShield = new THREE.Mesh(shieldGeo, shieldMat);
    aegisShield.position.set(0, 3.8, 2.8);
    aegisShield.visible = false;
    group.add(aegisShield);

    // Visor color switch on override
    const setAllied = (isAllied: boolean) => {
      if (isAllied) {
        visorMat.color.setHex(0x00f0ff);
        visorMat.emissive.setHex(0x00e5ff);
        visorLight.color.setHex(0x00f0ff);
      } else {
        visorMat.color.setHex(0xff1133);
        visorMat.emissive.setHex(0xff0022);
        visorLight.color.setHex(0xff1133);
      }
    };

    const animateWalk = (time: number, isMoving: boolean) => {
      if (isMoving) {
        const step = Math.sin(time * 6) * 0.45;
        leftLegPivot.rotation.x = step;
        rightLegPivot.rotation.x = -step;
        leftArmPivot.rotation.x = -step * 0.5;
        rightArmPivot.rotation.x = step * 0.5;
        torsoGroup.position.y = 4.2 + Math.abs(Math.sin(time * 6)) * 0.2;
      } else {
        leftLegPivot.rotation.x = 0;
        rightLegPivot.rotation.x = 0;
        torsoGroup.position.y = 4.2;
      }
    };

    return {
      group,
      visorMesh,
      visorLight,
      leftLegPivot,
      rightLegPivot,
      leftArmPivot,
      rightArmPivot,
      chestCore,
      chestLight,
      aegisShield,
      setAllied,
      animateWalk,
    };
  }

  // 3. PHOTOREALISTIC HUMAN SCIENTISTS (REAL HUMAN FACES, SKIN, HAIR, LAB COATS & BADGES)
  public createScientist(scientistIndex = 0): ScientistEntity {
    const group = new THREE.Group();

    const profiles = [
      {
        name: 'DR. ELENA CHEN',
        skinColor: 0xf3ceb3,
        hairColor: 0x18181b,
        shirtColor: 0x0f766e, // Emerald Teal
        pantsColor: 0x334155, // Slate
        shoeColor: 0x0f172a,
        glassesColor: 0x0284c7,
        hasPonytail: true,
        hasBeard: false,
      },
      {
        name: 'DR. MARCUS VANCE',
        skinColor: 0xd4a373,
        hairColor: 0x3e2723,
        shirtColor: 0x881337, // Burgundy Crimson
        pantsColor: 0x1e293b, // Charcoal
        shoeColor: 0x27170e,
        glassesColor: 0xb45309,
        hasPonytail: false,
        hasBeard: true,
      },
      {
        name: 'DR. KENJI SATO',
        skinColor: 0xebd2b4,
        hairColor: 0x09090b,
        shirtColor: 0x1d4ed8, // Cobalt Blue
        pantsColor: 0x1e293b, // Charcoal
        shoeColor: 0x18181b,
        glassesColor: 0x64748b,
        hasPonytail: false,
        hasBeard: false,
      },
    ];

    const p = profiles[scientistIndex % profiles.length];

    // Realistic PBR Human Materials
    const skinMat = new THREE.MeshStandardMaterial({
      color: p.skinColor,
      roughness: 0.65,
      metalness: 0.05,
    });
    const hairMat = new THREE.MeshStandardMaterial({
      color: p.hairColor,
      roughness: 0.75,
      metalness: 0.1,
    });
    const labCoatMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc, // Clean White Lab Coat
      roughness: 0.5,
      metalness: 0.05,
    });
    const shirtMat = new THREE.MeshStandardMaterial({
      color: p.shirtColor,
      roughness: 0.65,
      metalness: 0.08,
    });
    const pantsMat = new THREE.MeshStandardMaterial({
      color: p.pantsColor,
      roughness: 0.7,
      metalness: 0.08,
    });
    const shoeMat = new THREE.MeshStandardMaterial({
      color: p.shoeColor,
      roughness: 0.45,
      metalness: 0.2,
    });
    const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const irisMat = new THREE.MeshBasicMaterial({ color: 0x1e3a8a });
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const lipMat = new THREE.MeshStandardMaterial({ color: 0xb97268, roughness: 0.6 });
    const glassesFrameMat = new THREE.MeshStandardMaterial({
      color: p.glassesColor,
      roughness: 0.25,
      metalness: 0.8,
    });
    const glassesLensMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
      roughness: 0.05,
      transmission: 0.85,
    });
    const lanyardMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
    const badgeMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });

    // Master Human Body Hierarchy
    const bodyPivot = new THREE.Group();

    // A. Human Head & Facial Features
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.48, 0);

    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.16, 12), skinMat);
    neck.position.y = -0.16;
    headGroup.add(neck);

    const headGeo = new THREE.SphereGeometry(0.18, 16, 16);
    headGeo.scale(0.92, 1.08, 0.98);
    const head = new THREE.Mesh(headGeo, skinMat);
    headGroup.add(head);

    // Two Human Eyes with Sclera, Iris, and Pupil
    [-0.055, 0.055].forEach((xSide) => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), eyeWhiteMat);
      eye.position.set(xSide, 0.03, 0.165);
      headGroup.add(eye);

      const iris = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 8), irisMat);
      iris.position.set(xSide, 0.03, 0.185);
      headGroup.add(iris);

      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.009, 8, 8), pupilMat);
      pupil.position.set(xSide, 0.03, 0.197);
      headGroup.add(pupil);

      const eyebrow = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.012, 0.02), hairMat);
      eyebrow.position.set(xSide, 0.075, 0.168);
      headGroup.add(eyebrow);
    });

    // Human Nose
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.07, 4), skinMat);
    nose.rotation.x = Math.PI / 2.2;
    nose.position.set(0, 0.005, 0.19);
    headGroup.add(nose);

    // Human Lips
    const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.015, 0.02), lipMat);
    mouth.position.set(0, -0.055, 0.17);
    headGroup.add(mouth);

    // Human Ears
    [-0.17, 0.17].forEach((xSide) => {
      const ear = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.07, 0.04), skinMat);
      ear.position.set(xSide, 0.02, -0.02);
      headGroup.add(ear);
    });

    // Realistic 3D Styled Hair
    const hairCapGeo = new THREE.SphereGeometry(0.19, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.58);
    const hairCap = new THREE.Mesh(hairCapGeo, hairMat);
    hairCap.position.set(0, 0.05, -0.02);
    headGroup.add(hairCap);

    if (p.hasPonytail) {
      const ponytail = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.28, 8), hairMat);
      ponytail.rotation.x = -Math.PI / 2.5;
      ponytail.position.set(0, 0.02, -0.22);
      headGroup.add(ponytail);
    }

    if (p.hasBeard) {
      const beard = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.12), hairMat);
      beard.position.set(0, -0.07, 0.14);
      headGroup.add(beard);
    }

    // Scientific Research Glasses
    const glassFrame = new THREE.Group();
    [-0.055, 0.055].forEach((xSide) => {
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.038, 0.005, 8, 16), glassesFrameMat);
      rim.position.set(xSide, 0.03, 0.188);
      glassFrame.add(rim);

      const lens = new THREE.Mesh(new THREE.CircleGeometry(0.035, 12), glassesLensMat);
      lens.position.set(xSide, 0.03, 0.188);
      glassFrame.add(lens);
    });
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.006, 0.01), glassesFrameMat);
    bridge.position.set(0, 0.03, 0.19);
    glassFrame.add(bridge);
    headGroup.add(glassFrame);

    // B. Torso & White Lab Coat
    const shirt = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.56, 0.26), shirtMat);
    shirt.position.y = 1.08;
    bodyPivot.add(shirt);

    const coatBack = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.68, 0.08), labCoatMat);
    coatBack.position.set(0, 1.02, -0.11);
    bodyPivot.add(coatBack);

    const coatLeft = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.68, 0.28), labCoatMat);
    coatLeft.position.set(-0.20, 1.02, 0.01);
    bodyPivot.add(coatLeft);

    const coatRight = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.68, 0.28), labCoatMat);
    coatRight.position.set(0.20, 1.02, 0.01);
    bodyPivot.add(coatRight);

    [-0.14, 0.14].forEach((xSide) => {
      const lapel = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.25, 0.04), labCoatMat);
      lapel.position.set(xSide, 1.28, 0.14);
      lapel.rotation.z = (xSide > 0 ? -1 : 1) * 0.25;
      bodyPivot.add(lapel);
    });

    const lanyard = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.012, 6, 16), lanyardMat);
    lanyard.rotation.x = Math.PI / 2.3;
    lanyard.position.set(0, 1.25, 0.08);
    bodyPivot.add(lanyard);

    const badge = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.10, 0.01), badgeMat);
    badge.position.set(0, 1.06, 0.16);
    bodyPivot.add(badge);

    // C. Human Arms & Hands
    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-0.29, 1.30, 0);

    const leftUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.055, 0.32, 10), labCoatMat);
    leftUpperArm.position.y = -0.16;
    leftArmGroup.add(leftUpperArm);

    const leftForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.048, 0.30, 10), skinMat);
    leftForearm.position.y = -0.42;
    leftArmGroup.add(leftForearm);

    const leftHand = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.025), skinMat);
    leftHand.position.y = -0.60;
    leftArmGroup.add(leftHand);

    const datapad = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.20, 0.015), badgeMat);
    datapad.position.set(0, -0.60, 0.05);
    datapad.rotation.x = Math.PI / 4;
    leftArmGroup.add(datapad);
    bodyPivot.add(leftArmGroup);

    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(0.29, 1.30, 0);

    const rightUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.055, 0.32, 10), labCoatMat);
    rightUpperArm.position.y = -0.16;
    rightArmGroup.add(rightUpperArm);

    const rightForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.048, 0.30, 10), skinMat);
    rightForearm.position.y = -0.42;
    rightArmGroup.add(rightForearm);

    const rightHand = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.025), skinMat);
    rightHand.position.y = -0.60;
    rightArmGroup.add(rightHand);
    bodyPivot.add(rightArmGroup);

    // D. Human Legs & Footwear
    const pelvis = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.16, 0.24), pantsMat);
    pelvis.position.y = 0.74;
    bodyPivot.add(pelvis);

    const leftLegGroup = new THREE.Group();
    leftLegGroup.position.set(-0.13, 0.70, 0);

    const leftThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.065, 0.38, 10), pantsMat);
    leftThigh.position.y = -0.19;
    leftLegGroup.add(leftThigh);

    const leftShin = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.055, 0.38, 10), pantsMat);
    leftShin.position.y = -0.52;
    leftLegGroup.add(leftShin);

    const leftShoe = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.08, 0.22), shoeMat);
    leftShoe.position.set(0, -0.73, 0.04);
    leftLegGroup.add(leftShoe);
    bodyPivot.add(leftLegGroup);

    const rightLegGroup = new THREE.Group();
    rightLegGroup.position.set(0.13, 0.70, 0);

    const rightThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.065, 0.38, 10), pantsMat);
    rightThigh.position.y = -0.19;
    rightLegGroup.add(rightThigh);

    const rightShin = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.055, 0.38, 10), pantsMat);
    rightShin.position.y = -0.52;
    rightLegGroup.add(rightShin);

    const rightShoe = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.08, 0.22), shoeMat);
    rightShoe.position.set(0, -0.73, 0.04);
    rightLegGroup.add(rightShoe);
    bodyPivot.add(rightLegGroup);

    bodyPivot.add(headGroup);
    group.add(bodyPivot);

    // E. Floating Holographic Distress Beacon
    const beaconGroup = new THREE.Group();
    beaconGroup.position.set(0, 2.05, 0);

    const beaconRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.24, 0.02, 8, 24),
      new THREE.MeshBasicMaterial({ color: 0x10b981 })
    );
    beaconRing.rotation.x = Math.PI / 2;
    beaconGroup.add(beaconRing);

    const cross1 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.22, 0.02), new THREE.MeshBasicMaterial({ color: 0x10b981 }));
    const cross2 = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.06, 0.02), new THREE.MeshBasicMaterial({ color: 0x10b981 }));
    beaconGroup.add(cross1, cross2);
    group.add(beaconGroup);

    const animateIdle = (time: number) => {
      // Crouched naturally behind cover in distress
      bodyPivot.position.y = -0.22;
      bodyPivot.rotation.x = 0.22;

      leftLegGroup.rotation.x = -0.85;
      rightLegGroup.rotation.x = -0.55;

      // Head turns anxiously left and right looking for an escort
      headGroup.rotation.y = Math.sin(time * 2.0) * 0.45;
      headGroup.rotation.x = Math.sin(time * 1.5) * 0.15;

      // Right arm waves frantically in the air calling for help!
      rightArmGroup.rotation.x = -Math.PI / 1.5;
      rightArmGroup.rotation.z = Math.PI / 6 + Math.sin(time * 8.0) * 0.35;

      // Left arm shields body with datapad
      leftArmGroup.rotation.x = -0.4 + Math.sin(time * 3.0) * 0.05;

      // Beacon pulses
      beaconRing.rotation.z = time * 2;
      const bScale = 1.0 + Math.sin(time * 4) * 0.15;
      beaconGroup.scale.set(bScale, bScale, bScale);
    };

    const animateRun = (time: number) => {
      // Stands upright running for safety!
      bodyPivot.position.y = 0;
      bodyPivot.rotation.x = 0.12; // forward lean

      // Natural running leg stride
      const runCycle = time * 9.0;
      leftLegGroup.rotation.x = Math.sin(runCycle) * 0.75;
      rightLegGroup.rotation.x = -Math.sin(runCycle) * 0.75;

      // Arms swing back and forth
      leftArmGroup.rotation.x = -Math.sin(runCycle) * 0.65;
      rightArmGroup.rotation.x = Math.sin(runCycle) * 0.65;
      rightArmGroup.rotation.z = 0.1;

      headGroup.rotation.set(0, 0, 0);

      // Hide distress beacon once rescued
      beaconGroup.visible = false;
    };

    return {
      group,
      isRescued: false,
      animateIdle,
      animateRun,
    };
  }

  // 4. COMBAT SCOUT ROBOTS (AGILE BIPEDAL MECHANICAL STRIKER ROBOTS - NOT BALLS!)
  public createScoutBot() {
    const group = new THREE.Group();

    // High-tech military robotic materials
    const darkChassisMat = new THREE.MeshStandardMaterial({
      color: 0x18181b, // Dark carbon alloy
      roughness: 0.35,
      metalness: 0.85,
    });
    const gunmetalMat = new THREE.MeshStandardMaterial({
      color: 0x3f3f46,
      roughness: 0.25,
      metalness: 0.9,
    });
    const orangeHazardMat = new THREE.MeshStandardMaterial({
      color: 0xf97316, // Industrial amber/orange accent
      roughness: 0.4,
      metalness: 0.4,
    });
    const redGlowMat = new THREE.MeshBasicMaterial({ color: 0xff0044 });

    // Torso group
    const torso = new THREE.Group();
    torso.position.y = 1.1;

    // 1. Armored Angular Chassis Core
    const chestGeo = new THREE.BoxGeometry(0.7, 0.65, 0.55);
    const chest = new THREE.Mesh(chestGeo, darkChassisMat);
    chest.castShadow = true;
    torso.add(chest);

    // Front Chest Armor Plate
    const frontPlate = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.45, 0.15), gunmetalMat);
    frontPlate.position.set(0, 0, 0.26);
    frontPlate.castShadow = true;
    torso.add(frontPlate);

    // Hazard orange trim stripes on chest
    const hazardStripe = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.08, 0.16), orangeHazardMat);
    hazardStripe.position.set(0, -0.15, 0.265);
    torso.add(hazardStripe);

    // 2. Robotic Head Unit with Glowing Crimson Visor
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.32, 0.38), darkChassisMat);
    head.position.set(0, 0.45, 0.05);
    head.castShadow = true;
    torso.add(head);

    // Crimson Sensor Visor Eye (Slit)
    const eyeGeo = new THREE.BoxGeometry(0.32, 0.1, 0.1);
    const eye = new THREE.Mesh(eyeGeo, redGlowMat);
    eye.position.set(0, 0.46, 0.22);
    torso.add(eye);

    const eyeLight = new THREE.PointLight(0xff0044, 2.8, 8);
    eyeLight.position.set(0, 0.46, 0.45);
    torso.add(eyeLight);

    // Sensor Antenna
    const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.3, 6), gunmetalMat);
    antenna.position.set(0.14, 0.72, -0.05);
    torso.add(antenna);

    // 3. Back-Mounted Micro-Reactor Power Pack
    const reactor = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.48, 12), gunmetalMat);
    reactor.position.set(0, 0.05, -0.32);
    reactor.castShadow = true;
    torso.add(reactor);

    const exhaustGlow = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.05, 12), redGlowMat);
    exhaustGlow.position.set(0, -0.2, -0.32);
    torso.add(exhaustGlow);

    // 4. Dual Shoulder-Mounted Rapid Autocannons
    [-0.42, 0.42].forEach((xSide) => {
      const cannonMount = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.18, 0.28), darkChassisMat);
      cannonMount.position.set(xSide, 0.22, 0.05);
      torso.add(cannonMount);

      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.55, 8), gunmetalMat);
      barrel.rotateX(Math.PI / 2);
      barrel.position.set(xSide, 0.22, 0.35);
      barrel.castShadow = true;
      torso.add(barrel);
    });

    group.add(torso);

    // 5. Articulated Hydraulic Robotic Legs (Left & Right Pivots)
    const legGeo = new THREE.BoxGeometry(0.14, 0.55, 0.18);
    const footGeo = new THREE.BoxGeometry(0.22, 0.12, 0.35);

    // Left Leg
    const leftLegPivot = new THREE.Group();
    leftLegPivot.position.set(-0.25, 0.85, 0);

    const leftUpperLeg = new THREE.Mesh(legGeo, gunmetalMat);
    leftUpperLeg.position.set(0, -0.25, -0.05);
    leftUpperLeg.rotation.x = 0.25; // reverse knee bend
    leftUpperLeg.castShadow = true;
    leftLegPivot.add(leftUpperLeg);

    const leftLowerLeg = new THREE.Mesh(legGeo, darkChassisMat);
    leftLowerLeg.position.set(0, -0.65, 0.08);
    leftLowerLeg.rotation.x = -0.3;
    leftLowerLeg.castShadow = true;
    leftLegPivot.add(leftLowerLeg);

    const leftFoot = new THREE.Mesh(footGeo, gunmetalMat);
    leftFoot.position.set(0, -0.85, 0.12);
    leftFoot.castShadow = true;
    leftLegPivot.add(leftFoot);

    group.add(leftLegPivot);

    // Right Leg
    const rightLegPivot = new THREE.Group();
    rightLegPivot.position.set(0.25, 0.85, 0);

    const rightUpperLeg = new THREE.Mesh(legGeo, gunmetalMat);
    rightUpperLeg.position.set(0, -0.25, -0.05);
    rightUpperLeg.rotation.x = 0.25;
    rightUpperLeg.castShadow = true;
    rightLegPivot.add(rightUpperLeg);

    const rightLowerLeg = new THREE.Mesh(legGeo, darkChassisMat);
    rightLowerLeg.position.set(0, -0.65, 0.08);
    rightLowerLeg.rotation.x = -0.3;
    rightLowerLeg.castShadow = true;
    rightLegPivot.add(rightLowerLeg);

    const rightFoot = new THREE.Mesh(footGeo, gunmetalMat);
    rightFoot.position.set(0, -0.85, 0.12);
    rightFoot.castShadow = true;
    rightLegPivot.add(rightFoot);

    group.add(rightLegPivot);

    // Animated robotic walking stride
    const animateBob = (time: number) => {
      const step = Math.sin(time * 8);
      leftLegPivot.rotation.x = step * 0.45;
      rightLegPivot.rotation.x = -step * 0.45;
      torso.position.y = 1.1 + Math.abs(Math.sin(time * 8)) * 0.08;
      torso.rotation.z = Math.sin(time * 4) * 0.04;
      eyeLight.intensity = 2.4 + Math.sin(time * 12) * 0.6;
    };

    return {
      group,
      eye,
      hp: 50,
      speed: 5.5,
      animateBob,
    };
  }

  // 5. GREEN HOLOGRAPHIC EVACUATION AIRLOCK
  public createEvacuationAirlock(): THREE.Group {
    const group = new THREE.Group();

    // Octagonal Industrial Base
    const baseGeo = new THREE.CylinderGeometry(4.5, 4.8, 0.3, 8);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      roughness: 0.5,
      metalness: 0.7,
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.15;
    base.receiveShadow = true;
    group.add(base);

    // Glowing Hologram Safe Zone Ring
    const ringGeo = new THREE.RingGeometry(3.5, 4.2, 32);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x10b981, // Emerald green
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = 0.32;
    group.add(ring);

    // Evacuation Light Pillar (translucent green beam)
    const beamGeo = new THREE.CylinderGeometry(3.5, 3.5, 6, 16, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.y = 3.3;
    group.add(beam);

    // Green beacon light
    const beaconLight = new THREE.PointLight(0x10b981, 3.5, 18);
    beaconLight.position.set(0, 2.5, 0);
    group.add(beaconLight);

    return group;
  }
}

export const entityFactory = new EntityModelFactory();
