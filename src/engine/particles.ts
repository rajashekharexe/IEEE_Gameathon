// High-performance Particle and Floating Text Engine

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  glow?: boolean;
}

export interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  vy: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  scale: number;
}

export interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  alpha: number;
  width: number;
}

export class ParticleSystem {
  public particles: Particle[] = [];
  public texts: FloatingText[] = [];
  public shockwaves: Shockwave[] = [];
  private textCounter = 0;

  // Trigger bursting explosion
  public emitExplosion(x: number, y: number, color: string, count = 25, speed = 6) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const velocity = (Math.random() * 0.8 + 0.2) * speed;
      const life = 20 + Math.random() * 30;

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        size: Math.random() * 4 + 2,
        color,
        alpha: 1,
        life,
        maxLife: life,
        glow: true,
      });
    }

    // Add subtle expanding shockwave
    this.shockwaves.push({
      x,
      y,
      radius: 5,
      maxRadius: 40 + count,
      color,
      alpha: 0.8,
      width: 3,
    });
  }

  // Floating score or crit text
  public emitText(text: string, x: number, y: number, color = '#38bdf8', scale = 1) {
    this.texts.push({
      id: ++this.textCounter,
      text,
      x: x + (Math.random() * 20 - 10),
      y,
      vy: -1.8,
      color,
      alpha: 1,
      life: 45,
      maxLife: 45,
      scale,
    });
  }

  // Update physics every frame
  public update(friction = 0.96) {
    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= friction;
      p.vy *= friction;
      p.life--;
      p.alpha = Math.max(0, p.life / p.maxLife);

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update Floating Texts
    for (let i = this.texts.length - 1; i >= 0; i--) {
      const t = this.texts[i];
      t.y += t.vy;
      t.life--;
      t.alpha = Math.max(0, t.life / t.maxLife);

      if (t.life <= 0) {
        this.texts.splice(i, 1);
      }
    }

    // Update Shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += 3.5;
      sw.alpha *= 0.92;
      sw.width = Math.max(0.5, sw.width * 0.95);

      if (sw.radius >= sw.maxRadius || sw.alpha <= 0.05) {
        this.shockwaves.splice(i, 1);
      }
    }
  }

  // Render to 2D Canvas context
  public render(ctx: CanvasRenderingContext2D) {
    ctx.save();

    // Shockwaves
    for (const sw of this.shockwaves) {
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.strokeStyle = sw.color;
      ctx.globalAlpha = sw.alpha;
      ctx.lineWidth = sw.width;
      ctx.stroke();
    }

    // Particles
    for (const p of this.particles) {
      ctx.globalAlpha = p.alpha;
      if (p.glow) {
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
      }
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (p.life / p.maxLife), 0, Math.PI * 2);
      ctx.fill();
    }

    // Texts
    ctx.shadowBlur = 0;
    for (const t of this.texts) {
      ctx.globalAlpha = t.alpha;
      ctx.font = `bold ${Math.floor(16 * t.scale)}px sans-serif`;
      ctx.fillStyle = t.color;
      ctx.textAlign = 'center';
      ctx.fillText(t.text, t.x, t.y);
    }

    ctx.restore();
  }

  public clear() {
    this.particles = [];
    this.texts = [];
    this.shockwaves = [];
  }
}
