// 3D Entity Models for Circuit Breaker: Overlink
// Unit-7 (Player), MK-IV Titan Mech, Trapped Scientists, and Scout Bots
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
  setAllied: (isAllied: boolean) => void;
  animateWalk: (time: number, isMoving: boolean) => void;
}

export interface ScientistEntity {
  group: THREE.Group;
  isRescued: boolean;
  animateIdle: (time: number) => void;
}

export class EntityModelFactory {
  // 1. UNIT-7 (BLUE CYBERNETIC PLAYER)
  public createUnit7(): Unit7Entity {
    const group = new THREE.Group();

    // High-tech materials
    const armorMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.25,
      metalness: 0.85,
    });
    const darkMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.4,
      metalness: 0.9,
    });
    const cyanGlowMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });

    // Torso
    const torsoGeo = new THREE.BoxGeometry(0.8, 1.1, 0.45);
    const torso = new THREE.Mesh(torsoGeo, armorMat);
    torso.position.y = 1.35;
    torso.castShadow = true;
    group.add(torso);

    // Glowing Chest Reactor
    const coreGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.1, 16);
    coreGeo.rotateX(Math.PI / 2);
    const core = new THREE.Mesh(coreGeo, cyanGlowMat);
    core.position.set(0, 1.45, 0.25);
    group.add(core);

    // Head with Cyan Visor Band
    const headGeo = new THREE.BoxGeometry(0.48, 0.48, 0.48);
    const head = new THREE.Mesh(headGeo, darkMat);
    head.position.y = 2.1;
    head.castShadow = true;
    group.add(head);

    const visorGeo = new THREE.BoxGeometry(0.46, 0.12, 0.1);
    const visor = new THREE.Mesh(visorGeo, cyanGlowMat);
    visor.position.set(0, 2.12, 0.25);
    group.add(visor);

    // Left Arm (Shielded)
    const armGeo = new THREE.BoxGeometry(0.24, 0.85, 0.24);
    const leftArmPivot = new THREE.Group();
    leftArmPivot.position.set(-0.55, 1.7, 0);
    const leftArm = new THREE.Mesh(armGeo, armorMat);
    leftArm.position.y = -0.4;
    leftArm.castShadow = true;
    leftArmPivot.add(leftArm);
    group.add(leftArmPivot);

    // Right Arm (Holding EMP Blaster Rifle)
    const rightArmPivot = new THREE.Group();
    rightArmPivot.position.set(0.55, 1.7, 0);
    const rightArm = new THREE.Mesh(armGeo, armorMat);
    rightArm.position.y = -0.4;
    rightArm.castShadow = true;
    rightArmPivot.add(rightArm);

    // EMP Blaster Rifle
    const rifleGeo = new THREE.BoxGeometry(0.18, 0.24, 1.1);
    const rifle = new THREE.Mesh(rifleGeo, darkMat);
    rifle.position.set(0.08, -0.65, 0.4);
    rifle.castShadow = true;
    rightArmPivot.add(rifle);

    const barrelGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.4, 8);
    barrelGeo.rotateX(Math.PI / 2);
    const barrel = new THREE.Mesh(barrelGeo, cyanGlowMat);
    barrel.position.set(0.08, -0.62, 0.95);
    rightArmPivot.add(barrel);

    group.add(rightArmPivot);

    // Left Leg
    const legGeo = new THREE.BoxGeometry(0.28, 0.9, 0.28);
    const leftLegPivot = new THREE.Group();
    leftLegPivot.position.set(-0.25, 0.9, 0);
    const leftLeg = new THREE.Mesh(legGeo, darkMat);
    leftLeg.position.y = -0.45;
    leftLeg.castShadow = true;
    leftLegPivot.add(leftLeg);
    group.add(leftLegPivot);

    // Right Leg
    const rightLegPivot = new THREE.Group();
    rightLegPivot.position.set(0.25, 0.9, 0);
    const rightLeg = new THREE.Mesh(legGeo, darkMat);
    rightLeg.position.y = -0.45;
    rightLeg.castShadow = true;
    rightLegPivot.add(rightLeg);
    group.add(rightLegPivot);

    // Laser Sight Beam (Extending from weapon muzzle to crosshair on floor)
    const laserMat = new THREE.LineBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.65,
    });
    const laserGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, 10),
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
        leftArmPivot.rotation.x = -angle * 0.8;
      } else {
        leftLegPivot.rotation.x = 0;
        rightLegPivot.rotation.x = 0;
        leftArmPivot.rotation.x = 0;
      }
    };

    const updateLaserAim = (targetPoint: THREE.Vector3) => {
      // World position of weapon muzzle
      const muzzleLocal = new THREE.Vector3(0.63, 1.08, 0.95);
      muzzleLocal.applyMatrix4(group.matrixWorld);
      weaponMuzzle.copy(muzzleLocal);

      // Point laser at target
      const points = [
        new THREE.Vector3(0.63, 1.08, 0.95),
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

  // 2. MK-IV TITAN MECH (TOWERING BIPEDAL BATTLE MECH)
  public createTitanMech(): TitanMechEntity {
    const group = new THREE.Group();

    // Heavy Mech Materials
    const chassisMat = new THREE.MeshStandardMaterial({
      color: 0x1f2937,
      roughness: 0.35,
      metalness: 0.8,
    });
    const armorPlatesMat = new THREE.MeshStandardMaterial({
      color: 0x374151,
      roughness: 0.25,
      metalness: 0.9,
    });

    // Ocular Visor Material (Starts Red, switches to Cyan when hacked)
    const visorMat = new THREE.MeshBasicMaterial({ color: 0xff1133 });

    // Main Torso (Heavy Angular Box)
    const torsoGeo = new THREE.BoxGeometry(2.4, 2.0, 1.6);
    const torso = new THREE.Mesh(torsoGeo, chassisMat);
    torso.position.y = 3.2;
    torso.castShadow = true;
    group.add(torso);

    // Chest Core Vent
    const coreGeo = new THREE.BoxGeometry(0.8, 0.6, 0.2);
    const chestCore = new THREE.Mesh(coreGeo, visorMat);
    chestCore.position.set(0, 3.4, 0.85);
    group.add(chestCore);

    // Heavy Mech Head & Glowing Eye Visor
    const headGeo = new THREE.BoxGeometry(1.2, 0.7, 1.0);
    const head = new THREE.Mesh(headGeo, armorPlatesMat);
    head.position.set(0, 4.35, 0.2);
    head.castShadow = true;
    group.add(head);

    const visorGeo = new THREE.BoxGeometry(0.9, 0.18, 0.2);
    const visorMesh = new THREE.Mesh(visorGeo, visorMat);
    visorMesh.position.set(0, 4.38, 0.75);
    group.add(visorMesh);

    // Glowing point light cast by visor
    const visorLight = new THREE.PointLight(0xff1133, 3.5, 12);
    visorLight.position.set(0, 4.38, 1.2);
    group.add(visorLight);

    // Shoulder Cannons / Exhausts
    const exhaustGeo = new THREE.CylinderGeometry(0.25, 0.35, 1.2, 8);
    const leftExhaust = new THREE.Mesh(exhaustGeo, armorPlatesMat);
    leftExhaust.position.set(-1.1, 4.4, -0.6);
    leftExhaust.rotation.x = -Math.PI / 6;
    group.add(leftExhaust);

    const rightExhaust = new THREE.Mesh(exhaustGeo, armorPlatesMat);
    rightExhaust.position.set(1.1, 4.4, -0.6);
    rightExhaust.rotation.x = -Math.PI / 6;
    group.add(rightExhaust);

    // Massive Articulated Arms
    const upperArmGeo = new THREE.BoxGeometry(0.55, 1.6, 0.55);
    const forearmGeo = new THREE.BoxGeometry(0.65, 1.4, 0.65);

    const leftArmPivot = new THREE.Group();
    leftArmPivot.position.set(-1.5, 3.7, 0);
    const leftUpper = new THREE.Mesh(upperArmGeo, chassisMat);
    leftUpper.position.y = -0.7;
    leftUpper.castShadow = true;
    leftArmPivot.add(leftUpper);
    const leftForearm = new THREE.Mesh(forearmGeo, armorPlatesMat);
    leftForearm.position.set(0, -1.6, 0.3);
    leftForearm.castShadow = true;
    leftArmPivot.add(leftForearm);
    group.add(leftArmPivot);

    const rightArmPivot = new THREE.Group();
    rightArmPivot.position.set(1.5, 3.7, 0);
    const rightUpper = new THREE.Mesh(upperArmGeo, chassisMat);
    rightUpper.position.y = -0.7;
    rightUpper.castShadow = true;
    rightArmPivot.add(rightUpper);
    const rightForearm = new THREE.Mesh(forearmGeo, armorPlatesMat);
    rightForearm.position.set(0, -1.6, 0.3);
    rightForearm.castShadow = true;
    rightArmPivot.add(rightForearm);
    group.add(rightArmPivot);

    // Heavy Hydraulic Bipedal Legs
    const thighGeo = new THREE.BoxGeometry(0.7, 1.6, 0.7);
    const shinGeo = new THREE.BoxGeometry(0.8, 1.5, 0.8);
    const footGeo = new THREE.BoxGeometry(1.1, 0.4, 1.5);

    const leftLegPivot = new THREE.Group();
    leftLegPivot.position.set(-0.7, 2.3, 0);
    const leftThigh = new THREE.Mesh(thighGeo, chassisMat);
    leftThigh.position.y = -0.7;
    leftThigh.castShadow = true;
    leftLegPivot.add(leftThigh);
    const leftShin = new THREE.Mesh(shinGeo, armorPlatesMat);
    leftShin.position.set(0, -1.8, -0.1);
    leftShin.castShadow = true;
    leftLegPivot.add(leftShin);
    const leftFoot = new THREE.Mesh(footGeo, armorPlatesMat);
    leftFoot.position.set(0, -2.4, 0.2);
    leftFoot.castShadow = true;
    leftLegPivot.add(leftFoot);
    group.add(leftLegPivot);

    const rightLegPivot = new THREE.Group();
    rightLegPivot.position.set(0.7, 2.3, 0);
    const rightThigh = new THREE.Mesh(thighGeo, chassisMat);
    rightThigh.position.y = -0.7;
    rightThigh.castShadow = true;
    rightLegPivot.add(rightThigh);
    const rightShin = new THREE.Mesh(shinGeo, armorPlatesMat);
    rightShin.position.set(0, -1.8, -0.1);
    rightShin.castShadow = true;
    rightLegPivot.add(rightShin);
    const rightFoot = new THREE.Mesh(footGeo, armorPlatesMat);
    rightFoot.position.set(0, -2.4, 0.2);
    rightFoot.castShadow = true;
    rightLegPivot.add(rightFoot);
    group.add(rightLegPivot);

    const setAllied = (isAllied: boolean) => {
      const color = isAllied ? 0x00f0ff : 0xff1133;
      visorMat.color.setHex(color);
      visorLight.color.setHex(color);
    };

    const animateWalk = (time: number, isMoving: boolean) => {
      if (isMoving) {
        const angle = Math.sin(time * 6) * 0.4;
        leftLegPivot.rotation.x = angle;
        rightLegPivot.rotation.x = -angle;
        leftArmPivot.rotation.x = -angle * 0.6;
        rightArmPivot.rotation.x = angle * 0.6;
      } else {
        leftLegPivot.rotation.x = 0;
        rightLegPivot.rotation.x = 0;
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
      setAllied,
      animateWalk,
    };
  }

  // 3. TRAPPED SCIENTISTS (YELLOW HAZARD JUMPSUIT)
  public createScientist(): ScientistEntity {
    const group = new THREE.Group();

    const suitMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // Yellow hazard suit as in concept art
      roughness: 0.6,
      metalness: 0.2,
    });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.7 });

    // Body (Crouching pose behind crates)
    const bodyGeo = new THREE.BoxGeometry(0.5, 0.6, 0.35);
    const body = new THREE.Mesh(bodyGeo, suitMat);
    body.position.y = 0.55;
    body.castShadow = true;
    group.add(body);

    // Head
    const headGeo = new THREE.SphereGeometry(0.2, 12, 12);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.set(0, 0.95, 0.05);
    head.castShadow = true;
    group.add(head);

    // Hazard Mask
    const maskGeo = new THREE.BoxGeometry(0.18, 0.12, 0.15);
    const maskMat = new THREE.MeshStandardMaterial({ color: 0x1f2937 });
    const mask = new THREE.Mesh(maskGeo, maskMat);
    mask.position.set(0, 0.92, 0.18);
    group.add(mask);

    // Waving Arm (Calling for rescue)
    const armGeo = new THREE.BoxGeometry(0.14, 0.5, 0.14);
    const waveArm = new THREE.Mesh(armGeo, suitMat);
    waveArm.position.set(0.35, 0.85, 0);
    group.add(waveArm);

    const animateIdle = (time: number) => {
      // Trembling / waving arm animation
      waveArm.rotation.z = Math.sin(time * 8) * 0.4 + 0.3;
      body.position.y = 0.55 + Math.sin(time * 4) * 0.03;
    };

    return { group, isRescued: false, animateIdle };
  }
}

export const entityFactory = new EntityModelFactory();
