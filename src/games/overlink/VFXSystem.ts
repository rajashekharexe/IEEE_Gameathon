// High-Performance 3D Spark Particle & Floating Combat Text Engine
import * as THREE from 'three';

export interface FloatingTextItem {
  id: number;
  text: string;
  worldPos: THREE.Vector3;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  offsetY: number;
}

interface SparkParticle {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  color: THREE.Color;
  life: number;
  maxLife: number;
  size: number;
}

export interface InGameWaypoint {
  pos: THREE.Vector3;
  label: string;
  sublabel?: string;
  color: string;
  icon?: string;
  dist?: number;
}

export class VFXSystem {
  private maxParticles = 300;
  private sparks: SparkParticle[] = [];
  public floatingTexts: FloatingTextItem[] = [];
  private textCounter = 0;
  private tempVec = new THREE.Vector3();

  // Three.js Point Cloud
  private pointsGeo: THREE.BufferGeometry;
  private pointsMat: THREE.PointsMaterial;
  public pointsMesh: THREE.Points;

  private posArray: Float32Array;
  private colArray: Float32Array;

  // Screen Vignette Flash States (0 to 1)
  public damageFlash = 0;
  public shieldFlash = 0;
  public bossAlertFlash = 0;

  constructor(scene: THREE.Scene) {
    this.posArray = new Float32Array(this.maxParticles * 3);
    this.colArray = new Float32Array(this.maxParticles * 3);

    this.pointsGeo = new THREE.BufferGeometry();
    this.pointsGeo.setAttribute('position', new THREE.BufferAttribute(this.posArray, 3));
    this.pointsGeo.setAttribute('color', new THREE.BufferAttribute(this.colArray, 3));

    this.pointsMat = new THREE.PointsMaterial({
      size: 0.35,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.pointsMesh = new THREE.Points(this.pointsGeo, this.pointsMat);
    this.pointsMesh.frustumCulled = false;
    scene.add(this.pointsMesh);
  }

  // Emit 3D Sparks with physics & gravity
  public emitSparks(pos: THREE.Vector3, count: number, hexColor: number, speed = 8, isUpward = false) {
    const col = new THREE.Color(hexColor);
    const overflow = (this.sparks.length + count) - this.maxParticles;
    if (overflow > 0) {
      this.sparks.splice(0, overflow);
    }

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const elev = isUpward ? Math.random() * Math.PI * 0.5 : (Math.random() - 0.5) * Math.PI;
      const spd = (Math.random() * 0.7 + 0.3) * speed;

      const vx = Math.cos(angle) * Math.cos(elev) * spd;
      const vy = Math.sin(elev) * spd + (isUpward ? 3 : 1);
      const vz = Math.sin(angle) * Math.cos(elev) * spd;

      this.sparks.push({
        pos: pos.clone(),
        vel: new THREE.Vector3(vx, vy, vz),
        color: col.clone(),
        life: 0.4 + Math.random() * 0.5,
        maxLife: 0.9,
        size: Math.random() * 0.2 + 0.2,
      });
    }
  }

  // Emit 3D Floating Combat Text
  public emitText(worldPos: THREE.Vector3, text: string, color = '#38bdf8', size = 18, isCrit = false) {
    this.floatingTexts.push({
      id: ++this.textCounter,
      text: isCrit ? `💥 ${text}!` : text,
      worldPos: worldPos.clone(),
      color,
      size: isCrit ? Math.round(size * 1.35) : size,
      alpha: 1.0,
      life: 1.2,
      maxLife: 1.2,
      offsetY: Math.random() * 0.4,
    });
  }

  // Trigger damage edge vignette
  public triggerDamageFlash() {
    this.damageFlash = 0.85;
  }

  // Trigger shield edge vignette
  public triggerShieldFlash() {
    this.shieldFlash = 0.85;
  }

  // Trigger boss warning vignette
  public triggerBossAlertFlash() {
    this.bossAlertFlash = 1.0;
  }

  // Update per frame
  public update(delta: number) {
    // 1. Update Sparks
    const gravity = 18;
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const p = this.sparks[i];
      p.life -= delta;
      p.vel.y -= gravity * delta;
      p.pos.addScaledVector(p.vel, delta);

      // Bounce on floor (y = 0.1)
      if (p.pos.y < 0.1) {
        p.pos.y = 0.1;
        p.vel.y = -p.vel.y * 0.35;
        p.vel.x *= 0.7;
        p.vel.z *= 0.7;
      }

      if (p.life <= 0) {
        this.sparks.splice(i, 1);
      }
    }

    // Update Three.js buffer
    const posAttr = this.pointsGeo.attributes.position as THREE.BufferAttribute;
    const colAttr = this.pointsGeo.attributes.color as THREE.BufferAttribute;

    for (let i = 0; i < this.maxParticles; i++) {
      if (i < this.sparks.length) {
        const s = this.sparks[i];
        this.posArray[i * 3] = s.pos.x;
        this.posArray[i * 3 + 1] = s.pos.y;
        this.posArray[i * 3 + 2] = s.pos.z;

        const alpha = Math.max(0, s.life / s.maxLife);
        this.colArray[i * 3] = s.color.r * alpha;
        this.colArray[i * 3 + 1] = s.color.g * alpha;
        this.colArray[i * 3 + 2] = s.color.b * alpha;
      } else {
        this.posArray[i * 3] = 99999;
        this.posArray[i * 3 + 1] = 99999;
        this.posArray[i * 3 + 2] = 99999;
      }
    }
    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;

    // 2. Update Floating Texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const t = this.floatingTexts[i];
      t.life -= delta;
      t.offsetY += delta * 1.8;
      t.alpha = Math.max(0, t.life / t.maxLife);

      if (t.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }

    // 3. Decay Screen Flashes
    if (this.damageFlash > 0) {
      this.damageFlash = Math.max(0, this.damageFlash - delta * 2.8);
    }
    if (this.shieldFlash > 0) {
      this.shieldFlash = Math.max(0, this.shieldFlash - delta * 3.2);
    }
    if (this.bossAlertFlash > 0) {
      this.bossAlertFlash = Math.max(0, this.bossAlertFlash - delta * 1.5);
    }
  }

  // Render 2D Floating Combat Text & In-Game Waypoints onto overlay Canvas
  public renderOverlay(
    ctx: CanvasRenderingContext2D,
    camera: THREE.Camera,
    width: number,
    height: number,
    waypoints?: InGameWaypoint[]
  ) {
    ctx.clearRect(0, 0, width, height);

    // 1. Draw Screen Edge Vignette
    if (this.damageFlash > 0.02) {
      ctx.save();
      const grad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        Math.min(width, height) * 0.4,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.8
      );
      grad.addColorStop(0, 'rgba(255, 0, 50, 0)');
      grad.addColorStop(1, `rgba(255, 0, 50, ${this.damageFlash * 0.5})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }

    if (this.shieldFlash > 0.02) {
      ctx.save();
      const grad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        Math.min(width, height) * 0.45,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.8
      );
      grad.addColorStop(0, 'rgba(0, 240, 255, 0)');
      grad.addColorStop(1, `rgba(0, 240, 255, ${this.shieldFlash * 0.45})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }

    const tempVec = this.tempVec;

    // 2. Render In-Game Holographic Waypoints
    if (waypoints && waypoints.length > 0) {
      for (const wp of waypoints) {
        tempVec.copy(wp.pos);
        tempVec.project(camera);

        if (tempVec.z > -1.0 && tempVec.z < 1.0) {
          const sx = (tempVec.x * 0.5 + 0.5) * width;
          const sy = (-tempVec.y * 0.5 + 0.5) * height;

          if (sx > 40 && sx < width - 40 && sy > 40 && sy < height - 40) {
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const labelText = wp.label;
            const subText = wp.sublabel || (wp.dist !== undefined ? `${Math.round(wp.dist)}m` : '');

            ctx.font = 'bold 11px monospace';
            const textWidth = Math.max(ctx.measureText(labelText).width, ctx.measureText(subText).width) + 20;
            const boxHeight = subText ? 32 : 20;

            // Translucent cyber badge background
            ctx.fillStyle = 'rgba(15, 23, 42, 0.90)';
            ctx.strokeStyle = wp.color;
            ctx.lineWidth = 1.5;

            ctx.beginPath();
            if (ctx.roundRect) {
              ctx.roundRect(sx - textWidth / 2, sy - boxHeight / 2, textWidth, boxHeight, 6);
            } else {
              ctx.rect(sx - textWidth / 2, sy - boxHeight / 2, textWidth, boxHeight);
            }
            ctx.fill();
            ctx.stroke();

            // Downward pointer arrow
            ctx.fillStyle = wp.color;
            ctx.beginPath();
            ctx.moveTo(sx, sy + boxHeight / 2 + 5);
            ctx.lineTo(sx - 4, sy + boxHeight / 2);
            ctx.lineTo(sx + 4, sy + boxHeight / 2);
            ctx.closePath();
            ctx.fill();

            // Waypoint Label
            ctx.fillStyle = wp.color;
            ctx.font = 'bold 11px monospace';
            ctx.fillText(labelText, sx, subText ? sy - 6 : sy);

            if (subText) {
              ctx.fillStyle = '#94a3b8';
              ctx.font = '9px monospace';
              ctx.fillText(subText, sx, sy + 6);
            }
            ctx.restore();
          }
        }
      }
    }

    // 3. Draw Floating Texts projected to 2D
    ctx.save();
    for (const t of this.floatingTexts) {
      tempVec.copy(t.worldPos);
      tempVec.y += 2.0 + t.offsetY;
      tempVec.project(camera);

      // Check if inside frustum
      if (tempVec.z > -1.0 && tempVec.z < 1.0) {
        const screenX = (tempVec.x * 0.5 + 0.5) * width;
        const screenY = (-tempVec.y * 0.5 + 0.5) * height;

        ctx.globalAlpha = t.alpha;
        ctx.font = `900 ${t.size}px monospace`;
        ctx.textAlign = 'center';

        // Outer glow stroke
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.lineWidth = 4;
        ctx.strokeText(t.text, screenX, screenY);

        ctx.fillStyle = t.color;
        ctx.fillText(t.text, screenX, screenY);
      }
    }
    ctx.restore();
  }

  public dispose(scene: THREE.Scene) {
    scene.remove(this.pointsMesh);
    this.pointsGeo.dispose();
    this.pointsMat.dispose();
    this.sparks = [];
    this.floatingTexts = [];
  }
}
