// ParticleCanvas: DOM divの代わりにcanvasでパーティクルを描画
// Reactのstateを一切使わないためsetStateによるリレンダリングコストがゼロ
// 30fps capで低スペックPC(Celeron + Intel UHD)での負荷を軽減
import { useEffect, useRef } from "react";
import type { Particle } from "../types/game";

const FRAME_MIN = 1000 / 30;

export const ParticleCanvas: React.FC<{
    particlesRef: React.MutableRefObject<Particle[]>;
}> = ({ particlesRef }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext("2d")!;
        let raf = 0;
        let last = 0;

        const resize = () => {
            const dpr = devicePixelRatio;
            const w = window.innerWidth;
            const h = window.innerHeight;
            canvas.width = Math.floor(w * dpr);
            canvas.height = Math.floor(h * dpr);
            canvas.style.width = w + "px";
            canvas.style.height = h + "px";
        };
        resize();
        window.addEventListener("resize", resize);

        const tick = (now: number) => {
            raf = requestAnimationFrame(tick);
            if (now - last < FRAME_MIN) return;
            const dt = Math.min((now - last) / 1000, 0.05);
            last = now;

            const dpr = devicePixelRatio;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (particlesRef.current.length === 0) return;

            const next: Particle[] = [];
            ctx.fillStyle = "#00eebb";
            for (const p of particlesRef.current) {
                const life = p.life - dt * 1.5;
                if (life <= 0) continue;
                const nx = p.x + p.vx * dt;
                const ny = p.y + p.vy * dt;
                const nvy = p.vy + 650 * dt;
                next.push({ id: p.id, x: nx, y: ny, vx: p.vx, vy: nvy, life, size: p.size });
                ctx.globalAlpha = Math.min(1, life);
                ctx.beginPath();
                ctx.arc(nx * dpr, ny * dpr, (p.size / 2) * dpr, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
            particlesRef.current = next;
        };

        raf = requestAnimationFrame(tick);
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", resize);
        };
    }, [particlesRef]);

    return (
        <canvas
            ref={canvasRef}
            style={{ position: "absolute", inset: 0, zIndex: 30, pointerEvents: "none" }}
        />
    );
};
