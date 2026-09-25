// Procedural Vector Sprite & Texture Generator
// 100% Offline, Infinite Resolution, Zero image downloads required!

export class SpriteGenerator {
  private cache = new Map<string, HTMLCanvasElement>();

  // Generate glowing neon ship
  public createShipCanvas(color = '#06b6d4', size = 48): HTMLCanvasElement {
    const key = `ship_${color}_${size}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const center = size / 2;
    const r = size * 0.4;

    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(center + r, center);
    ctx.lineTo(center - r, center - r * 0.7);
    ctx.lineTo(center - r * 0.4, center);
    ctx.lineTo(center - r, center + r * 0.7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    this.cache.set(key, canvas);
    return canvas;
  }

  // Generate Biohazard / Virus / Enemy Drone
  public createVirusCanvas(color = '#ec4899', size = 40): HTMLCanvasElement {
    const key = `virus_${color}_${size}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const center = size / 2;
    const r = size * 0.35;

    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.fillStyle = color;

    // Core body
    ctx.beginPath();
    ctx.arc(center, center, r, 0, Math.PI * 2);
    ctx.fill();

    // Spikes around
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI * 2) / 8;
      const x1 = center + Math.cos(angle) * r;
      const y1 = center + Math.sin(angle) * r;
      const x2 = center + Math.cos(angle) * (r * 1.4);
      const y2 = center + Math.sin(angle) * (r * 1.4);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x2, y2, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    this.cache.set(key, canvas);
    return canvas;
  }

  // Generate Energy Core / Battery / Solar Cell
  public createEnergyCanvas(color = '#f59e0b', size = 32): HTMLCanvasElement {
    const key = `energy_${color}_${size}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const center = size / 2;

    ctx.shadowColor = color;
    ctx.shadowBlur = 15;
    ctx.fillStyle = color;

    // Lightning bolt shape
    ctx.beginPath();
    ctx.moveTo(center + 2, center - 12);
    ctx.lineTo(center - 8, center + 1);
    ctx.lineTo(center - 1, center + 1);
    ctx.lineTo(center - 4, center + 12);
    ctx.lineTo(center + 8, center - 1);
    ctx.lineTo(center + 1, center - 1);
    ctx.closePath();
    ctx.fill();

    this.cache.set(key, canvas);
    return canvas;
  }

  // Generate Starfield / Noise Background Texture for 2D/3D
  public createStarfieldTexture(width = 512, height = 512, starCount = 150): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#050714';
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < starCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const r = Math.random() * 1.5 + 0.5;
      const alpha = Math.random() * 0.7 + 0.3;

      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    return canvas;
  }
}

export const sprites = new SpriteGenerator();
