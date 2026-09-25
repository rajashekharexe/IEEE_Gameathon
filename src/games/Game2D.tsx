import React, { useEffect, useRef } from 'react';
import { input } from '../engine/input';
import { sounds } from '../engine/audio';
import { ParticleSystem } from '../engine/particles';
import { ScreenShake } from '../engine/screenshake';

interface Game2DProps {
  score: number;
  health: number;
  energy: number;
  wave: number;
  multiplier: number;
  godMode: boolean;
  onUpdateStats: (stats: {
    score?: number;
    health?: number;
    energy?: number;
    wave?: number;
    multiplier?: number;
    enemiesDefeated?: number;
  }) => void;
  onGameOver: () => void;
}

interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  isEnemy?: boolean;
}

interface Enemy {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hp: number;
  maxHp: number;
  color: string;
  speed: number;
  points: number;
  type: 'chaser' | 'speeder' | 'tank';
  shootCooldown?: number;
}

interface Drop {
  x: number;
  y: number;
  radius: number;
  type: 'health' | 'energy' | 'nuke';
  color: string;
  life: number;
}

export const Game2D: React.FC<Game2DProps> = ({
  score,
  health,
  energy,
  wave,
  multiplier,
  godMode,
  onUpdateStats,
  onGameOver,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Engine References
  const particlesRef = useRef(new ParticleSystem());
  const shakeRef = useRef(new ScreenShake());

  // Game State Refs (avoid React state lag inside 60 FPS loop)
  const stateRef = useRef({
    score,
    health,
    energy,
    wave,
    multiplier,
    godMode,
    enemiesDefeated: 0,
    player: {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      radius: 16,
      angle: 0,
      speed: 5.5,
      dashCooldown: 0,
      fireCooldown: 0,
      dashTime: 0,
      tripleShotTimer: 0,
    },
    bullets: [] as Bullet[],
    enemies: [] as Enemy[],
    drops: [] as Drop[],
    enemySpawnTimer: 0,
    comboTimer: 0,
    enemyIdCounter: 0,
    isRunning: true,
  });

  // Sync props to refs
  useEffect(() => {
    stateRef.current.godMode = godMode;
  }, [godMode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const particles = particlesRef.current;
    const shake = shakeRef.current;
    const s = stateRef.current;

    // Handle Resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Main Game Loop (60 FPS)
    const loop = () => {
      if (!s.isRunning) return;

      const width = canvas.width;
      const height = canvas.height;
      const p = s.player;

      // 1. UPDATE PLAYER MOVEMENT
      let dx = 0;
      let dy = 0;
      if (input.isActionPressed('left')) dx -= 1;
      if (input.isActionPressed('right')) dx += 1;
      if (input.isActionPressed('up')) dy -= 1;
      if (input.isActionPressed('down')) dy += 1;

      // Normalize diagonal speed
      if (dx !== 0 && dy !== 0) {
        dx *= 0.7071;
        dy *= 0.7071;
      }

      // Dash Action
      if (p.dashCooldown > 0) p.dashCooldown--;
      if (p.dashTime > 0) {
        p.dashTime--;
        p.speed = 13;
        // Emit dash trail
        particles.emitExplosion(p.x, p.y, '#38bdf8', 2, 2);
      } else {
        p.speed = 5.5;
      }

      if (input.isActionPressed('dash') && p.dashCooldown <= 0 && s.energy >= 20) {
        p.dashTime = 12;
        p.dashCooldown = 40;
        s.energy = Math.max(0, s.energy - 20);
        sounds.playDash();
        shake.addTrauma(0.2);
        particles.emitExplosion(p.x, p.y, '#06b6d4', 15, 6);
      }

      // Recharging Energy
      if (s.energy < 100) {
        s.energy = Math.min(100, s.energy + 0.15);
      }

      p.x += dx * p.speed;
      p.y += dy * p.speed;

      // Clamp player within screen boundaries
      p.x = Math.max(p.radius, Math.min(width - p.radius, p.x));
      p.y = Math.max(p.radius, Math.min(height - p.radius, p.y));

      // Calculate player angle facing mouse
      const mouse = input.state.mouse;
      p.angle = Math.atan2(mouse.y - p.y, mouse.x - p.x);

      // Thruster particle exhaust
      if (dx !== 0 || dy !== 0) {
        const exhaustAngle = p.angle + Math.PI + (Math.random() * 0.4 - 0.2);
        const exX = p.x - Math.cos(p.angle) * p.radius;
        const exY = p.y - Math.sin(p.angle) * p.radius;
        particles.particles.push({
          x: exX,
          y: exY,
          vx: Math.cos(exhaustAngle) * (Math.random() * 3 + 1),
          vy: Math.sin(exhaustAngle) * (Math.random() * 3 + 1),
          size: Math.random() * 3 + 1.5,
          color: Math.random() > 0.5 ? '#06b6d4' : '#38bdf8',
          alpha: 0.8,
          life: 15,
          maxLife: 15,
          glow: true,
        });
      }

      // 2. PLAYER SHOOTING
      if (p.fireCooldown > 0) p.fireCooldown--;
      if (p.tripleShotTimer > 0) p.tripleShotTimer--;

      if (input.isActionPressed('fire') && p.fireCooldown <= 0) {
        const bulletSpeed = 14;
        sounds.playShoot(p.tripleShotTimer > 0 ? 1100 : 880);
        shake.addTrauma(0.12);

        if (p.tripleShotTimer > 0) {
          // Triple Shot
          [-0.2, 0, 0.2].forEach((offsetAngle) => {
            const finalAngle = p.angle + offsetAngle;
            s.bullets.push({
              x: p.x + Math.cos(finalAngle) * p.radius,
              y: p.y + Math.sin(finalAngle) * p.radius,
              vx: Math.cos(finalAngle) * bulletSpeed,
              vy: Math.sin(finalAngle) * bulletSpeed,
              radius: 4,
              color: '#f43f5e',
            });
          });
          p.fireCooldown = 9;
        } else {
          // Standard Dual Shot
          [-6, 6].forEach((offsetY) => {
            const perpX = -Math.sin(p.angle) * offsetY;
            const perpY = Math.cos(p.angle) * offsetY;
            s.bullets.push({
              x: p.x + Math.cos(p.angle) * p.radius + perpX,
              y: p.y + Math.sin(p.angle) * p.radius + perpY,
              vx: Math.cos(p.angle) * bulletSpeed,
              vy: Math.sin(p.angle) * bulletSpeed,
              radius: 3.5,
              color: '#38bdf8',
            });
          });
          p.fireCooldown = 11;
        }
      }

      // 3. SPAWN ENEMIES IN WAVES
      s.enemySpawnTimer++;
      const spawnRate = Math.max(25, 90 - s.wave * 10);
      if (s.enemySpawnTimer >= spawnRate) {
        s.enemySpawnTimer = 0;

        // Spawn along random border
        let ex = 0;
        let ey = 0;
        if (Math.random() < 0.5) {
          ex = Math.random() < 0.5 ? -30 : width + 30;
          ey = Math.random() * height;
        } else {
          ex = Math.random() * width;
          ey = Math.random() < 0.5 ? -30 : height + 30;
        }

        const rand = Math.random();
        let type: 'chaser' | 'speeder' | 'tank' = 'chaser';
        let radius = 14;
        let hp = 2;
        let speed = 2.2 + s.wave * 0.2;
        let color = '#ec4899';
        let points = 100;

        if (rand > 0.8) {
          type = 'tank';
          radius = 24;
          hp = 6 + s.wave;
          speed = 1.3;
          color = '#f59e0b';
          points = 350;
        } else if (rand > 0.55) {
          type = 'speeder';
          radius = 11;
          hp = 1;
          speed = 4.2 + s.wave * 0.3;
          color = '#06b6d4';
          points = 200;
        }

        s.enemies.push({
          id: ++s.enemyIdCounter,
          x: ex,
          y: ey,
          vx: 0,
          vy: 0,
          radius,
          hp,
          maxHp: hp,
          color,
          speed,
          points,
          type,
          shootCooldown: type === 'tank' ? 90 : undefined,
        });
      }

      // Wave Progression
      if (s.enemiesDefeated > 0 && s.enemiesDefeated % 20 === 0 && s.enemySpawnTimer === 0) {
        s.wave++;
        sounds.playPowerup();
        particles.emitText(`WAVE ${s.wave} INCOMING!`, width / 2, height / 2 - 50, '#f59e0b', 1.8);
      }

      // 4. UPDATE BULLETS
      for (let i = s.bullets.length - 1; i >= 0; i--) {
        const b = s.bullets[i];
        b.x += b.vx;
        b.y += b.vy;

        // Despawn off-screen
        if (b.x < -50 || b.x > width + 50 || b.y < -50 || b.y > height + 50) {
          s.bullets.splice(i, 1);
          continue;
        }

        // Bullet vs Player (if enemy bullet)
        if (b.isEnemy) {
          const dist = Math.hypot(b.x - p.x, b.y - p.y);
          if (dist < b.radius + p.radius) {
            s.bullets.splice(i, 1);
            if (!s.godMode) {
              s.health -= 15;
              sounds.playHit();
              shake.addTrauma(0.4);
              particles.emitExplosion(p.x, p.y, '#f43f5e', 15);
              if (s.health <= 0) {
                s.isRunning = false;
                onGameOver();
                return;
              }
            }
          }
          continue;
        }

        // Bullet vs Enemy Collision
        for (let j = s.enemies.length - 1; j >= 0; j--) {
          const e = s.enemies[j];
          const dist = Math.hypot(b.x - e.x, b.y - e.y);

          if (dist < b.radius + e.radius) {
            // Hit enemy
            e.hp--;
            s.bullets.splice(i, 1);
            sounds.playHit();
            particles.emitExplosion(b.x, b.y, e.color, 8, 3);

            if (e.hp <= 0) {
              // Enemy Destroyed!
              s.enemies.splice(j, 1);
              s.enemiesDefeated++;
              sounds.playExplosion(e.type === 'tank' ? 'large' : 'small');
              shake.addTrauma(e.type === 'tank' ? 0.45 : 0.25);
              particles.emitExplosion(e.x, e.y, e.color, e.type === 'tank' ? 40 : 22, 7);

              // Combo and Score
              s.comboTimer = 180;
              s.multiplier = Math.min(8, s.multiplier + 0.5);
              const earnedScore = Math.floor(e.points * s.multiplier);
              s.score += earnedScore;
              particles.emitText(`+${earnedScore}`, e.x, e.y, '#38bdf8', 1.2);

              // Random Item Drop
              if (Math.random() < 0.25) {
                const dropRand = Math.random();
                s.drops.push({
                  x: e.x,
                  y: e.y,
                  radius: 12,
                  type: dropRand < 0.5 ? 'energy' : dropRand < 0.85 ? 'health' : 'nuke',
                  color: dropRand < 0.5 ? '#06b6d4' : dropRand < 0.85 ? '#10b981' : '#f59e0b',
                  life: 600,
                });
              }
            }
            break;
          }
        }
      }

      // Combo Decay
      if (s.comboTimer > 0) {
        s.comboTimer--;
        if (s.comboTimer <= 0) {
          s.multiplier = 1;
        }
      }

      // 5. UPDATE ENEMIES
      for (let i = s.enemies.length - 1; i >= 0; i--) {
        const e = s.enemies[i];
        const angleToPlayer = Math.atan2(p.y - e.y, p.x - e.x);

        e.vx = Math.cos(angleToPlayer) * e.speed;
        e.vy = Math.sin(angleToPlayer) * e.speed;

        e.x += e.vx;
        e.y += e.vy;

        // Tank Enemy Shooting
        if (e.shootCooldown !== undefined) {
          e.shootCooldown--;
          if (e.shootCooldown <= 0) {
            e.shootCooldown = 110;
            s.bullets.push({
              x: e.x,
              y: e.y,
              vx: Math.cos(angleToPlayer) * 5,
              vy: Math.sin(angleToPlayer) * 5,
              radius: 5,
              color: '#f59e0b',
              isEnemy: true,
            });
          }
        }

        // Enemy vs Player Body Collision
        const dist = Math.hypot(p.x - e.x, p.y - e.y);
        if (dist < p.radius + e.radius) {
          if (!s.godMode) {
            s.health -= 25;
            sounds.playExplosion('small');
            shake.addTrauma(0.5);
            particles.emitExplosion(p.x, p.y, '#f43f5e', 25, 6);

            if (s.health <= 0) {
              s.isRunning = false;
              onGameOver();
              return;
            }
          }
          // Push enemy back
          e.x -= Math.cos(angleToPlayer) * 40;
          e.y -= Math.sin(angleToPlayer) * 40;
        }
      }

      // 6. UPDATE DROPS (Powerups)
      for (let i = s.drops.length - 1; i >= 0; i--) {
        const d = s.drops[i];
        d.life--;
        if (d.life <= 0) {
          s.drops.splice(i, 1);
          continue;
        }

        const dist = Math.hypot(p.x - d.x, p.y - d.y);
        if (dist < p.radius + d.radius + 15) {
          // Collected!
          sounds.playPowerup();
          s.drops.splice(i, 1);

          if (d.type === 'health') {
            s.health = Math.min(100, s.health + 30);
            particles.emitText('+REPAIR!', p.x, p.y - 20, '#10b981', 1.4);
          } else if (d.type === 'energy') {
            p.tripleShotTimer = 400; // Overcharged weapon
            particles.emitText('OVERCHARGE!', p.x, p.y - 20, '#06b6d4', 1.4);
          } else if (d.type === 'nuke') {
            // Wipe screen enemies
            shake.addTrauma(0.8);
            sounds.playExplosion('large');
            s.enemies.forEach((e) => {
              particles.emitExplosion(e.x, e.y, e.color, 25, 7);
              s.score += e.points;
            });
            s.enemiesDefeated += s.enemies.length;
            s.enemies = [];
            particles.emitText('EMP PULSE WIPED!', width / 2, height / 2, '#f59e0b', 2);
          }
        }
      }

      // 7. RENDER FRAME
      ctx.clearRect(0, 0, width, height);

      // Apply Camera Screen Shake
      ctx.save();
      shake.update();
      shake.applyToContext(ctx, width / 2, height / 2);

      // Render Cyber Grid Background
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)';
      ctx.lineWidth = 1;
      const gridSize = 50;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Render Drops
      for (const d of s.drops) {
        ctx.save();
        ctx.shadowColor = d.color;
        ctx.shadowBlur = 15;
        ctx.fillStyle = d.color;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.radius + Math.sin(Date.now() * 0.008) * 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Render Bullets
      for (const b of s.bullets) {
        ctx.save();
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 12;
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Render Enemies
      for (const e of s.enemies) {
        ctx.save();
        ctx.shadowColor = e.color;
        ctx.shadowBlur = 14;
        ctx.fillStyle = e.color;

        ctx.beginPath();
        if (e.type === 'speeder') {
          // Sharp Triangle
          const angle = Math.atan2(e.vy, e.vx);
          ctx.translate(e.x, e.y);
          ctx.rotate(angle);
          ctx.moveTo(e.radius * 1.5, 0);
          ctx.lineTo(-e.radius, -e.radius);
          ctx.lineTo(-e.radius, e.radius);
          ctx.closePath();
        } else if (e.type === 'tank') {
          // Hexagon
          ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
        } else {
          // Chaser
          ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
        }
        ctx.fill();

        // Mini HP Bar over tanks
        if (e.type === 'tank') {
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(e.x - 20, e.y - e.radius - 10, 40, 4);
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(e.x - 20, e.y - e.radius - 10, (e.hp / e.maxHp) * 40, 4);
        }

        ctx.restore();
      }

      // Render Player Ship
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);

      // Player Glow & Shield
      ctx.shadowColor = s.godMode ? '#f59e0b' : '#06b6d4';
      ctx.shadowBlur = 20;

      // Ship Hull (Sleek sci-fi dart)
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = s.godMode ? '#f59e0b' : '#38bdf8';
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      ctx.moveTo(p.radius * 1.4, 0); // Nose
      ctx.lineTo(-p.radius, -p.radius * 0.9); // Left wing
      ctx.lineTo(-p.radius * 0.5, 0); // Engine indent
      ctx.lineTo(-p.radius, p.radius * 0.9); // Right wing
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Energy Cockpit
      ctx.fillStyle = p.tripleShotTimer > 0 ? '#f43f5e' : '#38bdf8';
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Update & Render Particles & Floating Texts
      particles.update();
      particles.render(ctx);

      ctx.restore(); // Restore camera shake

      // Push periodic stats back to React HUD
      onUpdateStats({
        score: s.score,
        health: s.health,
        energy: s.energy,
        wave: s.wave,
        multiplier: s.multiplier,
        enemiesDefeated: s.enemiesDefeated,
      });

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [onGameOver, onUpdateStats]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full block cursor-crosshair z-10"
    />
  );
};
