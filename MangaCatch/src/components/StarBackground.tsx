// MangaCatch/src/components/StarBackground.tsx
// 30fps cap + バッチ描画でCeleron/Intel UHD環境の負荷を軽減
import React, { useEffect, useRef } from "react";

type Star = { x: number; y: number; r: number; v: number };

const FRAME_MIN = 1000 / 30;
// 星密度を下げる（旧: /12000 → 新: /18000）
const STAR_DENSITY = 18000;

export const StarBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const starsRef = useRef<Star[]>([]);
  const rafRef = useRef<number>(0);

  const initStars = (w: number, h: number) => {
    const n = Math.floor((w * h) / STAR_DENSITY);
    const stars: Star[] = [];
    for (let i = 0; i < n; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.6 + Math.random() * 1.6,
        v: 8 + Math.random() * 32,
      });
    }
    starsRef.current = stars;
  };

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let last = 0;
    let cachedGrad: CanvasGradient | null = null;
    let cachedW = 0;
    let cachedH = 0;

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.floor(w * devicePixelRatio);
      canvas.height = Math.floor(h * devicePixelRatio);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      cachedGrad = ctx.createRadialGradient(w * 0.5, h * 0.25, 0, w * 0.5, h * 0.25, Math.max(w, h));
      cachedGrad.addColorStop(0, "#081018");
      cachedGrad.addColorStop(0.6, "#000000");
      cachedW = w;
      cachedH = h;
      initStars(w, h);
    };

    const tick = (now: number) => {
      rafRef.current = requestAnimationFrame(tick);
      // 30fps cap
      if (now - last < FRAME_MIN) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      const w = cachedW;
      const h = cachedH;

      // 背景（キャッシュ済みグラデーション）
      ctx.fillStyle = cachedGrad!;
      ctx.fillRect(0, 0, w, h);

      // 星をバッチ描画（per-star globalAlpha変更を廃止し1回のfillで全描画）
      ctx.globalAlpha = 0.75;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      for (const s of starsRef.current) {
        s.y += s.v * dt;
        if (s.y > h + 10) {
          s.y = -10;
          s.x = Math.random() * w;
          s.v = 8 + Math.random() * 32;
          s.r = 0.6 + Math.random() * 1.6;
        }
        ctx.moveTo(s.x + s.r, s.y);
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      }
      ctx.fill();
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
