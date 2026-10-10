import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  color: string;
  glowColor: string;
  baseAlpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
  layer: number; // 0: distant, 1: mid, 2: foreground
  sparkle: boolean;
}

interface Particle {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  pulsePhase: number;
  pulseSpeed: number;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  alpha: number;
  color: string;
  trailWidth: number;
  life: number;
  maxLife: number;
}

const STAR_COLORS = [
  { fill: '#f8fafc', glow: 'rgba(255, 255, 255, 0.7)' }, // soft white
  { fill: '#38bdf8', glow: 'rgba(56, 189, 248, 0.7)' },  // cyan
  { fill: '#60a5fa', glow: 'rgba(96, 165, 250, 0.7)' },  // light blue
  { fill: '#c084fc', glow: 'rgba(192, 132, 252, 0.7)' }, // purple
  { fill: '#f472b6', glow: 'rgba(244, 114, 182, 0.65)' }, // pink
  { fill: '#a78bfa', glow: 'rgba(167, 139, 250, 0.65)' }, // violet
  { fill: '#34d399', glow: 'rgba(52, 211, 153, 0.6)' },  // subtle emerald green accent
];

const PARTICLE_COLORS = [
  'rgba(56, 189, 248, 0.15)', // cyan haze
  'rgba(168, 85, 247, 0.12)', // purple haze
  'rgba(236, 72, 153, 0.1)',  // pink haze
  'rgba(96, 165, 250, 0.15)', // blue haze
  'rgba(16, 185, 129, 0.12)', // emerald haze
];

export const StarrySpaceBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Mouse parallax tracking
    const mouse = {
      targetX: 0,
      targetY: 0,
      currentX: 0,
      currentY: 0,
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Normalized between -1 and 1
      mouse.targetX = (e.clientX / (window.innerWidth || 1)) * 2 - 1;
      mouse.targetY = (e.clientY / (window.innerHeight || 1)) * 2 - 1;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Entities
    let stars: Star[] = [];
    let particles: Particle[] = [];
    let shootingStars: ShootingStar[] = [];
    let nextShootingStarTime = performance.now() + 2000;

    const initEntities = () => {
      const area = width * height;
      // Adjust star count dynamically based on resolution
      const starCount = Math.floor(Math.min(320, Math.max(120, area / 6000)));
      stars = [];

      for (let i = 0; i < starCount; i++) {
        const colorObj = STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)];
        const layerRand = Math.random();
        const layer = layerRand < 0.55 ? 0 : layerRand < 0.88 ? 1 : 2;

        let size: number;
        let baseAlpha: number;
        let sparkle = false;

        if (layer === 0) {
          // Distant micro stars
          size = 0.6 + Math.random() * 0.7;
          baseAlpha = 0.3 + Math.random() * 0.4;
        } else if (layer === 1) {
          // Mid-distance colorful stars
          size = 1.2 + Math.random() * 1.0;
          baseAlpha = 0.5 + Math.random() * 0.4;
          sparkle = Math.random() < 0.25;
        } else {
          // Foreground bright luminous stars
          size = 2.0 + Math.random() * 1.2;
          baseAlpha = 0.75 + Math.random() * 0.25;
          sparkle = Math.random() < 0.6;
        }

        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size,
          color: colorObj.fill,
          glowColor: colorObj.glow,
          baseAlpha,
          twinkleSpeed: 0.0015 + Math.random() * 0.0035,
          twinklePhase: Math.random() * Math.PI * 2,
          layer,
          sparkle,
        });
      }

      // Floating dust particles (cosmic nebulous dust)
      const particleCount = prefersReducedMotion ? 10 : 24;
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: 20 + Math.random() * 50,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
          alpha: 0.03 + Math.random() * 0.06,
          color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
          pulsePhase: Math.random() * Math.PI * 2,
          pulseSpeed: 0.001 + Math.random() * 0.002,
        });
      }
    };

    const handleResize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);
      initEntities();
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const spawnShootingStar = (time: number) => {
      if (prefersReducedMotion) return;

      const angle = (Math.PI / 4) + (Math.random() - 0.5) * 0.3; // ~45 degrees diagonal
      const startX = Math.random() * (width * 0.8);
      const startY = Math.random() * (height * 0.4);
      const speed = 7 + Math.random() * 6;
      const length = 90 + Math.random() * 110;
      const colors = ['#f8fafc', '#38bdf8', '#c084fc', '#60a5fa', '#34d399'];
      const chosenColor = colors[Math.floor(Math.random() * colors.length)];

      shootingStars.push({
        x: startX,
        y: startY,
        length,
        speed,
        angle,
        alpha: 1,
        color: chosenColor,
        trailWidth: 1.5 + Math.random() * 1.0,
        life: 0,
        maxLife: 60 + Math.random() * 40,
      });

      // Schedule next meteor between 3.5s and 7.5s
      nextShootingStarTime = time + (3500 + Math.random() * 4000);
    };

    // Render loop
    let lastTime = performance.now();

    const render = (time: number) => {
      const delta = Math.min(50, time - lastTime);
      lastTime = time;

      // Parallax smooth interpolation
      if (!prefersReducedMotion) {
        mouse.currentX += (mouse.targetX - mouse.currentX) * 0.05;
        mouse.currentY += (mouse.targetY - mouse.currentY) * 0.05;
      }

      // Draw space background canvas gradient (Midnight Navy & Deep Black)
      ctx.clearRect(0, 0, width, height);

      // Deep space base gradient
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#040816');   // deep interstellar navy
      bgGrad.addColorStop(0.35, '#020617'); // obsidian midnight
      bgGrad.addColorStop(0.7, '#030712');  // deep cosmic black
      bgGrad.addColorStop(1, '#010409');    // pure void
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Subtle atmospheric nebula clouds
      const nebula1 = ctx.createRadialGradient(
        width * 0.25 + mouse.currentX * 25,
        height * 0.25 + mouse.currentY * 25,
        20,
        width * 0.25,
        height * 0.25,
        width * 0.45
      );
      nebula1.addColorStop(0, 'rgba(30, 58, 138, 0.16)');  // deep indigo
      nebula1.addColorStop(0.5, 'rgba(88, 28, 135, 0.08)'); // subtle purple
      nebula1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = nebula1;
      ctx.fillRect(0, 0, width, height);

      const nebula2 = ctx.createRadialGradient(
        width * 0.8 - mouse.currentX * 30,
        height * 0.65 - mouse.currentY * 30,
        40,
        width * 0.8,
        height * 0.65,
        width * 0.5
      );
      nebula2.addColorStop(0, 'rgba(6, 78, 59, 0.12)');    // emerald glow
      nebula2.addColorStop(0.4, 'rgba(14, 116, 144, 0.08)'); // cyan glow
      nebula2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = nebula2;
      ctx.fillRect(0, 0, width, height);

      // Render floating dust particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (!prefersReducedMotion) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < -p.radius) p.x = width + p.radius;
          if (p.x > width + p.radius) p.x = -p.radius;
          if (p.y < -p.radius) p.y = height + p.radius;
          if (p.y > height + p.radius) p.y = -p.radius;
          p.pulsePhase += p.pulseSpeed * delta;
        }

        const pulse = Math.sin(p.pulsePhase) * 0.3 + 0.7;
        const pGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
        pGrad.addColorStop(0, p.color);
        pGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.save();
        ctx.globalAlpha = p.alpha * pulse;
        ctx.fillStyle = pGrad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Parallax layer factors
      const layerOffsets = [
        { x: mouse.currentX * 8, y: mouse.currentY * 8 },    // layer 0: distant
        { x: mouse.currentX * 18, y: mouse.currentY * 18 },  // layer 1: mid
        { x: mouse.currentX * 32, y: mouse.currentY * 32 },  // layer 2: foreground
      ];

      // Render stars
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        const offset = layerOffsets[star.layer];
        const renderX = star.x + offset.x;
        const renderY = star.y + offset.y;

        // Twinkle calculation
        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinklePhase);
        const alpha = Math.max(0.15, Math.min(1, star.baseAlpha + twinkle * 0.35));

        ctx.save();
        ctx.globalAlpha = alpha;

        // Glow halo for mid and foreground stars
        if (star.layer >= 1) {
          ctx.shadowBlur = star.layer === 2 ? 10 : 5;
          ctx.shadowColor = star.glowColor;
        }

        ctx.fillStyle = star.color;
        ctx.beginPath();
        ctx.arc(renderX, renderY, star.size, 0, Math.PI * 2);
        ctx.fill();

        // Cross sparkle for select luminous stars
        if (star.sparkle && alpha > 0.7) {
          ctx.strokeStyle = star.glowColor;
          ctx.lineWidth = 0.75;
          const flareLen = star.size * 2.8;

          ctx.beginPath();
          ctx.moveTo(renderX - flareLen, renderY);
          ctx.lineTo(renderX + flareLen, renderY);
          ctx.moveTo(renderX, renderY - flareLen);
          ctx.lineTo(renderX, renderY + flareLen);
          ctx.stroke();
        }

        ctx.restore();
      }

      // Shooting stars management
      if (time > nextShootingStarTime) {
        spawnShootingStar(time);
      }

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const meteor = shootingStars[i];
        meteor.life += delta;

        // Progress
        const progress = meteor.life / meteor.maxLife;
        meteor.x += Math.cos(meteor.angle) * meteor.speed;
        meteor.y += Math.sin(meteor.angle) * meteor.speed;

        // Fade out
        const currentAlpha = Math.sin(progress * Math.PI) * 0.95;

        // Calculate tail
        const tailX = meteor.x - Math.cos(meteor.angle) * meteor.length;
        const tailY = meteor.y - Math.sin(meteor.angle) * meteor.length;

        const meteorGrad = ctx.createLinearGradient(meteor.x, meteor.y, tailX, tailY);
        meteorGrad.addColorStop(0, meteor.color);
        meteorGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
        meteorGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.save();
        ctx.globalAlpha = Math.max(0, currentAlpha);
        ctx.strokeStyle = meteorGrad;
        ctx.lineWidth = meteor.trailWidth;
        ctx.lineCap = 'round';
        ctx.shadowBlur = 12;
        ctx.shadowColor = meteor.color;

        ctx.beginPath();
        ctx.moveTo(meteor.x, meteor.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        // Luminous head sparkle
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(meteor.x, meteor.y, meteor.trailWidth * 1.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        if (meteor.life >= meteor.maxLife) {
          shootingStars.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none -z-10"
      style={{
        display: 'block',
        pointerEvents: 'none',
        zIndex: -10,
      }}
      aria-hidden="true"
    />
  );
};
