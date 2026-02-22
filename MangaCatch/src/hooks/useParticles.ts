import { useCallback, useEffect, useRef, useState } from 'react';
import type { Particle } from '../types/game';

export const useParticles = () => {
    const [particles, setParticles] = useState<Particle[]>([]);
    const nextId = useRef(0);

    const createParticles = useCallback((x: number, y: number) => {
        const burst: Particle[] = [];
        for (let i = 0; i < 14; i++) {
            burst.push({
                id: nextId.current++,
                x,
                y,
                vx: (Math.random() - 0.5) * 280,
                vy: (Math.random() - 0.75) * 280,
                life: 1,
                size: 3 + Math.random() * 5,
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
                        vy: p.vy + 420 * 0.016,
                        life: p.life - 0.04,
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