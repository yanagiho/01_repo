// MangaCatch/src/hooks/useParticles.ts
import { useCallback, useEffect, useRef, useState } from "react";
import type { Particle } from "../types/game";

export const useParticles = () => {
    const [particles, setParticles] = useState<Particle[]>([]);
    const nextId = useRef(0);

    // ★大きく・派手に（数/速度/サイズ増）
    const createParticles = useCallback((x: number, y: number) => {
        const burst: Particle[] = [];

        // 小粒（多数）
        for (let i = 0; i < 26; i++) {
            burst.push({
                id: nextId.current++,
                x,
                y,
                vx: (Math.random() - 0.5) * 520,
                vy: (Math.random() - 0.85) * 520,
                life: 1,
                size: 4 + Math.random() * 8,
            });
        }

        // 中〜大粒（少数）
        for (let i = 0; i < 8; i++) {
            burst.push({
                id: nextId.current++,
                x,
                y,
                vx: (Math.random() - 0.5) * 380,
                vy: (Math.random() - 0.85) * 380,
                life: 1,
                size: 10 + Math.random() * 14,
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
                        vy: p.vy + 520 * 0.016,
                        life: p.life - 0.035,
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