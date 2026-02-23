// MangaCatch/src/hooks/useParticles.ts
import { useCallback, useEffect, useRef, useState } from "react";
import type { Particle } from "../types/game";

export const useParticles = () => {
    const [particles, setParticles] = useState<Particle[]>([]);
    const nextId = useRef(0);

    // ★「倍くらい」：数とサイズをさらに増やす
    const createParticles = useCallback((x: number, y: number) => {
        const burst: Particle[] = [];

        // 小粒（大量）
        for (let i = 0; i < 52; i++) {
            burst.push({
                id: nextId.current++,
                x,
                y,
                vx: (Math.random() - 0.5) * 760,
                vy: (Math.random() - 0.9) * 760,
                life: 1,
                size: 6 + Math.random() * 12,
            });
        }

        // 大粒（目立つ）
        for (let i = 0; i < 14; i++) {
            burst.push({
                id: nextId.current++,
                x,
                y,
                vx: (Math.random() - 0.5) * 540,
                vy: (Math.random() - 0.9) * 540,
                life: 1,
                size: 16 + Math.random() * 22,
            });
        }

        setParticles((p) => [...p, ...burst]);
    }, []);

    useEffect(() => {
        let raf = 0;
        const tick = () => {
            setParticles((prev) =>
                prev
                    .map((p) => ({
                        ...p,
                        x: p.x + p.vx * 0.016,
                        y: p.y + p.vy * 0.016,
                        vy: p.vy + 650 * 0.016,
                        life: p.life - 0.03,
                    }))
                    .filter((p) => p.life > 0)
            );
            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, []);

    return { particles, createParticles };
};