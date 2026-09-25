// Procedural 3D Characters & Nature Generator (Three.js)
// Generates stylized 3D Humans, Dogs, Trees, and Cars purely through code!
// 100% Offline, Zero external 3D files needed!

import * as THREE from 'three';

export class Procedural3DModels {
  // 1. STYLIZED 3D HUMANOID (Walk/Run Animated Hierarchy)
  public createHumanoid(options?: {
    shirtColor?: number;
    pantsColor?: number;
    skinColor?: number;
  }) {
    const shirt = options?.shirtColor ?? 0x0284c7;
    const pants = options?.pantsColor ?? 0x1e293b;
    const skin = options?.skinColor ?? 0xfcd34d;

    const group = new THREE.Group();

    // Materials
    const skinMat = new THREE.MeshStandardMaterial({ color: skin, roughness: 0.5 });
    const shirtMat = new THREE.MeshStandardMaterial({ color: shirt, roughness: 0.6 });
    const pantsMat = new THREE.MeshStandardMaterial({ color: pants, roughness: 0.7 });

    // Head
    const headGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.y = 1.9;
    head.castShadow = true;
    group.add(head);

    // Torso
    const torsoGeo = new THREE.BoxGeometry(0.7, 0.9, 0.4);
    const torso = new THREE.Mesh(torsoGeo, shirtMat);
    torso.position.y = 1.25;
    torso.castShadow = true;
    group.add(torso);

    // Left Arm Pivot
    const armGeo = new THREE.BoxGeometry(0.22, 0.8, 0.22);
    const leftArmPivot = new THREE.Group();
    leftArmPivot.position.set(-0.48, 1.6, 0);
    const leftArm = new THREE.Mesh(armGeo, shirtMat);
    leftArm.position.y = -0.35;
    leftArm.castShadow = true;
    leftArmPivot.add(leftArm);
    group.add(leftArmPivot);

    // Right Arm Pivot
    const rightArmPivot = new THREE.Group();
    rightArmPivot.position.set(0.48, 1.6, 0);
    const rightArm = new THREE.Mesh(armGeo, shirtMat);
    rightArm.position.y = -0.35;
    rightArm.castShadow = true;
    rightArmPivot.add(rightArm);
    group.add(rightArmPivot);

    // Left Leg Pivot
    const legGeo = new THREE.BoxGeometry(0.28, 0.8, 0.28);
    const leftLegPivot = new THREE.Group();
    leftLegPivot.position.set(-0.2, 0.8, 0);
    const leftLeg = new THREE.Mesh(legGeo, pantsMat);
    leftLeg.position.y = -0.4;
    leftLeg.castShadow = true;
    leftLegPivot.add(leftLeg);
    group.add(leftLegPivot);

    // Right Leg Pivot
    const rightLegPivot = new THREE.Group();
    rightLegPivot.position.set(0.2, 0.8, 0);
    const rightLeg = new THREE.Mesh(legGeo, pantsMat);
    rightLeg.position.y = -0.4;
    rightLeg.castShadow = true;
    rightLegPivot.add(rightLeg);
    group.add(rightLegPivot);

    // Animation helper method
    const animateWalk = (time: number, speed = 8) => {
      const angle = Math.sin(time * speed) * 0.6;
      leftLegPivot.rotation.x = angle;
      rightLegPivot.rotation.x = -angle;
      leftArmPivot.rotation.x = -angle;
      rightArmPivot.rotation.x = angle;
    };

    return { group, animateWalk, leftLegPivot, rightLegPivot, leftArmPivot, rightArmPivot };
  }

  // 2. STYLIZED 3D DOG / QUADRUPED (Trot & Tail Wag Animation)
  public createDog(options?: { furColor?: number }) {
    const fur = options?.furColor ?? 0xd97706; // Golden retriever / warm amber
    const group = new THREE.Group();

    const furMat = new THREE.MeshStandardMaterial({ color: fur, roughness: 0.8 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.6 });

    // Body
    const bodyGeo = new THREE.BoxGeometry(0.6, 0.5, 1.1);
    const body = new THREE.Mesh(bodyGeo, furMat);
    body.position.y = 0.55;
    body.castShadow = true;
    group.add(body);

    // Head
    const headGeo = new THREE.BoxGeometry(0.4, 0.4, 0.45);
    const head = new THREE.Mesh(headGeo, furMat);
    head.position.set(0, 0.85, 0.6);
    head.castShadow = true;
    group.add(head);

    // Snout
    const snoutGeo = new THREE.BoxGeometry(0.25, 0.2, 0.3);
    const snout = new THREE.Mesh(snoutGeo, darkMat);
    snout.position.set(0, 0.77, 0.9);
    group.add(snout);

    // Ears
    const earGeo = new THREE.BoxGeometry(0.1, 0.25, 0.15);
    const leftEar = new THREE.Mesh(earGeo, darkMat);
    leftEar.position.set(-0.22, 0.95, 0.55);
    group.add(leftEar);

    const rightEar = new THREE.Mesh(earGeo, darkMat);
    rightEar.position.set(0.22, 0.95, 0.55);
    group.add(rightEar);

    // Tail Pivot
    const tailPivot = new THREE.Group();
    tailPivot.position.set(0, 0.7, -0.55);
    const tailGeo = new THREE.CylinderGeometry(0.04, 0.06, 0.4);
    const tail = new THREE.Mesh(tailGeo, furMat);
    tail.position.set(0, 0.15, -0.15);
    tail.rotation.x = -Math.PI / 4;
    tailPivot.add(tail);
    group.add(tailPivot);

    // 4 Legs Pivots
    const legGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.45);

    const flPivot = new THREE.Group(); // Front-Left
    flPivot.position.set(-0.22, 0.35, 0.4);
    const flLeg = new THREE.Mesh(legGeo, furMat);
    flLeg.position.y = -0.15;
    flPivot.add(flLeg);
    group.add(flPivot);

    const frPivot = new THREE.Group(); // Front-Right
    frPivot.position.set(0.22, 0.35, 0.4);
    const frLeg = new THREE.Mesh(legGeo, furMat);
    frLeg.position.y = -0.15;
    frPivot.add(frLeg);
    group.add(frPivot);

    const blPivot = new THREE.Group(); // Back-Left
    blPivot.position.set(-0.22, 0.35, -0.4);
    const blLeg = new THREE.Mesh(legGeo, furMat);
    blLeg.position.y = -0.15;
    blPivot.add(blLeg);
    group.add(blPivot);

    const brPivot = new THREE.Group(); // Back-Right
    brPivot.position.set(0.22, 0.35, -0.4);
    const brLeg = new THREE.Mesh(legGeo, furMat);
    brLeg.position.y = -0.15;
    brPivot.add(brLeg);
    group.add(brPivot);

    // Animation: Trot & Wag
    const animateTrot = (time: number, speed = 10) => {
      const angle = Math.sin(time * speed) * 0.45;
      flPivot.rotation.x = angle;
      brPivot.rotation.x = angle;
      frPivot.rotation.x = -angle;
      blPivot.rotation.x = -angle;
      tailPivot.rotation.y = Math.sin(time * 20) * 0.5; // Happy wag
    };

    return { group, animateTrot, tailPivot };
  }

  // 3. STYLIZED 3D TREE (Pine or Lush Foliage with wind sway)
  public createTree(type: 'oak' | 'pine' = 'oak') {
    const group = new THREE.Group();

    // Trunk
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
    const trunkGeo = new THREE.CylinderGeometry(0.25, 0.35, 2.2, 7);
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 1.1;
    trunk.castShadow = true;
    group.add(trunk);

    if (type === 'pine') {
      // 3 Stacked Cones
      const pineMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 });
      [
        { r: 1.4, h: 1.6, y: 2.2 },
        { r: 1.1, h: 1.4, y: 3.1 },
        { r: 0.7, h: 1.2, y: 3.9 },
      ].forEach((layer) => {
        const coneGeo = new THREE.ConeGeometry(layer.r, layer.h, 6);
        const cone = new THREE.Mesh(coneGeo, pineMat);
        cone.position.y = layer.y;
        cone.castShadow = true;
        group.add(cone);
      });
    } else {
      // Oak / Cloud Foliage
      const oakMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.7 });
      const foliageGroup = new THREE.Group();
      foliageGroup.position.y = 2.8;

      [
        { r: 1.2, x: 0, y: 0, z: 0 },
        { r: 0.8, x: 0.5, y: 0.4, z: 0.2 },
        { r: 0.85, x: -0.5, y: 0.3, z: -0.3 },
        { r: 0.7, x: 0, y: 0.8, z: 0 },
      ].forEach((blob) => {
        const sphereGeo = new THREE.IcosahedronGeometry(blob.r, 1);
        const sphere = new THREE.Mesh(sphereGeo, oakMat);
        sphere.position.set(blob.x, blob.y, blob.z);
        sphere.castShadow = true;
        foliageGroup.add(sphere);
      });

      group.add(foliageGroup);
    }

    return group;
  }

  // 4. STYLIZED 3D VEHICLE / CAR (Chassis, Cabin, 4 Rotating Wheels)
  public createCar(color = 0xef4444) {
    const group = new THREE.Group();

    const carMat = new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.6 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1, metalness: 0.9 });
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 });

    // Chassis
    const baseGeo = new THREE.BoxGeometry(2.0, 0.45, 4.0);
    const base = new THREE.Mesh(baseGeo, carMat);
    base.position.y = 0.5;
    base.castShadow = true;
    group.add(base);

    // Cabin
    const cabinGeo = new THREE.BoxGeometry(1.6, 0.65, 2.0);
    const cabin = new THREE.Mesh(cabinGeo, glassMat);
    cabin.position.set(0, 1.0, -0.2);
    cabin.castShadow = true;
    group.add(cabin);

    // 4 Wheels
    const wheels: THREE.Mesh[] = [];
    const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.3, 16);
    wheelGeo.rotateZ(Math.PI / 2);

    const positions = [
      [-1.0, 0.35, 1.2],
      [1.0, 0.35, 1.2],
      [-1.0, 0.35, -1.2],
      [1.0, 0.35, -1.2],
    ];

    positions.forEach((pos) => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.position.set(pos[0], pos[1], pos[2]);
      wheel.castShadow = true;
      group.add(wheel);
      wheels.push(wheel);
    });

    const rotateWheels = (speed: number) => {
      wheels.forEach((w) => (w.rotation.x += speed));
    };

    return { group, rotateWheels };
  }
}

export const proceduralModels = new Procedural3DModels();
