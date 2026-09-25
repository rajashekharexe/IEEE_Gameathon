// Game-feel Screen Shake based on Trauma & Damping physics

export class ScreenShake {
  private trauma = 0;
  private maxOffset = 18;
  private maxAngle = 0.05; // radians

  public offsetX = 0;
  public offsetY = 0;
  public angle = 0;

  // Add trauma (0.1 = subtle, 0.4 = gun hit, 0.8 = massive explosion)
  public addTrauma(amount: number) {
    this.trauma = Math.min(1.0, this.trauma + amount);
  }

  // Decay per frame (typically call in requestAnimationFrame)
  public update(decay = 0.04) {
    if (this.trauma > 0) {
      // Non-linear shake power (trauma squared feels much better than linear)
      const shake = this.trauma * this.trauma;

      this.offsetX = (Math.random() * 2 - 1) * this.maxOffset * shake;
      this.offsetY = (Math.random() * 2 - 1) * this.maxOffset * shake;
      this.angle = (Math.random() * 2 - 1) * this.maxAngle * shake;

      this.trauma = Math.max(0, this.trauma - decay);
    } else {
      this.offsetX = 0;
      this.offsetY = 0;
      this.angle = 0;
    }
  }

  // Helper to apply to 2D canvas context
  public applyToContext(ctx: CanvasRenderingContext2D, centerX: number, centerY: number) {
    if (this.trauma <= 0) return;
    ctx.translate(centerX + this.offsetX, centerY + this.offsetY);
    ctx.rotate(this.angle);
    ctx.translate(-centerX, -centerY);
  }
}
