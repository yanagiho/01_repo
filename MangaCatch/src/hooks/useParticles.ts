import { useState, useCallback, useEffect } from 'react';
import type { Particle } from '../types/game';

export const useParticles = () => {
    const [particles, setParticles] = useState<Particle[]>([]);

    const createParticles = useCallback((x: number, y: number) => {
        const pCount = 35;
        const newParticles: Particle[] = Array.from({ length: pCount }, () => {
            const angle = Math.random() * Math.PI * 2;
            const speed = 8 + Math.random() * 24;
            return {
                id: Math.random(),
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0,
                size: Math.random() * 20 + 15,
                color: Math.random() > 0.5 ? '#fff' : 'cyan'
            };
        });
        setParticles(prev => [...prev, ...newParticles]);
    }, []);

    useEffect(() => {
        if (particles.length === 0) return;
        const interval = setInterval(() => {
            setParticles(prev => prev.map(p => ({
                ...p,
                x: p.x + p.vx,
                y: p.y + p.vy,
                vy: p.vy + 0.5,
                life: p.life - 0.05
            })).filter(p => p.life > 0));
        }, 16);
        return () => clearInterval(interval);
    }, [particles]);

    return { particles, createParticles };
};
