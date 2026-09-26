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

  // 3. SCIENTIST IN BRIGHT YELLOW HAZMAT SUIT (EXACT MATCH FOR CONCEPT ART)
  public createScientist(): ScientistEntity {
    const group = new THREE.Group();

    // Bright yellow hazard suit materials
    const suitMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // Warm OSHA yellow
      roughness: 0.55,
      metalness: 0.1,
    });
    const blackRubberMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.7,
      metalness: 0.3,
    });
    const visorGlassMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.1,
      metalness: 0.9,
    });

    // Crouch posture hierarchy
    const crouchPivot = new THREE.Group();
    crouchPivot.position.y = 0.8;

    // Torso (Yellow Hazmat Jacket)
    const torsoGeo = new THREE.BoxGeometry(0.7, 0.75, 0.45);
    const torso = new THREE.Mesh(torsoGeo, suitMat);
    torso.position.y = 0.5;
    torso.castShadow = true;
    crouchPivot.add(torso);

    // Life-Support Oxygen Backpack
    const tankGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.6, 12);
    const tank1 = new THREE.Mesh(tankGeo, blackRubberMat);
    tank1.position.set(-0.15, 0.5, -0.3);
    crouchPivot.add(tank1);
    const tank2 = new THREE.Mesh(tankGeo, blackRubberMat);
    tank2.position.set(0.15, 0.5, -0.3);
    crouchPivot.add(tank2);

    // Hazmat Hood Helmet
    const hoodGeo = new THREE.SphereGeometry(0.3, 16, 16);
    hoodGeo.scale(0.9, 1.0, 0.95);
    const hood = new THREE.Mesh(hoodGeo, suitMat);
    hood.position.set(0, 1.05, 0.05);
    hood.castShadow = true;
    crouchPivot.add(hood);

    // Black Tinted Face Shield Visor
    const visorGeo = new THREE.SphereGeometry(0.18, 12, 12, 0, Math.PI);
    const faceShield = new THREE.Mesh(visorGeo, visorGlassMat);
    faceShield.position.set(0, 1.05, 0.2);
    faceShield.rotation.y = -Math.PI / 2;
    crouchPivot.add(faceShield);

    // Crouched Arms (Bracing on crates)
    const armGeo = new THREE.BoxGeometry(0.2, 0.6, 0.2);
    const leftArm = new THREE.Mesh(armGeo, suitMat);
    leftArm.position.set(-0.45, 0.4, 0.2);
    leftArm.rotation.x = Math.PI / 4;
    crouchPivot.add(leftArm);

    const rightArm = new THREE.Mesh(armGeo, suitMat);
    rightArm.position.set(0.45, 0.4, 0.2);
    rightArm.rotation.x = Math.PI / 3;
    crouchPivot.add(rightArm);

    // Crouched Kneeling Legs
    const legGeo = new THREE.BoxGeometry(0.24, 0.65, 0.24);
    const leftLeg = new THREE.Mesh(legGeo, suitMat);
    leftLeg.position.set(-0.2, -0.2, 0.15);
    leftLeg.rotation.x = -Math.PI / 3;
    crouchPivot.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, suitMat);
    rightLeg.position.set(0.2, -0.2, 0.15);
    rightLeg.rotation.x = -Math.PI / 3;
    crouchPivot.add(rightLeg);

    // Black Rubber Boots
    const bootGeo = new THREE.BoxGeometry(0.24, 0.2, 0.35);
    const leftBoot = new THREE.Mesh(bootGeo, blackRubberMat);
    leftBoot.position.set(-0.2, -0.5, -0.1);
    crouchPivot.add(leftBoot);

    const rightBoot = new THREE.Mesh(bootGeo, blackRubberMat);
    rightBoot.position.set(0.2, -0.5, -0.1);
    crouchPivot.add(rightBoot);

    group.add(crouchPivot);

    const animateIdle = (time: number) => {
      // Trembling / looking around in fear
      crouchPivot.position.y = 0.8 + Math.sin(time * 3) * 0.04;
      hood.rotation.y = Math.sin(time * 1.5) * 0.25;
      rightArm.rotation.z = Math.sin(time * 6) * 0.1; // waving hand for help
    };

    return {
      group,
      isRescued: false,
      animateIdle,
    };
  }

  // 4. SCOUT RECON BOTS (AGILE RED SWARM AUTOMATONS)
  public createScoutBot() {
    const group = new THREE.Group();

    const chassisMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.3,
      metalness: 0.85,
    });
    const redGlowMat = new THREE.MeshBasicMaterial({ color: 0xff0044 });

    // Spherical Central Eye Drone
    const bodyGeo = new THREE.SphereGeometry(0.6, 16, 16);
    const body = new THREE.Mesh(bodyGeo, chassisMat);
    body.position.y = 1.0;
    body.castShadow = true;
    group.add(body);

    // Glowing Crimson Ocular Sensor
    const eyeGeo = new THREE.SphereGeometry(0.25, 12, 12);
    const eye = new THREE.Mesh(eyeGeo, redGlowMat);
    eye.position.set(0, 1.0, 0.45);
    group.add(eye);

    const eyeLight = new THREE.PointLight(0xff0044, 2.0, 8);
    eyeLight.position.set(0, 1.0, 0.6);
    group.add(eyeLight);

    // 3 Spider-like Hover Limbs
    for (let i = 0; i < 3; i++) {
      const legGeo = new THREE.CylinderGeometry(0.04, 0.06, 0.8, 6);
      const leg = new THREE.Mesh(legGeo, chassisMat);
      const angle = (i * Math.PI * 2) / 3;
      leg.position.set(Math.cos(angle) * 0.5, 0.5, Math.sin(angle) * 0.5);
      leg.rotation.z = Math.cos(angle) * 0.4;
      leg.rotation.x = Math.sin(angle) * 0.4;
      group.add(leg);
    }

    const animateBob = (time: number) => {
      body.position.y = 1.0 + Math.sin(time * 4) * 0.12;
      eye.position.y = 1.0 + Math.sin(time * 4) * 0.12;
      eyeLight.position.y = 1.0 + Math.sin(time * 4) * 0.12;
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
