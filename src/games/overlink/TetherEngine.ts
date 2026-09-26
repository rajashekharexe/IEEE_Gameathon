// Electric Cyan Neural Tether Engine for Circuit Breaker: Overlink
import * as THREE from 'three';

export interface TetherState {
  isActive: boolean;
  progress: number; // 0 to 100
  target: THREE.Object3D | null;
  origin: THREE.Vector3;
}

export class NeuralTetherEngine {
  private tetherLine: THREE.Line;
  private glowLine: THREE.Line;
  private pointsCount = 24;
  private sparks: { mesh: THREE.Mesh; velocity: THREE.Vector3; life: number }[] = [];
  private sparkGeo = new THREE.SphereGeometry(0.08, 6, 6);
  private sparkMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });

  public state: TetherState = {
    isActive: false,
    progress: 0,
    target: null,
    origin: new THREE.Vector3(),
  };

  constructor(scene: THREE.Scene) {
    // 1. Core Electric Beam
    const lineMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      linewidth: 3,
      transparent: true,
      opacity: 0.9,
    });
    const lineGeo = new THREE.BufferGeometry().setFromPoints(
      new Array(this.pointsCount).fill(new THREE.Vector3())
    );
    this.tetherLine = new THREE.Line(lineGeo, lineMat);
    this.tetherLine.frustumCulled = false;
    scene.add(this.tetherLine);

    // 2. Cyan Glow Outer Beam
    const glowMat = new THREE.LineBasicMaterial({
      color: 0x00f0ff,
      linewidth: 6,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const glowGeo = new THREE.BufferGeometry().setFromPoints(
      new Array(this.pointsCount).fill(new THREE.Vector3())
    );
    this.glowLine = new THREE.Line(glowGeo, glowMat);
    this.glowLine.frustumCulled = false;
    scene.add(this.glowLine);

    // Pre-create sparks pool
    for (let i = 0; i < 30; i++) {
      const spark = new THREE.Mesh(this.sparkGeo, this.sparkMat);
      spark.visible = false;
      scene.add(spark);
      this.sparks.push({
        mesh: spark,
        velocity: new THREE.Vector3(),
        life: 0,
      });
    }
  }

  public activate(origin: THREE.Vector3, target: THREE.Object3D) {
    this.state.isActive = true;
    this.state.target = target;
    this.state.origin.copy(origin);
    this.tetherLine.visible = true;
    this.glowLine.visible = true;
  }

  public deactivate() {
    this.state.isActive = false;
    this.state.target = null;
    this.state.progress = 0;
    this.tetherLine.visible = false;
    this.glowLine.visible = false;
  }

  public update(origin: THREE.Vector3, delta: number, time: number) {
    if (!this.state.isActive || !this.state.target) {
      this.tetherLine.visible = false;
      this.glowLine.visible = false;
      return;
    }

    this.state.origin.copy(origin);
    const targetPos = this.state.target.position.clone();
    targetPos.y += 3.2; // Chest height of Titan mech

    // Fill hacking progress
    this.state.progress = Math.min(100, this.state.progress + delta * 24);

    // Generate electric arc points with erratic sine/noise jitter
    const points: THREE.Vector3[] = [];
    for (let i = 0; i < this.pointsCount; i++) {
      const t = i / (this.pointsCount - 1);
      const pos = new THREE.Vector3().lerpVectors(origin, targetPos, t);

      if (i > 0 && i < this.pointsCount - 1) {
        // Add high-frequency electrical jitter
        const jitterFreq = time * 25 + i * 2;
        const jitterX = Math.sin(jitterFreq) * 0.35 * Math.sin(t * Math.PI);
        const jitterY = Math.cos(jitterFreq * 1.3) * 0.35 * Math.sin(t * Math.PI);
        const jitterZ = Math.sin(jitterFreq * 0.7) * 0.25 * Math.sin(t * Math.PI);
        pos.add(new THREE.Vector3(jitterX, jitterY, jitterZ));
      }
      points.push(pos);
    }

    this.tetherLine.geometry.setFromPoints(points);
    this.glowLine.geometry.setFromPoints(points);

    // Emit flying spark particles from target impact point
    if (Math.random() < 0.6) {
      this.emitSparks(targetPos, 3);
    }

    // Update active sparks
    this.sparks.forEach((s) => {
      if (s.life > 0) {
        s.mesh.position.addScaledVector(s.velocity, delta);
        s.velocity.y -= delta * 9.8; // gravity
        s.life -= delta;
        s.mesh.scale.setScalar(Math.max(0.01, s.life * 2));
        if (s.life <= 0) s.mesh.visible = false;
      }
    });
  }

  private emitSparks(center: THREE.Vector3, count = 2) {
    let spawned = 0;
    for (const s of this.sparks) {
      if (s.life <= 0) {
        s.mesh.position.copy(center);
        s.mesh.visible = true;
        s.life = 0.3 + Math.random() * 0.3;
        s.velocity.set(
          (Math.random() - 0.5) * 8,
          Math.random() * 5 + 2,
          (Math.random() - 0.5) * 8
        );
        s.mesh.scale.setScalar(1);
        spawned++;
        if (spawned >= count) break;
      }
    }
  }

  public dispose(scene: THREE.Scene) {
    scene.remove(this.tetherLine);
    scene.remove(this.glowLine);
    this.sparks.forEach((s) => scene.remove(s.mesh));
  }
}
