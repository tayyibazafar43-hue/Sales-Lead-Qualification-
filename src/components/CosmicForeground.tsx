import React, { useEffect, useRef } from 'react';

interface StarParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  points: 4 | 5; // 4-point or 5-point star
  outerRadius: number;
  innerRadius: number;
  rotation: number;
  rotSpeed: number;
  color: string;
  glowColor: string;
  twinkleSpeed: number;
  twinklePhase: number;
  life: number;
  maxLife: number; // in milliseconds (1000 - 1800ms)
}

interface AmbientSparkle {
  x: number;
  y: number;
  size: number;
  color: string;
  glowColor: string;
  twinkleSpeed: number;
  twinklePhase: number;
  spikeLength: number;
  rotation: number;
  rotSpeed: number;
}

// Multicolor Star Palette: Red, White, Yellow, Pink, Purple, Blue, Gold, Cyan, Orange
const STAR_TRAIL_COLORS = [
  { fill: '#ef4444', glow: 'rgba(239, 68, 68, 0.95)' },    // Bright Red
  { fill: '#ffffff', glow: 'rgba(255, 255, 255, 0.98)' },  // Pure White
  { fill: '#facc15', glow: 'rgba(250, 204, 21, 0.95)' },   // Bright Yellow
  { fill: '#f472b6', glow: 'rgba(244, 114, 182, 0.95)' },  // Soft Pink
  { fill: '#ec4899', glow: 'rgba(236, 72, 153, 0.95)' },   // Vibrant Magenta Pink
  { fill: '#c084fc', glow: 'rgba(192, 132, 252, 0.95)' },  // Celestial Purple
  { fill: '#a855f7', glow: 'rgba(168, 85, 247, 0.95)' },   // Royal Purple
  { fill: '#38bdf8', glow: 'rgba(56, 189, 248, 0.95)' },   // Electric Cyan
  { fill: '#60a5fa', glow: 'rgba(96, 165, 250, 0.95)' },   // Stellar Blue
  { fill: '#fbbf24', glow: 'rgba(251, 191, 36, 0.98)' },   // Radiant Gold
  { fill: '#f59e0b', glow: 'rgba(245, 158, 11, 0.95)' },   // Amber Gold
  { fill: '#fb923c', glow: 'rgba(251, 146, 60, 0.95)' },   // Warm Orange
];

const AMBIENT_SPARKLE_COLORS = [
  { fill: '#ffffff', glow: 'rgba(255, 255, 255, 0.85)' },
  { fill: '#38bdf8', glow: 'rgba(56, 189, 248, 0.85)' },
  { fill: '#c084fc', glow: 'rgba(192, 132, 252, 0.85)' },
  { fill: '#fbbf24', glow: 'rgba(251, 191, 36, 0.85)' },
  { fill: '#f472b6', glow: 'rgba(244, 114, 182, 0.85)' },
];

// Draw 4-point diamond star
function drawFourPointStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outerRadius: number,
  innerRadius: number,
  rotation: number
) {
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const r = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = rotation + (i * Math.PI) / 4;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

// Draw 5-point celestial star
function drawFivePointStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outerRadius: number,
  innerRadius: number,
  rotation: number
) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = rotation + (i * Math.PI) / 5 - Math.PI / 2;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

export const CosmicForeground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Cursor position tracking
    const cursor = {
      x: -1000,
      y: -1000,
      prevX: -1000,
      prevY: -1000,
      hasMoved: false,
    };

    let ambientSparkles: AmbientSparkle[] = [];
    const starParticles: StarParticle[] = [];

    const initAmbientSparkles = () => {
      ambientSparkles = [];
      const count = Math.floor(Math.min(40, Math.max(20, (width * height) / 40000)));

      for (let i = 0; i < count; i++) {
        const col = AMBIENT_SPARKLE_COLORS[Math.floor(Math.random() * AMBIENT_SPARKLE_COLORS.length)];
        let sx = Math.random() * width;
        let sy = Math.random() * height;

        // Peripheral edge placement
        if (Math.random() < 0.5) {
          sx = Math.random() < 0.5 ? Math.random() * (width * 0.15) : width - Math.random() * (width * 0.15);
        } else if (Math.random() < 0.35) {
          sy = Math.random() * (height * 0.15);
        }

        ambientSparkles.push({
          x: sx,
          y: sy,
          size: 1.8 + Math.random() * 1.6,
          color: col.fill,
          glowColor: col.glow,
          twinkleSpeed: 0.002 + Math.random() * 0.003,
          twinklePhase: Math.random() * Math.PI * 2,
          spikeLength: 3.5 + Math.random() * 4.5,
          rotation: Math.random() * Math.PI,
          rotSpeed: (Math.random() - 0.5) * 0.003,
        });
      }
    };

    const handleResize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      initAmbientSparkles();
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Spawn a star particle at coordinates
    const spawnStar = (
      x: number,
      y: number,
      driftX: number,
      driftY: number,
      isMicro = false
    ) => {
      // Keep particle array bounded for smooth 60fps performance
      if (starParticles.length >= 600) {
        starParticles.shift();
      }

      const col = STAR_TRAIL_COLORS[Math.floor(Math.random() * STAR_TRAIL_COLORS.length)];
      const points: 4 | 5 = Math.random() < 0.5 ? 4 : 5;

      // Varied small delicate star sizes (2.2px to 5.2px)
      const outerRadius = isMicro
        ? 1.6 + Math.random() * 1.5
        : 2.4 + Math.random() * 2.8;
      const innerRadius = outerRadius * (points === 4 ? 0.35 : 0.45);

      // Subtle radial drift and upward float
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.2 + Math.random() * 0.7;
      const vx = Math.cos(angle) * speed + driftX * 0.04;
      const vy = Math.sin(angle) * speed + driftY * 0.04 - (0.15 + Math.random() * 0.2); // gentle float

      // Lifetime: 1100ms to 1800ms (fades within 1-2 seconds)
      const maxLife = 1100 + Math.random() * 700;

      starParticles.push({
        x: x + (Math.random() - 0.5) * 5,
        y: y + (Math.random() - 0.5) * 5,
        vx,
        vy,
        points,
        outerRadius,
        innerRadius,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.08,
        color: col.fill,
        glowColor: col.glow,
        twinkleSpeed: 0.008 + Math.random() * 0.012,
        twinklePhase: Math.random() * Math.PI * 2,
        life: 0,
        maxLife,
      });
    };

    // Movement handler with smooth step interpolation along the cursor path
    const handleMovement = (newX: number, newY: number) => {
      if (prefersReducedMotion) return;

      if (!cursor.hasMoved) {
        cursor.x = newX;
        cursor.y = newY;
        cursor.prevX = newX;
        cursor.prevY = newY;
        cursor.hasMoved = true;
        spawnStar(newX, newY, 0, 0);
        return;
      }

      const prevX = cursor.x;
      const prevY = cursor.y;
      cursor.prevX = prevX;
      cursor.prevY = prevY;
      cursor.x = newX;
      cursor.y = newY;

      const dx = newX - prevX;
      const dy = newY - prevY;
      const dist = Math.hypot(dx, dy);

      // Interpolate along path so trail remains seamless during fast cursor movement
      if (dist > 1) {
        const steps = Math.min(16, Math.max(1, Math.floor(dist / 4.5)));
        for (let i = 1; i <= steps; i++) {
          const t = i / steps;
          const interpX = prevX + dx * t;
          const interpY = prevY + dy * t;
          spawnStar(interpX, interpY, dx, dy);

          // Add occasional micro-sparkle for a denser sparkling trail
          if (Math.random() < 0.4) {
            spawnStar(
              interpX + (Math.random() - 0.5) * 6,
              interpY + (Math.random() - 0.5) * 6,
              dx,
              dy,
              true
            );
          }
        }
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      handleMovement(e.clientX, e.clientY);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' || e.pointerType === 'pen') {
        handleMovement(e.clientX, e.clientY);
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const t = e.touches[0];
        cursor.hasMoved = false;
        handleMovement(t.clientX, t.clientY);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const t = e.touches[0];
        handleMovement(t.clientX, t.clientY);
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });

    let lastTime = performance.now();

    const render = (time: number) => {
      const delta = Math.min(40, time - lastTime);
      lastTime = time;

      ctx.save();
      // Set DPI scale transform cleanly
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      // 1. Render Magical Multicolor Star Trail
      for (let i = starParticles.length - 1; i >= 0; i--) {
        const p = starParticles[i];
        p.life += delta;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotSpeed;

        const progress = p.life / p.maxLife;

        // When life expires (1-2 seconds after cursor stopped or moved), star fades away and is removed
        if (progress >= 1) {
          starParticles.splice(i, 1);
          continue;
        }

        // Smooth fade out with sparkling twinkle
        const fade = Math.max(0, 1 - progress);
        const twinkle = Math.sin(time * p.twinkleSpeed + p.twinklePhase) * 0.2;
        const alpha = Math.max(0, Math.min(1, fade + twinkle * fade));

        // Gradual shrink as star dissolves
        const scale = Math.max(0.25, 1 - progress * 0.65);
        const curOuter = p.outerRadius * scale;
        const curInner = p.innerRadius * scale;

        ctx.save();
        ctx.globalAlpha = alpha;

        // Glowing colorful aura
        ctx.shadowBlur = 9;
        ctx.shadowColor = p.glowColor;
        ctx.fillStyle = p.color;

        if (p.points === 4) {
          drawFourPointStar(ctx, p.x, p.y, curOuter, curInner, p.rotation);
        } else {
          drawFivePointStar(ctx, p.x, p.y, curOuter, curInner, p.rotation);
        }

        // Brilliant sparkling core for stars with good opacity
        if (curOuter > 2.2 && alpha > 0.35) {
          ctx.shadowBlur = 4;
          ctx.shadowColor = '#ffffff';
          ctx.fillStyle = '#ffffff';
          if (p.points === 4) {
            drawFourPointStar(ctx, p.x, p.y, curOuter * 0.45, curInner * 0.45, p.rotation);
          } else {
            drawFivePointStar(ctx, p.x, p.y, curOuter * 0.45, curInner * 0.45, p.rotation);
          }
        }

        ctx.restore();
      }

      // 2. Render Subtle Ambient Edge Sparkles
      for (let i = 0; i < ambientSparkles.length; i++) {
        const star = ambientSparkles[i];
        if (!prefersReducedMotion) {
          star.rotation += star.rotSpeed;
        }

        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinklePhase);
        const alpha = Math.max(0.2, Math.min(0.85, 0.5 + twinkle * 0.35));

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.shadowBlur = 10;
        ctx.shadowColor = star.glowColor;
        ctx.fillStyle = star.color;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();

        if (alpha > 0.5) {
          ctx.strokeStyle = star.glowColor;
          ctx.lineWidth = 0.75;
          ctx.translate(star.x, star.y);
          ctx.rotate(star.rotation);

          const spike = star.spikeLength * (0.8 + twinkle * 0.2);
          ctx.beginPath();
          ctx.moveTo(-spike, 0);
          ctx.lineTo(spike, 0);
          ctx.moveTo(0, -spike);
          ctx.lineTo(0, spike);
          ctx.stroke();

          ctx.rotate(-star.rotation);
          ctx.translate(-star.x, -star.y);
        }

        ctx.restore();
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999, // Overlays entire website including header, navbar, cards, charts
        display: 'block',
      }}
      aria-hidden="true"
    />
  );
};
