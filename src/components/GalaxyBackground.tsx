import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  glowColor: string;
  baseAlpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
  layer: number; // 0: distant micro, 1: mid cosmic, 2: cluster
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  color: string;
  tailColor: string;
  width: number;
  life: number;
  maxLife: number;
}

interface CosmicDust {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  pulsePhase: number;
  pulseSpeed: number;
}

const COSMIC_COLORS = [
  { fill: '#ffffff', glow: 'rgba(255, 255, 255, 0.85)' }, // Diamond White
  { fill: '#38bdf8', glow: 'rgba(56, 189, 248, 0.85)' },  // Electric Cyan
  { fill: '#60a5fa', glow: 'rgba(96, 165, 250, 0.85)' },  // Stellar Blue
  { fill: '#c084fc', glow: 'rgba(192, 132, 252, 0.85)' }, // Celestial Purple
  { fill: '#f472b6', glow: 'rgba(244, 114, 182, 0.85)' }, // Cosmic Pink
  { fill: '#e879f9', glow: 'rgba(232, 121, 249, 0.85)' }, // Deep Magenta
  { fill: '#fbbf24', glow: 'rgba(251, 191, 36, 0.85)' },  // Radiant Gold
  { fill: '#34d399', glow: 'rgba(52, 211, 153, 0.75)' },  // Emerald Aurora
];

const DUST_COLORS = [
  'rgba(56, 189, 248, 0.14)',  // cyan haze
  'rgba(168, 85, 247, 0.13)',  // purple haze
  'rgba(236, 72, 153, 0.12)',  // magenta haze
  'rgba(59, 130, 246, 0.14)',  // electric blue haze
  'rgba(245, 158, 11, 0.10)',  // golden dust
  'rgba(16, 185, 129, 0.10)',  // aurora green
];

export const GalaxyBackground: React.FC = () => {
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

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Mouse parallax tracking
    const mouse = {
      targetX: 0,
      targetY: 0,
      currentX: 0,
      currentY: 0,
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = (e.clientX / (window.innerWidth || 1)) * 2 - 1;
      mouse.targetY = (e.clientY / (window.innerHeight || 1)) * 2 - 1;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    let stars: Star[] = [];
    let dustClouds: CosmicDust[] = [];
    let shootingStars: ShootingStar[] = [];
    let nextShootingStarTime = performance.now() + 1500;

    const initGalaxy = () => {
      const area = width * height;
      // Thousands of stars scaled by resolution: 1,200 to 2,200 stars
      const starCount = Math.floor(Math.min(2200, Math.max(900, area / 1200)));
      stars = [];

      for (let i = 0; i < starCount; i++) {
        const col = COSMIC_COLORS[Math.floor(Math.random() * COSMIC_COLORS.length)];
        const layerRand = Math.random();
        const layer = layerRand < 0.65 ? 0 : layerRand < 0.90 ? 1 : 2;

        let size: number;
        let baseAlpha: number;
        let vx: number;
        let vy: number;

        if (layer === 0) {
          // Distant micro stars (thousands of tiny sparkles)
          size = 0.5 + Math.random() * 0.7;
          baseAlpha = 0.25 + Math.random() * 0.45;
          vx = (Math.random() - 0.5) * 0.03;
          vy = (Math.random() - 0.5) * 0.03;
        } else if (layer === 1) {
          // Mid-field colorful stars
          size = 1.0 + Math.random() * 0.9;
          baseAlpha = 0.45 + Math.random() * 0.45;
          vx = (Math.random() - 0.5) * 0.06;
          vy = (Math.random() - 0.5) * 0.06;
        } else {
          // Cluster stars with vibrant luminosity
          size = 1.6 + Math.random() * 1.1;
          baseAlpha = 0.7 + Math.random() * 0.3;
          vx = (Math.random() - 0.5) * 0.1;
          vy = (Math.random() - 0.5) * 0.1;
        }

        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx,
          vy,
          size,
          color: col.fill,
          glowColor: col.glow,
          baseAlpha,
          twinkleSpeed: 0.0012 + Math.random() * 0.004,
          twinklePhase: Math.random() * Math.PI * 2,
          layer,
        });
      }

      // Cosmic dust particles (soft gaseous nebulae)
      const dustCount = prefersReducedMotion ? 12 : 32;
      dustClouds = [];
      for (let i = 0; i < dustCount; i++) {
        dustClouds.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.12,
          vy: (Math.random() - 0.5) * 0.12,
          radius: 35 + Math.random() * 95,
          color: DUST_COLORS[Math.floor(Math.random() * DUST_COLORS.length)],
          alpha: 0.035 + Math.random() * 0.07,
          pulsePhase: Math.random() * Math.PI * 2,
          pulseSpeed: 0.0008 + Math.random() * 0.0018,
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
      initGalaxy();
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const spawnShootingStar = (time: number) => {
      if (prefersReducedMotion) return;

      const angle = (Math.PI / 4) + (Math.random() - 0.5) * 0.35;
      const startX = Math.random() * (width * 0.85);
      const startY = Math.random() * (height * 0.45);
      const speed = 8 + Math.random() * 8;
      const length = 110 + Math.random() * 140;

      const meteorPalette = [
        { head: '#ffffff', tail: '#38bdf8' }, // white to electric cyan
        { head: '#ffffff', tail: '#e879f9' }, // white to magenta
        { head: '#fef08a', tail: '#c084fc' }, // gold to violet
        { head: '#67e8f9', tail: '#3b82f6' }, // cyan to deep blue
      ];
      const pal = meteorPalette[Math.floor(Math.random() * meteorPalette.length)];

      shootingStars.push({
        x: startX,
        y: startY,
        length,
        speed,
        angle,
        color: pal.head,
        tailColor: pal.tail,
        width: 1.6 + Math.random() * 1.2,
        life: 0,
        maxLife: 55 + Math.random() * 45,
      });

      // Spawn next shooting star in 2.5s to 6.5s
      nextShootingStarTime = time + (2500 + Math.random() * 4000);
    };

    let lastTime = performance.now();

    const render = (time: number) => {
      const delta = Math.min(50, time - lastTime);
      lastTime = time;

      // Smooth mouse parallax interpolation
      if (!prefersReducedMotion) {
        mouse.currentX += (mouse.targetX - mouse.currentX) * 0.04;
        mouse.currentY += (mouse.targetY - mouse.currentY) * 0.04;
      }

      ctx.clearRect(0, 0, width, height);

      // 1. Deep Midnight Base
      const spaceGrad = ctx.createLinearGradient(0, 0, width, height);
      spaceGrad.addColorStop(0, '#030718');    // Deepest Midnight Blue
      spaceGrad.addColorStop(0.35, '#020512'); // Cosmic Navy
      spaceGrad.addColorStop(0.70, '#01030a'); // Void Black
      spaceGrad.addColorStop(1, '#000206');    // True Obsidian
      ctx.fillStyle = spaceGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Swirling Multicolor Cosmic Nebulae
      // Nebula A: Electric Cyan & Deep Sapphire
      const nebA = ctx.createRadialGradient(
        width * 0.22 + mouse.currentX * 22,
        height * 0.28 + mouse.currentY * 22,
        30,
        width * 0.22,
        height * 0.28,
        width * 0.55
      );
      nebA.addColorStop(0, 'rgba(14, 165, 233, 0.16)');
      nebA.addColorStop(0.45, 'rgba(30, 58, 138, 0.10)');
      nebA.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = nebA;
      ctx.fillRect(0, 0, width, height);

      // Nebula B: Cosmic Purple & Radiant Violet
      const nebB = ctx.createRadialGradient(
        width * 0.78 - mouse.currentX * 28,
        height * 0.40 - mouse.currentY * 28,
        40,
        width * 0.78,
        height * 0.40,
        width * 0.60
      );
      nebB.addColorStop(0, 'rgba(168, 85, 247, 0.15)');
      nebB.addColorStop(0.5, 'rgba(124, 58, 237, 0.08)');
      nebB.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = nebB;
      ctx.fillRect(0, 0, width, height);

      // Nebula C: Vivid Magenta & Pink Haze (Center-lower)
      const nebC = ctx.createRadialGradient(
        width * 0.50 + mouse.currentX * 15,
        height * 0.75 + mouse.currentY * 15,
        25,
        width * 0.50,
        height * 0.75,
        width * 0.50
      );
      nebC.addColorStop(0, 'rgba(236, 72, 153, 0.12)');
      nebC.addColorStop(0.5, 'rgba(147, 51, 234, 0.06)');
      nebC.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = nebC;
      ctx.fillRect(0, 0, width, height);

      // Nebula D: Emerald Aurora Ribbon near top
      const nebD = ctx.createRadialGradient(
        width * 0.65 + mouse.currentX * 10,
        height * 0.08 + mouse.currentY * 10,
        15,
        width * 0.65,
        height * 0.08,
        width * 0.45
      );
      nebD.addColorStop(0, 'rgba(16, 185, 129, 0.11)');
      nebD.addColorStop(0.6, 'rgba(5, 150, 105, 0.03)');
      nebD.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = nebD;
      ctx.fillRect(0, 0, width, height);

      // 3. Floating Cosmic Dust Motes
      for (let i = 0; i < dustClouds.length; i++) {
        const d = dustClouds[i];
        if (!prefersReducedMotion) {
          d.x += d.vx;
          d.y += d.vy;
          if (d.x < -d.radius) d.x = width + d.radius;
          if (d.x > width + d.radius) d.x = -d.radius;
          if (d.y < -d.radius) d.y = height + d.radius;
          if (d.y > height + d.radius) d.y = -d.radius;
          d.pulsePhase += d.pulseSpeed * delta;
        }

        const pulse = Math.sin(d.pulsePhase) * 0.35 + 0.65;
        const dGrad = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.radius);
        dGrad.addColorStop(0, d.color);
        dGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.save();
        ctx.globalAlpha = d.alpha * pulse;
        ctx.fillStyle = dGrad;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 4. Parallax Offsets
      const layerOffsets = [
        { x: mouse.currentX * 6, y: mouse.currentY * 6 },    // layer 0: distant
        { x: mouse.currentX * 16, y: mouse.currentY * 16 },  // layer 1: mid
        { x: mouse.currentX * 28, y: mouse.currentY * 28 },  // layer 2: cluster
      ];

      // 5. Render Thousands of Sparkling Stars
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        // Slow orbital drift
        if (!prefersReducedMotion) {
          star.x += star.vx;
          star.y += star.vy;
          if (star.x < 0) star.x = width;
          if (star.x > width) star.x = 0;
          if (star.y < 0) star.y = height;
          if (star.y > height) star.y = 0;
        }

        const offset = layerOffsets[star.layer];
        const px = star.x + offset.x;
        const py = star.y + offset.y;

        // Twinkle sinusoidal calculation
        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinklePhase);
        const alpha = Math.max(0.12, Math.min(1, star.baseAlpha + twinkle * 0.40));

        ctx.save();
        ctx.globalAlpha = alpha;

        // Neon Glow on mid and cluster stars
        if (star.layer >= 1) {
          ctx.shadowBlur = star.layer === 2 ? 8 : 4;
          ctx.shadowColor = star.glowColor;
        }

        ctx.fillStyle = star.color;
        ctx.beginPath();
        ctx.arc(px, py, star.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // 6. Shooting Stars / Meteors
      if (time > nextShootingStarTime) {
        spawnShootingStar(time);
      }

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const meteor = shootingStars[i];
        meteor.life += delta;

        const progress = meteor.life / meteor.maxLife;
        meteor.x += Math.cos(meteor.angle) * meteor.speed;
        meteor.y += Math.sin(meteor.angle) * meteor.speed;

        const currentAlpha = Math.sin(progress * Math.PI) * 0.95;
        const tailX = meteor.x - Math.cos(meteor.angle) * meteor.length;
        const tailY = meteor.y - Math.sin(meteor.angle) * meteor.length;

        const mGrad = ctx.createLinearGradient(meteor.x, meteor.y, tailX, tailY);
        mGrad.addColorStop(0, meteor.color);
        mGrad.addColorStop(0.35, meteor.tailColor);
        mGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.save();
        ctx.globalAlpha = Math.max(0, currentAlpha);
        ctx.strokeStyle = mGrad;
        ctx.lineWidth = meteor.width;
        ctx.lineCap = 'round';
        ctx.shadowBlur = 14;
        ctx.shadowColor = meteor.tailColor;

        ctx.beginPath();
        ctx.moveTo(meteor.x, meteor.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        // Luminous head sparkle
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(meteor.x, meteor.y, meteor.width * 1.3, 0, Math.PI * 2);
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
      className="fixed inset-0 w-full h-full pointer-events-none -z-20"
      style={{
        display: 'block',
        pointerEvents: 'none',
        zIndex: -20,
      }}
      aria-hidden="true"
    />
  );
};
