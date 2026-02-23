// MangaCatch/src/components/StarBackground.tsx
import React, { useEffect, useRef } from "react";

type Star = { x: number; y: number; r: number; a: number; v: number };

export const StarBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const starsRef = useRef<Star[]>([]);
  const rafRef = useRef<number>(0);

  const initStars = (w: number, h: number) => {
    const n = Math.floor((w * h) / 12000); // 密度調整
    const stars: Star[] = [];
    for (let i = 0; i < n; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.6 + Math.random() * 1.9,
        a: 0.25 + Math.random() * 0.75,
        v: 10 + Math.random() * 40, // px/sec
      });
    }
    starsRef.current = stars;
  };

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let last = performance.now();

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.floor(w * devicePixelRatio);
      canvas.height = Math.floor(h * devicePixelRatio);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      initStars(w, h);
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      const w = window.innerWidth;
      const h = window.innerHeight;

      // 背景
      const grad = ctx.createRadialGradient(w * 0.5, h * 0.25, 0, w * 0.5, h * 0.25, Math.max(w, h));
      grad.addColorStop(0, "#081018");
      grad.addColorStop(0.6, "#000000");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // 星
      ctx.fillStyle = "#ffffff";
      for (const s of starsRef.current) {
        s.y += s.v * dt;
        if (s.y > h + 10) {
          s.y = -10;
          s.x = Math.random() * w;
          s.v = 10 + Math.random() * 40;
          s.a = 0.25 + Math.random() * 0.75;
          s.r = 0.6 + Math.random() * 1.9;
        }
        ctx.globalAlpha = s.a;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      rafRef.current = requestAnimationFrame(tick);
    };

    resize();
    window.addEventListener("resize", resize);
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, zIndex: 0 }}
    />
  );
};